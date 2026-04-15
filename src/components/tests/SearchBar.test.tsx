/**
 * SearchBar.test.tsx
 *
 * SearchBar has no submit button — it submits on Enter keypress.
 * The only interactive element is the text input; the search icon is decorative.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SearchBar from '../ui/SearchBar';

// ─── Mock useNavigate ─────────────────────────────────────────────────────────

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ─── Helper ───────────────────────────────────────────────────────────────────

function renderSearchBar() {
  return render(
    <MemoryRouter>
      <SearchBar />
    </MemoryRouter>,
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SearchBar — rendering', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders a text input', () => {
    renderSearchBar();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders a search icon (SVG)', () => {
    renderSearchBar();
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('input starts empty', () => {
    renderSearchBar();
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('renders a search-related placeholder', () => {
    renderSearchBar();
    const input = screen.getByRole('textbox');
    expect(input.getAttribute('placeholder')).toBeTruthy();
  });

  it('input is not disabled', () => {
    renderSearchBar();
    expect(screen.getByRole('textbox')).not.toBeDisabled();
  });
});

describe('SearchBar — typing', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('updates value as user types', async () => {
    renderSearchBar();
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'lofi beats');
    expect(input).toHaveValue('lofi beats');
  });

  it('reflects each keypress incrementally', async () => {
    renderSearchBar();
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'abc');
    expect(input).toHaveValue('abc');
  });
});

describe('SearchBar — form submission', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('navigates to /search?q=... when Enter is pressed', async () => {
    renderSearchBar();
    await userEvent.type(screen.getByRole('textbox'), 'kendrick lamar{Enter}');
    expect(mockNavigate).toHaveBeenCalledWith('/search?q=kendrick%20lamar');
  });

  it('trims leading/trailing whitespace before navigating', async () => {
    renderSearchBar();
    await userEvent.type(screen.getByRole('textbox'), '  lofi  {Enter}');
    expect(mockNavigate).toHaveBeenCalledWith('/search?q=lofi');
  });

  it('does NOT navigate for an empty query on Enter', async () => {
    renderSearchBar();
    await userEvent.type(screen.getByRole('textbox'), '{Enter}');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('does NOT navigate for a whitespace-only query', async () => {
    renderSearchBar();
    await userEvent.type(screen.getByRole('textbox'), '   {Enter}');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('encodes special characters in the query', async () => {
    renderSearchBar();
    await userEvent.type(screen.getByRole('textbox'), 'AC/DC{Enter}');
    const call = mockNavigate.mock.calls[0][0] as string;
    expect(call).toMatch('/search?q=');
    expect(call).not.toContain(' ');
  });

  it('only triggers navigate once per Enter press', async () => {
    renderSearchBar();
    await userEvent.type(screen.getByRole('textbox'), 'drake{Enter}');
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
});

describe('SearchBar — controlled input state', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('allows typing a new query after a previous submit', async () => {
    renderSearchBar();
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'first{Enter}');
    await userEvent.clear(input);
    await userEvent.type(input, 'second');
    expect(input).toHaveValue('second');
  });

  it('does not navigate again without a new Enter press', async () => {
    renderSearchBar();
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'first{Enter}');
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    await userEvent.clear(input);
    await userEvent.type(input, 'second');
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
});