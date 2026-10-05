import digitalImg from '../assets/artwork-types/digital.webp';
import digitalImg2 from '../assets/artwork-types/digital2.webp';
import paintingImg from '../assets/artwork-types/painting.webp';
import paintingImg2 from '../assets/artwork-types/painting2.webp';
import photographyImg2 from '../assets/artwork-types/photography2.webp';
import sculptureImg from '../assets/artwork-types/sculpture.webp';

/**
 * The Artwork model has no image field (see README decisions — not in the
 * task's model, not added). Each artwork still needs *some* visual, so every
 * card shows one representative, public-domain image for its `type` — not a
 * made-up picture of that specific piece. A type can have more than one
 * candidate image (so two artworks of the same type don't show an identical
 * picture) — which one an artwork gets is a deterministic hash of its id, so
 * a given artwork always shows the same picture. A type with no entry here
 * (or none left after curating the set) falls back to the gradient below.
 * Attribution in README.
 */
const TYPE_IMAGES: Record<string, string[]> = {
  painting: [paintingImg, paintingImg2],
  sculpture: [sculptureImg],
  photography: [photographyImg2],
  digital: [digitalImg, digitalImg2],
};

/**
 * FNV-1a — chosen over a naive polynomial rolling hash after that version
 * collided on this app's own seed data: cuid ids created in the same
 * createMany() batch share a long common prefix ("cmuuytuna000...") and
 * differ by one digit, which was enough for `(hash * 31 + charCode) % 997`
 * to land both artworks in the same bucket. FNV-1a's per-character XOR +
 * multiply avalanches much faster, verified to split that exact pair.
 */
function hashToIndex(id: string, poolSize: number): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return Math.abs(hash) % poolSize;
}

export function getArtworkImage(type: string, id: string): string | undefined {
  const pool = TYPE_IMAGES[type];
  if (!pool || pool.length === 0) {
    return undefined;
  }
  return pool[hashToIndex(id, pool.length)];
}

/**
 * Gradient + initials fallback for a `type` with no image (not in
 * TYPE_IMAGES, or the image itself fails to load).
 */
const TYPE_GRADIENTS: Record<string, string> = {
  painting: 'from-amber-400 to-rose-500',
  sculpture: 'from-slate-500 to-zinc-700',
  photography: 'from-sky-400 to-indigo-600',
  digital: 'from-fuchsia-500 to-purple-700',
  print: 'from-emerald-400 to-teal-600',
};

const FALLBACK_GRADIENT = 'from-gray-400 to-gray-600';

export function getArtworkGradient(type: string): string {
  return TYPE_GRADIENTS[type] ?? FALLBACK_GRADIENT;
}

export function getArtworkInitials(title: string): string {
  const initials = title
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
  return initials || '?';
}
