interface SettingsToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  "data-testid"?: string;
}

export default function SettingsToggle({
  checked,
  onChange,
  "data-testid": dataTestId,
}: SettingsToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      data-testid={dataTestId}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
        checked ? "bg-[#f50]" : "bg-zinc-600"
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
