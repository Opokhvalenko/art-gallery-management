import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ArtworkFilters, type ArtworkFiltersState } from './ArtworkFilters';

const EMPTY: ArtworkFiltersState = { artist: '', type: '', price: '' };

describe('ArtworkFilters', () => {
  it('reports the typed artist value through onChange', () => {
    const onChange = vi.fn();
    render(<ArtworkFilters filters={EMPTY} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Artist'), { target: { value: 'Monet' } });

    expect(onChange).toHaveBeenCalledWith({ ...EMPTY, artist: 'Monet' });
  });

  it('shows "Clear filters" only when a filter is active, and resets all fields on click', () => {
    const onChange = vi.fn();
    const { rerender } = render(<ArtworkFilters filters={EMPTY} onChange={onChange} />);
    expect(screen.queryByRole('button', { name: /clear filters/i })).not.toBeInTheDocument();

    rerender(<ArtworkFilters filters={{ ...EMPTY, type: 'painting' }} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /clear filters/i }));

    expect(onChange).toHaveBeenCalledWith(EMPTY);
  });
});
