import prisma from "@/app/lib/prisma";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

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
    return NextResponse.json(
      { error: "Bot unavailable." },
      { status: 403 },
    );
  }

  if (!process.env.HACKCLUB_AI_API_KEY) {
    return NextResponse.json(
      { error: "ai.hackclub.com key not configured." },
      { status: 500 },
    );
  }

  const prompt = bot.prompt || "You are a helpful assistant.";

  try {
    const result = await axios.post(
      "https://ai.hackclub.com/proxy/v1/chat/completions",
      {
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Suas informacoes: Você é um chatbot criado por um usuario da ForgeAI, seu nome e ${bot.name}. Descricao: ${bot.description}. \n\n Instrucoes: ${prompt}\n\nPergunta: `,
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
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HACKCLUB_AI_API_KEY}`,
        },
        timeout: 120_000,
      },
    );

    const data = result.data;

    if (result.status !== 200 || data.error) {
      const msg = data?.error || "ai.hackclub.com returned an error.";
      return NextResponse.json(
        { error: msg },
        { status: result.status || 500 },
      );
    }

    const answer = data.choices?.[0]?.message?.content;
    if (!answer) {
      return NextResponse.json(
        { error: "Invalid response from API." },
        { status: 502 },
      );
    }

    return NextResponse.json({ answer });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("[CHAT_ROUTE]", error);

    if (error.code === "ECONNABORTED") {
      return NextResponse.json(
        { error: "Request timed out after 120 seconds." },
        { status: 504 },
      );
    }

    return NextResponse.json(
      {
        error: "Cannot generate a response.",
      },
      { status: 500 },
    );
  }
}
