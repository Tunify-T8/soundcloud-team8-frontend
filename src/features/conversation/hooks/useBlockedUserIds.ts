import { useState, useEffect } from "react";
import { followingService } from "@/features/following/followingService";

export function useBlockedUserIds(): Set<string> {
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    followingService
      .getBlockedUsers(1, 100)
      .then(({ blockedUsers }) => {
        setBlockedIds(new Set(blockedUsers.map((u) => u.id)));
      })
      .catch(() => {});
  }, []);

  return blockedIds;
}