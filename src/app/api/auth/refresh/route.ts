import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateRefreshToken, REFRESH_TOKEN_TTL_MS, signAccessToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { refreshToken } = body;

  if (!refreshToken) {
    return Response.json({ error: "Refresh token is required" }, { status: 400 });
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!stored) {
    return Response.json({ error: "Invalid refresh token" }, { status: 401 });
  }

  if (stored.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    return Response.json({ error: "Refresh token has expired" }, { status: 401 });
  }

  const newAccessToken = signAccessToken({
    userId: stored.user.id,
    phone: stored.user.phone,
    role: stored.user.role,
  });

  const newRefreshToken = generateRefreshToken();
  await prisma.$transaction([
    prisma.refreshToken.delete({ where: { id: stored.id } }),
    prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: stored.user.id,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    }),
  ]);

  return Response.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
}
