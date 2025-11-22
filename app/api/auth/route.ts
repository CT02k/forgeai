import jwt from "jsonwebtoken";
import argon2 from "argon2";

import prisma from "@/app/lib/prisma";
import { NextRequest } from "next/server";
import { Token } from "@/app/types";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { username, password }: { username: string; password: string } =
    await req.json();
  const normalizedUsername = username.toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { username: normalizedUsername },
  });

  if (existing) {
    return new Response("Username already taken", {
      status: 400,
    });
  }

  const hashedPassword = await argon2.hash(password);

  const createUser = await prisma.user.create({
    data: {
      username: normalizedUsername,
      password: hashedPassword,
    },
  });

  const token = jwt.sign(
    {
      id: createUser.id,
      username: createUser.username,
      role: createUser.role,
    },
    process.env.JWT_SECRET || "secret",
    {
      expiresIn: "7d",
    },
  );

  const cookieStore = await cookies();

  console.log(cookieStore.set("token", token, { httpOnly: true }));

  return new Response("User created successfully", { status: 201 });
}

export async function GET() {
  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;

  if (!token) {
    return new Response("Not authenticated", { status: 401 });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret",
    ) as Token;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        createdAt: true,
        role: true,
        isBanned: true,
      },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    if (user.isBanned) {
      cookieStore.set("token", "", {
        httpOnly: true,
        expires: new Date(0),
      });
      return new Response("Account banned", { status: 403 });
    }

    return new Response(JSON.stringify({ user }), { status: 200 });
  } catch (error) {
    console.error("JWT verification error:", error);
    return new Response("Invalid token", { status: 401 });
  }
}
