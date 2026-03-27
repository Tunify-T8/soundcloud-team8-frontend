import type { Track } from "@/shared/types/Track";
import { api } from "@/features/auth/services/api";

export const feedService = {
  /**
   * Simulates fetching feed tracks from an API or database.
   * Returns a Promise that resolves to an array of Track objects.
   */
  async getFeedTracks(): Promise<Track[]> {
    try {
      const response = await api.get("/feed");
      // The mock server returns { items: [...] }
      // Map to Track[] if needed
      const items = response.data.items || [];
      // If items are feed items with a .track property, extract .track
      const tracks = items.map((item: any) => item.track || item);
      return tracks as Track[];
    } catch (error) {
      // Optionally: fallback to [] or throw error
      return [];
    }
  },
};
