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
  const newPassword = 'Admin123!';
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  
  const admin = await prisma.user.update({
    where: { email: 'admin@lawyer.ru' },
    data: { password: hashedPassword },
  });
  
  console.log('Password reset for:', admin.email);
  console.log('New password:', newPassword);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

