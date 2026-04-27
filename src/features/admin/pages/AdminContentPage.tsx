import { useMemo, useState } from 'react';
import { adminServices } from '../services/adminServices';

type ContentEntity = 'TRACK' | 'COMMENT';
type ContentAction = 'HIDE' | 'UNHIDE' | 'DELETE';

type ActionLogEntry = {
  id: string;
  entity: ContentEntity;
  entityId: string;
  action: ContentAction;
  createdAt: string;
  message: string;
};

const ENTITY_OPTIONS: Array<{ value: ContentEntity; label: string; placeholder: string }> = [
  { value: 'TRACK', label: 'Track', placeholder: 'Paste track id' },
  { value: 'COMMENT', label: 'Comment', placeholder: 'Paste comment id' },
];

const ACTION_LABELS: Record<ContentAction, string> = {
  HIDE: 'Hide',
  UNHIDE: 'Unhide',
  DELETE: 'Delete',
};

const AdminContentPage = () => {
  const [entity, setEntity] = useState<ContentEntity>('TRACK');
  const [entityIdInput, setEntityIdInput] = useState('');
  const [submittingAction, setSubmittingAction] = useState<ContentAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLog, setActionLog] = useState<ActionLogEntry[]>([]);

  const activeEntityOption = useMemo(() => {
    return ENTITY_OPTIONS.find((option) => option.value === entity) ?? ENTITY_OPTIONS[0];
  }, [entity]);

  const runAction = async (action: ContentAction) => {
    const trimmedId = entityIdInput.trim();
    if (!trimmedId) {
      setError(`Enter a ${entity === 'TRACK' ? 'track' : 'comment'} id first.`);
      return;
    }

    if (action === 'DELETE') {
      const label = entity === 'TRACK' ? 'track' : 'comment';
      const confirmed = window.confirm(`Delete ${label} ${trimmedId}? This cannot be undone.`);
      if (!confirmed) return;
    }

    setSubmittingAction(action);
    setError(null);
    setSuccess(null);

    try {
      let message = '';

      if (entity === 'TRACK') {
        if (action === 'HIDE') message = await adminServices.content.hideTrack(trimmedId);
        if (action === 'UNHIDE') message = await adminServices.content.unhideTrack(trimmedId);
        if (action === 'DELETE') message = await adminServices.content.deleteTrack(trimmedId);
      }

      if (entity === 'COMMENT') {
        if (action === 'HIDE') message = await adminServices.content.hideComment(trimmedId);
        if (action === 'UNHIDE') message = await adminServices.content.unhideComment(trimmedId);
        if (action === 'DELETE') message = await adminServices.content.deleteComment(trimmedId);
      }

      const fallbackMessage = `${ACTION_LABELS[action]} action completed for ${entity.toLowerCase()} ${trimmedId}.`;
      const finalMessage = message || fallbackMessage;
      setSuccess(finalMessage);

      const entry: ActionLogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        entity,
        entityId: trimmedId,
        action,
        createdAt: new Date().toISOString(),
        message: finalMessage,
      };

      setActionLog((prev) => [entry, ...prev].slice(0, 8));
    } catch {
      setError(`Failed to ${ACTION_LABELS[action].toLowerCase()} this ${entity.toLowerCase()}.`);
    } finally {
      setSubmittingAction(null);
    }
  };

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 text-white">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Content Moderation</h1>
          <p className="text-zinc-400 text-sm mt-1">Moderate tracks and comments directly by content id.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setSuccess(null);
          }}
          className="rounded-sm border border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-200 hover:text-white hover:border-zinc-500 transition-colors"
        >
          Clear Alerts
        </button>
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
          <h2 className="text-lg font-black tracking-tight mb-4">Moderation Controls</h2>

          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500 mb-2">Content type</p>
            <div className="flex flex-wrap gap-2">
              {ENTITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setEntity(option.value)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${entity === option.value ? 'border-orange-500/70 bg-orange-500/15 text-orange-200' : 'border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-zinc-500 hover:text-white'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <label className="block mb-4">
            <span className="block text-xs uppercase tracking-[0.18em] text-zinc-500 mb-2">{activeEntityOption.label} id</span>
            <input
              value={entityIdInput}
              onChange={(e) => setEntityIdInput(e.target.value)}
              placeholder={activeEntityOption.placeholder}
              className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => void runAction('HIDE')}
              disabled={submittingAction !== null}
              className="rounded-sm border border-amber-500/70 bg-amber-500/10 px-4 py-2.5 text-sm font-bold text-amber-200 hover:bg-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingAction === 'HIDE' ? 'Working...' : `Hide ${activeEntityOption.label}`}
            </button>

            <button
              type="button"
              onClick={() => void runAction('UNHIDE')}
              disabled={submittingAction !== null}
              className="rounded-sm border border-emerald-500/70 bg-emerald-500/10 px-4 py-2.5 text-sm font-bold text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingAction === 'UNHIDE' ? 'Working...' : `Unhide ${activeEntityOption.label}`}
            </button>

            <button
              type="button"
              onClick={() => void runAction('DELETE')}
              disabled={submittingAction !== null}
              className="rounded-sm border border-red-500/70 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-200 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingAction === 'DELETE' ? 'Working...' : `Delete ${activeEntityOption.label}`}
            </button>
          </div>

          <div className="mt-4 rounded border border-zinc-800 bg-zinc-950/40 px-3 py-3 text-xs text-zinc-400">
            Use delete only for severe or irreversible policy violations. Hide is better for temporary enforcement while an appeal is pending.
          </div>
        </section>

        <section className="rounded-md border border-zinc-800 bg-zinc-900/70 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black tracking-tight">Recent Actions</h2>
            {actionLog.length > 0 && (
              <button
                type="button"
                onClick={() => setActionLog([])}
                className="text-xs font-bold text-zinc-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {actionLog.length ? (
            <div className="space-y-2">
              {actionLog.map((entry) => (
                <div key={entry.id} className="rounded border border-zinc-800 bg-zinc-950/50 px-3 py-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                      {entry.entity} • {entry.action}
                    </p>
                    <p className="text-[11px] text-zinc-500">{new Date(entry.createdAt).toLocaleString()}</p>
                  </div>
                  <p className="text-sm text-zinc-100 break-all">{entry.entityId}</p>
                  <p className="text-xs text-zinc-400 mt-1">{entry.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No actions yet in this session.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminContentPage;
