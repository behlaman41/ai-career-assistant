import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables
config({ path: '../apps/api/.env' });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/app',
    },
  },
});

async function main() {
  console.log('Seeding database...');

  // Create a demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
    },
  });

  // Create demo documents
  const resumeDoc = await prisma.document.upsert({
    where: {
      userId_sha256: {
        userId: user.id,
        sha256: '0'.repeat(64),
      },
    },
    update: {},
    create: {
      userId: user.id,
      type: 'resume',
      storageKey: 'demo-resume.pdf',
      mime: 'application/pdf',
      sha256: '0'.repeat(64),
    },
  });

  const jdDoc = await prisma.document.upsert({
    where: {
      userId_sha256: {
        userId: user.id,
        sha256: '1'.repeat(64),
      },
    },
    update: {},
    create: {
      userId: user.id,
      type: 'jd',
      storageKey: 'demo-jd.pdf',
      mime: 'application/pdf',
      sha256: '1'.repeat(64),
    },
  });

  // Create demo resume
  const resume = await prisma.resume.upsert({
    where: { id: 'demo-resume-id' },
    update: {},
    create: {
      id: 'demo-resume-id',
      userId: user.id,
      title: 'My Resume',
      sourceDocumentId: resumeDoc.id,
    },
  });

  // Create demo job description
  const jd = await prisma.jobDescription.upsert({
    where: { id: 'demo-jd-id' },
    update: {},
    create: {
      id: 'demo-jd-id',
      userId: user.id,
      title: 'Software Engineer',
      company: 'Tech Corp',
      sourceDocumentId: jdDoc.id,
      parsedJson: {
        title: 'Software Engineer',
        company: 'Tech Corp',
        description: 'Build amazing software',
        requirements: ['JavaScript', 'React', 'Node.js'],
        responsibilities: ['Write code', 'Review PRs'],
        skills: ['JavaScript', 'React', 'Node.js'],
      },
    },
  });

  console.log('Seeding completed:', { user, resume, jd });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
