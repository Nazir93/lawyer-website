const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash('Admin123!', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lawyer.ru' },
    update: {},
    create: {
      name: 'Администратор',
      email: 'admin@lawyer.ru',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  
  console.log('Admin created:', admin);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

