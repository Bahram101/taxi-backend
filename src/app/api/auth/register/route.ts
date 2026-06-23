import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { Role } from "@/generated/prisma/enums";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { phone, name, role } = body;

  if (!phone || !name || !role) {
    return Response.json(
      { error: "phone, name and role are required" },
      { status: 400 },
    );
  }

  const phoneRegex = /^\+7[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    return Response.json(
      { error: "Invalid phone number. Must be in format +7XXXXXXXXXX" },
      { status: 400 },
    );
  }

  if (!Object.values(Role).includes(role)) {
    return Response.json(
      { error: "Invalid role. Must be CLIENT, DRIVER or ADMIN" },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return Response.json(
      { error: "This phone number is already registered" },
      { status: 409 },
    );
  }

  const user = await prisma.user.create({ data: { phone, name, role } });

  // const token = signToken({ userId: user.id, phone: user.phone, role: user.role });

  return Response.json(
    {
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
    },
    { status: 201 },
  );
}
