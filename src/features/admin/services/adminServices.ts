import { api } from '@/features/auth/services/api';
import type {
  AnalyticsResponse,
  GetAdminReportsParams,
  GetAdminReportsResponse,
  MessageResponse,
  ModerationAction,
  PlatformSummary,
  ReportDetail,
  ReportReason,
  ReportStats,
  ReportSummary,
  ReportedEntityType,
  ReportStatus,
  SubmitReportPayload,
  SuspendUserPayload,
  TopStats,
  UpdateReportPayload,
  UserModerationOverview,
} from '../types/admin.types';

// ─── Raw API shapes (what the backend actually returns) ───────────────────────

interface RawReportSummary {
  id: string;
  targetType: ReportedEntityType;
  targetId: string;
  status: ReportStatus;
  createdAt: string;
  reviewedAt: string | null;
  adminAction: ModerationAction | null;
  reason: {
    id: string;
    label: string;
  };
  reporter: {
    id: string;
    username: string;
    displayName: string | null;
  };
}

interface RawReportDetail extends RawReportSummary {
  details?: string | null;
  reviewedByAdminId?: string | null;
  adminNote?: string | null;
}

interface RawGetAdminReportsResponse {
  data: RawReportSummary[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    hasMore: boolean;
  };
}

// ─── Entity info shapes ───────────────────────────────────────────────────────

export interface TrackInfo {
  id: string;
  title: string;
  artistName?: string;
}

export interface UserInfo {
  id: string;
  username: string;
  displayName?: string | null;
}

export interface CommentInfo {
  id: string;
  body: string;
  authorUsername?: string;
}

export type EntityInfo =
  | { type: 'TRACK'; data: TrackInfo }
  | { type: 'USER'; data: UserInfo }
  | { type: 'COMMENT'; data: CommentInfo };

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapReportSummary(raw: RawReportSummary): ReportSummary {
  return {
    id: raw.id,
    reportedEntityType: raw.targetType,
    reportedEntityId: raw.targetId,
    reasonId: raw.reason.id,
    status: raw.status,
    createdAt: raw.createdAt,
  };
}

function mapReportDetail(raw: RawReportDetail): ReportDetail {
  return {
    id: raw.id,
    reportedEntityType: raw.targetType,
    reportedEntityId: raw.targetId,
    reasonId: raw.reason.id,
    status: raw.status,
    createdAt: raw.createdAt,
    reporterId: raw.reporter.id,
    reporterUsername: raw.reporter.username,
    details: raw.details ?? null,
    reviewedAt: raw.reviewedAt ?? null,
    reviewedByAdminId: raw.reviewedByAdminId ?? null,
    adminNote: raw.adminNote ?? null,
    actionTaken: raw.adminAction ?? 'NONE',
  };
}

// ─── Services ─────────────────────────────────────────────────────────────────

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
      const { data } = await api.get<RawGetAdminReportsResponse>('/admin/reports', {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 20,
          status: params.status,
          entityType: params.entityType,
          reasonId: params.reasonId,
        },
      });

      return {
        data: data.data.map(mapReportSummary),
        pagination: data.pagination,
      };
    },

    async getById(reportId: string): Promise<ReportDetail> {
      const { data } = await api.get<RawReportDetail>(`/admin/reports/${reportId}`);
      return mapReportDetail(data);
    },

    async review(reportId: string, payload: UpdateReportPayload): Promise<string> {
      const { data } = await api.patch<MessageResponse>(`/admin/reports/${reportId}`, payload);
      return data.message;
    },
  },

  // ─── Entity lookup (for displaying names in the report detail panel) ─────────

  entities: {
    async getTrack(trackId: string): Promise<TrackInfo> {
      const { data } = await api.get<TrackInfo>(`/tracks/${trackId}`);
      return data;
    },

    async getUser(userId: string): Promise<UserInfo> {
      const { data } = await api.get<UserInfo>(`/users/${userId}`);
      return data;
    },

    async getComment(commentId: string): Promise<CommentInfo> {
      const { data } = await api.get<CommentInfo>(`/comments/${commentId}`);
      return data;
    },

    /** Fetches whichever entity matches the report's targetType. */
    async getEntityInfo(
      entityType: ReportedEntityType,
      entityId: string,
    ): Promise<EntityInfo | null> {
      try {
        switch (entityType) {
          case 'TRACK': {
            const track = await adminServices.entities.getTrack(entityId);
            return { type: 'TRACK', data: track };
          }
          case 'USER': {
            const user = await adminServices.entities.getUser(entityId);
            return { type: 'USER', data: user };
          }
          case 'COMMENT': {
            const comment = await adminServices.entities.getComment(entityId);
            return { type: 'COMMENT', data: comment };
          }
          default:
            return null;
        }
      } catch {
        return null;
      }
    },
  },

  content: {
    async hideTrack(trackId: string): Promise<string> {
      const { data } = await api.patch<MessageResponse>(`/admin/content/tracks/${trackId}/hide`);
      return data.message;
    },

    async unhideTrack(trackId: string): Promise<string> {
      const { data } = await api.patch<MessageResponse>(`/admin/content/tracks/${trackId}/unhide`);
      return data.message;
    },

    async deleteTrack(trackId: string): Promise<string> {
      const { data } = await api.delete<MessageResponse>(`/admin/content/tracks/${trackId}`);
      return data.message;
    },

    async hideComment(commentId: string): Promise<string> {
      const { data } = await api.patch<MessageResponse>(`/admin/content/comments/${commentId}/hide`);
      return data.message;
    },

    async unhideComment(commentId: string): Promise<string> {
      const { data } = await api.patch<MessageResponse>(`/admin/content/comments/${commentId}/unhide`);
      return data.message;
    },

    async deleteComment(commentId: string): Promise<string> {
      const { data } = await api.delete<MessageResponse>(`/admin/content/comments/${commentId}`);
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

    async ban(userId: string): Promise<string> {
      const { data } = await api.post<MessageResponse>(`/admin/users/${userId}/ban`);
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