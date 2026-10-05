import { PrismaClient } from '@prisma/client';
import { SEED_ARTWORKS } from './seed-data';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const existing = await prisma.artwork.count();
  if (existing > 0) {
    console.warn(`Skipping seed — ${existing} artworks already exist.`);
    return;
  }

  await prisma.artwork.createMany({ data: SEED_ARTWORKS });
  console.warn(`Seeded ${SEED_ARTWORKS.length} artworks.`);
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
