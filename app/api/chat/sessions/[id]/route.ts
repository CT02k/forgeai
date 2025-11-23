import prisma from "@/app/lib/prisma";
import { ChatRole } from "@/.prisma/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { Token } from "@/app/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const cookieStore = await cookies();
  const tokenValue = cookieStore.get("token")?.value || "";

  let token: Token;
  try {
    token = jwt.verify(tokenValue, process.env.JWT_SECRET || "secret") as Token;
  } catch {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const session = await prisma.chatSession.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      updatedAt: true,
      bot: {
        select: {
          id: true,
          name: true,
          avatar: true,
          description: true,
          prompt: true,
          isBanned: true,
          createdBy: {
            select: { isBanned: true },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          role: true,
        },
      },
    },
  });

  if (!session || session.userId !== token.id) {
    return NextResponse.json({ error: "Chat not found." }, { status: 404 });
  }

  if (session.bot.isBanned || session.bot.createdBy.isBanned) {
    return NextResponse.json({ error: "Bot unavailable." }, { status: 403 });
  }

  return NextResponse.json({
    session: {
      id: session.id,
      bot: session.bot,
      updatedAt: session.updatedAt,
      messages: session.messages.map((message) => ({
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        role: message.role === ChatRole.USER ? "user" : "bot",
      })),
    },
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const cookieStore = await cookies();
  const tokenValue = cookieStore.get("token")?.value || "";

  let token: Token;
  try {
    token = jwt.verify(tokenValue, process.env.JWT_SECRET || "secret") as Token;
  } catch {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const session = await prisma.chatSession.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });

  if (!session || session.userId !== token.id) {
    return NextResponse.json({ error: "Chat not found." }, { status: 404 });
  }

  await prisma.chatSession.delete({ where: { id: session.id } });

  return NextResponse.json({ deleted: true });
}
