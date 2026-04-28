import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminServices } from '../services/adminServices';
import AdminTopListCard, { type TopListKey, type TopListItem, type TopListOption } from '../components/AdminTopListCard';
import type {
  AnalyticsResponse,
  PlatformSummary,
  ReportStats,
  TopStats,
} from '../types/admin.types';

type NullableNumber = number | null;

const pickNumber = (obj: Record<string, unknown>, keys: string[]): NullableNumber => {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }
  return null;
};

const AdminDashboardPage = () => {
  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setDate(today.getDate() - 29);

  const [startDate, setStartDate] = useState(lastMonth.toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(today.toISOString().slice(0, 10));
  const [summary, setSummary] = useState<PlatformSummary | null>(null);
  const [topStats, setTopStats] = useState<TopStats | null>(null);
  const [reportStats, setReportStats] = useState<ReportStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [topListKey, setTopListKey] = useState<TopListKey>('mostPlayedTracks');
  const [showSummary, setShowSummary] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const results = await Promise.allSettled([
      adminServices.analytics.getSummary(),
      adminServices.analytics.getTop(5),
      adminServices.analytics.getReportsBreakdown(),
      adminServices.analytics.getTimeSeries(startDate, endDate),
    ]);

    const [summaryResult, topResult, reportResult, analyticsResult] = results;

    if (summaryResult.status === 'fulfilled') setSummary(summaryResult.value);
    else setSummary(null);

    if (topResult.status === 'fulfilled') setTopStats(topResult.value);
    else setTopStats(null);

    if (reportResult.status === 'fulfilled') setReportStats(reportResult.value);
    else setReportStats(null);

    if (analyticsResult.status === 'fulfilled') setAnalytics(analyticsResult.value);
    else setAnalytics(null);

    const failedCount = results.filter((result) => result.status === 'rejected').length;
    if (failedCount === results.length) {
      setError('Failed to load dashboard data.');
    } else if (failedCount > 0) {
      setError('Some dashboard widgets could not be loaded.');
    }

    setIsLoading(false);
  }, [startDate, endDate]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const metrics = useMemo(() => {
    const summaryAny = (summary ?? {}) as unknown as Record<string, unknown>;
    const analyticsAny = (analytics ?? {}) as unknown as Record<string, unknown>;

    const artistCount =
      pickNumber(summaryAny, ['artistCount']) ??
      pickNumber(analyticsAny, ['artistCount']);
    const listenerCount =
      pickNumber(summaryAny, ['listenerCount']) ??
      pickNumber(analyticsAny, ['listenerCount']);

    const playThroughRate =
      pickNumber(summaryAny, ['playThroughRate', 'playthroughRate', 'play_through_rate']) ??
      pickNumber(analyticsAny, ['playThroughRate', 'playthroughRate', 'play_through_rate']);

    let storageUsage =
      pickNumber(summaryAny, [
        'storageUsagePercent',
        'storage_usage_percent',
        'storagePercent',
        'storageUsage',
      ]) ??
      pickNumber(analyticsAny, [
        'storageUsagePercent',
        'storage_usage_percent',
        'storagePercent',
        'storageUsage',
      ]);

    if (storageUsage === null) {
      const storageUsed = pickNumber(summaryAny, ['storageUsedGb', 'storageUsedGB', 'storageUsed']);
      const storageTotal = pickNumber(summaryAny, [
        'storageTotalGb',
        'storageTotalGB',
        'storageCapacityGb',
        'storageCapacity',
      ]);
      if (storageUsed !== null && storageTotal !== null && storageTotal > 0) {
        storageUsage = (storageUsed / storageTotal) * 100;
      }
    }

    return {
      activeUsers: summary?.activeUsers ?? null,
      artistCount,
      listenerCount,
      artistListenerRatio:
        summary?.artistToListenerRatio !== undefined
          ? summary.artistToListenerRatio
          : artistCount !== null && listenerCount !== null && listenerCount > 0
          ? artistCount / listenerCount
          : null,
      playThroughRate,
      storageUsage,
      generatedAt: summary?.generatedAt ?? null,
    };
  }, [summary, analytics]);

  const generatedAtLabel = useMemo(() => {
    if (!summary?.generatedAt) return null;
    const parsed = new Date(summary.generatedAt);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toLocaleString();
  }, [summary]);

  const renderNumber = (value: number | null) => {
    if (value === null) return 'N/A';
    return value.toLocaleString();
  };

  const renderPercent = (value: number | null) => {
    if (value === null) return 'N/A';
    return `${value.toFixed(1)}%`;
  };

  const renderRatio = (value: number | null) => {
    if (value === null) return 'N/A';
    return `${value.toFixed(2)} : 1`;
  };

  const summaryItems = useMemo(
    () => [
      { label: 'Total users', value: summary?.totalUsers },
      { label: 'New users today', value: summary?.newUsersToday },
      { label: 'New users this week', value: summary?.newUsersThisWeek },
      { label: 'Active users', value: summary?.activeUsers },
      { label: 'Suspended users', value: summary?.suspendedUsers },
      { label: 'Banned users', value: summary?.bannedUsers },
      { label: 'Total tracks', value: summary?.totalTracks },
      { label: 'New tracks today', value: summary?.newTracksToday },
      { label: 'New tracks this week', value: summary?.newTracksThisWeek },
      { label: 'Total plays', value: summary?.totalPlays },
      { label: 'Plays today', value: summary?.playsToday },
      { label: 'Total reports', value: summary?.totalReports },
      { label: 'Pending reports', value: summary?.pendingReports },
    ],
    [summary],
  );

  const topListOptions: TopListOption[] = [
    { key: 'mostPlayedTracks', label: 'Most Played Tracks' },
    { key: 'mostReportedTracks', label: 'Most Reported Tracks' },
    { key: 'mostReportedUsers', label: 'Most Reported Users' },
    { key: 'mostActiveUsers', label: 'Most Active Users' },
  ];

  const topListData = useMemo<TopListItem[]>(() => {
    if (!topStats) return [];

    return (topStats[topListKey] ?? []) as unknown as TopListItem[];
  }, [topStats, topListKey]);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Admin Dashboard</h1>
          <p className="text-zinc-400 text-sm mt-1">Platform analytics overview</p>
        </div>
        <button
          type="button"
          onClick={loadDashboard}
          className="rounded-sm border border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-200 hover:text-white hover:border-zinc-500 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setShowSummary((value) => !value)}
          className="rounded-sm border border-orange-500 bg-orange-500/10 px-3 py-1.5 text-xs font-bold text-orange-200 hover:bg-orange-500/20 transition-colors"
        >
          {showSummary ? 'Hide Summary' : 'Show Summary'}
        </button>
      </div>

      {showSummary && (
        <section className="mb-5 rounded-md border border-zinc-800 bg-zinc-900/70 p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-black tracking-tight">Summary</h2>
              <p className="text-xs text-zinc-500 mt-1">Overview data from the summary API</p>
            </div>
            {generatedAtLabel && <span className="text-xs text-zinc-500">Updated: {generatedAtLabel}</span>}
          </div>

          {isLoading ? (
            <p className="text-zinc-400 text-sm">Loading summary...</p>
          ) : summary ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {summaryItems.map((item) => (
                <div key={item.label} className="rounded-md border border-zinc-800 bg-zinc-950/60 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{item.label}</p>
                  <p className="mt-2 text-xl font-black tracking-tight">
                    {typeof item.value === 'number' ? item.value.toLocaleString() : 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">No summary data available.</p>
          )}
        </section>
      )}

      <div className="mb-5 rounded-sm border border-zinc-800 bg-zinc-900/60 p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500 mb-1">Analytics date range</p>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-sm"
            />
            <span className="text-zinc-500 text-xs">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-sm"
            />
          </div>
        </div>
        {generatedAtLabel && <span className="text-xs text-zinc-500">Updated: {generatedAtLabel}</span>}
      </div>

      {error && (
        <div className="mb-5 rounded-sm border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        <section className="rounded-md border border-zinc-800 bg-zinc-900/70 p-5">
          <p className="text-zinc-400 text-sm font-semibold">Total Active Users</p>
          <p className="mt-2 text-3xl font-black tracking-tight">
            {isLoading ? '...' : renderNumber(metrics.activeUsers)}
          </p>
          <p className="mt-2 text-xs text-zinc-500">Users active in the last 30 days</p>
        </section>

        <section className="rounded-md border border-zinc-800 bg-zinc-900/70 p-5">
          <p className="text-zinc-400 text-sm font-semibold">Play-through Rate</p>
          <p className="mt-2 text-3xl font-black tracking-tight">
            {isLoading ? '...' : renderPercent(metrics.playThroughRate)}
          </p>
          <p className="mt-2 text-xs text-zinc-500">Completion or engagement rate from analytics</p>
        </section>

        <section className="rounded-md border border-zinc-800 bg-zinc-900/70 p-5">
          <p className="text-zinc-400 text-sm font-semibold">Storage Usage</p>
          <p className="mt-2 text-3xl font-black tracking-tight">
            {isLoading ? '...' : renderPercent(metrics.storageUsage)}
          </p>
          <p className="mt-2 text-xs text-zinc-500">Current platform storage utilization</p>
        </section>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        <section className="rounded-md border border-zinc-800 bg-zinc-900/70 p-5">
          <p className="text-zinc-400 text-sm font-semibold">Artist to Listener Ratio</p>
          <p className="mt-2 text-3xl font-black tracking-tight">
            {isLoading ? '...' : renderRatio(metrics.artistListenerRatio)}
          </p>
        </section>

        <section className="rounded-md border border-zinc-800 bg-zinc-900/70 p-5">
          <p className="text-zinc-400 text-sm font-semibold">Audience Mix</p>
          <p className="mt-2 text-3xl font-black tracking-tight">
            {isLoading ? '...' : metrics.artistCount !== null && metrics.listenerCount !== null ? `${Math.round((metrics.artistCount / Math.max(metrics.artistCount + metrics.listenerCount, 1)) * 100)}%` : 'N/A'}
          </p>
          <p className="mt-2 text-xs text-zinc-500">Artist share of creator-account population</p>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 mt-5">
        <AdminTopListCard
          title={topListOptions.find((option) => option.key === topListKey)?.label ?? 'Top List'}
          selectedKey={topListKey}
          options={topListOptions}
          items={topListData}
          isLoading={isLoading}
          onChange={setTopListKey}
        />

        <section className="rounded-md border border-zinc-800 bg-zinc-900/70 p-5">
          <h2 className="text-lg font-black tracking-tight mb-3">Reports Overview</h2>
          {isLoading ? (
            <p className="text-zinc-400 text-sm">Loading...</p>
          ) : reportStats?.byStatus?.length ? (
            <ul className="space-y-2">
              {reportStats.byStatus.map((row) => (
                <li key={row.status} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-200">{row.status}</span>
                  <span className="text-zinc-400">{row.count.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-zinc-500 text-sm">No report status data available.</p>
          )}

          {reportStats && (
            <div className="mt-4 pt-3 border-t border-zinc-800">
              <div className="text-sm flex items-center justify-between mb-2">
                <span className="text-zinc-300">Resolution Rate</span>
                <span className="text-zinc-100 font-bold">{reportStats.resolutionRate.toFixed(1)}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 animate-pulse"
                  style={{ width: `${Math.max(0, Math.min(100, reportStats.resolutionRate))}%` }}
                />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
