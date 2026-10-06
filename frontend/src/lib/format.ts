const CENTS_DIGITS = 2;

const wholeDollars = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const withCents = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: CENTS_DIGITS,
  maximumFractionDigits: CENTS_DIGITS,
});

/** `5500` → "$5,500", `19.9` → "$19.90" — cents only when there are any. */
export function formatPrice(price: number): string {
  return Number.isInteger(price) ? wholeDollars.format(price) : withCents.format(price);
}

/** `painting` → "Painting" — for <option> labels, where CSS `capitalize` doesn't apply reliably. */
export function formatArtworkType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}
