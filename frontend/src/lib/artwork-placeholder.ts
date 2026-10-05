import digitalImg from '../assets/artwork-types/digital.webp';
import paintingImg from '../assets/artwork-types/painting.webp';
import paintingImg2 from '../assets/artwork-types/painting2.webp';
import sculptureImg from '../assets/artwork-types/sculpture.webp';

/**
 * The Artwork model has no image field (see README decisions — not in the
 * task's model, not added). The 4 seed artworks are real public-domain
 * works, each keyed here by its exact title — not by `type` — so a
 * same-type guess never shows one seed artwork's picture on another's
 * card. Anything else (a reviewer's own title, an edited one) falls back
 * to the gradient + initials below, same as a known image that fails to
 * load. Attribution in README.
 */
const KNOWN_ARTWORK_IMAGES: Record<string, string> = {
  'The Starry Night': paintingImg,
  'Girl with a Pearl Earring': paintingImg2,
  'Pillars of Creation': digitalImg,
  'Little Dancer of Fourteen Years': sculptureImg,
};

export function getArtworkImage(title: string): string | undefined {
  return KNOWN_ARTWORK_IMAGES[title];
}

/**
 * Gradient + initials fallback for any artwork with no known image (not in
 * KNOWN_ARTWORK_IMAGES, or the image itself fails to load).
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
