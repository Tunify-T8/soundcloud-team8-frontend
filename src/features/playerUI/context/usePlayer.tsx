import { useContext } from "react";
import { PlayerContext } from "./PlayerContext";
import type { PlayerContextValue } from "./PlayerTypes";

export const usePlayer = (): PlayerContextValue => useContext(PlayerContext);