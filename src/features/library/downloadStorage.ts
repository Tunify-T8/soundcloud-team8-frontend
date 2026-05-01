export const DOWNLOAD_LIBRARY_CHANGED_EVENT = "sc:download-library-changed";

const DB_NAME = "sc_downloads";
const STORE = "tracks";

export type DownloadedEntry = {
  meta: {
    id: string;
    title: string;
    artist: string;
    coverUrl: string;
  };
  audio: Blob;
  artwork?: Blob | null;
};

export type DownloadedTrackRecord = DownloadedEntry & {
  key: string;
  blobUrl: string;
  artworkBlobUrl?: string;
};

export type DownloadLibraryChangedDetail = {
  action: "saved" | "deleted" | "cleared";
  userId: string;
  trackId?: string;
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function waitForTransaction(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export function getDownloadKey(userId: string, trackId: string) {
  return `user_${userId}_song_${trackId}`;
}

export function notifyDownloadLibraryChanged(detail: DownloadLibraryChangedDetail) {
  window.dispatchEvent(
    new CustomEvent<DownloadLibraryChangedDetail>(DOWNLOAD_LIBRARY_CHANGED_EVENT, {
      detail,
    }),
  );
}

export async function saveDownload(
  userId: string,
  trackId: string,
  meta: DownloadedEntry["meta"],
  blob: Blob,
  artwork?: Blob | null,
) {
  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).put({ meta, audio: blob, artwork: artwork ?? null }, getDownloadKey(userId, trackId));
  await waitForTransaction(tx);
  notifyDownloadLibraryChanged({ action: "saved", userId, trackId });
}

export async function hasDownload(userId: string, trackId: string): Promise<boolean> {
  const db = await openDB();
  const tx = db.transaction(STORE, "readonly");
  const store = tx.objectStore(STORE);

  return new Promise((resolve, reject) => {
    const request = store.get(getDownloadKey(userId, trackId));
    request.onsuccess = () => resolve(Boolean(request.result));
    request.onerror = () => reject(request.error);
  });
}

export async function getDownloadedTracks(userId: string): Promise<DownloadedTrackRecord[]> {
  const db = await openDB();
  const tx = db.transaction(STORE, "readonly");
  const store = tx.objectStore(STORE);

  const allKeys: string[] = await new Promise((resolve, reject) => {
    const request = store.getAllKeys();
    request.onsuccess = () => resolve(request.result as string[]);
    request.onerror = () => reject(request.error);
  });

  const userKeys = allKeys.filter((key) => key.startsWith(`user_${userId}_`));
  const results: DownloadedTrackRecord[] = [];

  for (const key of userKeys) {
    const value: DownloadedEntry = await new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (value?.meta && value?.audio) {
      results.push({
        ...value,
        key,
        blobUrl: URL.createObjectURL(value.audio),
        artworkBlobUrl: value.artwork ? URL.createObjectURL(value.artwork) : undefined,
      });
    }
  }

  return results;
}

export async function deleteDownload(userId: string, trackId: string) {
  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).delete(getDownloadKey(userId, trackId));
  await waitForTransaction(tx);
  notifyDownloadLibraryChanged({ action: "deleted", userId, trackId });
}

export async function deleteAllDownloads(userId: string) {
  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);

  const allKeys: string[] = await new Promise((resolve, reject) => {
    const request = store.getAllKeys();
    request.onsuccess = () => resolve(request.result as string[]);
    request.onerror = () => reject(request.error);
  });

  allKeys
    .filter((key) => key.startsWith(`user_${userId}_`))
    .forEach((key) => {
      store.delete(key);
    });

  await waitForTransaction(tx);
  notifyDownloadLibraryChanged({ action: "cleared", userId });
}

export function revokeDownloadedTrackUrls(tracks: DownloadedTrackRecord[]) {
  tracks.forEach((track) => {
    URL.revokeObjectURL(track.blobUrl);
    if (track.artworkBlobUrl) {
      URL.revokeObjectURL(track.artworkBlobUrl);
    }
  });
}
