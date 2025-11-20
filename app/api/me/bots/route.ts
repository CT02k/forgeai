import jwt from "jsonwebtoken";

import prisma from "@/app/lib/prisma";
import { Token } from "@/app/types";
import { cookies } from "next/headers";

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
        chatBots: true,
      },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error("JWT verification error:", error);
    return new Response("Invalid token", { status: 401 });
  }
}
