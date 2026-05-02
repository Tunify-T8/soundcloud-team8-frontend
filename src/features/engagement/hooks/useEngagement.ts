import { useState, useEffect, useRef } from 'react';
import { engagementService } from '../services/engagementService';
import type { EngagementState } from '../types';
import {
  notifyTrackLikeChanged,
  TRACK_LIKE_CHANGED_EVENT,
  type TrackLikeChangedDetail,
} from '../engagementEvents';

 export const useEngagement = (trackId: string) => {
   const [state, setState] = useState<EngagementState>({
     counts: { likes: 0, reposts: 0, plays: 0, comments: 0 },
     isLiked: false,
     isReposted: false,
   });
  const [isFetching, setIsFetching] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const mutationVersionRef = useRef(0);

  useEffect(() => {
    if (!trackId) {
      setIsFetching(false);
      return;
    }
    setIsFetching(true);
    const fetchMutationVersion = mutationVersionRef.current;
    let active = true;

    engagementService
      .getEngagement(trackId)
      .then((data) => {
        if (!active || mutationVersionRef.current !== fetchMutationVersion) return;
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
        if (!active) return;
        setIsFetching(false);
      });
    return () => {
      active = false;
    };
  }, [trackId]);

  useEffect(() => {
    if (!trackId) return;

    const handleTrackLikeChanged = (event: Event) => {
      const detail = (event as CustomEvent<TrackLikeChangedDetail>).detail;
      if (!detail || detail.trackId !== trackId) return;

      setState((prev) => ({
        ...prev,
        isLiked: detail.isLiked,
        counts: {
          ...prev.counts,
          likes:
            typeof detail.likesCount === "number"
              ? detail.likesCount
              : Math.max(0, prev.counts.likes + (detail.isLiked ? 1 : -1)),
        },
      }));
    };

    window.addEventListener(TRACK_LIKE_CHANGED_EVENT, handleTrackLikeChanged);
    return () => {
      window.removeEventListener(TRACK_LIKE_CHANGED_EVENT, handleTrackLikeChanged);
    };
  }, [trackId]);

  const toggleLike = async () => {
    if (!trackId || isPending) return;

    const mutationVersion = ++mutationVersionRef.current;
    const previousState = state;
    const nextIsLiked = !previousState.isLiked;
    const nextLikes = Math.max(
      0,
      previousState.counts.likes + (previousState.isLiked ? -1 : 1),
    );

    setIsPending(true);
    setState((prev) => ({
      ...prev,
      counts: { ...prev.counts, likes: nextLikes },
      isLiked: nextIsLiked,
    }));
    notifyTrackLikeChanged({ trackId, isLiked: nextIsLiked, likesCount: nextLikes });

    try {
      if (previousState.isLiked) {
        await engagementService.unlikeTrack(trackId);
      } else {
        await engagementService.likeTrack(trackId);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      if (mutationVersionRef.current === mutationVersion) {
        setState(previousState);
        notifyTrackLikeChanged({
          trackId,
          isLiked: previousState.isLiked,
          likesCount: previousState.counts.likes,
        });
      }
    } finally {
      if (mutationVersionRef.current === mutationVersion) {
        setIsPending(false);
      }
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
    loading: isFetching || isPending,
    toggleLike,
    toggleRepost,
  };
};
