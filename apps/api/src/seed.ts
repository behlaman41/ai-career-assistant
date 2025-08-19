import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  console.log('Seeding API DB...');

  const user = await prisma.user.upsert({
    where: { email: 'api-demo@example.com' },
    update: {},
    create: { email: 'api-demo@example.com', name: 'API Demo' },
  });

  console.log('Seeded user:', user.email);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
