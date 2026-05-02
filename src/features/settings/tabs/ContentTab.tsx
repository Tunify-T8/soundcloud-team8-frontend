import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { type ReactNode, type RefObject, useEffect, useRef, useState } from "react";
import SettingsSection from "../components/shared/SettingsSection";

type OpenDropdown = "emailDisplay" | "category" | "language" | null;

interface DropdownOption {
  label: string;
  value: string;
  testId: string;
}

const primaryEmail = "asmahanbettar@gmail.com";

const emailDisplayOptions: DropdownOption[] = [
  { label: "Don't display email address", value: "none", testId: "content-email-display-option-none" },
  { label: primaryEmail, value: primaryEmail, testId: "content-email-display-option-email" },
];

const categoryOptions: DropdownOption[] = [
  { label: "Arts", value: "Arts", testId: "content-category-option-arts" },
  { label: "Business", value: "Business", testId: "content-category-option-business" },
  { label: "Comedy", value: "Comedy", testId: "content-category-option-comedy" },
  { label: "Education", value: "Education", testId: "content-category-option-education" },
  { label: "Fiction", value: "Fiction", testId: "content-category-option-fiction" },
  { label: "Government", value: "Government", testId: "content-category-option-government" },
  { label: "Health & Fitness", value: "Health & Fitness", testId: "content-category-option-health-fitness" },
  { label: "History", value: "History", testId: "content-category-option-history" },
  { label: "Kids & Family", value: "Kids & Family", testId: "content-category-option-kids-family" },
  { label: "Leisure", value: "Leisure", testId: "content-category-option-leisure" },
  { label: "Music", value: "Music", testId: "content-category-option-music" },
  { label: "News", value: "News", testId: "content-category-option-news" },
  { label: "Religion & Spirituality", value: "Religion & Spirituality", testId: "content-category-option-religion-spirituality" },
  { label: "Science", value: "Science", testId: "content-category-option-science" },
  { label: "Society & Culture", value: "Society & Culture", testId: "content-category-option-society-culture" },
];

const languages = [
  "English",
  "Finnish",
  "French",
  "Gaelic",
  "Galician",
  "German",
  "Greek",
  "Hawaiian",
  "Hebrew",
  "Hindi",
  "Hungarian",
  "Icelandic",
  "Indonesian",
  "Irish",
  "Italian",
  "Japanese",
  "Korean",
  "Lithuanian",
  "Macedonian",
  "Maori",
  "Mongolian",
  "Norwegian",
  "Polish",
  "Portuguese",
  "Punjabi",
  "Romanian",
  "Russian",
  "Serbian",
  "Slovak",
  "Slovenian",
  "Spanish",
  "Swedish",
  "Thai",
  "Turkish",
  "Ukrainian",
];

const languageOptions: DropdownOption[] = languages.map((language) => ({
  label: language,
  value: language,
  testId: `content-language-option-${language.toLowerCase().replace(/&/g, "").replace(/\s+/g, "-")}`,
}));

function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="mb-2 block font-black text-white">{children}</label>;
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
      className="h-10 w-full rounded-sm bg-[var(--sc-surface)] px-4 text-[13px] font-semibold text-white placeholder:text-zinc-400"
    />
  );
}

function ContentDropdown({
  id,
  testId,
  value,
  options,
  openDropdown,
  setOpenDropdown,
  onChange,
  dropdownRef,
  maxHeightClass = "max-h-[475px]",
  highlightSelected = false,
}: {
  id: Exclude<OpenDropdown, null>;
  testId: string;
  value: string;
  options: DropdownOption[];
  openDropdown: OpenDropdown;
  setOpenDropdown: (id: OpenDropdown) => void;
  onChange: (value: string) => void;
  dropdownRef: RefObject<HTMLDivElement | null>;
  maxHeightClass?: string;
  highlightSelected?: boolean;
}) {
  const open = openDropdown === id;
  const selected = options.find((option) => option.value === value);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        data-testid={testId}
        onClick={() => setOpenDropdown(open ? null : id)}
        className={`flex h-10 w-full items-center justify-between rounded-sm border px-4 text-left text-[13px] font-semibold transition-colors ${
          open
            ? "border-[#a7a7a7] bg-[var(--sc-surface)] text-[var(--sc-text)]"
            : "border-transparent bg-[var(--sc-surface)] text-[var(--sc-text)] hover:bg-[var(--sc-surface-hover)]"
        }`}
      >
        <span className="min-h-[1em] truncate">{selected?.label ?? ""}</span>
        {open ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
      </button>
      {open && (
        <div className={`absolute left-0 right-0 top-full z-30 mt-0 overflow-y-auto rounded-b-sm border border-[var(--sc-border)] bg-white shadow-xl ${maxHeightClass}`}>
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                data-testid={option.testId}
                onClick={() => {
                  onChange(option.value);
                  setOpenDropdown(null);
                }}
                className={`block w-full px-4 py-2.5 text-left text-[13px] text-[#333] hover:bg-[#f2f2f2] ${
                  highlightSelected && isSelected ? "font-black" : "font-semibold"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CheckRow({ label, testId }: { label: string; testId: string }) {
  const [checked, setChecked] = useState(false);

  return (
    <label className="flex w-fit cursor-pointer items-center gap-4 font-black text-white">
      <input
        type="checkbox"
        data-testid={testId}
        checked={checked}
        onChange={(event) => setChecked(event.target.checked)}
        className="sr-only"
      />
      <span className={`content-checkbox-box ${checked ? "content-checkbox-box-checked" : ""}`} aria-hidden="true">
        {checked && <Check size={13} strokeWidth={3} />}
      </span>
      {label}
    </label>
  );
}

export default function ContentTab() {
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);
  const [emailDisplay, setEmailDisplay] = useState("none");
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState("English");
  const emailDisplayRef = useRef<HTMLDivElement | null>(null);
  const categoryRef = useRef<HTMLDivElement | null>(null);
  const languageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const dropdownRefs = [emailDisplayRef, categoryRef, languageRef];
      const clickedInsideDropdown = dropdownRefs.some((ref) => ref.current?.contains(target));

      if (!clickedInsideDropdown) setOpenDropdown(null);
    };

    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, []);

  return (
    <div data-testid="content-tab">
      <SettingsSection title="RSS feed" infoIcon data-testid="settings-section-rss-feed">
        <div className="grid max-w-[860px] grid-cols-1 gap-x-6 gap-y-7 md:grid-cols-3">
          <div className="md:col-span-2">
            <FieldLabel>RSS feed</FieldLabel>
            <TextInput
              testId="content-rss-feed-url"
              value="https://feeds.soundcloud.com/users/soundcloud:users:845679997/sounds.rss"
              readOnly
            />
          </div>
          <div>
            <FieldLabel>Email address displayed</FieldLabel>
            <ContentDropdown
              id="emailDisplay"
              testId="content-email-display-dropdown"
              value={emailDisplay}
              options={emailDisplayOptions}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              onChange={setEmailDisplay}
              dropdownRef={emailDisplayRef}
              maxHeightClass="max-h-none"
            />
          </div>
          <div>
            <FieldLabel>Custom feed title</FieldLabel>
            <TextInput testId="content-custom-feed-title" />
          </div>
          <div>
            <FieldLabel>
              Category <span className="text-pink-500">*</span>
            </FieldLabel>
            <ContentDropdown
              id="category"
              testId="content-category-dropdown"
              value={category}
              options={categoryOptions}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              onChange={setCategory}
              dropdownRef={categoryRef}
              maxHeightClass="max-h-[405px]"
            />
          </div>
          <div>
            <FieldLabel>Stats-service URL prefix</FieldLabel>
            <TextInput testId="content-stats-url-prefix" placeholder="http://" />
          </div>
          <div>
            <FieldLabel>Custom author name</FieldLabel>
            <TextInput testId="content-custom-author-name" />
          </div>
          <div>
            <FieldLabel>
              Language <span className="text-pink-500">*</span>
            </FieldLabel>
            <ContentDropdown
              id="language"
              testId="content-language-dropdown"
              value={language}
              options={languageOptions}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              onChange={setLanguage}
              dropdownRef={languageRef}
              maxHeightClass="max-h-[445px]"
              highlightSelected
            />
          </div>
          <div>
            <FieldLabel>Subscriber redirect</FieldLabel>
            <TextInput testId="content-subscriber-redirect" placeholder="http://" />
          </div>
        </div>
        <div className="mt-7">
          <CheckRow label="Contains explicit content" testId="content-explicit-checkbox" />
        </div>
      </SettingsSection>

      <SettingsSection title="Upload Defaults" infoIcon data-testid="settings-section-upload-defaults">
        <div className="space-y-5">
          <CheckRow label="Include in RSS feed" testId="content-rss-feed-checkbox" />
          <CheckRow label="Creative Commons license" testId="content-creative-commons-checkbox" />
        </div>
      </SettingsSection>

      <div className="flex justify-end gap-8" data-testid="content-actions">
        <button type="button" data-testid="content-cancel-button" className="font-black text-white">
          Cancel
        </button>
        <button type="button" data-testid="content-save-button" className="rounded-sm bg-zinc-400 px-5 py-3 text-[13px] font-black text-black">
          Save changes
        </button>
      </div>
    </div>
  );
}
