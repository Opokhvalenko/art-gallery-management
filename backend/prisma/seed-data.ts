/**
 * Pure data, no side effects — safe to import from both seed.ts (the CLI
 * seed script) and the e2e tests, without accidentally running main().
 */
export const SEED_ARTWORKS = [
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
