import SettingsSection from "../components/shared/SettingsSection";
import SettingsToggle from "../components/shared/SettingsToggle";
import { useSettings } from "../hooks/useSettings";

const privacyTestIds: Record<string, string> = {
  "receive-messages-from-anyone": "privacy-toggle-receive-messages",
  "show-my-activities-in-social-discovery-playlists-and-modules": "privacy-toggle-show-activities",
  "show-when-im-a-first-or-top-fan": "privacy-toggle-show-first-top-fan",
  "show-first-and-top-fans-for-my-tracks": "privacy-toggle-show-fans-for-tracks",
};

export default function PrivacyTab() {
  const { privacySettings, togglePrivacySetting } = useSettings();

  return (
    <div data-testid="settings-privacy-tab">
      <SettingsSection title="Privacy settings" data-testid="settings-section-privacy-settings">
        <div className="max-w-[835px] space-y-8">
          {privacySettings.map((setting) => (
            <div key={setting.key} className="grid grid-cols-[1fr_auto] items-center gap-5 sm:gap-8">
              <div>
                <p className="mb-3 font-black text-[var(--sc-text)]">{setting.label}</p>
                {setting.description && (
                  <p className="max-w-[740px] text-xs leading-5 text-[var(--sc-text-secondary)]">{setting.description}</p>
                )}
              </div>
              <SettingsToggle
                checked={setting.enabled}
                onChange={(checked) => togglePrivacySetting(setting.key, checked)}
                data-testid={privacyTestIds[setting.key]}
              />
            </div>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Blocked users" data-testid="settings-section-blocked-users">
        <p className="font-semibold">You have not muted any users.</p>
      </SettingsSection>

      <SettingsSection title="Cookies" data-testid="settings-section-cookies">
        <div className="grid max-w-[835px] grid-cols-1 items-center gap-5 sm:grid-cols-[1fr_auto] sm:gap-8">
          <p className="text-[var(--sc-text-secondary)]">Manage your cookie preferences</p>
          <button
            type="button"
            data-testid="open-cookie-manager"
            className="w-fit rounded-sm bg-[var(--sc-surface)] px-4 py-3 text-[13px] font-black text-[var(--sc-text)]"
          >
            Open Cookie Manager
          </button>
        </div>
      </SettingsSection>
    </div>
  );
}
