const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

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

