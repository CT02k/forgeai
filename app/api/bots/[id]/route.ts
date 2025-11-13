import { NextRequest, NextResponse } from "next/server";

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
