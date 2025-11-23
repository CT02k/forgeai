import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import prisma from "@/app/lib/prisma";
import jwt from "jsonwebtoken";
import { Token } from "@/app/types";
import { getCachedString, setCachedString } from "@/app/lib/redis";

export async function GET() {
  const cacheKey = "bots:list:public";

  try {
    const cached = await getCachedString(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      return NextResponse.json(parsed, {
        headers: { "X-Cache": "HIT" },
      });
    }
  } catch (cacheReadError) {
    console.error("[BOTS_CACHE_READ]", cacheReadError);
  }

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

  try {
    await setCachedString(cacheKey, JSON.stringify(bots), 60);
  } catch (cacheWriteError) {
    console.error("[BOTS_CACHE_WRITE]", cacheWriteError);
  }

  return NextResponse.json(bots);
}

export async function POST(request: NextRequest) {
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
