import prisma from "@/app/lib/prisma";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.HACKCLUB_AI_API_KEY,
  baseURL: "https://ai.hackclub.com/proxy/v1",
});

export async function POST(req: NextRequest) {
  const { message, botId, history: historyData } = await req.json();

  const history =
    (historyData as Array<{ role: "user" | "bot"; content: string }>).slice(
      0,
      10,
    ) || [];

  const bot = await prisma.chatBot.findUnique({
    where: { id: botId },
    select: {
      prompt: true,
      name: true,
      description: true,
      isBanned: true,
      createdBy: {
        select: { isBanned: true },
      },
    },
  });

  if (!bot) {
    return NextResponse.json({ error: "BOT not found." }, { status: 404 });
  }

  if (bot.isBanned || bot.createdBy.isBanned) {
    return NextResponse.json({ error: "Bot unavailable." }, { status: 403 });
  }

  if (!process.env.HACKCLUB_AI_API_KEY) {
    return NextResponse.json(
      { error: "HACKCLUB_AI_API_KEY not configured." },
      { status: 500 },
    );
  }

  if (!message) {
    return NextResponse.json(
      { error: "A message is required." },
      { status: 400 },
    );
  }

  const prompt = bot.prompt || "You are a helpful assistant.";

  try {
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash",
      stream: true,
      messages: [
        {
          role: "system",
          content: `Suas informacoes: Voce e um chatbot criado por um usuario da ForgeAI, seu nome e ${bot.name}. Descricao: ${bot.description}. \n\n Instrucoes: ${prompt}\n\nPergunta: `,
        },
        ...history.map((msg) => ({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        })),
        {
          role: "user",
          content: `${message}`,
        },
      ],
      temperature: 0.7,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // eslint-disable-next-line no-restricted-syntax
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (streamError) {
          console.error("[CHAT_STREAM]", streamError);
          controller.error(streamError);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
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
