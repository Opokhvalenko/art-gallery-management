import { describe, expect, it } from 'vitest';
import { getArtworkImage, getArtworkInitials } from './artwork-placeholder';

describe('getArtworkImage', () => {
  it('is deterministic — the same id always returns the same image', () => {
    const first = getArtworkImage('painting', 'cmuuytuna0000rt5oqkctnnd9');
    const second = getArtworkImage('painting', 'cmuuytuna0000rt5oqkctnnd9');
    expect(first).toBe(second);
  });

  it('gives two artworks of the same type different images — regression for the seed data collision', () => {
    // These two real seed ids share a long common prefix (same createMany
    // batch) and differ by one digit. A naive `(hash * 31 + c) % 997`
    // rolling hash put both in the same bucket, so every "painting" card
    // showed the same picture. FNV-1a must not repeat that.
    const abstractVibrance = getArtworkImage('painting', 'cmuuytuna0000rt5oqkctnnd9');
    const tranquilLake = getArtworkImage('painting', 'cmuuytuna0001rt5ookrlmnp7');
    expect(abstractVibrance).not.toBe(tranquilLake);
  });

  it('returns undefined for a type with no image pool', () => {
    expect(getArtworkImage('unknown-type', 'some-id')).toBeUndefined();
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
