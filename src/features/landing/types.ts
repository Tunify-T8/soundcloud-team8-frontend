export interface TrendingItem {
  id: string;
  name: string;
  artist: string;
  coverUrl: string;
}

export interface AutocompleteTrack {
  id: string;
  title: string;
  artist: string;
}

export interface AutocompleteUser {
  id: string;
  username: string;
  displayName: string | null;
}

export interface AutocompleteCollection {
  id: string;
  title: string;
  artist: string;
}

export interface AutocompleteResults {
  tracks: AutocompleteTrack[];
  users: AutocompleteUser[];
  collections: AutocompleteCollection[];
}