import FollowingSection from "../components/FollowingSection";
import { FOLLOWING } from "../tests/mockdata";

export default function FollowingTab() {
  return (
    <div>
      {FOLLOWING.length === 0 ? (
        <p className="text-white font-bold text-lg text-center py-20">
          You haven't followed anyone yet
        </p>
      ) : (
        <FollowingSection users={FOLLOWING} />
      )}
    </div>
  );
}