import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/features/auth/services/api';
import { adminServices } from '../services/adminServices';

vi.mock('@/features/auth/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('adminServices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps analytics summary and report queue endpoints', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: [{ id: 'reason-1', label: 'Spam' }] } as never);
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        data: [],
        pagination: { page: 1, limit: 20, hasMore: false, totalCount: 0 },
      },
    } as never);
    vi.mocked(api.get).mockResolvedValueOnce({ data: { totalUsers: 10 } } as never);
    vi.mocked(api.post).mockResolvedValueOnce({ data: { message: 'done' } } as never);

    await expect(adminServices.reports.getReasons()).resolves.toEqual([{ id: 'reason-1', label: 'Spam' }]);
    await expect(adminServices.reports.getQueue()).resolves.toEqual({
      data: [],
      pagination: { page: 1, limit: 20, hasMore: false, totalCount: 0 },
    });
    await expect(adminServices.analytics.getSummary()).resolves.toEqual({ totalUsers: 10 });
    await expect(adminServices.reports.submitSpam('track-1')).resolves.toBe('done');

    expect(api.get).toHaveBeenNthCalledWith(1, '/reports/reasons');
    expect(api.get).toHaveBeenNthCalledWith(2, '/admin/reports', {
      params: {
        page: 1,
        limit: 20,
        status: undefined,
        entityType: undefined,
        reasonId: undefined,
      },
    });
    expect(api.get).toHaveBeenNthCalledWith(3, '/admin/stats/summary');
    expect(api.post).toHaveBeenCalledWith('/reports/spam', { reportedEntityId: 'track-1' });
  });

  it('maps moderation and content endpoints', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { message: 'suspended' } } as never);
    vi.mocked(api.post).mockResolvedValueOnce({ data: { message: 'unsuspended' } } as never);
    vi.mocked(api.post).mockResolvedValueOnce({ data: { message: 'banned' } } as never);
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        userId: 'user-1',
        isSuspended: true,
        isBanned: true,
        suspendedUntil: null,
        suspensionReason: 'spam',
      },
    } as never);
    vi.mocked(api.patch).mockResolvedValueOnce({ data: { message: 'hidden' } } as never);
    vi.mocked(api.patch).mockResolvedValueOnce({ data: { message: 'unhidden' } } as never);
    vi.mocked(api.delete).mockResolvedValueOnce({ data: { message: 'deleted' } } as never);

    await expect(
      adminServices.users.suspend('user-1', { durationHours: 24, reason: 'spam' }),
    ).resolves.toBe('suspended');
    await expect(adminServices.users.unsuspend('user-1')).resolves.toBe('unsuspended');
    await expect(adminServices.users.ban('user-1')).resolves.toBe('banned');
    await expect(adminServices.users.getModeration('user-1')).resolves.toMatchObject({
      userId: 'user-1',
      isSuspended: true,
      isBanned: true,
    });
    await expect(adminServices.content.hideTrack('track-1')).resolves.toBe('hidden');
    await expect(adminServices.content.unhideTrack('track-1')).resolves.toBe('unhidden');
    await expect(adminServices.content.deleteTrack('track-1')).resolves.toBe('deleted');

    expect(api.post).toHaveBeenNthCalledWith(1, '/admin/users/user-1/suspend', {
      durationHours: 24,
      reason: 'spam',
    });
    expect(api.post).toHaveBeenNthCalledWith(2, '/admin/users/user-1/unsuspend');
    expect(api.post).toHaveBeenNthCalledWith(3, '/admin/users/user-1/ban');
    expect(api.patch).toHaveBeenNthCalledWith(1, '/admin/tracks/track-1/hide');
    expect(api.patch).toHaveBeenNthCalledWith(2, '/admin/tracks/track-1/unhide');
    expect(api.delete).toHaveBeenNthCalledWith(1, '/admin/tracks/track-1');
  });
});