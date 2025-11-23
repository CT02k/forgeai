import prisma from "@/app/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { Token } from "@/app/types";

export async function GET() {
  const cookieStore = await cookies();
  const tokenValue = cookieStore.get("token")?.value || "";

  let token: Token;
  try {
    token = jwt.verify(tokenValue, process.env.JWT_SECRET || "secret") as Token;
  } catch {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: token.id },
    select: { id: true, isBanned: true },
  });

  if (!user || user.isBanned) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const sessions = await prisma.chatSession.findMany({
    where: {
      userId: user.id,
      bot: {
        isBanned: false,
        createdBy: {
          isBanned: false,
        },
      },
    },
    include: {
      bot: {
        select: { id: true, name: true, avatar: true },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    sessions: sessions.map((session) => ({
      id: session.id,
      bot: session.bot,
      updatedAt: session.updatedAt,
      lastMessage: session.messages[0]?.content || "",
    })),
  });
}
