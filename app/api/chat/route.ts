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

  const prompt = bot?.prompt || "You are a helpful assistant.";

  const result = await fetch(
    "https://ai.hackclub.com/proxy/v1/chat/completions",
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HACKCLUB_AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "qwen/qwen3-32b",
        messages: [
          {
            role: "system",
            content: `Suas informações: Você é um chatbot criado por um usuário da ForgeAI, seu nome é ${bot?.name}. Descrição: ${bot?.description}. \n\n Instruções: ${prompt}\n\nPergunta: `,
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
    },
  );

  const data = await result.json();

  const response = {
    answer: data.choices[0].message.content,
  };

  return NextResponse.json(response);
}
