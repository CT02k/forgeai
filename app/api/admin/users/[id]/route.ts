import { NextRequest, NextResponse } from "next/server";

import prisma from "@/app/lib/prisma";
import { AdminAuthError, requireAdmin } from "../../utils";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const { isBanned } = await req.json();

    if (typeof isBanned !== "boolean") {
      return NextResponse.json(
        { error: "isBanned must be a boolean." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        isBanned: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.id === admin.id && isBanned) {
      return NextResponse.json(
        { error: "You cannot ban yourself." },
        { status: 400 },
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isBanned },
      select: {
        id: true,
        username: true,
        isBanned: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("[ADMIN_USER_PATCH]", error);
    return NextResponse.json(
      { error: "Could not update user." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.id === admin.id) {
      return NextResponse.json(
        { error: "You cannot delete yourself." },
        { status: 400 },
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("[ADMIN_USER_DELETE]", error);
    return NextResponse.json(
      { error: "Could not delete user." },
      { status: 500 },
    );
  }
}
