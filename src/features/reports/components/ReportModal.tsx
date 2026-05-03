import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import type {
  ReportReason,
  ReportedEntityType,
  ViolationArea,
} from "@/features/admin/types/admin.types";
import { reportService } from "../reportService";

const TRACK_VIOLATION_AREAS: ViolationArea[] = [
  "AUDIO",
  "ARTWORK",
  "TITLE",
  "DESCRIPTION",
];

const ENTITY_LABELS: Record<ReportedEntityType, string> = {
  TRACK: "track",
  COMMENT: "comment",
  USER: "account",
};

export default function ReportModal({
  entityType,
  entityId,
  onClose,
  onSubmitted,
}: {
  entityType: ReportedEntityType;
  entityId: string;
  onClose: () => void;
  onSubmitted?: () => void;
}) {
  const [reasons, setReasons] = useState<ReportReason[]>([]);
  const [loadingReasons, setLoadingReasons] = useState(true);
  const [selectedReasonId, setSelectedReasonId] = useState("");
  const [detailsText, setDetailsText] = useState("");
  const [violationAreas, setViolationAreas] = useState<ViolationArea[]>(
    entityType === "TRACK" ? ["AUDIO"] : [],
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;

    reportService
      .getReasons()
      .then((data) => {
        if (cancelled) return;
        setReasons(data);
        setSelectedReasonId((current) => current || data[0]?.id || "");
      })
      .catch(() => {
        if (cancelled) return;
        setSubmitError("Failed to load report reasons.");
      })
      .finally(() => {
        if (!cancelled) setLoadingReasons(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const entityLabel = ENTITY_LABELS[entityType];
  const isTrack = entityType === "TRACK";
  const submitDisabled = loadingReasons || !selectedReasonId || submitting;

  const selectedReasonLabel = useMemo(
    () => reasons.find((reason) => reason.id === selectedReasonId)?.label ?? "",
    [reasons, selectedReasonId],
  );

  const toggleViolationArea = (area: ViolationArea) => {
    setViolationAreas((current) =>
      current.includes(area)
        ? current.filter((value) => value !== area)
        : [...current, area],
    );
  };

  const handleSubmit = async () => {
    if (submitDisabled) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await reportService.submit({
        reportedEntityType: entityType,
        reportedEntityId: entityId,
        reasonId: selectedReasonId,
        detailsText: detailsText.trim() || undefined,
        violationAreas: isTrack && violationAreas.length > 0 ? violationAreas : undefined,
      });
      onSubmitted?.();
      onClose();
    } catch {
      setSubmitError("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative my-auto flex max-h-[calc(100vh-3rem)] w-full max-w-[640px] flex-col overflow-hidden rounded-[4px] border border-zinc-800 bg-[#111] text-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 transition hover:text-white"
          aria-label="Close report modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="border-b border-zinc-800 px-6 pb-4 pt-6">
          <h2 className="pr-8 text-[22px] font-bold tracking-tight">
            Report this {entityLabel}
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Choose the reason that best describes the problem. Reports are reviewed by the moderation team.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <div>
            <p className="text-sm font-semibold text-white">Reason</p>
            {loadingReasons ? (
              <div className="mt-3 text-sm text-zinc-400">Loading reasons...</div>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                {reasons.map((reason) => {
                  const isSelected = reason.id === selectedReasonId;
                  return (
                    <button
                      key={reason.id}
                      type="button"
                      onClick={() => setSelectedReasonId(reason.id)}
                      className={`rounded-[4px] border px-3 py-2 text-left text-sm transition ${
                        isSelected
                          ? "border-orange-500 bg-orange-500/10 text-white"
                          : "border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-600 hover:text-white"
                      }`}
                    >
                      {reason.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {isTrack && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-white">Violation areas</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {TRACK_VIOLATION_AREAS.map((area) => {
                  const active = violationAreas.includes(area);
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleViolationArea(area)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        active
                          ? "border-orange-500 bg-orange-500/10 text-orange-300"
                          : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
                      }`}
                    >
                      {area}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">Additional details</p>
              {selectedReasonLabel ? (
                <span className="text-xs text-zinc-500">{selectedReasonLabel}</span>
              ) : null}
            </div>
            <textarea
              value={detailsText}
              onChange={(event) => setDetailsText(event.target.value)}
              rows={5}
              placeholder={`Tell us more about why you're reporting this ${entityLabel}.`}
              className="mt-3 w-full rounded-[4px] border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none transition focus:border-zinc-600"
            />
          </div>

          <div className="mt-6 rounded-[4px] border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm leading-6 text-zinc-400">
            Repeated violations or serious abuse may result in account restrictions or content removal.
          </div>

          {submitError ? (
            <p className="mt-4 text-sm text-red-400">{submitError}</p>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-zinc-800 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[4px] border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitDisabled}
            className="rounded-[4px] bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit report"}
          </button>
        </div>
      </div>
    </div>
  );
}
