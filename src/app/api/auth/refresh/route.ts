import { NextRequest } from "next/server";
import { JwtPayload, signAccessToken, verifyRefreshToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { refreshToken } = body;

  if (!refreshToken) {
    return Response.json({ error: "Refresh token is required" }, { status: 400 });
  }

  let payload: JwtPayload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    return Response.json({ error: "Invalid or expired refresh token" }, { status: 401 });
  }

  const accessToken = signAccessToken({
    userId: payload.userId,
    phone: payload.phone,
    role: payload.role,
  });

  return Response.json({ accessToken });
}
