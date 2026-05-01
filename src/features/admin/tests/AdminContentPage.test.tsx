import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import AdminContentPage from '../pages/AdminContentPage';
import { adminServices } from '../services/adminServices';

vi.mock('../services/adminServices', () => ({
  adminServices: {
    content: {
      hideTrack: vi.fn(),
      unhideTrack: vi.fn(),
      deleteTrack: vi.fn(),
      hideComment: vi.fn(),
      unhideComment: vi.fn(),
      deleteComment: vi.fn(),
    },
  },
}));

describe('AdminContentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminServices.content.hideTrack).mockResolvedValue('Track hidden' as never);
    vi.mocked(adminServices.content.unhideTrack).mockResolvedValue('Track unhidden' as never);
    vi.mocked(adminServices.content.deleteTrack).mockResolvedValue('Track deleted' as never);
    vi.mocked(adminServices.content.hideComment).mockResolvedValue('Comment hidden' as never);
    vi.mocked(adminServices.content.unhideComment).mockResolvedValue('Comment unhidden' as never);
    vi.mocked(adminServices.content.deleteComment).mockResolvedValue('Comment deleted' as never);
  });

  it('runs a content moderation action and logs it', async () => {
    const user = userEvent.setup();
    render(<AdminContentPage />);

    await user.type(screen.getByPlaceholderText('Paste track id'), 'track-77');
    await user.click(screen.getByRole('button', { name: /^Hide Track$/ }));

    await waitFor(() => {
      expect(adminServices.content.hideTrack).toHaveBeenCalledWith('track-77');
    });

    expect(screen.getByText('track-77')).toBeInTheDocument();
    expect(screen.getByText(/TRACK • HIDE/i)).toBeInTheDocument();
  });
});