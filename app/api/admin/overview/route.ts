import { NextResponse } from "next/server";

import prisma from "@/app/lib/prisma";
import { AdminAuthError, requireAdmin } from "../utils";

export async function GET() {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    throw error;
  }

  const [users, bots] = await Promise.all([
    prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        username: true,
        role: true,
        isBanned: true,
        createdAt: true,
        _count: {
          select: {
            chatBots: true,
          },
        },
      },
    }),
    prisma.chatBot.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        description: true,
        createdAt: true,
        isBanned: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            isBanned: true,
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    users: users.map(({ _count, ...user }) => ({
      ...user,
      botCount: _count.chatBots,
    })),
    bots,
  });
}
