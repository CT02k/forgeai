import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import jwt from "jsonwebtoken";

import prisma from "@/app/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const bot = await prisma.chatBot.findUnique({
    where: { id },
  });

  if (!bot) {
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
  ) as { id: string; username: string };

  const user = await prisma.user.findUnique({
    where: { id: token?.id },
  });

  if (!user) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const newBot = await prisma.chatBot.delete({
    where: {
      id,
      createdById: user.id,
    },
  });

  return NextResponse.json(newBot);
}
