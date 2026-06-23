// import { NextRequest } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { signToken } from "@/lib/jwt";
// import { Role } from "@/generated/prisma";
//
// export async function POST(request: NextRequest) {
//   const body = await request.json();
//   const { phone, code, name, role } = body;
//
//   if (!phone || !code) {
//     return Response.json({ error: "phone and code are required" }, { status: 400 });
//   }
//
//   const otpRecord = await prisma.otpCode.findFirst({
//     where: { phone, code },
//     orderBy: { createdAt: "desc" },
//   });
//
//   if (!otpRecord) {
//     return Response.json({ error: "Invalid OTP code" }, { status: 401 });
//   }
//
//   if (otpRecord.expiresAt < new Date()) {
//     await prisma.otpCode.delete({ where: { id: otpRecord.id } });
//     return Response.json({ error: "OTP code has expired" }, { status: 401 });
//   }
//
//   await prisma.otpCode.delete({ where: { id: otpRecord.id } });
//
//   let user = await prisma.user.findUnique({ where: { phone } });
//
//   if (!user) {
//     if (!name || !role) {
//       return Response.json(
//         { error: "name and role are required for new users", isNewUser: true },
//         { status: 422 }
//       );
//     }
//
//     if (!Object.values(Role).includes(role)) {
//       return Response.json({ error: "Invalid role. Must be CLIENT, DRIVER or ADMIN" }, { status: 400 });
//     }
//
//     user = await prisma.user.create({ data: { phone, name, role } });
//   }
//
//   const token = signToken({ userId: user.id, phone: user.phone, role: user.role });
//
//   return Response.json({ token, user: { id: user.id, phone: user.phone, name: user.name, role: user.role } });
// }
