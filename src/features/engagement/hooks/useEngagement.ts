import { useState, useEffect } from 'react';
import { engagementService } from '../services/engagementService';
import type { EngagementState } from '../types';

export const useEngagement = (trackId: string) => {
  const [state, setState] = useState<EngagementState>({
    counts: { likes: 0, reposts: 0, plays: 0, comments: 0 },
    isLiked: false,
    isReposted: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!trackId) return;
    setLoading(true);

    engagementService
      .getEngagement(trackId)
      .then((data) => {
        setState({
          counts: {
            likes: data.likesCount,
            reposts: data.repostsCount,
            comments: data.commentsCount,
            plays: 0,
          },
          isLiked: data.isLiked,
          isReposted: data.isReposted,
        });
      })
      .catch((error) => {
        console.error('Failed to fetch engagement:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [trackId]);

  const toggleLike = async () => {
    try {
      if (state.isLiked) {
        await engagementService.unlikeTrack(trackId);
        setState((prev) => ({
          ...prev,
          counts: { ...prev.counts, likes: Math.max(0, prev.counts.likes - 1) },
          isLiked: false,
        }));
      } else {
        await engagementService.likeTrack(trackId);
        setState((prev) => ({
          ...prev,
          counts: { ...prev.counts, likes: prev.counts.likes + 1 },
          isLiked: true,
        }));
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const toggleRepost = async () => {
    try {
      if (state.isReposted) {
        await engagementService.unrepostTrack(trackId);
        setState((prev) => ({
          ...prev,
          counts: { ...prev.counts, reposts: Math.max(0, prev.counts.reposts - 1) },
          isReposted: false,
        }));
      } else {
        await engagementService.repostTrack(trackId);
        setState((prev) => ({
          ...prev,
          counts: { ...prev.counts, reposts: prev.counts.reposts + 1 },
          isReposted: true,
        }));
      }
    } catch (error) {
      console.error('Failed to toggle repost:', error);
    }
  };

  return {
    ...state,
    loading,
    toggleLike,
    toggleRepost,
  };
};
