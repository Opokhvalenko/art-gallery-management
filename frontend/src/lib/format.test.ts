import { describe, expect, it } from 'vitest';
import { formatArtworkType, formatPrice } from './format';

describe('formatPrice', () => {
  it('shows whole prices without cents', () => {
    expect(formatPrice(5500)).toBe('$5,500');
  });

  it('always shows two decimal places when there are cents', () => {
    expect(formatPrice(19.9)).toBe('$19.90');
    expect(formatPrice(10.55)).toBe('$10.55');
  });
});

describe('formatArtworkType', () => {
  it('capitalizes the type for display', () => {
    expect(formatArtworkType('photography')).toBe('Photography');
  });
});
