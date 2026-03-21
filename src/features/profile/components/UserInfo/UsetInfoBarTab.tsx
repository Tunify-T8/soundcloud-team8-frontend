type TabProps = {
  label: string;
  isActive?: boolean;
};

export default function UserInfoBarTab({ label, isActive = false }: TabProps) {
  return (
    <div className={`pb-2 ${isActive ? "border-b-2 border-white" : ""}`}>
      <button
        className={`font-bold text-[14px] mx-1 cursor-pointer hover:text-white ${
          isActive ? "text-white" : "text-gray-400"
        }`}
      >
        {label}
      </button>
    </div>
  );
}
