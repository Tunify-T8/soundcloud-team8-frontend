import { api } from '../../../services/api';
import type { Like, Repost, EngagementCounts } from '../types';
import type { Track } from '../types/Track';

export const engagementService = {

  getTrackDetails: async (trackId: string): Promise<Track> =>
    (await api.get<Track>(`/${trackId}`)).data,

  getTrackLikes: async (trackId: string): Promise<Like[]> =>
    (await api.get<Like[]>(`/${trackId}/likes`)).data,

  likeTrack: async (userId: string, trackId: string): Promise<Like> =>
    (await api.post<Like>(`/${trackId}/likes`, { userId })).data,

  unlikeTrack: async (likeId: string, trackId: string): Promise<void> =>
    (await api.delete(`/${trackId}/likes/${likeId}`)).data,

  getTrackReposts: async (trackId: string): Promise<Repost[]> =>
    (await api.get<Repost[]>(`/${trackId}/reposts`)).data,

  repostTrack: async (userId: string, trackId: string): Promise<Repost> =>
    (await api.post<Repost>(`/${trackId}/reposts`, { userId })).data,

  unrepostTrack: async (repostId: string, trackId: string): Promise<void> =>
    (await api.delete(`/${trackId}/reposts/${repostId}`)).data,

  getEngagementCounts: async (trackId: string): Promise<EngagementCounts> =>
    (await api.get<EngagementCounts>(`/${trackId}/engagement`)).data,
};