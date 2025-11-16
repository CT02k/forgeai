import prisma from "@/app/lib/prisma";
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
    select: { prompt: true, name: true, description: true },
  });

  if (!bot) {
    return NextResponse.json({ error: "BOT not found." }, { status: 404 });
  }

  if (!process.env.HACKCLUB_AI_API_KEY) {
    return NextResponse.json(
      { error: "ai.hackclub.com key not configured." },
      { status: 500 },
    );
  }

  const prompt = bot.prompt || "You are a helpful assistant.";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120_000);

  try {
    const result = await fetch(
      "https://ai.hackclub.com/proxy/v1/chat/completions",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HACKCLUB_AI_API_KEY}`,
        },
        body: JSON.stringify({
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
        }),
        method: "POST",
        signal: controller.signal,
      },
    );

    const data = await result.json();

    if (!result.ok || data.error) {
      const msg = data?.error || "ai.hackclub.com returned a error.";
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
  } catch (error) {
    console.error("[CHAT_ROUTE]", error);
    if (error instanceof Error && error.name === "AbortError") {
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
  } finally {
    clearTimeout(timeoutId);
  }
}
