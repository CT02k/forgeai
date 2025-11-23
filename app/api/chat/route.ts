import prisma from "@/app/lib/prisma";
import { checkRateLimit } from "@/app/lib/redis";
import OpenAI from "openai";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { Token } from "@/app/types";
import { ChatRole } from "@/.prisma/client";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.HACKCLUB_AI_API_KEY,
  baseURL: "https://ai.hackclub.com/proxy/v1",
});

export async function POST(req: NextRequest) {
  const { message, botId, chatId } = await req.json();
  const trimmedMessage = typeof message === "string" ? message.trim() : "";

  if (!trimmedMessage) {
    return NextResponse.json(
      { error: "A message is required." },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  const tokenValue = cookieStore.get("token")?.value || "";

  let token: Token | null = null;

  try {
    token = jwt.verify(tokenValue, process.env.JWT_SECRET || "secret") as Token;
  } catch {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: token?.id },
    select: {
      id: true,
      isBanned: true,
    },
  });

  if (!user || user.isBanned) {
    return NextResponse.json(
      { error: "Not authorized to chat." },
      { status: 403 },
    );
  }

  const clientIdentifier =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const session = await resolveSession(chatId, botId, user.id);
  if ("error" in session) {
    return NextResponse.json(
      { error: session.error },
      { status: session.status },
    );
  }

  const bot = session.bot;

  if (!process.env.HACKCLUB_AI_API_KEY) {
    return NextResponse.json(
      { error: "HACKCLUB_AI_API_KEY not configured." },
      { status: 500 },
    );
  }

  const rateKey = `${bot.id}:${clientIdentifier}`;

  try {
    const rateResult = await checkRateLimit(rateKey, 20, 60);
    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        {
          status: 429,
          headers: {
            "Retry-After": `${rateResult.retryAfter}`,
            "X-RateLimit-Limit": "20",
            "X-RateLimit-Remaining": `${rateResult.remaining}`,
          },
        },
      );
    }
  } catch (redisError) {
    console.error("[CHAT_REDIS]", redisError);
    return NextResponse.json(
      { error: "Chat service unavailable. Please try again shortly." },
      { status: 503 },
    );
  }

  const prompt = bot.prompt || "You are a helpful assistant.";

  const previousMessages = await prisma.chatMessage.findMany({
    where: { sessionId: session.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  await prisma.chatMessage.create({
    data: {
      content: trimmedMessage,
      role: ChatRole.USER,
      sessionId: session.id,
    },
  });

  await prisma.chatSession.update({
    where: { id: session.id },
    data: { updatedAt: new Date() },
  });

  const history = [
    ...previousMessages.reverse(),
    { content: trimmedMessage, role: ChatRole.USER },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash",
      stream: true,
      messages: [
        {
          role: "system",
          content: `Your info: You are a chatbot created by a ForgeAI user. Your name is ${bot.name}. Description: ${bot.description}.\n\nInstructions: ${prompt}\n\nQuestion:`,
        },
        ...history.map((msg) => ({
          role: msg.role === ChatRole.USER ? "user" : "assistant",
          content: msg.content,
        })),
      ],
      temperature: 0.7,
    });

    const encoder = new TextEncoder();
    let botContent = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              botContent += content;
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (streamError) {
          console.error("[CHAT_STREAM]", streamError);
          controller.error(streamError);
          return;
        }

        controller.close();

        try {
          await prisma.chatMessage.create({
            data: {
              content: botContent,
              role: ChatRole.BOT,
              sessionId: session.id,
            },
          });

          await prisma.chatSession.update({
            where: { id: session.id },
            data: { updatedAt: new Date() },
          });
        } catch (storeError) {
          console.error("[CHAT_STREAM_STORE]", storeError);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Chat-Id": session.id,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("[CHAT_ROUTE]", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Cannot generate a response. Please try again in a moment.",
      },
      { status: 500 },
    );
  }
}

async function resolveSession(
  chatId: string | undefined,
  botId: string | undefined,
  userId: string,
) {
  if (chatId) {
    const existing = await prisma.chatSession.findUnique({
      where: { id: chatId },
      include: {
        bot: {
          include: {
            createdBy: { select: { isBanned: true } },
          },
        },
      },
    });

    if (!existing || existing.userId !== userId) {
      return { error: "Chat not found.", status: 404 } as const;
    }

    if (existing.bot.isBanned || existing.bot.createdBy.isBanned) {
      return { error: "Bot unavailable.", status: 403 } as const;
    }

    return { id: existing.id, bot: existing.bot };
  }

  if (!botId) {
    return {
      error: "A botId is required to start a chat.",
      status: 400,
    } as const;
  }

  const bot = await prisma.chatBot.findUnique({
    where: { id: botId },
    include: {
      createdBy: { select: { isBanned: true } },
    },
  });

  if (!bot) {
    return { error: "Bot not found.", status: 404 } as const;
  }

  if (bot.isBanned || bot.createdBy.isBanned) {
    return { error: "Bot unavailable.", status: 403 } as const;
  }

  const newSession = await prisma.chatSession.create({
    data: {
      botId: bot.id,
      userId,
    },
  });

  return { id: newSession.id, bot };
}
