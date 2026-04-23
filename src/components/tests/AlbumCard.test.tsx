import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AlbumCard from '../ui/AlbumCard';
import type { AlbumCardProps } from '../ui/AlbumCard';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('react-icons/si', () => ({
  SiSoundcloud: () => <svg data-testid="sc-icon" />,
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const THREE_TRACKS: AlbumCardProps['tracks'] = [
  { id: 't1', number: 1, title: 'Track One',   artist: 'Artist A', playsCount: 1_000  },
  { id: 't2', number: 2, title: 'Track Two',   artist: 'Artist B', playsCount: 2_000  },
  { id: 't3', number: 3, title: 'Track Three', artist: 'Artist C', playsCount: 3_000  },
];

const FIVE_TRACKS: AlbumCardProps['tracks'] = [
  ...THREE_TRACKS,
  { id: 't4', number: 4, title: 'Track Four', artist: 'Artist D', playsCount: 4_000  },
  { id: 't5', number: 5, title: 'Track Five', artist: 'Artist E', playsCount: 5_000  },
];

const baseProps: AlbumCardProps = {
  id:        'album-1',
  type:      'album',
  title:     'Test Album',
  artist:    'Test Artist',
  coverUrl:  null,
  createdAt: new Date(Date.now() - 2 * 86_400_000).toISOString(), // 2 days ago
  tracks:    THREE_TRACKS,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AlbumCard — basic rendering', () => {
  it('renders the album title', () => {
    render(<AlbumCard {...baseProps} />);
    expect(screen.getByText('Test Album')).toBeInTheDocument();
  });

  it('renders the artist name', () => {
    render(<AlbumCard {...baseProps} />);
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
  });

  it('renders the "album" type badge', () => {
    render(<AlbumCard {...baseProps} />);
    expect(screen.getByText('album')).toBeInTheDocument();
  });

  it('renders the "playlist" type badge', () => {
    render(<AlbumCard {...baseProps} type="playlist" />);
    expect(screen.getByText('playlist')).toBeInTheDocument();
  });

  it('renders a play button', () => {
    render(<AlbumCard {...baseProps} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});

// ─── Cover art ────────────────────────────────────────────────────────────────

describe('AlbumCard — cover art', () => {
  it('renders SoundCloud fallback icon when coverUrl is null', () => {
    render(<AlbumCard {...baseProps} coverUrl={null} />);
    expect(screen.getAllByTestId('sc-icon').length).toBeGreaterThan(0);
  });

  it('renders cover image when coverUrl is provided', () => {
    render(<AlbumCard {...baseProps} coverUrl="https://example.com/cover.jpg" />);
    const img = screen.getByAltText('Test Album') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toBe('https://example.com/cover.jpg');
  });

  it('does NOT render an <img> when coverUrl is null', () => {
    render(<AlbumCard {...baseProps} coverUrl={null} />);
    expect(screen.queryByAltText('Test Album')).not.toBeInTheDocument();
  });
});

// ─── Track list ───────────────────────────────────────────────────────────────

describe('AlbumCard — track list', () => {
  it('renders all tracks when total ≤ 3', () => {
    render(<AlbumCard {...baseProps} />);
    expect(screen.getByText('Track One')).toBeInTheDocument();
    expect(screen.getByText('Track Two')).toBeInTheDocument();
    expect(screen.getByText('Track Three')).toBeInTheDocument();
  });

  it('shows only 3 tracks by default when total > 3', () => {
    render(<AlbumCard {...baseProps} tracks={FIVE_TRACKS} />);
    expect(screen.getByText('Track One')).toBeInTheDocument();
    expect(screen.getByText('Track Three')).toBeInTheDocument();
    expect(screen.queryByText('Track Four')).not.toBeInTheDocument();
    expect(screen.queryByText('Track Five')).not.toBeInTheDocument();
  });

  it('renders track numbers', () => {
    render(<AlbumCard {...baseProps} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders formatted play counts', () => {
    render(<AlbumCard {...baseProps} />);
    expect(screen.getByText('1,000')).toBeInTheDocument();
    expect(screen.getByText('2,000')).toBeInTheDocument();
    expect(screen.getByText('3,000')).toBeInTheDocument();
  });

  it('renders track artist names', () => {
    render(<AlbumCard {...baseProps} />);
    expect(screen.getByText(/Artist A/)).toBeInTheDocument();
    expect(screen.getByText(/Artist B/)).toBeInTheDocument();
  });

  it('handles an empty tracks array without crashing', () => {
    render(<AlbumCard {...baseProps} tracks={[]} />);
    expect(screen.getByText('Test Album')).toBeInTheDocument();
  });
});

// ─── Expand / collapse ────────────────────────────────────────────────────────

describe('AlbumCard — expand / collapse', () => {
  it('shows "View X tracks" button when total > 3', () => {
    render(<AlbumCard {...baseProps} tracks={FIVE_TRACKS} />);
    expect(screen.getByText(`View ${FIVE_TRACKS.length} tracks`)).toBeInTheDocument();
  });

  it('does NOT show expand button when total ≤ 3', () => {
    render(<AlbumCard {...baseProps} />);
    expect(screen.queryByText(/View \d+ tracks/)).not.toBeInTheDocument();
  });

  it('reveals all tracks after clicking expand', () => {
    render(<AlbumCard {...baseProps} tracks={FIVE_TRACKS} />);
    fireEvent.click(screen.getByText(`View ${FIVE_TRACKS.length} tracks`));
    expect(screen.getByText('Track Four')).toBeInTheDocument();
    expect(screen.getByText('Track Five')).toBeInTheDocument();
  });

  it('shows "View fewer" after expanding', () => {
    render(<AlbumCard {...baseProps} tracks={FIVE_TRACKS} />);
    fireEvent.click(screen.getByText(`View ${FIVE_TRACKS.length} tracks`));
    expect(screen.getByText('View fewer')).toBeInTheDocument();
  });

  it('hides extra tracks after collapsing', () => {
    render(<AlbumCard {...baseProps} tracks={FIVE_TRACKS} />);
    fireEvent.click(screen.getByText(`View ${FIVE_TRACKS.length} tracks`));
    fireEvent.click(screen.getByText('View fewer'));
    expect(screen.queryByText('Track Four')).not.toBeInTheDocument();
    expect(screen.queryByText('Track Five')).not.toBeInTheDocument();
  });

  it('restores "View X tracks" text after collapsing', () => {
    render(<AlbumCard {...baseProps} tracks={FIVE_TRACKS} />);
    fireEvent.click(screen.getByText(`View ${FIVE_TRACKS.length} tracks`));
    fireEvent.click(screen.getByText('View fewer'));
    expect(screen.getByText(`View ${FIVE_TRACKS.length} tracks`)).toBeInTheDocument();
  });
});

// ─── Action buttons ───────────────────────────────────────────────────────────

describe('AlbumCard — action buttons', () => {
  it('renders at least 5 action buttons (Heart, Repeat, Share, Copy, More)', () => {
    render(<AlbumCard {...baseProps} />);
    // 1 play button + 5 action buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(6);
  });
});

// ─── formatTimeAgo ────────────────────────────────────────────────────────────

describe('AlbumCard — formatTimeAgo', () => {
  it('displays "today" for a timestamp from the current day', () => {
    render(<AlbumCard {...baseProps} createdAt={new Date().toISOString()} />);
    expect(screen.getByText('today')).toBeInTheDocument();
  });

  it('displays "1 day ago" for 1 day old', () => {
    const date = new Date(Date.now() - 1 * 86_400_000).toISOString();
    render(<AlbumCard {...baseProps} createdAt={date} />);
    expect(screen.getByText('1 day ago')).toBeInTheDocument();
  });

  it('displays "2 days ago" for 2 days old', () => {
    const date = new Date(Date.now() - 2 * 86_400_000).toISOString();
    render(<AlbumCard {...baseProps} createdAt={date} />);
    expect(screen.getByText('2 days ago')).toBeInTheDocument();
  });

  it('displays "1 month ago" for ~31 days old', () => {
    const date = new Date(Date.now() - 31 * 86_400_000).toISOString();
    render(<AlbumCard {...baseProps} createdAt={date} />);
    expect(screen.getByText('1 month ago')).toBeInTheDocument();
  });

  it('displays "2 months ago" for ~62 days old', () => {
    const date = new Date(Date.now() - 62 * 86_400_000).toISOString();
    render(<AlbumCard {...baseProps} createdAt={date} />);
    expect(screen.getByText('2 months ago')).toBeInTheDocument();
  });

  it('displays "1 year ago" for ~365 days old', () => {
    const date = new Date(Date.now() - 365 * 86_400_000).toISOString();
    render(<AlbumCard {...baseProps} createdAt={date} />);
    expect(screen.getByText('1 year ago')).toBeInTheDocument();
  });

  it('displays "2 years ago" for ~730 days old', () => {
    const date = new Date(Date.now() - 730 * 86_400_000).toISOString();
    render(<AlbumCard {...baseProps} createdAt={date} />);
    expect(screen.getByText('2 years ago')).toBeInTheDocument();
  });

  it('renders without crashing when createdAt is an empty string', () => {
    render(<AlbumCard {...baseProps} createdAt="" />);
    expect(screen.getByText('Test Album')).toBeInTheDocument();
  });
});