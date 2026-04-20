import { api } from '../../../services/api';
import type {
  GetEngagementResponse,
  PaginatedLikes,
  PaginatedReposts,
  PaginatedComments,
  PaginatedReplies,
} from '../types';
import type { Track } from '../types/Track';

export const engagementService = {

  getTrackDetails: async (trackId: string): Promise<Track> =>
    (await api.get<Track>(`/tracks/${trackId}`)).data,

  getEngagement: async (trackId: string): Promise<GetEngagementResponse> =>
    (await api.get<GetEngagementResponse>(`/tracks/${trackId}/engagement`)).data,

  likeTrack: async (trackId: string): Promise<void> =>
    (await api.post(`/tracks/${trackId}/like`)).data,

  unlikeTrack: async (trackId: string): Promise<void> =>
    (await api.delete(`/tracks/${trackId}/like`)).data,

  repostTrack: async (trackId: string): Promise<void> =>
    (await api.post(`/tracks/${trackId}/repost`)).data,

  unrepostTrack: async (trackId: string): Promise<void> =>
    (await api.delete(`/tracks/${trackId}/repost`)).data,

  getTrackLikes: async (trackId: string, page = 1, limit = 20): Promise<PaginatedLikes> =>
    (await api.get<PaginatedLikes>(`/tracks/${trackId}/likes?page=${page}&limit=${limit}`)).data,

  getTrackReposts: async (trackId: string, page = 1, limit = 20): Promise<PaginatedReposts> =>
    (await api.get<PaginatedReposts>(`/tracks/${trackId}/reposts?page=${page}&limit=${limit}`)).data,

  getTrackComments: async (trackId: string, page = 1, limit = 20): Promise<PaginatedComments> =>
    (await api.get<PaginatedComments>(`/tracks/${trackId}/comments?page=${page}&limit=${limit}`)).data,

  postComment: async (trackId: string, text: string, timestamp: number): Promise<void> =>
    (await api.post(`/tracks/${trackId}/comments`, { text, timestamp })).data,

  deleteComment: async (commentId: string): Promise<void> =>
    (await api.delete(`/comments/${commentId}`)).data,

  likeComment: async (commentId: string): Promise<void> =>
    (await api.post(`/comments/${commentId}/like`)).data,

  unlikeComment: async (commentId: string): Promise<void> =>
    (await api.delete(`/comments/${commentId}/like`)).data,

  getReplies: async (commentId: string, page = 1, limit = 20): Promise<PaginatedReplies> =>
    (await api.get<PaginatedReplies>(`/comments/${commentId}/replies?page=${page}&limit=${limit}`)).data,

  postReply: async (commentId: string, text: string): Promise<void> =>
    (await api.post(`/comments/${commentId}/replies`, { text })).data,
};
