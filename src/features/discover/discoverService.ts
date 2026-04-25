import { api } from "../auth/services/api";
import type {
  DiscoverArtist,
  DiscoverArtistsResponse,
  DiscoverTrack,
  DiscoverResponse,
  TrendingItem,
  TrendingPeriod,
  TrendingResponse,
  TrendingType,
} from "@/features/discover/Discover";

export interface GetDiscoverParams {
  page: number;
  limit: number;
  genreId?: string;
}

export interface GetTrendingParams {
  type?: TrendingType;
  period?: TrendingPeriod;
  genreId?: string;
}

export type GetTrendingAlbumsParams = Omit<GetTrendingParams, "type">;

export interface GetSuggestedArtistsParams {
  page?: number;
  limit?: number;
}

interface SuggestedArtistItem {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  followersCount: number;
  isCertified?: boolean;
}

interface SuggestedArtistsResponse {
  items?: SuggestedArtistItem[];
}

const mapTrendingItemToDiscoverTrack = (item: TrendingItem): DiscoverTrack => ({
  id: item.id,
  title: item.name,
  artist: item.artist,
  coverUrl: item.coverUrl,
  waveformUrl: "",
  durationSeconds: 0,
  genre: null,
  createdAt: "",
});

const mapSuggestedArtist = (item: SuggestedArtistItem): DiscoverArtist => ({
  id: item.id,
  name: item.displayName ?? item.username,
  avatarUrl: item.avatarUrl ?? "",
  followersCount: item.followersCount ?? 0,
  isVerified: Boolean(item.isCertified),
});

export const getDiscoverTracks = async (
  params: GetDiscoverParams,
): Promise<DiscoverResponse> => {
  const response = await api.get<DiscoverResponse>("/feed/discover", {
    params,
  });

  return response.data;
};

export const getTrendingTracks = async (
  params: GetTrendingParams = {},
): Promise<DiscoverResponse> => {
  const { type = "track", period = "week", genreId } = params;

  const response = await api.get<TrendingResponse>("/feed/trending", {
    params: {
      type,
      period,
      ...(genreId ? { genreId } : {}),
    },
  });

  const items = (response.data.items ?? []).map(mapTrendingItemToDiscoverTrack);

  return {
    items,
    page: 1,
    limit: items.length,
    hasMore: false,
    personalized: false,
  };
};

export const getTrendingAlbums = async (
  params: GetTrendingAlbumsParams = {},
): Promise<DiscoverResponse> =>
  getTrendingTracks({
    ...params,
    type: "album",
  });

export const getSuggestedArtists = async (
  params: GetSuggestedArtistsParams = {},
): Promise<DiscoverArtistsResponse> => {
  const { page = 1, limit = 10 } = params;

  const response = await api.get<SuggestedArtistsResponse>(
    "/feed/suggested-artists",
    {
      params: { page, limit },
    },
  );

  const items = (response.data.items ?? []).map(mapSuggestedArtist);

  return {
    items,
    page,
    limit,
    hasMore: false,
  };
};
