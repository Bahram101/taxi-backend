import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateRefreshToken, REFRESH_TOKEN_TTL_MS, signAccessToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { phone } = body;

  if (!phone) {
    return Response.json({ error: "Phone is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const accessToken = signAccessToken({
    userId: user.id,
    phone: user.phone,
    role: user.role,
  });

  const refreshToken = generateRefreshToken();
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  return Response.json({
    accessToken,
    refreshToken,
    user: { id: user.id, phone: user.phone, name: user.name, role: user.role },
  });
}
