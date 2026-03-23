import { useContext } from "react";
import { ProfileContext } from "./ProfileContext";

export const useMe = () => useContext(ProfileContext);