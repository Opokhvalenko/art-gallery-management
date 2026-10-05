/**
 * The Artwork model has no image field (see README decisions — not in the
 * task's model, not added). Instead: a deterministic gradient keyed by
 * type, with the title's initials — same artwork always looks the same.
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
