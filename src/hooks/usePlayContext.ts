import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPlayContext, selectPlayContext } from "@/store/playContextSlice";
import type { contextType, repeatMode } from "@/features/player-core/types";

interface UsePlayContextOptions {
  contextType: contextType;
  // contextId may be undefined while user/profile data is loading —
  // in that case we should avoid registering an empty playback context.
  contextId?: string;
  shuffle?: boolean;
  repeat?: repeatMode;
}

/**
 * usePlayContext — call this at the top of any page that hosts playable tracks.
 *
 * It registers the current page as the active playback context so that when
 * the user hits play on any track, the queue is built from the right source.
 *
 * @example
 * // In your Feed page:
 * usePlayContext({ contextType: "feed", contextId: "me" });
 *
 * // In a Playlist page:
 * usePlayContext({ contextType: "playlist", contextId: playlist.id });
 *
 * // In a Profile page:
 * usePlayContext({ contextType: "profile", contextId: user.id });
 *
 * // In the History page:
 * usePlayContext({ contextType: "history", contextId: "me" });
 */
export function usePlayContext({
  contextType,
  contextId,
  shuffle = false,
  repeat = "none",
}: UsePlayContextOptions) {
  const dispatch = useDispatch();
  const activeContext = useSelector(selectPlayContext);

  // Register this page's context when the page mounts or context IDs change.
  // If `contextId` is not yet available (e.g. user/profile still loading),
  // skip registering until a real id is provided.
  useEffect(() => {
    if (!contextId) return;
    dispatch(setPlayContext({ contextType, contextId, shuffle, repeat }));
  }, [contextType, contextId, shuffle, repeat, dispatch]);

  // Expose a manual setter for cases like toggling shuffle on the page itself.
  const updateContext = useCallback(
    (overrides: Partial<UsePlayContextOptions>) => {
      dispatch(
        setPlayContext({
          contextType,
          contextId,
          shuffle,
          repeat,
          ...overrides,
        })
      );
    },
    [dispatch, contextType, contextId, shuffle, repeat]
  );

  return { activeContext, updateContext };
}