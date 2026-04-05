import { SiSoundcloud } from "react-icons/si";

export default function EmptyList({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
      <SiSoundcloud size={48} className="mb-4 opacity-30" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
