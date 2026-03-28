import { useEffect } from "react";
import { usePlayer } from "../context/usePlayer";
import thumbnail from "@/assets/neverendingstory.png";

export function TestPlayer() {
  const { setCurrentTrack, setIsPlaying } = usePlayer();

  useEffect(() => {
    setCurrentTrack({
      id: "1",
      title: "Never Ending Story",
      artist: "Stranger Things",
      thumbnailUrl: thumbnail,
      duration: 175,
    });
    setIsPlaying(true);
  }, []);

  return null;
}