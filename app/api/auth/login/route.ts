import jwt from "jsonwebtoken";
import argon2 from "argon2";

import prisma from "@/app/lib/prisma";

import { NextRequest, NextResponse } from "next/server";
import { Token } from "@/app/types";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { username, password }: { username: string; password: string } =
    await req.json();

  const existing = await prisma.user.findUnique({
    where: {
      username: username.toLowerCase(),
    },
  });

  const verify = await argon2.verify(
    (existing && existing.password) || "",
    password,
  );

  if (!existing || !verify) {
    return new Response("Invalid credentials", { status: 401 });
  }

  if (existing.isBanned) {
    const cookieStore = await cookies();
    cookieStore.set("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    return new Response("Account banned", { status: 403 });
  }

  const token = jwt.sign(
    {
      id: existing.id,
      username: existing.username,
      role: existing.role,
    } as Token,
    process.env.JWT_SECRET || "secret",
    {
      expiresIn: "7d",
    },
  );

  const cookieStore = await cookies();
  cookieStore.set("token", token, { httpOnly: true });

  return NextResponse.json(
    {
      authenticated: true,
    },
    { status: 200 },
  );
}
