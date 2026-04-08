import axios from 'axios';
import type { DiscoverTrack, DiscoverResponse } from '../../shared/types/Discover';

export interface GetDiscoverParams {
  page: number;
  limit: number;
  genreId?: string;
}

export const getDiscoverTracks = async (params: GetDiscoverParams): Promise<DiscoverResponse> => {
  const response = await axios.get<DiscoverResponse>('/endpoint/discover', { params });
  return response.data;
};
