import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { phone, name, carModel, carNumber } = body;

  if (!phone || !name || !carModel || !carNumber) {
    return Response.json(
      { error: "phone, name, carModel and carNumber are required" },
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

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return Response.json({ error: "This phone number is already registered" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      phone,
      name,
      role: "DRIVER",
      driver: {
        create: { carModel, carNumber },
      },
    },
    include: { driver: true },
  });

  return Response.json(
    {
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        driver: {
          id: user.driver!.id,
          carModel: user.driver!.carModel,
          carNumber: user.driver!.carNumber,
        },
      },
    },
    { status: 201 },
  );
}
