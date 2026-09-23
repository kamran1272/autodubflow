import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: 'demo@dubflow.app' },
    update: {},
    create: {
      email: 'demo@dubflow.app',
      name: 'Demo User',
    },
  });

  await prisma.voice.upsert({
    where: { id: 'demo-spanish-neutral' },
    update: {},
    create: {
      id: 'demo-spanish-neutral',
      name: 'Spanish — Neutral',
      language: 'es',
      gender: 'neutral',
      accent: 'Latin American',
      style: 'Professional',
      provider: 'mock',
      description: 'Default Spanish voice for demo projects.',
      pitchHz: 168,
      tagsJson: '["narration","default"]',
      isDefault: true,
    },
  });

  const user = await prisma.user.findUnique({ where: { email: 'demo@dubflow.app' } });

  if (user) {
    const workspace = await prisma.workspace.upsert({
      where: { slug: 'demo-workspace' },
      update: {},
      create: {
        name: 'Demo Workspace',
        slug: 'demo-workspace',
        ownerId: user.id,
      },
    });

    await prisma.project.upsert({
      where: { id: 'demo-project-id' },
      update: {},
      create: {
        id: 'demo-project-id',
        workspaceId: workspace.id,
        userId: user.id,
        name: 'Product Demo Video',
        status: 'COMPLETED',
        sourceLanguage: 'en',
        targetLanguage: 'es',
        voiceId: 'demo-spanish-neutral',
        durationSeconds: 154,
        completedAt: new Date(),
      },
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
