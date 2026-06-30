import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { refreshToken } = body;

  if (!refreshToken) {
    return Response.json({ error: "Refresh token is required" }, { status: 400 });
  }

  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });

  return Response.json({ success: true });
}
