import { api } from "@/features/auth/services/api";
import type {
  MessageResponse,
  ReportReason,
  SubmitReportPayload,
} from "@/features/admin/types/admin.types";

type ReportReasonsResponse =
  | ReportReason[]
  | {
      data?: ReportReason[];
      reasons?: ReportReason[];
    };

export const reportService = {
  async getReasons(): Promise<ReportReason[]> {
    const { data } = await api.get<ReportReasonsResponse>("/reports/reasons");
    const reasons = Array.isArray(data) ? data : data?.data ?? data?.reasons ?? [];

    return reasons
      .map((reason) => ({
        id: String((reason as { id?: string }).id ?? ""),
        label: String(
          (reason as { label?: string; name?: string }).label ??
            (reason as { name?: string }).name ??
            "",
        ),
      }))
      .filter((reason) => reason.id && reason.label);
  },

  async submit(payload: SubmitReportPayload): Promise<string> {
    const { data } = await api.post<MessageResponse>("/reports", payload);
    return data?.message ?? "Report submitted";
  },
};
