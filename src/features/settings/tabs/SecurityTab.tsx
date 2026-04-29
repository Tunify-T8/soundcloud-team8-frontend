import SettingsSection from "../components/shared/SettingsSection";

export default function SecurityTab() {
  return (
    <div data-testid="settings-security-tab">
      <SettingsSection title="Security Settings" data-testid="settings-section-security-settings">
        <p className="text-zinc-400">Security controls are coming soon.</p>
      </SettingsSection>
    </div>
  );
}
