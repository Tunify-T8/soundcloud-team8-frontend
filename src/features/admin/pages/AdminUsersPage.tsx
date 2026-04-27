import { useEffect, useMemo, useState } from 'react';
import { adminServices } from '../services/adminServices';
import type { UserModerationOverview } from '../types/admin.types';
import { profileService } from '../../profile/profileService';
import type { PublicUserProfile } from '../../../shared/types/User';

const PAGE_HINTS = [
  'Paste a username or user ID to inspect moderation state.',
  'Use the suspension controls to set a time-limited or permanent suspension.',
  'Unsuspend to immediately restore access.',
];

const DURATION_PRESETS = [
  { label: '24h', value: '24' },
  { label: '72h', value: '72' },
  { label: '7d', value: '168' },
  { label: '30d', value: '720' },
  { label: 'Permanent', value: '' },
];

const AdminUsersPage = () => {
  const [userIdInput, setUserIdInput] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserProfile, setSelectedUserProfile] = useState<PublicUserProfile | null>(null);
  const [moderation, setModeration] = useState<UserModerationOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [durationHours, setDurationHours] = useState('72');
  const [suspensionReason, setSuspensionReason] = useState('');

  const loadModeration = async (userId: string) => {
    const trimmed = userId.trim();
    if (!trimmed) {
      setError('Enter a username or user ID first.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const resolvedProfile = await profileService.getPublicProfile(trimmed);
      const data = await adminServices.users.getModeration(resolvedProfile.id);
      setModeration(data);
      setSelectedUserId(resolvedProfile.id);
      setSelectedUserProfile(resolvedProfile);
    } catch {
      setModeration(null);
      setSelectedUserId(trimmed);
      setSelectedUserProfile(null);
      setError('Failed to load the user moderation record.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedUserId) return;

    const refresh = async () => {
      try {
        const data = await adminServices.users.getModeration(selectedUserId);
        setModeration(data);
      } catch {
        // keep the last loaded state visible
      }
    };

    refresh();
  }, [selectedUserId]);

  const handleSuspend = async () => {
    const trimmedReason = suspensionReason.trim();
    if (!selectedUserId) {
      setError('Load a user moderation record first.');
      return;
    }
    if (!trimmedReason) {
      setError('Add a suspension reason.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await adminServices.users.suspend(selectedUserId, {
        durationHours: durationHours.trim() ? Number(durationHours) : null,
        reason: trimmedReason,
      });
      const data = await adminServices.users.getModeration(selectedUserId);
      setModeration(data);
      setSuccess('User suspended successfully.');
    } catch {
      setError('Failed to suspend the user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnsuspend = async () => {
    if (!selectedUserId) {
      setError('Load a user moderation record first.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await adminServices.users.unsuspend(selectedUserId);
      const data = await adminServices.users.getModeration(selectedUserId);
      setModeration(data);
      setSuccess('User unsuspended successfully.');
    } catch {
      setError('Failed to unsuspend the user.');
    } finally {
      setSubmitting(false);
    }
  };

  const suspensionLabel = useMemo(() => {
    if (!moderation) return 'No user selected';
    if (!moderation.isSuspended) return 'Active';
    return moderation.suspendedUntil ? `Suspended until ${new Date(moderation.suspendedUntil).toLocaleString()}` : 'Permanently suspended';
  }, [moderation]);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 text-white">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">User Moderation</h1>
          <p className="text-zinc-400 text-sm mt-1">Search a user by username or ID, review moderation status, and manage suspension state.</p>
        </div>
        <button
          type="button"
          onClick={() => selectedUserId && loadModeration(selectedUserId)}
          className="rounded-sm border border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-200 hover:text-white hover:border-zinc-500 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="mb-5 rounded-md border border-zinc-800 bg-zinc-900/70 p-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_auto] gap-3 items-end">
          <label className="block">
            <span className="block text-xs uppercase tracking-[0.18em] text-zinc-500 mb-2">User ID</span>
            <span className="block text-[11px] text-zinc-600 mb-2">Username or user id works here.</span>
            <input
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  void loadModeration(userIdInput);
                }
              }}
              placeholder="Paste a user UUID here"
              className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600"
            />
          </label>

          <button
            type="button"
            onClick={() => void loadModeration(userIdInput)}
            disabled={loading}
            className="rounded-sm border border-orange-500 bg-orange-500/10 px-4 py-2.5 text-sm font-bold text-orange-200 hover:bg-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Load User'}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-zinc-500">
          {PAGE_HINTS.map((hint) => (
            <p key={hint} className="rounded border border-zinc-800 bg-zinc-950/40 px-3 py-2">
              {hint}
            </p>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-sm border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-sm border border-emerald-900 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-5">
        <section className="rounded-md border border-zinc-800 bg-zinc-900/70 p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-black tracking-tight">Moderation State</h2>
              <p className="text-xs text-zinc-500 mt-1">{suspensionLabel}</p>
            </div>
            {moderation && (
              <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] ${moderation.isSuspended ? 'border-red-500/40 bg-red-500/10 text-red-300' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'}`}>
                {moderation.isSuspended ? 'Suspended' : 'Active'}
              </span>
            )}
          </div>

          {moderation ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Resolved user</p>
                <p className="mt-2 text-sm text-zinc-100 break-all">{selectedUserProfile?.username ?? 'Unknown user'}</p>
              </div>
              <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Suspension reason</p>
                <p className="mt-2 text-sm text-zinc-100">{moderation.suspensionReason || 'None'}</p>
              </div>
              <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Suspended until</p>
                <p className="mt-2 text-sm text-zinc-100">{moderation.suspendedUntil ? new Date(moderation.suspendedUntil).toLocaleString() : 'N/A'}</p>
              </div>
              <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">State</p>
                <p className="mt-2 text-sm text-zinc-100">{moderation.isSuspended ? 'Suspended' : 'Active'}</p>
              </div>
            </div>
          ) : loading ? (
            <p className="text-zinc-400 text-sm">Loading moderation data...</p>
          ) : (
            <p className="text-zinc-500 text-sm">Search for a user to load their moderation details.</p>
          )}
        </section>

        <section className="rounded-md border border-zinc-800 bg-zinc-900/70 p-5">
          <h2 className="text-lg font-black tracking-tight mb-4">Actions</h2>

          <div className="space-y-3">
            <div className="rounded border border-zinc-800 bg-zinc-950/50 p-3 text-xs text-zinc-400">
              {selectedUserProfile ? (
                <>
                  Resolved user: <span className="text-zinc-200 font-semibold">{selectedUserProfile.username}</span>
                </>
              ) : (
                'The admin actions will use the resolved user after lookup.'
              )}
            </div>

            <label className="block">
              <span className="block text-xs uppercase tracking-[0.18em] text-zinc-500 mb-2">Duration hours</span>
              <input
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                placeholder="72 for a 3-day suspension, leave blank for permanent"
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600"
              />
            </label>

            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-zinc-500">Quick presets</p>
              <div className="flex flex-wrap gap-2">
                {DURATION_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setDurationHours(preset.value)}
                    className={`rounded-full border px-3 py-1 text-xs ${durationHours === preset.value ? 'border-orange-500/70 bg-orange-500/15 text-orange-200' : 'border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-zinc-500 hover:text-white'}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="block text-xs uppercase tracking-[0.18em] text-zinc-500 mb-2">Suspension reason</span>
              <textarea
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                rows={5}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 resize-none"
                placeholder="Repeated abuse, spam, policy violation, etc."
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => void handleSuspend()}
                disabled={submitting || !selectedUserId}
                className="rounded-sm border border-orange-500 bg-orange-500/10 px-4 py-2.5 text-sm font-bold text-orange-200 hover:bg-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : 'Suspend User'}
              </button>

              <button
                type="button"
                onClick={() => void handleUnsuspend()}
                disabled={submitting || !selectedUserId}
                className="rounded-sm border border-zinc-700 px-4 py-2.5 text-sm font-bold text-zinc-200 hover:text-white hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Unsuspend User
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminUsersPage;
