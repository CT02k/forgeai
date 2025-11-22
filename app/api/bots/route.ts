import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import prisma from "@/app/lib/prisma";
import jwt from "jsonwebtoken";
import { Token } from "@/app/types";

export async function GET() {
  const bots = await prisma.chatBot.findMany({
    where: {
      isBanned: false,
      createdBy: {
        isBanned: false,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(bots);
}

export async function POST(request: Request) {
  const { avatar, name, description, prompt } = await request.json();

  const cookieStore = await cookies();

  const token = jwt.verify(
    cookieStore.get("token")?.value || "",
    process.env.JWT_SECRET || "secret",
  ) as Token;

  const user = await prisma.user.findUnique({
    where: { id: token?.id },
    select: {
      id: true,
      isBanned: true,
    },
  });

  if (!user || user.isBanned) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

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
