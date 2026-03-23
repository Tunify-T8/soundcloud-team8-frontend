import { useContext } from "react";
import { ProfileContext } from "./ProfileContextDef";

export const useMe = () => useContext(ProfileContext);
