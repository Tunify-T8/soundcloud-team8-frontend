type TabProps = {
  label: string;
  isActive?: boolean;
};

export default function UserInfoBarTab({ label, isActive = false }: TabProps) {
  return (
    <div className={`pb-2 ${isActive ? "border-b-2 border-white" : ""}`}>
      <button
        className={`text-[11px] font-bold cursor-pointer hover:text-white sm:text-[14px] ${
          isActive ? "text-white" : "text-gray-400"
        }`}
      >
        {label}
      </button>
    </div>
  );
}
