// import { useState, useEffect } from 'react';
// import { engagementService } from '../services/engagementService';
// import type { EngagementState } from '../types';

// export const useEngagement = (trackId: string) => {
//   const [state, setState] = useState<EngagementState>({
//     counts: { likes: 0, reposts: 0, plays: 0, comments: 0 },
//     isLiked: false,
//     isReposted: false,
//   });
//   const [loading, setLoading] = useState(true);

//   const currentUserId = 'user1';
//   const [currentLikeId, setCurrentLikeId] = useState<string | null>(null);
//   const [currentRepostId, setCurrentRepostId] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchEngagement = async () => {
//       try {
//         const [counts, likes, reposts] = await Promise.all([
//           engagementService.getEngagementCounts(trackId),
//           engagementService.getTrackLikes(trackId),
//           engagementService.getTrackReposts(trackId),
//         ]);

//         const userLike = likes.find((like) => like.userId === currentUserId);
//         const userRepost = reposts.find((repost) => repost.userId === currentUserId);

//         setState({
//           counts,
//           isLiked: Boolean(userLike),
//           isReposted: Boolean(userRepost),
//         });
//         setCurrentLikeId(userLike?.id ?? null);
//         setCurrentRepostId(userRepost?.id ?? null);
//       } catch (error) {
//         console.error('Failed to fetch engagement:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (trackId) {
//       setLoading(true);
//       fetchEngagement();
//     }
//   }, [trackId]);

//   const toggleLike = async () => {
//     try {
//       if (currentLikeId) {
//         await engagementService.unlikeTrack(currentLikeId, trackId);
//         setState((prev: EngagementState) => ({
//           ...prev,
//           counts: { ...prev.counts, likes: Math.max(0, prev.counts.likes - 1) },
//           isLiked: false,
//         }));
//         setCurrentLikeId(null);
//       } else {
//         const created = await engagementService.likeTrack(currentUserId, trackId);
//         setState((prev: EngagementState) => ({
//           ...prev,
//           counts: { ...prev.counts, likes: prev.counts.likes + 1 },
//           isLiked: true,
//         }));
//         setCurrentLikeId(created.id);
//       }
//     } catch (error) {
//       console.error('Failed to toggle like:', error);
//     }
//   };

//   const toggleRepost = async () => {
//     try {
//       if (currentRepostId) {
//         await engagementService.unrepostTrack(currentRepostId, trackId);
//         setState((prev: EngagementState) => ({
//           ...prev,
//           counts: { ...prev.counts, reposts: Math.max(0, prev.counts.reposts - 1) },
//           isReposted: false,
//         }));
//         setCurrentRepostId(null);
//       } else {
//         const created = await engagementService.repostTrack(currentUserId, trackId);
//         setState((prev: EngagementState) => ({
//           ...prev,
//           counts: { ...prev.counts, reposts: prev.counts.reposts + 1 },
//           isReposted: true,
//         }));
//         setCurrentRepostId(created.id);
//       }
//     } catch (error) {
//       console.error('Failed to toggle repost:', error);
//     }
//   };

//   return {
//     ...state,
//     loading,
//     toggleLike,
//     toggleRepost,
//   };
// };