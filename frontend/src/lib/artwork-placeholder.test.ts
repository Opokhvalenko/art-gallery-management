import { describe, expect, it } from 'vitest';
import { getArtworkImage, getArtworkInitials } from './artwork-placeholder';

describe('getArtworkImage', () => {
  it('returns a real image for a known seed title', () => {
    expect(getArtworkImage('The Starry Night')).toBeDefined();
  });

  it('gives two different seed titles different images', () => {
    // A type-based lookup once showed the same picture for two different
    // paintings — titles are an exact key, so that can't happen again.
    const starryNight = getArtworkImage('The Starry Night');
    const girlWithAPearlEarring = getArtworkImage('Girl with a Pearl Earring');
    expect(starryNight).not.toBe(girlWithAPearlEarring);
  });

  it('returns undefined for any title outside the known 4, falling back to the gradient', () => {
    expect(getArtworkImage('Sunset Over the Ocean')).toBeUndefined();
  });
});

describe('getArtworkInitials', () => {
  it('takes the first letter of up to two words', () => {
    expect(getArtworkInitials('Sunset Over the Ocean')).toBe('SO');
  });

  it('falls back to "?" for an empty title', () => {
    expect(getArtworkInitials('   ')).toBe('?');
  });
});
