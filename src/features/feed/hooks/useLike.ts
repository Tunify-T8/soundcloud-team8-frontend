import { useState } from 'react';
import { feedService } from '../feedservice';

/**
 * Manages like/unlike state for a single track with optimistic updates.
 *
 * "Optimistic update" means: we change the UI instantly (feels fast),
 * then silently sync with the backend. If the API call fails, we revert.
 *
 * @param initialIsLiked  Whether the track is already liked when the page loads
 * @param initialCount    The like count when the page loads
 * @param trackId         The track's ID, used for the API call
 */
export function useLike(
  initialIsLiked: boolean,
  initialCount: number,
  trackId: string,
) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialCount);

  const toggleLike = async () => {
    const newIsLiked = !isLiked;

    // Step 1: Update UI immediately — no waiting for the server
    setIsLiked(newIsLiked);
    setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

    try {
      // Step 2: Sync with backend in the background
      if (newIsLiked) {
        await feedService.likeTrack(trackId);
      } else {
        await feedService.unlikeTrack(trackId);
      }
    } catch {
      // Step 3: If the API call fails, revert to what it was before
      setIsLiked(!newIsLiked);
      setLikesCount((prev) => (newIsLiked ? prev - 1 : prev + 1));
    }
  };

  return { isLiked, likesCount, toggleLike };
}