import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import prisma from "@/app/lib/prisma";
import { Token } from "@/app/types";

export class AdminAuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

export async function requireAdmin() {
  const cookieStore = await cookies();
  const tokenValue = cookieStore.get("token")?.value;

  if (!tokenValue) {
    throw new AdminAuthError("Not authenticated", 401);
  }

  try {
    const decoded = jwt.verify(
      tokenValue,
      process.env.JWT_SECRET || "secret",
    ) as Token;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        role: true,
        isBanned: true,
      },
    });

    if (!user) {
      throw new AdminAuthError("User not found", 404);
    }

    if (user.role !== "ADMIN") {
      throw new AdminAuthError("Forbidden", 403);
    }

    if (user.isBanned) {
      throw new AdminAuthError("Account banned", 403);
    }

    return user;
  } catch (error) {
    if (error instanceof AdminAuthError) {
      throw error;
    }

    console.error("[ADMIN_REQUIRE_ADMIN]", error);
    throw new AdminAuthError("Invalid token", 401);
  }
}
