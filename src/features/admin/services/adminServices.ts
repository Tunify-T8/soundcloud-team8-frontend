export const adminServices = {
  reports: {
    queue: '/admin/reports',
    byId: (reportId: string) => `/admin/reports/${reportId}`,
  },
  content: {
    hideTrack: (trackId: string) => `/admin/tracks/${trackId}/hide`,
    unhideTrack: (trackId: string) => `/admin/tracks/${trackId}/unhide`,
    deleteTrack: (trackId: string) => `/admin/tracks/${trackId}`,
    hideComment: (commentId: string) => `/admin/comments/${commentId}/hide`,
    unhideComment: (commentId: string) => `/admin/comments/${commentId}/unhide`,
    deleteComment: (commentId: string) => `/admin/comments/${commentId}`,
  },
  users: {
    suspend: (userId: string) => `/admin/users/${userId}/suspend`,
    unsuspend: (userId: string) => `/admin/users/${userId}/unsuspend`,
    moderation: (userId: string) => `/admin/users/${userId}/moderation`,
  },
  analytics: {
    summary: '/admin/stats/summary',
    analytics: '/admin/stats/analytics',
    top: '/admin/stats/top',
    reports: '/admin/stats/reports',
  },
};
