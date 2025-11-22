import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import jwt from "jsonwebtoken";

import prisma from "@/app/lib/prisma";
import { Token } from "@/app/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const bot = await prisma.chatBot.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          isBanned: true,
        },
      },
    },
  });

  if (!bot || bot.isBanned || bot.createdBy.isBanned) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404 });
  }

  return NextResponse.json(bot);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const cookieStore = await cookies();

  const token = jwt.verify(
    cookieStore.get("token")?.value || "",
    process.env.JWT_SECRET || "secret",
  ) as Token;

  const user = await prisma.user.findUnique({
    where: { id: token?.id },
    select: {
      id: true,
      role: true,
      isBanned: true,
    },
  });

  if (!user || user.isBanned) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const bot = await prisma.chatBot.findUnique({
    where: { id },
    select: {
      id: true,
      createdById: true,
    },
  });

  if (!bot) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404 });
  }

  if (user.role !== "ADMIN" && bot.createdById !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const deletedBot = await prisma.chatBot.delete({
    where: {
      id,
    },
  });

  return NextResponse.json(deletedBot);
}
