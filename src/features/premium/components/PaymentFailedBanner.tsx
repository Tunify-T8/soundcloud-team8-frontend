import { AlertTriangle, X } from "lucide-react";

interface PaymentFailedBannerProps {
  message?: string;
  onDismiss: () => void;
  onRetry?: () => void;
}

export default function PaymentFailedBanner({
  onDismiss,
  onRetry,
}: PaymentFailedBannerProps) {
  return (
    <div className="relative bg-red-50 border border-red-200 rounded-2xl px-6 py-4 mb-4 flex items-start gap-3">
      <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-bold text-red-700">Your Payment Has Failed</p>
        <p className="text-[13px] text-red-500 mt-0.5">
          { "Please update your payment method or enter a valid card."}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-[13px] font-semibold text-orange-600 hover:underline"
          >
            Try a different card →
          </button>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 text-red-300 hover:text-red-500 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}