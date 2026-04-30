import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import SettingsSection from "../components/shared/SettingsSection";

function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="mb-2 block font-black text-[var(--sc-text)]">{children}</label>;
}

function TextInput({
  testId,
  value,
  placeholder,
  readOnly = false,
}: {
  testId: string;
  value?: string;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <input
      data-testid={testId}
      value={value}
      placeholder={placeholder}
      readOnly={readOnly}
      onChange={() => undefined}
      className="h-10 w-full rounded-sm bg-[var(--sc-surface)] px-4 text-[13px] font-semibold text-[var(--sc-text)] placeholder:text-[var(--sc-text-secondary)]"
    />
  );
}

function SelectInput({ testId, value }: { testId: string; value: string }) {
  return (
    <button
      type="button"
      data-testid={testId}
      className="flex h-10 w-full items-center justify-between rounded-sm bg-[var(--sc-surface)] px-4 text-left text-[13px] font-semibold text-[var(--sc-text)]"
    >
      {value}
      <ChevronDown size={22} className="text-zinc-200" aria-hidden="true" />
    </button>
  );
}

function CheckRow({ label, testId }: { label: string; testId: string }) {
  return (
    <label className="flex w-fit cursor-pointer items-center gap-4 font-black text-[var(--sc-text)]">
      <input type="checkbox" data-testid={testId} className="h-5 w-5 rounded-sm accent-white" />
      {label}
    </label>
  );
}

export default function ContentTab() {
  return (
    <div data-testid="settings-content-tab">
      <SettingsSection title="RSS feed" infoIcon data-testid="settings-section-rss-feed">
        <div className="grid max-w-[860px] grid-cols-1 gap-x-6 gap-y-7 md:grid-cols-3">
          <div className="md:col-span-2">
            <FieldLabel>RSS feed</FieldLabel>
            <TextInput
              testId="rss-feed-url-input"
              value="https://feeds.soundcloud.com/users/soundcloud:users:845679997/sounds.rss"
              readOnly
            />
          </div>
          <div>
            <FieldLabel>Email address displayed</FieldLabel>
            <SelectInput testId="email-address-displayed-select" value="Don't display email address" />
          </div>
          <div>
            <FieldLabel>Custom feed title</FieldLabel>
            <TextInput testId="custom-feed-title-input" />
          </div>
          <div>
            <FieldLabel>
              Category <span className="text-pink-500">*</span>
            </FieldLabel>
            <SelectInput testId="category-select" value="" />
          </div>
          <div>
            <FieldLabel>Stats-service URL prefix</FieldLabel>
            <TextInput testId="stats-service-url-prefix-input" placeholder="http://" />
          </div>
          <div>
            <FieldLabel>Custom author name</FieldLabel>
            <TextInput testId="custom-author-name-input" />
          </div>
          <div>
            <FieldLabel>
              Language <span className="text-pink-500">*</span>
            </FieldLabel>
            <SelectInput testId="language-select" value="English" />
          </div>
          <div>
            <FieldLabel>Subscriber redirect</FieldLabel>
            <TextInput testId="subscriber-redirect-input" placeholder="http://" />
          </div>
        </div>
        <div className="mt-7">
          <CheckRow label="Contains explicit content" testId="contains-explicit-content-checkbox" />
        </div>
      </SettingsSection>

      <SettingsSection title="Upload Defaults" infoIcon data-testid="settings-section-upload-defaults">
        <div className="space-y-5">
          <CheckRow label="Include in RSS feed" testId="include-in-rss-feed-checkbox" />
          <CheckRow label="Creative Commons license" testId="creative-commons-license-checkbox" />
        </div>
      </SettingsSection>

      <div className="flex justify-end gap-8" data-testid="content-actions">
        <button type="button" data-testid="content-cancel-button" className="font-black text-[var(--sc-text)]">
          Cancel
        </button>
        <button type="button" data-testid="content-save-button" className="rounded-sm bg-zinc-400 px-5 py-3 text-[13px] font-black text-black">
          Save changes
        </button>
      </div>
    </div>
  );
}
