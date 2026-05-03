import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminServices } from '../services/adminServices';
import type { EntityInfo } from '../services/adminServices';
import type {
  ModerationAction,
  ReportDetail,
  ReportReason,
  ReportStatus,
  ReportedEntityType,
  ReportSummary,
} from '../types/admin.types';

const STATUS_OPTIONS: Array<{ value: ReportStatus | ''; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'REJECTED', label: 'Rejected' },
];

const ENTITY_OPTIONS: Array<{ value: ReportedEntityType | ''; label: string }> = [
  { value: '', label: 'All entities' },
  { value: 'TRACK', label: 'Track' },
  { value: 'COMMENT', label: 'Comment' },
  { value: 'USER', label: 'User' },
];

const ACTION_OPTIONS: Array<{ value: ModerationAction; label: string }> = [
  { value: 'NONE', label: 'No action' },
  { value: 'HIDE', label: 'Hide content' },
  { value: 'REMOVE', label: 'Remove content' },
  { value: 'SUSPEND_USER', label: 'Suspend user' },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const statusClassMap: Record<ReportStatus, string> = {
  PENDING: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  RESOLVED: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  REJECTED: 'border-red-500/40 bg-red-500/10 text-red-300',
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
};

const getEntityLabel = (entityType?: ReportedEntityType | null) => {
  if (!entityType) return 'Unknown';
  return entityType.charAt(0) + entityType.slice(1).toLowerCase();
};

const truncateId = (id?: string | null): string => {
  if (!id) return '—';
  return `${id.slice(0, 8)}…`;
};

/** Returns a human-readable primary label for the entity (track title, username, comment excerpt). */
const getEntityPrimaryLabel = (entityInfo: EntityInfo | null): string | null => {
  if (!entityInfo) return null;
  switch (entityInfo.type) {
    case 'TRACK':
      return entityInfo.data.title;
    case 'USER':
      return entityInfo.data.displayName ?? entityInfo.data.username;
    case 'COMMENT':
      return entityInfo.data.body.length > 80
        ? `${entityInfo.data.body.slice(0, 80)}…`
        : entityInfo.data.body;
  }
};

/** Returns a secondary label (artist name, username, comment author). */
const getEntitySecondaryLabel = (entityInfo: EntityInfo | null): string | null => {
  if (!entityInfo) return null;
  switch (entityInfo.type) {
    case 'TRACK':
      return entityInfo.data.artistName ?? null;
    case 'USER':
      return entityInfo.data.username !== getEntityPrimaryLabel(entityInfo)
        ? `@${entityInfo.data.username}`
        : null;
    case 'COMMENT':
      return entityInfo.data.authorUsername ? `by @${entityInfo.data.authorUsername}` : null;
  }
};

/**
 * Executes the content/user moderation action that corresponds to the chosen
 * dropdown value.  This is called automatically inside handleSubmitReview so
 * the admin never has to trigger the action separately.
 */
async function dispatchModerationAction(
  entityType: ReportedEntityType,
  entityId: string,
  action: ModerationAction,
  suspendReason?: string,
): Promise<void> {
  switch (action) {
    case 'HIDE':
      if (entityType === 'TRACK') await adminServices.content.hideTrack(entityId);
      else if (entityType === 'COMMENT') await adminServices.content.hideComment(entityId);
      // USER entity has no "hide" – silently no-op so the report still saves.
      break;

    case 'REMOVE':
      if (entityType === 'TRACK') await adminServices.content.deleteTrack(entityId);
      else if (entityType === 'COMMENT') await adminServices.content.deleteComment(entityId);
      break;

    case 'SUSPEND_USER':
      if (entityType === 'USER') {
        await adminServices.users.suspend(entityId, {
          reason: suspendReason?.trim() || 'Suspended via moderation report',
        });
      }
      break;

    case 'NONE':
    default:
      break;
  }
}

const AdminReportsPage = () => {
  type ReviewStatus = Exclude<ReportStatus, 'PENDING'>;

  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [reasons, setReasons] = useState<ReportReason[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportDetail | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [entityInfo, setEntityInfo] = useState<EntityInfo | null>(null);
  const [loadingEntityInfo, setLoadingEntityInfo] = useState(false);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [loadingReasons, setLoadingReasons] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [queuePage, setQueuePage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | ''>('');
  const [entityFilter, setEntityFilter] = useState<ReportedEntityType | ''>('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    hasMore: false,
    totalCount: 0,
  });
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>('RESOLVED');
  const [reviewAction, setReviewAction] = useState<ModerationAction>('NONE');
  const [adminNote, setAdminNote] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const loadReasons = useCallback(async () => {
    setLoadingReasons(true);
    try {
      const data = await adminServices.reports.getReasons();
      setReasons(data);
    } catch {
      setReasons([]);
    } finally {
      setLoadingReasons(false);
    }
  }, []);

  const loadQueue = useCallback(async () => {
    setLoadingQueue(true);
    setError(null);

    try {
      const response = await adminServices.reports.getQueue({
        page: queuePage,
        limit: pageSize,
        status: statusFilter || undefined,
        entityType: entityFilter || undefined,
        reasonId: reasonFilter || undefined,
      });

      setReports(response.data);
      setPagination(response.pagination);
    } catch {
      setReports([]);
      setPagination({ page: queuePage, limit: pageSize, hasMore: false, totalCount: 0 });
      setError('Failed to load reports queue.');
    } finally {
      setLoadingQueue(false);
    }
  }, [queuePage, pageSize, statusFilter, entityFilter, reasonFilter]);

  useEffect(() => {
    loadReasons();
  }, [loadReasons]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue, reloadToken]);

  useEffect(() => {
    setQueuePage(1);
  }, [statusFilter, entityFilter, reasonFilter, pageSize]);

  // ── Load report detail + fetch the reported entity info in parallel ──────────
  useEffect(() => {
    if (!selectedReportId) {
      setSelectedReport(null);
      setEntityInfo(null);
      setAdminNote('');
      setReviewAction('NONE');
      setReviewStatus('RESOLVED');
      return;
    }

    const loadDetail = async () => {
      setLoadingDetail(true);
      setDetailError(null);
      setEntityInfo(null);

      try {
        const detail = await adminServices.reports.getById(selectedReportId);
        setSelectedReport(detail);
        setReviewStatus(detail.status === 'REJECTED' ? 'REJECTED' : 'RESOLVED');
        setReviewAction(detail.actionTaken ?? 'NONE');
        setAdminNote(detail.adminNote ?? '');

        // Kick off entity info fetch without blocking the detail render
        if (detail.reportedEntityId) {
          setLoadingEntityInfo(true);
          adminServices.entities
            .getEntityInfo(detail.reportedEntityType, detail.reportedEntityId)
            .then((info) => setEntityInfo(info))
            .finally(() => setLoadingEntityInfo(false));
        }
      } catch {
        setSelectedReport(null);
        setDetailError('Failed to load report details.');
      } finally {
        setLoadingDetail(false);
      }
    };

    loadDetail();
  }, [selectedReportId]);

  const reasonMap = useMemo(() => {
    return new Map(reasons.map((reason) => [reason.id, reason.label]));
  }, [reasons]);

  const currentPage = pagination.page;
  const totalPages = Math.max(1, Math.ceil(pagination.totalCount / pagination.limit));

  const currentStatusCounts = useMemo(() => {
    return reports.reduce(
      (acc, report) => {
        acc[report.status] += 1;
        return acc;
      },
      { PENDING: 0, RESOLVED: 0, REJECTED: 0 },
    );
  }, [reports]);

  const handleFilterChange = <T extends string>(setter: (value: T) => void, value: T) => {
    setter(value);
    setQueuePage(1);
  };

  const handleSelectReport = (reportId: string) => {
    setSelectedReportId(reportId);
  };

  // ── Submit review + automatically dispatch the chosen moderation action ──────
  const handleSubmitReview = async () => {
    if (!selectedReportId || !selectedReport) return;

    setSubmitting(true);
    setError(null);

    try {
      // 1. Execute the content/user moderation action first so that if it
      //    fails the report status is not updated and the admin can retry.
      if (reviewAction !== 'NONE') {
        if (!selectedReport.reportedEntityId) {
          setError('Cannot dispatch action: reported entity ID is missing.');
          return;
        }
        await dispatchModerationAction(
          selectedReport.reportedEntityType,
          selectedReport.reportedEntityId,
          reviewAction,
          adminNote,
        );
      }

      // 2. Persist the review decision on the report record.
      await adminServices.reports.review(selectedReportId, {
        status: reviewStatus,
        adminNote: adminNote.trim() || null,
        actionTaken: reviewAction,
      });

      // 3. Refresh the queue and reload the detail.
      setReloadToken((value) => value + 1);
      const refreshed = await adminServices.reports.getById(selectedReportId);
      setSelectedReport(refreshed);
      setReviewStatus(refreshed.status === 'PENDING' ? 'RESOLVED' : refreshed.status);
      setReviewAction(refreshed.actionTaken ?? 'NONE');
      setAdminNote(refreshed.adminNote ?? '');
    } catch {
      setError('Failed to update the report. Check the action and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const summaryMessage = pagination.totalCount
    ? `Showing ${reports.length} of ${pagination.totalCount} reports`
    : 'No reports found';

  // Derived entity labels for the detail panel
  const entityPrimary = getEntityPrimaryLabel(entityInfo);
  const entitySecondary = getEntitySecondaryLabel(entityInfo);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 text-white">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Reports Queue</h1>
          <p className="text-zinc-400 text-sm mt-1">Review and moderate reported tracks, comments, and users.</p>
        </div>
        <button
          type="button"
          onClick={() => setReloadToken((value) => value + 1)}
          className="rounded-sm border border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-200 hover:text-white hover:border-zinc-500 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="mb-5 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-md border border-zinc-800 bg-zinc-900/70 p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-[0.18em]">Pending</p>
          <p className="mt-2 text-2xl font-black">{currentStatusCounts.PENDING}</p>
        </div>
        <div className="rounded-md border border-zinc-800 bg-zinc-900/70 p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-[0.18em]">Resolved</p>
          <p className="mt-2 text-2xl font-black">{currentStatusCounts.RESOLVED}</p>
        </div>
        <div className="rounded-md border border-zinc-800 bg-zinc-900/70 p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-[0.18em]">Rejected</p>
          <p className="mt-2 text-2xl font-black">{currentStatusCounts.REJECTED}</p>
        </div>
      </div>

      <div className="mb-5 rounded-md border border-zinc-800 bg-zinc-900/60 p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <label className="block">
          <span className="block text-xs text-zinc-500 mb-1">Status</span>
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(setStatusFilter, e.target.value as ReportStatus | '')}
            className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-2 text-sm text-zinc-200"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || 'all-statuses'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="block text-xs text-zinc-500 mb-1">Entity</span>
          <select
            value={entityFilter}
            onChange={(e) => handleFilterChange(setEntityFilter, e.target.value as ReportedEntityType | '')}
            className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-2 text-sm text-zinc-200"
          >
            {ENTITY_OPTIONS.map((option) => (
              <option key={option.value || 'all-entities'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="block text-xs text-zinc-500 mb-1">Reason</span>
          <select
            value={reasonFilter}
            onChange={(e) => handleFilterChange(setReasonFilter, e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-2 text-sm text-zinc-200"
          >
            <option value="">All reasons</option>
            {loadingReasons ? (
              <option value="">Loading reasons...</option>
            ) : (
              reasons.map((reason) => (
                <option key={reason.id} value={reason.id}>
                  {reason.label}
                </option>
              ))
            )}
          </select>
        </label>

        <label className="block">
          <span className="block text-xs text-zinc-500 mb-1">Page size</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-2 text-sm text-zinc-200"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <div className="mb-5 rounded-sm border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-5">
        {/* ── Queue table ───────────────────────────────────────────────────── */}
        <section className="rounded-md border border-zinc-800 bg-zinc-900/70 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <div>
              <h2 className="text-lg font-black tracking-tight">Queue</h2>
              <p className="text-xs text-zinc-500 mt-1">{summaryMessage}</p>
            </div>
            <div className="text-xs text-zinc-500">
              Page {currentPage} of {totalPages}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-950/70 text-zinc-400 uppercase text-[10px] tracking-[0.2em]">
                <tr>
                  <th className="text-left px-4 py-3">Report</th>
                  <th className="text-left px-4 py-3">Entity</th>
                  <th className="text-left px-4 py-3">Reason</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {loadingQueue ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-zinc-400">
                      Loading reports...
                    </td>
                  </tr>
                ) : reports.length ? (
                  reports.map((report) => (
                    <tr
                      key={report.id}
                      className={`border-t border-zinc-800 cursor-pointer transition-colors ${
                        selectedReportId === report.id ? 'bg-zinc-800/60' : 'hover:bg-zinc-800/30'
                      }`}
                      onClick={() => handleSelectReport(report.id)}
                    >
                      <td className="px-4 py-4">
                        <div className="font-semibold text-zinc-100">{truncateId(report.id)}</div>
                        <div className="text-xs text-zinc-500">{truncateId(report.reportedEntityId)}</div>
                      </td>
                      <td className="px-4 py-4 text-zinc-200">{getEntityLabel(report.reportedEntityType)}</td>
                      <td className="px-4 py-4 text-zinc-200">{reasonMap.get(report.reasonId) ?? report.reasonId}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-[0.18em] ${statusClassMap[report.status]}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-zinc-400">{formatDate(report.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-zinc-500">
                      No reports match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-zinc-800">
            <button
              type="button"
              disabled={queuePage <= 1 || loadingQueue}
              onClick={() => setQueuePage((value) => Math.max(1, value - 1))}
              className="rounded-sm border border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-200 hover:text-white hover:border-zinc-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="text-xs text-zinc-500">
              {pagination.totalCount} total reports
            </div>
            <button
              type="button"
              disabled={!pagination.hasMore || loadingQueue}
              onClick={() => setQueuePage((value) => value + 1)}
              className="rounded-sm border border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-200 hover:text-white hover:border-zinc-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </section>

        {/* ── Report detail + review panel ──────────────────────────────────── */}
        <section className="rounded-md border border-zinc-800 bg-zinc-900/70 p-5">
          <h2 className="text-lg font-black tracking-tight mb-3">Report Details</h2>

          {!selectedReportId ? (
            <p className="text-zinc-500 text-sm">Select a report to review its full details.</p>
          ) : loadingDetail ? (
            <p className="text-zinc-400 text-sm">Loading report details...</p>
          ) : detailError ? (
            <p className="text-red-300 text-sm">{detailError}</p>
          ) : selectedReport ? (
            <div className="space-y-4">

              {/* ── Reported entity card ─────────────────────────────────────── */}
              <div className="rounded-md border border-zinc-700 bg-zinc-950/80 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500 mb-2">
                  Reported {getEntityLabel(selectedReport.reportedEntityType)}
                </p>

                {loadingEntityInfo ? (
                  <p className="text-sm text-zinc-500 animate-pulse">Fetching details…</p>
                ) : entityPrimary ? (
                  <div>
                    <p className="text-base font-bold text-zinc-100 leading-snug">{entityPrimary}</p>
                    {entitySecondary && (
                      <p className="text-xs text-zinc-400 mt-0.5">{entitySecondary}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400 font-mono break-all">
                    {selectedReport.reportedEntityId}
                  </p>
                )}

                {/* Always show the raw ID beneath the name */}
                {entityPrimary && (
                  <p className="mt-1.5 text-[10px] font-mono text-zinc-600 break-all">
                    {selectedReport.reportedEntityId}
                  </p>
                )}
              </div>

              {/* ── Core report fields ───────────────────────────────────────── */}
              <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">Report ID</span>
                  <span className="text-sm text-zinc-200 break-all text-right">{selectedReport.id}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">Entity</span>
                  <span className="text-sm text-zinc-200">{getEntityLabel(selectedReport.reportedEntityType)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">Reason</span>
                  <span className="text-sm text-zinc-200">{reasonMap.get(selectedReport.reasonId) ?? selectedReport.reasonId}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">Status</span>
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-[0.18em] ${statusClassMap[selectedReport.status]}`}>
                    {selectedReport.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500 mb-1">Reporter</p>
                  <p className="text-zinc-200">
                    {selectedReport.reporterUsername ?? selectedReport.reporterId}
                  </p>
                </div>
                <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500 mb-1">Created</p>
                  <p className="text-zinc-200">{formatDate(selectedReport.createdAt)}</p>
                </div>
              </div>

              <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500 mb-2">Details</p>
                <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                  {selectedReport.details?.trim() || 'No extra details were provided.'}
                </p>
              </div>

              {/* ── Review controls ──────────────────────────────────────────── */}
              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500 mb-2">Decision</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setReviewStatus('RESOLVED')}
                      className={`flex-1 rounded-sm border px-3 py-2 text-sm font-bold transition-colors ${
                        reviewStatus === 'RESOLVED'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200'
                          : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'
                      }`}
                    >
                      Resolve
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewStatus('REJECTED')}
                      className={`flex-1 rounded-sm border px-3 py-2 text-sm font-bold transition-colors ${
                        reviewStatus === 'REJECTED'
                          ? 'border-red-500 bg-red-500/10 text-red-200'
                          : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'
                      }`}
                    >
                      Reject
                    </button>
                  </div>
                </div>

                <label className="block">
                  <span className="block text-xs uppercase tracking-[0.18em] text-zinc-500 mb-2">
                    Action taken
                  </span>

                  {/* Contextual hint: what will actually happen when saved */}
                  {reviewAction !== 'NONE' && (
                    <p className="mb-1.5 text-xs text-amber-400/80">
                      {reviewAction === 'HIDE' && selectedReport.reportedEntityType === 'TRACK' &&
                        '⚠ Saving will hide this track from the platform.'}
                      {reviewAction === 'HIDE' && selectedReport.reportedEntityType === 'COMMENT' &&
                        '⚠ Saving will hide this comment from the platform.'}
                      {reviewAction === 'HIDE' && selectedReport.reportedEntityType === 'USER' &&
                        'Hide is not applicable to users — no content action will run.'}
                      {reviewAction === 'REMOVE' && selectedReport.reportedEntityType === 'TRACK' &&
                        '⚠ Saving will permanently delete this track.'}
                      {reviewAction === 'REMOVE' && selectedReport.reportedEntityType === 'COMMENT' &&
                        '⚠ Saving will permanently delete this comment.'}
                      {reviewAction === 'SUSPEND_USER' && selectedReport.reportedEntityType === 'USER' &&
                        '⚠ Saving will suspend this user account.'}
                      {reviewAction === 'SUSPEND_USER' && selectedReport.reportedEntityType !== 'USER' &&
                        'Suspend user is only valid for USER reports.'}
                    </p>
                  )}

                  <select
                    value={reviewAction}
                    onChange={(e) => setReviewAction(e.target.value as ModerationAction)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200"
                  >
                    {ACTION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="block text-xs uppercase tracking-[0.18em] text-zinc-500 mb-2">Admin note</span>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={4}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 resize-none"
                    placeholder="Add an internal note for the moderation log"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={submitting}
                  className="w-full rounded-sm border border-orange-500 bg-orange-500/10 px-4 py-2.5 text-sm font-bold text-orange-200 hover:bg-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? 'Saving…'
                    : reviewStatus === 'RESOLVED'
                    ? 'Save Resolution'
                    : 'Save Rejection'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">Unable to load the selected report.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminReportsPage;