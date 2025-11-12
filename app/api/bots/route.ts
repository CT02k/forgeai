import { NextResponse } from "next/server";

import prisma from "@/app/lib/prisma";

export async function GET() {
  const bots = await prisma.chatBot.findMany();

  return NextResponse.json(bots);
}

export async function POST(request: Request) {
  const { avatar, name, description, prompt } = await request.json();

  const newBot = await prisma.chatBot.create({
    data: {
      avatar,
      name,
      description,
      prompt,
    },
  });

  return NextResponse.json(newBot);
}
