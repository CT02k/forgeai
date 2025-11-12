import { NextResponse } from "next/server";

export async function GET() {
  const result = await fetch(
    "https://ai.hackclub.com/proxy/v1/chat/completions",
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HACKCLUB_AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: "[NÃO USE MARKDOWN] What is the capital of France?",
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
