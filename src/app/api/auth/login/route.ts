import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";

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

  const token = signToken({
    userId: user.id,
    phone: user.phone,
    role: user.role,
  });

  return Response.json({
    token,
    user: { id: user.id, phone: user.phone, name: user.name, role: user.role },
  });
}
