
export type recorder={
    setMicOpen:React.Dispatch<React.SetStateAction<boolean>> ,
    micOpen:boolean,
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