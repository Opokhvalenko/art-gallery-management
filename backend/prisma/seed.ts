import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SEED_ARTWORKS = [
  {
    title: 'Abstract Vibrance',
    artist: 'Alex Johnson',
    type: 'painting',
    price: 5500,
    availability: true,
  },
  {
    title: 'Tranquil Lake',
    artist: 'Maria Gonzales',
    type: 'painting',
    price: 3500,
    availability: true,
  },
  {
    title: 'Geometric Harmony',
    artist: 'Liam Smith',
    type: 'digital',
    price: 11000,
    availability: false,
  },
  {
    title: 'Silent Observer',
    artist: 'Liam Smith',
    type: 'sculpture',
    price: 8200,
    availability: true,
  },
];

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
