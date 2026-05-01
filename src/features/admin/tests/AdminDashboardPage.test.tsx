import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import { adminServices } from '../services/adminServices';

vi.mock('../services/adminServices', () => ({
  adminServices: {
    analytics: {
      getSummary: vi.fn(),
      getTop: vi.fn(),
      getReportsBreakdown: vi.fn(),
      getTimeSeries: vi.fn(),
    },
  },
}));

vi.mock('../components/AdminTopListCard', () => ({
  default: ({ title, selectedKey, items, options, onChange }: Record<string, unknown>) => (
    <div data-testid="top-list-card">
      <span>{String(title)}</span>
      <span>{String(selectedKey)}</span>
      <span>{String((items as unknown[]).length)}</span>
      <button type="button" onClick={() => onChange?.((options as Array<{ key: string }>)[1].key)}>
        switch-ranking
      </button>
    </div>
  ),
}));

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.mocked(adminServices.analytics.getSummary).mockResolvedValue({
      totalUsers: 1234,
      newUsersToday: 12,
      newUsersThisWeek: 34,
      activeUsers: 56,
      suspendedUsers: 1,
      bannedUsers: 0,
      artistCount: 2,
      listenerCount: 0,
      totalTracks: 99,
      newTracksToday: 3,
      newTracksThisWeek: 8,
      totalPlays: 4567,
      playsToday: 89,
      completedPlays: 0,
      playThroughRate: 42.5,
      totalStorageBytes: 0,
      totalStorageGB: 0,
      totalReports: 5,
      pendingReports: 1,
      artistToListenerRatio: null,
      generatedAt: new Date('2026-04-29T12:00:00Z').toISOString(),
    } as never);
    vi.mocked(adminServices.analytics.getTop).mockResolvedValue({
      mostPlayedTracks: [{ trackId: 'track-1', title: 'Song A', artistName: 'Artist A', playCount: 99 }],
      mostReportedTracks: [{ trackId: 'track-2', title: 'Song B', artistName: 'Artist B', reportCount: 11 }],
      mostReportedUsers: [{ userId: 'user-1', username: 'moderated', displayName: 'Moderated User', reportCount: 7 }],
      mostActiveUsers: [{ userId: 'user-2', username: 'active', displayName: 'Active User', playCount: 4 }],
    } as never);
    vi.mocked(adminServices.analytics.getReportsBreakdown).mockResolvedValue({
      byReason: [],
      byEntityType: [],
      byStatus: [{ status: 'RESOLVED', count: 4 }],
      resolutionRate: 80,
      avgResolutionHours: 12,
    } as never);
    vi.mocked(adminServices.analytics.getTimeSeries).mockResolvedValue({
      rangeStart: '2026-04-01',
      rangeEnd: '2026-04-29',
      playsSeries: [],
      activeUsersSeries: [],
      newSignupsSeries: [],
      newTracksSeries: [],
      newReportsSeries: [],
    } as never);
  });

  it('renders dashboard metrics and summary data', async () => {
    const user = userEvent.setup();
    render(<AdminDashboardPage />);

    await waitFor(() => expect(screen.getByText('Total Active Users')).toBeInTheDocument());
    expect(screen.getByText('56')).toBeInTheDocument();
    expect(screen.getByText('42.5%')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /show summary/i }));
    await waitFor(() => expect(screen.getByText('Summary')).toBeInTheDocument());
    expect(screen.getByText('Total users')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('99')).toBeInTheDocument();

    expect(screen.getByTestId('top-list-card')).toBeInTheDocument();
    expect(screen.getByText('Most Played Tracks')).toBeInTheDocument();
  });
});