import SettingsSection from "../components/shared/SettingsSection";

export default function AdvertisingTab() {
  return (
    <div data-testid="settings-advertising-tab">
      <SettingsSection title="Advertising Settings" data-testid="settings-section-advertising-settings">
        <p className="text-zinc-400">Advertising controls are coming soon.</p>
      </SettingsSection>
    </div>
  );
}
