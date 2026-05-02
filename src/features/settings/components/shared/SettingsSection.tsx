import type { ReactNode } from "react";
import { Info } from "lucide-react";

interface SettingsSectionProps {
  title: string;
  infoIcon?: boolean;
  children: ReactNode;
  "data-testid"?: string;
}

export default function SettingsSection({
  title,
  infoIcon = false,
  children,
  "data-testid": dataTestId,
}: SettingsSectionProps) {
  return (
    <section className="mb-12 text-white" data-testid={dataTestId}>
      <h2
        className="mb-5 flex items-center gap-2 text-base font-black text-white"
        data-testid={dataTestId ? `${dataTestId}-heading` : undefined}
      >
        {title}
        {infoIcon && <Info size={16} className="text-zinc-400" aria-hidden="true" />}
      </h2>
      {children}
    </section>
  );
}
