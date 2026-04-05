import FollowingSection from "../components/FollowingSection";
import { FOLLOWING } from "../tests/mockdata";

export default function FollowingTab() {
  return (
    <div>
      <h2 className="text-white font-bold text-base mb-6">People you follow:</h2>
      <FollowingSection users={FOLLOWING} />
    </div>
  );
}
