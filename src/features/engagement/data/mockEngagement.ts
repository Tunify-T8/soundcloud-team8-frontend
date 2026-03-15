import type { Like, Repost, EngagementCounts } from '../types';

const makeAvatar = (text: string) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"><rect width="50" height="50" fill="#374151"/><text x="50%" y="50%" font-size="18" fill="#F9FAFB" text-anchor="middle" dominant-baseline="central">${text}</text></svg>`
  )}`;

export { makeAvatar };

export const mockLikes: Like[] = [
  {
    id: 'like1',
    userId: 'user3',
    trackId: '1',
    createdAt: '2023-06-02T00:00:00Z',
    user: {
      id: 'user3',
      username: 'musiclover',
      avatarUrl: makeAvatar('ML'),
    },
  },
  {
    id: 'like2',
    userId: 'user4',
    trackId: '1',
    createdAt: '2023-06-03T00:00:00Z',
    user: {
      id: 'user4',
      username: 'beatfan',
      avatarUrl: makeAvatar('BF'),
    },
  },
];

export const mockReposts: Repost[] = [
  {
    id: 'repost1',
    userId: 'user5',
    trackId: '1',
    createdAt: '2023-06-04T00:00:00Z',
    user: {
      id: 'user5',
      username: 'shareguru',
      avatarUrl: makeAvatar('SG'),
    },
  },
];

export const getMockTrackLikes = (trackId: string): Like[] => {
  return mockLikes.filter(like => like.trackId === trackId);
};

export const getMockTrackReposts = (trackId: string): Repost[] => {
  return mockReposts.filter(repost => repost.trackId === trackId);
};

export const getMockEngagementCounts = (trackId: string): EngagementCounts => {
  const likes = getMockTrackLikes(trackId).length;
  const reposts = getMockTrackReposts(trackId).length;
  return {
    likes,
    reposts,
    plays: 1500, // Mock 
    comments: 23, // Mock 
  };
};