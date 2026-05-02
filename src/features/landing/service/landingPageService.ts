import axios from 'axios';
import { BASE_URL } from '@/config/env'; 

const apiClient = axios.create({
  baseURL: BASE_URL, 
  headers: { 'Content-Type': 'application/json' }
});

export const musicApi = {
  // --- FEED & TRENDING ---
  
  // Main Feed (Posts/Reposts)
  getFeed: async (page: number = 1, limit: number = 10) => {
    const response = await apiClient.get('feed/', { 
      params: { page, limit }
    });
    return response.data;
  },

  // Trending (Top 10)
  getTrending: async (type: string = 'track', period: string = 'week', genreId?: string) => {
    const response = await apiClient.get('feed/trending', {
      params: { type, period, genreId }
    });
    return response.data;
  },

  // Discover (Curated/Recent reccs)
  getDiscover: async (page: number = 1, limit: number = 10, genreId?: string) => {
    const response = await apiClient.get('endpoint/discover', {
      params: { page, limit, genreId }
    });
    return response.data;
  },

  // Artists You Should Follow
  getSuggestedArtists: async (page: number = 1, limit: number = 5) => {
    const response = await apiClient.get('feed/suggested-artists', {
      params: { page, limit }
    });
    return response.data;
  },

  // --- SEARCH ---

  // Search Autocomplete (Results while typing)
  getAutocomplete: async (query: string) => {
    const response = await apiClient.get('search/autocomplete', {
      params: { q: query }
    });
    return response.data;
  },

  // Full Search (Combined)
  searchAll: async (query: string, page: number = 1, limit: number = 20) => {
    const response = await apiClient.get('search/', {
      params: { q: query, page, limit }
    });
    return response.data;
  },

  // Specific Track Search with Filters
  searchTracks: async (query: string, filters: { 
    timeAdded?: string, 
    duration?: string, 
    tag?: string 
  } = {}) => {
    const response = await apiClient.get('search/tracks/', {
      params: { q: query, ...filters }
    });
    return response.data;
  }
};