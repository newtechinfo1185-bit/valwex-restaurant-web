import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPasswordResetToken } from "@/lib/password-reset";

export const runtime = "nodejs";

const genericResponse = () => NextResponse.json({
  message: "If an active account uses that email, a password reset link will be sent shortly.",
});

export async function POST(request: NextRequest) {
  let email = "";
  try {
    const body = await request.json();
    email = String(body?.email || "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const secret = process.env.NEXTAUTH_SECRET;
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!secret || !resendApiKey || !from) {
    return NextResponse.json({ error: "Password reset email is not configured yet. Please contact your administrator." }, { status: 503 });
  }

  try {
    const [users, superAdmins] = await Promise.all([
      prisma.user.findMany({
        where: { email: { equals: email, mode: "insensitive" }, isActive: true },
        select: { id: true, updatedAt: true },
        take: 50,
      }),
      prisma.superAdmin.findMany({
        where: { email: { equals: email, mode: "insensitive" }, isActive: true },
        select: { id: true, updatedAt: true },
        take: 50,
      }),
    ]);

    if (users.length === 0 && superAdmins.length === 0) return genericResponse();

    const token = createPasswordResetToken({
      users: users.map(({ id, updatedAt }) => ({ id, updatedAt: updatedAt.toISOString() })),
      superAdmins: superAdmins.map(({ id, updatedAt }) => ({ id, updatedAt: updatedAt.toISOString() })),
    }, secret);
    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;
    const resetUrl = new URL(`/reset-password?token=${encodeURIComponent(token)}`, baseUrl).toString();

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Reset your JR XPERT RMS password",
        text: `We received a request to reset your JR XPERT RMS password. Open this link within 30 minutes:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
      }),
    });

    if (!response.ok) {
      console.error("Password reset email delivery failed:", response.status);
      return NextResponse.json({ error: "The reset email could not be sent. Please try again later or contact your administrator." }, { status: 502 });
    }
    return genericResponse();
  } catch (error) {
    console.error("Password reset request failed:", error);
    return NextResponse.json({ error: "Unable to process the request right now. Please try again later." }, { status: 500 });
  }
}
