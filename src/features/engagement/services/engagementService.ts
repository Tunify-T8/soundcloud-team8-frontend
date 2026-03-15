import { api } from '../../../services/api';
import type { Like, Repost, EngagementCounts } from '../types';
import type { Track } from '../../../shared/types/Track';

export const engagementService = {

  
  getTrackDetails: async (trackId: string): Promise<Track> =>
    (await api.get<Track>(`/tracks/${trackId}`)).data,

  
  getTrackLikes: async (trackId: string): Promise<Like[]> =>
    (await api.get<Like[]>(`/tracks/${trackId}/likes`)).data,

  likeTrack: async (userId: string, trackId: string): Promise<Like> =>
    (await api.post<Like>(`/tracks/${trackId}/likes`, { userId })).data,

  unlikeTrack: async (likeId: string, trackId: string): Promise<void> =>
    (await api.delete(`/tracks/${trackId}/likes/${likeId}`)).data,

  
  getTrackReposts: async (trackId: string): Promise<Repost[]> =>
    (await api.get<Repost[]>(`/tracks/${trackId}/reposts`)).data,

  repostTrack: async (userId: string, trackId: string): Promise<Repost> =>
    (await api.post<Repost>(`/tracks/${trackId}/reposts`, { userId })).data,

  unrepostTrack: async (repostId: string, trackId: string): Promise<void> =>
    (await api.delete(`/tracks/${trackId}/reposts/${repostId}`)).data,

  
  getEngagementCounts: async (trackId: string): Promise<EngagementCounts> =>
    (await api.get<EngagementCounts>(`/tracks/${trackId}/engagement`)).data,
};