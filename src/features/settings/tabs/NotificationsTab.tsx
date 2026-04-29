import SettingsSection from "../components/shared/SettingsSection";
import {
  toKebabCase,
  useSettings,
} from "../hooks/useSettings";
import type { NotificationSetting } from "../types/settings.types";

const notificationTestIds: Record<string, { email?: string; devices?: string }> = {
  "New follower": {
    email: "notification-new-follower-email",
    devices: "notification-new-follower-devices",
  },
  "Repost of your post": {
    email: "notification-repost-email",
    devices: "notification-repost-devices",
  },
  "New post by followed user": {
    email: "notification-new-post-email",
    devices: "notification-new-post-devices",
  },
  "Likes and plays on your post": {
    email: "notification-likes-plays-email",
    devices: "notification-likes-plays-devices",
  },
  "Comment on your post": {
    email: "notification-comment-email",
    devices: "notification-comment-devices",
  },
  "Recommended Content": {
    email: "notification-recommended-email",
    devices: "notification-recommended-devices",
  },
  "New message": {
    email: "notification-new-message-email",
    devices: "notification-new-message-devices-dropdown",
  },
  "SoundCloud Feature Updates & Education": {
    email: "notification-feature-updates-email",
    devices: "notification-feature-updates-devices",
  },
  "Surveys and feedback": {
    email: "notification-surveys-email",
    devices: "notification-surveys-devices",
  },
  "Promotional & Partnership Content": {
    email: "notification-promotional-email",
    devices: "notification-promotional-devices",
  },
  "SoundCloud newsletter": {
    email: "notification-newsletter-email",
  },
};

function SettingsCheckbox({
  checked,
  disabled = false,
  onChange,
  testId,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  testId: string;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      data-testid={testId}
      onChange={(event) => onChange?.(event.target.checked)}
      className="h-5 w-5 rounded-sm accent-white disabled:opacity-0"
    />
  );
}

function NotificationGrid({
  title,
  settings,
  onToggle,
}: {
  title: string;
  settings: NotificationSetting[];
  onToggle: (label: string, field: "email" | "devices", checked: boolean) => void;
}) {
  return (
    <SettingsSection title={title} data-testid={`settings-section-${toKebabCase(title)}`}>
      <div className="hide-scrollbar overflow-x-auto">
        <div className="grid min-w-[520px] max-w-[830px] grid-cols-[1fr_90px_120px] items-center gap-y-6 text-[13px]">
        <span />
        <label className="flex items-center gap-3 font-black">
          <SettingsCheckbox checked disabled testId={`${toKebabCase(title)}-email-header-checkbox`} />
          Email
        </label>
        <label className="flex items-center gap-3 font-black">
          <SettingsCheckbox checked disabled testId={`${toKebabCase(title)}-devices-header-checkbox`} />
          Devices
        </label>

        {settings.map((setting) => {
          const key = toKebabCase(setting.label);

          return (
            <div className="contents" key={setting.label}>
              <p className="font-black">
                {setting.label}
                {setting.label === "New message" && <span className="ml-2 text-zinc-400">i</span>}
              </p>
              <SettingsCheckbox
                checked={setting.email}
                testId={notificationTestIds[setting.label]?.email ?? `notification-${key}-email`}
                onChange={(checked) => onToggle(setting.label, "email", checked)}
              />
              {setting.devices === "everyone" ? (
                <select
                  data-testid={notificationTestIds[setting.label]?.devices ?? `notification-${key}-devices`}
                className="h-7 w-24 rounded-sm border border-[var(--sc-border)] bg-[var(--sc-bg-secondary)] px-2 text-[13px] text-[var(--sc-text)]"
                  defaultValue="Everyone"
                >
                  <option>Everyone</option>
                </select>
              ) : (
                <SettingsCheckbox
                  checked={setting.devices}
                  testId={notificationTestIds[setting.label]?.devices ?? `notification-${key}-devices`}
                  onChange={(checked) => onToggle(setting.label, "devices", checked)}
                />
              )}
            </div>
          );
        })}
        </div>
      </div>
    </SettingsSection>
  );
}

export default function NotificationsTab() {
  const {
    activityNotifications,
    soundCloudUpdates,
    toggleActivityNotification,
    toggleSoundCloudUpdate,
  } = useSettings();

  return (
    <div data-testid="settings-notifications-tab">
      <NotificationGrid
        title="Activities"
        settings={activityNotifications}
        onToggle={toggleActivityNotification}
      />
      <NotificationGrid
        title="Updates from SoundCloud"
        settings={soundCloudUpdates}
        onToggle={toggleSoundCloudUpdate}
      />
      <div className="flex max-w-[830px] justify-end gap-8" data-testid="notifications-actions">
        <button type="button" data-testid="notifications-cancel-button" className="font-black text-[var(--sc-text)]">
          Cancel
        </button>
        <button type="button" data-testid="notifications-save-button" className="rounded-sm bg-zinc-400 px-5 py-3 text-[13px] font-black text-black">
          Save changes
        </button>
      </div>
    </div>
  );
}
