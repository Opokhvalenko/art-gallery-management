/**
 * Pure data, no side effects — safe to import from both seed.ts (the CLI
 * seed script) and the e2e tests, without accidentally running main().
 */
export const SEED_ARTWORKS = [
  {
    title: 'The Starry Night',
    artist: 'Vincent van Gogh',
    type: 'painting',
    price: 5500,
    availability: true,
  },
  {
    title: 'Girl with a Pearl Earring',
    artist: 'Johannes Vermeer',
    type: 'painting',
    price: 3500,
    availability: true,
  },
  {
    title: 'Pillars of Creation',
    artist: 'NASA / ESA',
    type: 'digital',
    price: 11000,
    availability: false,
  },
  {
    title: 'Little Dancer of Fourteen Years',
    artist: 'Edgar Degas',
    type: 'sculpture',
    price: 8200,
    availability: true,
  },
];
