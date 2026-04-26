import { api } from '@/features/auth/services/api';
import type {
  AnalyticsResponse,
  GetAdminReportsParams,
  GetAdminReportsResponse,
  MessageResponse,
  PlatformSummary,
  ReportDetail,
  ReportReason,
  ReportStats,
  SubmitReportPayload,
  SuspendUserPayload,
  TopStats,
  UpdateReportPayload,
  UserModerationOverview,
} from '../types/admin.types';

export const adminServices = {
  reports: {
    async getReasons(): Promise<ReportReason[]> {
      const { data } = await api.get<ReportReason[]>('/reports/reasons');
      return data ?? [];
    },

    async submit(payload: SubmitReportPayload): Promise<string> {
      const { data } = await api.post<MessageResponse>('/reports', payload);
      return data.message;
    },

    async submitSpam(reportedEntityId: string): Promise<string> {
      const { data } = await api.post<MessageResponse>('/reports/spam', { reportedEntityId });
      return data.message;
    },

    async getQueue(params: GetAdminReportsParams = {}): Promise<GetAdminReportsResponse> {
      const { data } = await api.get<GetAdminReportsResponse>('/admin/reports', {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 20,
          status: params.status,
          entityType: params.entityType,
          reasonId: params.reasonId,
        },
      });
      return data;
    },

    async getById(reportId: string): Promise<ReportDetail> {
      const { data } = await api.get<ReportDetail>(`/admin/reports/${reportId}`);
      return data;
    },

    async review(reportId: string, payload: UpdateReportPayload): Promise<string> {
      const { data } = await api.patch<MessageResponse>(`/admin/reports/${reportId}`, payload);
      return data.message;
    },
  },

  content: {
    async hideTrack(trackId: string): Promise<string> {
      const { data } = await api.patch<MessageResponse>(`/admin/tracks/${trackId}/hide`);
      return data.message;
    },

    async unhideTrack(trackId: string): Promise<string> {
      const { data } = await api.patch<MessageResponse>(`/admin/tracks/${trackId}/unhide`);
      return data.message;
    },

    async deleteTrack(trackId: string): Promise<string> {
      const { data } = await api.delete<MessageResponse>(`/admin/tracks/${trackId}`);
      return data.message;
    },

    async hideComment(commentId: string): Promise<string> {
      const { data } = await api.patch<MessageResponse>(`/admin/comments/${commentId}/hide`);
      return data.message;
    },

    async unhideComment(commentId: string): Promise<string> {
      const { data } = await api.patch<MessageResponse>(`/admin/comments/${commentId}/unhide`);
      return data.message;
    },

    async deleteComment(commentId: string): Promise<string> {
      const { data } = await api.delete<MessageResponse>(`/admin/comments/${commentId}`);
      return data.message;
    },
  },

  users: {
    async suspend(userId: string, payload: SuspendUserPayload): Promise<string> {
      const { data } = await api.post<MessageResponse>(`/admin/users/${userId}/suspend`, payload);
      return data.message;
    },

    async unsuspend(userId: string): Promise<string> {
      const { data } = await api.post<MessageResponse>(`/admin/users/${userId}/unsuspend`);
      return data.message;
    },

    async getModeration(userId: string): Promise<UserModerationOverview> {
      const { data } = await api.get<UserModerationOverview>(`/admin/users/${userId}/moderation`);
      return data;
    },
  },

  analytics: {
    async getSummary(): Promise<PlatformSummary> {
      const { data } = await api.get<PlatformSummary>('/admin/stats/summary');
      return data;
    },

    async getTimeSeries(startDate: string, endDate: string): Promise<AnalyticsResponse> {
      const { data } = await api.get<AnalyticsResponse>('/admin/stats/analytics', {
        params: { startDate, endDate },
      });
      return data;
    },

    async getTop(limit = 10): Promise<TopStats> {
      const { data } = await api.get<TopStats>('/admin/stats/top', { params: { limit } });
      return data;
    },

    async getReportsBreakdown(): Promise<ReportStats> {
      const { data } = await api.get<ReportStats>('/admin/stats/reports');
      return data;
    },
  },
};
