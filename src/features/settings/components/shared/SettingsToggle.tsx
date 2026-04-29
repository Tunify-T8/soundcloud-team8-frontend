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
      className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
        checked ? "bg-[#f50]" : "bg-zinc-600"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
          checked ? "translate-x-[22px]" : "translate-x-1"
        }`}
      />
    </button>
  );
}
