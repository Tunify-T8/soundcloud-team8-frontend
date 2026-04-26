export type ReportedEntityType = 'TRACK' | 'COMMENT' | 'USER';
export type ReportStatus = 'PENDING' | 'RESOLVED' | 'REJECTED';
export type ModerationAction = 'NONE' | 'HIDE' | 'REMOVE' | 'SUSPEND_USER';
export type ViolationArea = 'AUDIO' | 'ARTWORK' | 'TITLE' | 'DESCRIPTION';

export interface PaginationMeta {
  page: number;
  limit: number;
  hasMore: boolean;
  totalCount: number;
}

export interface ReportReason {
  id: string;
  label: string;
}

export interface SubmitReportPayload {
  reportedEntityType: ReportedEntityType;
  reportedEntityId: string;
  reasonId: string;
  detailsText?: string | null;
  violationAreas?: ViolationArea[];
}

export interface ReportSummary {
  id: string;
  reportedEntityType: ReportedEntityType;
  reportedEntityId: string;
  reasonId: string;
  status: ReportStatus;
  createdAt: string;
}

export interface ReportDetail extends ReportSummary {
  reporterId: string;
  details?: string | null;
  reviewedAt?: string | null;
  reviewedByAdminId?: string | null;
  adminNote?: string | null;
  actionTaken: ModerationAction;
}

export interface GetAdminReportsParams {
  status?: ReportStatus;
  entityType?: ReportedEntityType;
  reasonId?: string;
  page?: number;
  limit?: number;
}

export interface GetAdminReportsResponse {
  data: ReportSummary[];
  pagination: PaginationMeta;
}

export interface UpdateReportPayload {
  status: Exclude<ReportStatus, 'PENDING'>;
  adminNote?: string | null;
  actionTaken?: ModerationAction;
}

export interface UserModerationOverview {
  userId: string;
  isSuspended: boolean;
  suspendedUntil?: string | null;
  suspensionReason?: string | null;
}

export interface SuspendUserPayload {
  durationHours?: number | null;
  reason: string;
}

export interface PlatformSummary {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  activeUsers: number;
  suspendedUsers: number;
  bannedUsers: number;
  totalTracks: number;
  newTracksToday: number;
  newTracksThisWeek: number;
  totalPlays: number;
  playsToday: number;
  totalReports: number;
  pendingReports: number;
  generatedAt: string;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface AnalyticsResponse {
  rangeStart: string;
  rangeEnd: string;
  playsSeries: TimeSeriesPoint[];
  activeUsersSeries: TimeSeriesPoint[];
  newSignupsSeries: TimeSeriesPoint[];
  newTracksSeries: TimeSeriesPoint[];
  newReportsSeries: TimeSeriesPoint[];
}

interface TopTrackStat {
  trackId: string;
  title: string;
  artistName: string;
  playCount?: number;
  reportCount?: number;
}

interface TopUserStat {
  userId: string;
  username: string;
  displayName?: string | null;
  reportCount?: number;
  playCount?: number;
}

export interface TopStats {
  mostPlayedTracks: TopTrackStat[];
  mostReportedTracks: TopTrackStat[];
  mostReportedUsers: TopUserStat[];
  mostActiveUsers: TopUserStat[];
}

interface ReportReasonBreakdown {
  reasonId: string;
  label: string;
  count: number;
}

interface ReportEntityBreakdown {
  entityType: 'TRACK' | 'COMMENT' | 'USER' | 'COLLECTION';
  count: number;
}

interface ReportStatusBreakdown {
  status: ReportStatus;
  count: number;
}

export interface ReportStats {
  byReason: ReportReasonBreakdown[];
  byEntityType: ReportEntityBreakdown[];
  byStatus: ReportStatusBreakdown[];
  resolutionRate: number;
  avgResolutionHours: number;
}

export interface MessageResponse {
  message: string;
}
