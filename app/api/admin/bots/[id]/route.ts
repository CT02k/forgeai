import { NextRequest, NextResponse } from "next/server";

import prisma from "@/app/lib/prisma";
import { AdminAuthError, requireAdmin } from "../../utils";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { isBanned } = await req.json();

    if (typeof isBanned !== "boolean") {
      return NextResponse.json(
        { error: "isBanned must be a boolean." },
        { status: 400 },
      );
    }

    const bot = await prisma.chatBot.findUnique({
      where: { id },
      select: {
        id: true,
      },
    });

    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    const updated = await prisma.chatBot.update({
      where: { id },
      data: { isBanned },
      select: {
        id: true,
        name: true,
        avatar: true,
        description: true,
        isBanned: true,
        createdAt: true,
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("[ADMIN_BOT_PATCH]", error);
    return NextResponse.json(
      { error: "Could not update bot." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const bot = await prisma.chatBot.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    await prisma.chatBot.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("[ADMIN_BOT_DELETE]", error);
    return NextResponse.json(
      { error: "Could not delete bot." },
      { status: 500 },
    );
  }
}
