import { Upload } from "lucide-react";
import ArtistProUpgradeButton from "@/features/premium/components/ArtistProUpgradeButton";

export type UploadQuota = {
  tier: string;
  uploadMinutesLimit: number | null;
  uploadMinutesUsed: number;
  uploadMinutesRemaining: number | null;
  canReplaceFiles: boolean;
  canScheduleRelease: boolean;
  canAccessAdvancedTab: boolean;
};

interface UploadQuotaBannerProps {
  quota: UploadQuota | null;
  loading: boolean;
  onOpenDetails?: () => void;
  forceOverLimit?: boolean;
  statusMessage?: string;
}

export default function UploadQuotaBanner({
  quota,
  loading,
  onOpenDetails,
  forceOverLimit = false,
  statusMessage,
}: UploadQuotaBannerProps) {
  const isUnlimited = quota?.uploadMinutesLimit === null;
  const minutesLimit = quota?.uploadMinutesLimit ?? 180;
  const minutesUsed = forceOverLimit ? minutesLimit : quota?.uploadMinutesUsed ?? 0;
  const percentUsed = forceOverLimit
    ? 100
    : isUnlimited
    ? 0
    : minutesLimit === 0
      ? 0
      : Math.min(100, Math.round((minutesUsed / minutesLimit) * 100));
  const isOverLimit = forceOverLimit || (!isUnlimited && percentUsed >= 100);

  return (
    <div
      data-testid="upload-banner"
      className="bg-[hsl(0,0%,11%)] border-b border-[hsl(0,0%,18%)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-8 py-3 shrink-0"
    >
      <div
        className="flex items-center gap-3 flex-wrap"
        role={onOpenDetails ? "button" : undefined}
        onClick={onOpenDetails}
      >
        <Upload className="w-4 h-4 text-[hsl(0,0%,60%)] shrink-0" />
        {loading ? (
          <span className="text-[#555] text-sm animate-pulse">Loading...</span>
        ) : isUnlimited ? (
          <>
            <span className="text-white text-sm font-medium tracking-tighter">Unlimited uploads</span>
            <div className="w-32 sm:w-44 h-1.5 bg-[hsl(0,0%,23%)] rounded-full overflow-hidden">
              <div className="h-full bg-[hsl(142,69%,36%)] rounded-full" style={{ width: "0%" }} />
            </div>
            <span className="text-[hsl(0,100%,99%)] text-sm font-semibold">Unlimited</span>
          </>
        ) : (
          <>
            <span className="text-white text-sm font-medium tracking-tighter">
              {percentUsed}% of uploads used
            </span>
            <div className="w-32 sm:w-44 h-1.5 bg-[hsl(0,0%,23%)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percentUsed}%`,
                  backgroundColor: isOverLimit ? "#e74c3c" : "#3bb54a",
                }}
              />
            </div>
            <span className="text-[hsl(0,100%,99%)] text-sm font-semibold">
              {minutesUsed} of {minutesLimit} minutes
            </span>
            {statusMessage && (
              <span className="text-[hsl(0,0%,70%)] text-xs sm:text-sm">
                {statusMessage}
              </span>
            )}
          </>
        )}
      </div>
      <ArtistProUpgradeButton
        data-testid="upload-banner-unlimited-btn"
        className="self-end sm:self-auto bg-black text-white text-sm font-bold tracking-tighter px-5 py-2 rounded-full hover:bg-[hsl(0,0%,20%)] transition-colors whitespace-nowrap"
      >
        Get unlimited uploads
      </ArtistProUpgradeButton>
    </div>
  );
}
