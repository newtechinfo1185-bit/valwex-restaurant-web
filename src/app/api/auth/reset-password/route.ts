import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { readPasswordResetToken } from "@/lib/password-reset";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: { token?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid reset request." }, { status: 400 });
  }

  const token = String(body.token || "");
  const password = String(body.password || "");
  if (password.length < 8 || password.length > 128) {
    return NextResponse.json({ error: "Password must be between 8 and 128 characters." }, { status: 400 });
  }

  const secret = process.env.NEXTAUTH_SECRET;
  const claims = secret ? readPasswordResetToken(token, secret) : null;
  if (!claims) return NextResponse.json({ error: "This reset link is invalid or expired. Please request a new one." }, { status: 400 });

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.$transaction(async (tx) => {
      for (const account of claims.users) {
        const current = await tx.user.findUnique({ where: { id: account.id }, select: { updatedAt: true, isActive: true } });
        if (!current?.isActive || current.updatedAt.toISOString() !== account.updatedAt) {
          throw new Error("RESET_LINK_EXPIRED");
        }
      }
      for (const account of claims.superAdmins) {
        const current = await tx.superAdmin.findUnique({ where: { id: account.id }, select: { updatedAt: true, isActive: true } });
        if (!current?.isActive || current.updatedAt.toISOString() !== account.updatedAt) {
          throw new Error("RESET_LINK_EXPIRED");
        }
      }

      for (const account of claims.users) {
        await tx.user.update({ where: { id: account.id }, data: { passwordHash } });
      }
      for (const account of claims.superAdmins) {
        await tx.superAdmin.update({ where: { id: account.id }, data: { passwordHash } });
      }
    });
    return NextResponse.json({ message: "Password updated. You can now sign in." });
  } catch (error) {
    if (error instanceof Error && error.message === "RESET_LINK_EXPIRED") {
      return NextResponse.json({ error: "This reset link has already been used or expired. Please request a new one." }, { status: 400 });
    }
    console.error("Password reset failed:", error);
    return NextResponse.json({ error: "Unable to reset the password right now. Please try again." }, { status: 500 });
  }
}
