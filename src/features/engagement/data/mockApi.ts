import { api } from '../../../services/api';
import type { Like, Repost, EngagementCounts } from '../types';
import type { Track } from '../../../shared/types/Track';
import { getMockTrack } from './mockTracks';
import { mockLikes, mockReposts, makeAvatar } from './mockEngagement';


const LIKES_KEY = 'soundcloud_likes';
const REPOSTS_KEY = 'soundcloud_reposts';


const getStoredLikes = (): Like[] => {
  const stored = localStorage.getItem(LIKES_KEY);
  if (!stored) return mockLikes;

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : mockLikes;
  } catch {
    return mockLikes;
  }
};

const getStoredReposts = (): Repost[] => {
  const stored = localStorage.getItem(REPOSTS_KEY);
  if (!stored) return mockReposts;

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : mockReposts;
  } catch {
    return mockReposts;
  }
};


const saveLikes = (likes: Like[]) => {
  localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
};

const saveReposts = (reposts: Repost[]) => {
  localStorage.setItem(REPOSTS_KEY, JSON.stringify(reposts));
};


export const mockApi = {
  getTrackDetails: (trackId: string): Promise<Track> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const track = getMockTrack(trackId);
        if (track) {
          resolve(track);
        } else {
          reject(new Error('Track not found'));
        }
      }, 500);
    });
  },

  getTrackLikes: (trackId: string): Promise<Like[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        
        const likes = getStoredLikes().filter(like => like.trackId === trackId);
        console.debug('[mockApi] getTrackLikes', trackId, likes.length);
        resolve(likes);
      }, 300);
    });
  },

  getTrackReposts: (trackId: string): Promise<Repost[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        
        const reposts = getStoredReposts().filter(repost => repost.trackId === trackId);
        console.debug('[mockApi] getTrackReposts', trackId, reposts.length);
        resolve(reposts);
      }, 300);
    });
  },

  getEngagementCounts: (trackId: string): Promise<EngagementCounts> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const likes = getStoredLikes().filter(like => like.trackId === trackId).length;
        const reposts = getStoredReposts().filter(repost => repost.trackId === trackId).length;
        resolve({
          likes,
          reposts,
          plays: 1500, // Mock
          comments: 23, // Mock
        });
      }, 200);
    });
  },

  likeTrack: (userId: string, trackId: string): Promise<Like> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const likes = getStoredLikes();
        const newLike: Like = {
          id: `like_${Date.now()}`,
          userId,
          trackId,
          createdAt: new Date().toISOString(),
          user: {
            id: userId,
            username: `user${userId}`,
            avatarUrl: makeAvatar(userId.slice(-2).toUpperCase()),
          },
        };
        likes.push(newLike);
        saveLikes(likes);
        console.debug('[mockApi] likeTrack', newLike);
        resolve(newLike);
      }, 300);
    });
  },

  unlikeTrack: (likeId: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const likes = getStoredLikes();
        const filtered = likes.filter(like => like.id !== likeId);
        saveLikes(filtered);
        console.debug('[mockApi] unlikeTrack', likeId);
        resolve();
      }, 300);
    });
  },

  repostTrack: (userId: string, trackId: string): Promise<Repost> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const reposts = getStoredReposts();
        const newRepost: Repost = {
          id: `repost_${Date.now()}`,
          userId,
          trackId,
          createdAt: new Date().toISOString(),
          user: {
            id: userId,
            username: `user${userId}`,
            avatarUrl: makeAvatar(userId.slice(-2).toUpperCase()),
          },
        };
        reposts.push(newRepost);
        saveReposts(reposts);
        console.debug('[mockApi] repostTrack', newRepost);
        resolve(newRepost);
      }, 300);
    });
  },

  unrepostTrack: (repostId: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const reposts = getStoredReposts();
        const filtered = reposts.filter(repost => repost.id !== repostId);
        saveReposts(filtered);
        resolve();
      }, 300);
    });
  },
};


export const setupMockApi = () => {
  const makeAxiosResponse = <T>(data: T, config: any) =>
    Promise.resolve({
      data,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      request: {},
    });

  api.interceptors.request.use((config) => {
    
    const base = config.baseURL && config.baseURL !== '' ? config.baseURL : window.location.origin;
    const url = new URL(config.url ?? '', base);
    const rawPath = url.pathname;

    
    const path = rawPath.replace(/^\/api(\/|$)/, '/');

    
    if (path.startsWith('/track')) {
      console.debug('[mockApi] intercepted', config.method, path);
    }

    
    if (path.startsWith('/tracks/')) {
      const parts = path.split('/');
      const trackId = parts[2];
      const endpoint = parts[3];

      switch (config.method) {
        case 'get':
          if (!endpoint) {
            config.adapter = () => mockApi.getTrackDetails(trackId).then(data => makeAxiosResponse(data, config));
          } else if (endpoint === 'likes') {
            config.adapter = () => mockApi.getTrackLikes(trackId).then(data => makeAxiosResponse(data, config));
          } else if (endpoint === 'reposts') {
            config.adapter = () => mockApi.getTrackReposts(trackId).then(data => makeAxiosResponse(data, config));
          } else if (endpoint === 'engagement') {
            config.adapter = () => mockApi.getEngagementCounts(trackId).then(data => makeAxiosResponse(data, config));
          }
          break;
        case 'post':
          if (endpoint === 'likes') {
            const { userId } = config.data;
            config.adapter = () => mockApi.likeTrack(userId, trackId).then(data => makeAxiosResponse(data, config));
          } else if (endpoint === 'reposts') {
            const { userId } = config.data;
            config.adapter = () => mockApi.repostTrack(userId, trackId).then(data => makeAxiosResponse(data, config));
          }
          break;
        case 'delete':
          if (endpoint === 'likes') {
            const likeId = parts[4];
            config.adapter = () => mockApi.unlikeTrack(likeId).then(() => makeAxiosResponse(null, config));
          } else if (endpoint === 'reposts') {
            const repostId = parts[4];
            config.adapter = () => mockApi.unrepostTrack(repostId).then(() => makeAxiosResponse(null, config));
          }
          break;
      }
    } else if (path === '/tracklikes') {
      if (config.method === 'get') {
        config.adapter = () => makeAxiosResponse(getStoredLikes(), config);
      } else if (config.method === 'post') {
        config.adapter = () => mockApi.likeTrack(config.data.userId, config.data.trackId).then(data => makeAxiosResponse(data, config));
      }
    } else if (path.startsWith('/tracklikes/')) {
      const likeId = path.split('/')[2];
      if (config.method === 'delete') {
        config.adapter = () => mockApi.unlikeTrack(likeId).then(() => makeAxiosResponse(null, config));
      }
    } else if (path === '/trackreposts') {
      if (config.method === 'get') {
        config.adapter = () => makeAxiosResponse(getStoredReposts(), config);
      } else if (config.method === 'post') {
        config.adapter = () => mockApi.repostTrack(config.data.userId, config.data.trackId).then(data => makeAxiosResponse(data, config));
      }
    } else if (path.startsWith('/trackreposts/')) {
      const repostId = path.split('/')[2];
      if (config.method === 'delete') {
        config.adapter = () => mockApi.unrepostTrack(repostId).then(() => makeAxiosResponse(null, config));
      }
    }

    return config;
  });
};