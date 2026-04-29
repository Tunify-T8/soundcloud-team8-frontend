import { useEffect, useState } from "react";
import SettingsSection from "../components/shared/SettingsSection";
import SettingsToggle from "../components/shared/SettingsToggle";
import { useSettings } from "../hooks/useSettings";
import { profileService } from "../../profile/profileService";
import type { BlockedUser } from "@/shared/types/User";

const privacyTestIds: Record<string, string> = {
  "receive-messages-from-anyone": "privacy-toggle-receive-messages",
  "show-my-activities-in-social-discovery-playlists-and-modules": "privacy-toggle-show-activities",
  "show-when-im-a-first-or-top-fan": "privacy-toggle-show-first-top-fan",
  "show-first-and-top-fans-for-my-tracks": "privacy-toggle-show-fans-for-tracks",
};

export default function PrivacyTab() {
  const { privacySettings, togglePrivacySetting } = useSettings();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoadingBlockedUsers, setIsLoadingBlockedUsers] = useState(true);

  useEffect(() => {
    let isMounted = true;

    profileService
      .getBlockedUsers()
      .then((data) => {
        if (isMounted) {
          setBlockedUsers(data.blockedUsers ?? []);
        }
      })
      .catch(() => {
        if (isMounted) {
          setBlockedUsers([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingBlockedUsers(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
        {isLoadingBlockedUsers ? (
          <p className="font-semibold" data-testid="settings-blocked-users-loading">Loading blocked users...</p>
        ) : blockedUsers.length > 0 ? (
          <div className="space-y-3" data-testid="settings-blocked-users-list">
            {blockedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 rounded-sm bg-[var(--sc-surface)] px-3 py-2"
                data-testid={`settings-blocked-user-${user.id}`}
              >
                <img
                  src={user.avatarUrl ?? "https://i.pravatar.cc/100"}
                  alt={user.username}
                  className="h-9 w-9 rounded-full object-cover"
                />
                <div>
                  <p className="font-black text-[var(--sc-text)]">{user.username}</p>
                  <p className="text-xs text-[var(--sc-text-secondary)]">Blocked</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-semibold" data-testid="settings-blocked-users-empty">You have not blocked any users.</p>
        )}
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
