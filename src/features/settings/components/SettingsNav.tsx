import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { label: "Account", path: "/settings", testId: "settings-tab-account" },
  { label: "Content", path: "/settings/content", testId: "settings-tab-content" },
  { label: "Notifications", path: "/settings/notifications", testId: "settings-tab-notifications" },
  { label: "Privacy", path: "/settings/privacy", testId: "settings-tab-privacy" },
  { label: "Advertising", path: "/settings/advertising", testId: "settings-tab-advertising" },
  { label: "Security", path: "/settings/security", testId: "settings-tab-security" },
];

export default function SettingsNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="hide-scrollbar mb-10 flex gap-7 overflow-x-auto whitespace-nowrap pb-1" aria-label="Settings tabs">
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;

        return (
          <button
            key={tab.path}
            type="button"
            data-testid={tab.testId}
            onClick={() => navigate(tab.path)}
            className={`relative shrink-0 pb-3 text-base font-black transition-colors sm:text-lg ${
              isActive ? "text-[var(--sc-text)]" : "text-[var(--sc-text-secondary)] hover:text-[var(--sc-text)]"
            }`}
          >
            {tab.label}
            {isActive && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[var(--sc-text)]" />}
          </button>
        );
      })}
    </nav>
  );
}
