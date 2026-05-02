import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import AdminReportsPage from '../pages/AdminReportsPage';
import { adminServices } from '../services/adminServices';

vi.mock('../services/adminServices', () => ({
  adminServices: {
    reports: {
      getReasons: vi.fn(),
      getQueue: vi.fn(),
      getById: vi.fn(),
      review: vi.fn(),
    },
  },
}));

describe('AdminReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminServices.reports.getReasons).mockResolvedValue([
      { id: 'reason-spam', label: 'Spam' },
    ] as never);
    vi.mocked(adminServices.reports.getQueue).mockResolvedValue({
      data: [
        {
          id: 'report-1',
          reportedEntityType: 'TRACK',
          reportedEntityId: 'track-1',
          reasonId: 'reason-spam',
          status: 'PENDING',
          createdAt: '2026-04-29T10:00:00.000Z',
        },
      ],
      pagination: { page: 1, limit: 20, hasMore: false, totalCount: 1 },
    } as never);
    vi.mocked(adminServices.reports.getById).mockResolvedValue({
      id: 'report-1',
      reportedEntityType: 'TRACK',
      reportedEntityId: 'track-1',
      reasonId: 'reason-spam',
      status: 'PENDING',
      createdAt: '2026-04-29T10:00:00.000Z',
      reporterId: 'user-1',
      details: 'Looks like spam',
      reviewedAt: null,
      reviewedByAdminId: null,
      adminNote: null,
      actionTaken: 'NONE',
    } as never);
    vi.mocked(adminServices.reports.review).mockResolvedValue('saved' as never);
  });

  it('loads a report and submits a rejection review', async () => {
    const user = userEvent.setup();
    render(<AdminReportsPage />);

    await waitFor(() => expect(screen.getByText('report-1...')).toBeInTheDocument());
    await user.click(screen.getByText('report-1...'));

    await waitFor(() => expect(screen.getByText('Reporter')).toBeInTheDocument());
    expect(screen.getByText('Looks like spam')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reject' }));
    await user.type(screen.getByPlaceholderText('Add an internal note for the moderation log'), 'Rejected as spam');
    await user.click(screen.getByRole('button', { name: /save rejection/i }));

    await waitFor(() => {
      expect(adminServices.reports.review).toHaveBeenCalledWith('report-1', {
        status: 'REJECTED',
        adminNote: 'Rejected as spam',
        actionTaken: 'NONE',
      });
    });
  });
});