import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import prisma from "@/app/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET() {
  const bots = await prisma.chatBot.findMany();

  return NextResponse.json(bots);
}

export async function POST(request: Request) {
  const { avatar, name, description, prompt } = await request.json();

  const cookieStore = await cookies();

  const token = jwt.verify(
    cookieStore.get("token")?.value || "",
    process.env.JWT_SECRET || "secret",
  ) as { id: string; username: string };

  const user = await prisma.user.findUnique({
    where: { id: token?.id },
  });

  const newBot = await prisma.chatBot.create({
    data: {
      avatar,
      name,
      description,
      prompt,
      createdBy: {
        connect: { id: user?.id || "" },
      },
    },
  });

  return NextResponse.json(newBot);
}
