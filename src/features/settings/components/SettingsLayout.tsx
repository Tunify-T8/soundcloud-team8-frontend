import type { ReactNode } from "react";
import { X, Zap } from "lucide-react";
import SettingsNav from "./SettingsNav";

interface SettingsLayoutProps {
  children: ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <main className="min-h-screen bg-[var(--sc-bg)] pb-24 text-white" data-testid="settings-page">
      <div className="mx-auto max-w-[1230px] px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="mb-9 flex min-h-14 items-center justify-center border border-[var(--sc-border)] bg-[var(--sc-surface)] px-4 text-sm font-bold text-white sm:px-6">
          <Zap size={20} className="mr-4 fill-purple-700 text-purple-700" aria-hidden="true" />
          <span>
            Now available: Get heard by up to 100 listeners on your next upload with Artist or Artist Pro.{" "}
            <a href="#" className="text-[#6699ff] hover:underline">
              Learn More
            </a>
          </span>
          <button
            type="button"
            className="ml-auto text-zinc-400 hover:text-white"
            data-testid="settings-promo-dismiss-button"
            aria-label="Dismiss"
          >
            <X size={24} />
          </button>
        </div>

        <h1 className="mb-9 text-[1.75rem] font-black text-white" data-testid="settings-heading">
          Settings
        </h1>
        <SettingsNav />
        <div className="max-w-[920px] text-sm text-white sm:text-[15px]">{children}</div>
      </div>
    </main>
  );
}
