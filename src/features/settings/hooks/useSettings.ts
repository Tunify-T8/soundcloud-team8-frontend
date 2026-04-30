import { useState } from "react";
import type { NotificationSetting, PrivacySetting } from "../types/settings.types";

export const activityNotificationDefaults: NotificationSetting[] = [
  { label: "New follower", email: true, devices: true },
  { label: "Repost of your post", email: true, devices: true },
  { label: "New post by followed user", email: true, devices: true },
  { label: "Likes and plays on your post", email: true, devices: true },
  { label: "Comment on your post", email: false, devices: true },
  { label: "Recommended Content", email: true, devices: true },
  { label: "New message", email: true, devices: "everyone" },
];

export const soundCloudUpdateDefaults: NotificationSetting[] = [
  { label: "SoundCloud Feature Updates & Education", email: true, devices: true },
  { label: "Surveys and feedback", email: false, devices: true },
  { label: "Promotional & Partnership Content", email: true, devices: true },
  { label: "SoundCloud newsletter", email: false, devices: false },
];

export const privacyDefaults: PrivacySetting[] = [
  {
    key: "receive-messages-from-anyone",
    label: "Receive messages from anyone",
    description:
      "For your safety, we recommend only allowing messages from people you follow. Turning this on will allow anyone to send you messages.",
    enabled: true,
  },
  {
    key: "show-my-activities-in-social-discovery-playlists-and-modules",
    label: "Show my activities in social discovery playlists and modules",
    description:
      "Your Likes, Reactions and other engagement may be shown to other users in discovery features such as 'Liked By' playlists or update feeds. Turning this off won't hide your Likes on your profile or tracks.",
    enabled: true,
  },
  {
    key: "show-when-im-a-first-or-top-fan",
    label: "Show when I'm a First or Top Fan",
    description: "Appear in public Top Fans and First Fans lists",
    enabled: true,
  },
  {
    key: "show-first-and-top-fans-for-my-tracks",
    label: "Show First and Top Fans for my tracks",
    description: "Your First and Top Fans will appear on your tracks",
    enabled: true,
  },
];

export function toKebabCase(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function useSettings() {
  const [isEmailFormOpen, setIsEmailFormOpen] = useState(false);
  const [activityNotifications, setActivityNotifications] = useState(activityNotificationDefaults);
  const [soundCloudUpdates, setSoundCloudUpdates] = useState(soundCloudUpdateDefaults);
  const [privacySettings, setPrivacySettings] = useState(privacyDefaults);

  const toggleActivityNotification = (
    label: string,
    field: "email" | "devices",
    checked: boolean,
  ) => {
    setActivityNotifications((settings) =>
      settings.map((setting) =>
        setting.label === label ? { ...setting, [field]: checked } : setting,
      ),
    );
  };

  const toggleSoundCloudUpdate = (
    label: string,
    field: "email" | "devices",
    checked: boolean,
  ) => {
    setSoundCloudUpdates((settings) =>
      settings.map((setting) =>
        setting.label === label ? { ...setting, [field]: checked } : setting,
      ),
    );
  };

  const togglePrivacySetting = (key: string, checked: boolean) => {
    setPrivacySettings((settings) =>
      settings.map((setting) =>
        setting.key === key ? { ...setting, enabled: checked } : setting,
      ),
    );
  };

  return {
    isEmailFormOpen,
    setIsEmailFormOpen,
    activityNotifications,
    soundCloudUpdates,
    privacySettings,
    toggleActivityNotification,
    toggleSoundCloudUpdate,
    togglePrivacySetting,
  };
}
