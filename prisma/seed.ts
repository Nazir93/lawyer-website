/**
 * Seed демо-данных платформы (admin / lawyer / client + реферал).
 * Запуск: npx tsx --env-file=.env.local prisma/seed.ts
 * Нужен DATABASE_URL и схема: npx prisma db push
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL не задан. Пример: npx tsx --env-file=.env.local prisma/seed.ts");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = "Demo1234!";

async function upsertUser(input: {
  email: string;
  name: string;
  role: "ADMIN" | "LAWYER" | "CLIENT";
  referralCode?: string;
  referredById?: string | null;
}) {
  const password = await bcrypt.hash(DEMO_PASSWORD, 12);
  return prisma.user.upsert({
    where: { email: input.email },
    create: {
      email: input.email,
      name: input.name,
      role: input.role,
      password,
      referralCode: input.referralCode,
      referredById: input.referredById ?? undefined,
    },
    update: {
      name: input.name,
      role: input.role,
      password,
      referralCode: input.referralCode,
      referredById: input.referredById ?? undefined,
    },
  });
}

async function main() {
  const admin = await upsertUser({
    email: "admin@demo.local",
    name: "Админ платформы",
    role: "ADMIN",
    referralCode: "ADMIN01",
  });

  const lawyerUser = await upsertUser({
    email: "lawyer@demo.local",
    name: "Иван Юристов",
    role: "LAWYER",
    referralCode: "LAW001",
  });

  const lawyer = await prisma.lawyerProfile.upsert({
    where: { userId: lawyerUser.id },
    create: {
      userId: lawyerUser.id,
      displayName: "Иван Юристов",
      slug: "ivan-yuristov",
      specialization: "Семейное право",
      city: "Москва",
      status: "ACTIVE",
      verifiedAt: new Date(),
      bio: "Демо-юрист для проверки платформы",
    },
    update: {
      displayName: "Иван Юристов",
      slug: "ivan-yuristov",
      status: "ACTIVE",
      verifiedAt: new Date(),
    },
  });

  const client = await upsertUser({
    email: "client@demo.local",
    name: "Анна Клиентова",
    role: "CLIENT",
    referralCode: "CLI001",
    referredById: lawyerUser.id,
  });

  const settings = await prisma.platformSettings.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (!settings) {
    await prisma.platformSettings.create({
      data: {
        platformFeePercent: 10,
        referralLevel1Percent: 5,
        referralLevel2Percent: 2,
        maxReferralDepth: 2,
        minContractAmount: 10000,
      },
    });
  }

  console.log("Seed OK — пароль для всех: Demo1234!");
  console.log(
    JSON.stringify(
      {
        admin: admin.email,
        lawyer: lawyerUser.email,
        lawyerCabinet: "/lawyer",
        lawyerPublic: `/lawyers/${lawyer.slug}`,
        referralLink: `/register?ref=${lawyerUser.referralCode}`,
        client: client.email,
        clientBilling: "/dashboard/billing",
        gasanov: "/gasanov/lawyers",
      },
      null,
      2
    )
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
