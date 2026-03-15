
export type RecorderProps = {
  setMicOpen: (open: boolean) => void
  micOpen: boolean
}

export type ToggleProps  = {
  enabled: boolean;
  onChange: (val: boolean) => void;
}

export type TogglesState =  {
  downloads: boolean;
  offline: boolean;
  rss: boolean;
  embed: boolean;
  appPlayback: boolean;
  comments: boolean;
  showComments: boolean;
  insights: boolean;
}
export type PermissionState = "idle" | "granted" | "denied" | "requesting"
