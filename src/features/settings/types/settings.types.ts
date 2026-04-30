export type Theme = "light" | "dark";

export interface NotificationSetting {
  label: string;
  email: boolean;
  devices: boolean | "everyone";
}

export interface PrivacySetting {
  key: string;
  label: string;
  description?: string;
  enabled: boolean;
}
