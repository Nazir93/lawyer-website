import { NextResponse } from "next/server";
import { requireLawyer } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { getPlatformSettings } from "@/lib/platform/commission";
import {
  createUniqueLawyerSlug,
  createUniqueReferralCode,
} from "@/lib/platform/referral";

export async function GET() {
  try {
    const user = await requireLawyer();

    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        referralCode: true,
        role: true,
        lawyerProfile: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!dbUser.lawyerProfile && dbUser.role === "LAWYER") {
      const slug = await createUniqueLawyerSlug(dbUser.name || "lawyer");
      await prisma.lawyerProfile.create({
        data: {
          userId: dbUser.id,
          displayName: dbUser.name || "Юрист",
          slug,
          status: "PENDING",
        },
      });
      if (!dbUser.referralCode) {
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { referralCode: await createUniqueReferralCode("LAWYER") },
        });
      }
      dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
          referralCode: true,
          role: true,
          lawyerProfile: true,
        },
      });
    }

    const profile = dbUser!.lawyerProfile;
    const settings = await getPlatformSettings();

    const [referrals, earned, pending, contracts] = await Promise.all([
      prisma.user.count({ where: { referredById: user.id } }),
      prisma.commission.aggregate({
        where: { beneficiaryId: user.id },
        _sum: { amount: true },
      }),
      prisma.commission.aggregate({
        where: { beneficiaryId: user.id, status: "PENDING" },
        _sum: { amount: true },
      }),
      profile
        ? prisma.contract.count({ where: { lawyerId: profile.id } })
        : Promise.resolve(0),
    ]);

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "";
    const code = dbUser!.referralCode;
    const invitePath = code ? `/register?ref=${code}` : "/register";

    return NextResponse.json({
      profile,
      referralCode: code,
      inviteUrl: origin
        ? `${origin.replace(/\/$/, "")}${invitePath}`
        : invitePath,
      stats: {
        referrals,
        contracts,
        earnedKopecks: earned._sum.amount || 0,
        pendingKopecks: pending._sum.amount || 0,
      },
      fees: settings,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("lawyer overview error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
