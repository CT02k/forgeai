import { NextRequest, NextResponse } from "next/server";
import * as jdenticon from "jdenticon";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string; size: string }> },
) {
  const { username, size } = await params;

  const png = jdenticon.toPng(username, Number(size));

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
