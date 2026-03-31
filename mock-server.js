// mock-server.js — Custom mock API server for soundcloud-team8-frontend
// Run with: node mock-server.js
// Listens on http://localhost:3001

import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Seed Data ────────────────────────────────────────────────────────────────

const MOCK_USER = {
  id: 'mock-user-001',
  username: 'tunify_dev',
  email: 'test@tunify.com',
  displayName: 'TunifyTest',
  role: 'ARTIST',
  bio: 'Frontend developer and music enthusiast.',
  location: 'Cairo, Egypt',
  avatarUrl: 'https://i.pravatar.cc/150?img=1',
  coverUrl: 'https://picsum.photos/seed/cover1/1200/300',
  isCertified: true,
  isActive: true,
  visibility: 'PUBLIC',
  followersCount: 340,
  followingCount: 120,
  likesReceived: 512,
  tracksUploadedCount: 4,
  createdAt: '2024-01-10T08:00:00.000Z',
  updatedAt: '2026-03-20T12:00:00.000Z',
  lastLogin: '2026-03-25T10:00:00.000Z',
};

const USERS = {
  'mock-user-001': MOCK_USER,
  'user-uuid-1': {
    id: 'user-uuid-1', username: 'test_user', displayName: 'Test User',
    role: 'LISTENER', bio: 'Music lover.', location: 'Alexandria, Egypt',
    avatarUrl: 'https://i.pravatar.cc/150?img=2',
    coverUrl: 'https://picsum.photos/seed/cover2/1200/300',
    isCertified: false, followersCount: 80, followingCount: 200,
    tracksUploadedCount: 0, createdAt: '2024-03-01T09:00:00.000Z',
  },
  'user-uuid-2': {
    id: 'user-uuid-2', username: 'jordan_beats', displayName: 'Jordan Beats',
    role: 'ARTIST', bio: 'Producer. Beats for days.', location: 'New York, USA',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
    coverUrl: 'https://picsum.photos/seed/cover3/1200/300',
    isCertified: true, followersCount: 1200, followingCount: 300,
    tracksUploadedCount: 12, createdAt: '2023-11-15T10:00:00.000Z',
  },
  'user-uuid-3': {
    id: 'user-uuid-3', username: 'ava_mix', displayName: 'Ava Mix',
    role: 'ARTIST', bio: 'DJ and mixer. Cairo underground scene.', location: 'Cairo, Egypt',
    avatarUrl: 'https://i.pravatar.cc/150?img=4',
    coverUrl: 'https://picsum.photos/seed/cover4/1200/300',
    isCertified: false, followersCount: 430, followingCount: 90,
    tracksUploadedCount: 6, createdAt: '2024-05-20T11:00:00.000Z',
  },
  'user-uuid-4': {
    id: 'user-uuid-4', username: 'ahmed_beats', displayName: 'Ahmed Beats',
    role: 'ARTIST', bio: 'Hip-hop producer from Cairo.', location: 'Cairo, Egypt',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    coverUrl: 'https://picsum.photos/seed/cover5/1200/300',
    isCertified: false, followersCount: 210, followingCount: 180,
    tracksUploadedCount: 3, createdAt: '2024-07-01T12:00:00.000Z',
  },
};

let tracks = [
  {
    id: 'trk_001', title: 'Midnight Echoes', artist: 'tunify_dev',
    genre: 'ambient', tags: ['synthwave', 'night', 'ambient'],
    status: 'finished', visibility: 'public', privacy: 'public',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    description: 'A dreamy synthwave track inspired by late-night city lights.',
    waveformData: [12,18,22,30,27,25,33,40,38,29,21,18,14,20,26,31,28,22,17,24],
    duration: 214, date: '2026-03-10T00:00:00.000Z', createdAt: '2026-03-10T00:00:00.000Z',
    likes: 128, comments: 24, reposts: 8, downloads: 15, plays: 1240,
    isHD: true, isPrivate: false,
    thumbnailUrl: 'https://picsum.photos/seed/trk001/300/300', userId: 'mock-user-001',
  },
  {
    id: 'trk_002', title: 'Unreleased Horizon', artist: 'tunify_dev',
    genre: 'classical', tags: ['lofi', 'chill', 'study'],
    status: 'finished', visibility: 'private', privacy: 'private',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    description: 'A chill lo-fi beat currently in progress. Private preview.',
    waveformData: [8,10,14,18,16,15,20,22,19,17,13,9,11,14,17,20,18,15,12,10],
    duration: 176, date: '2026-03-13T00:00:00.000Z', createdAt: '2026-03-13T00:00:00.000Z',
    likes: 0, comments: 0, reposts: 0, downloads: 0, plays: 12,
    isHD: false, isPrivate: true,
    thumbnailUrl: 'https://picsum.photos/seed/trk002/300/300', userId: 'mock-user-001',
  },
  {
    id: 'trk_003', title: 'Midnight Stroll', artist: 'tunify_dev',
    genre: 'electronic', tags: ['ambient', 'synthwave', 'night-drive'],
    status: 'finished', visibility: 'public', privacy: 'public',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    description: 'Smooth synthwave vibes for late night drives through the city.',
    waveformData: [12,18,25,30,28,22,19,24,29,26,20,15,18,23,27,32,30,25,21,16],
    duration: 245, date: '2026-03-10T00:00:00.000Z', createdAt: '2026-03-10T00:00:00.000Z',
    likes: 342, comments: 28, reposts: 56, downloads: 89, plays: 15234,
    isHD: true, isPrivate: false,
    thumbnailUrl: 'https://picsum.photos/seed/trk003/300/300', userId: 'mock-user-001',
  },
  {
    id: 'trk_004', title: 'Velvet Dreams', artist: 'tunify_dev',
    genre: 'jazz_and_blues', tags: ['smooth-jazz', 'nightclub', 'saxophone'],
    status: 'finished', visibility: 'private', privacy: 'private',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    description: 'Late night jazz recording with a modern twist.',
    waveformData: [6,9,15,21,24,22,18,16,19,23,17,11,13,16,20,25,22,18,14,10],
    duration: 312, date: '2026-03-14T00:00:00.000Z', createdAt: '2026-03-14T00:00:00.000Z',
    likes: 0, comments: 0, reposts: 0, downloads: 0, plays: 5,
    isHD: true, isPrivate: true,
    thumbnailUrl: 'https://picsum.photos/seed/trk004/300/300', userId: 'mock-user-001',
  },
  {
    id: 'trk_005', title: 'Summer Vibes', artist: 'jordan_beats',
    genre: 'hip_hop_and_rap', tags: ['chill', 'summer', 'relax'],
    status: 'finished', visibility: 'public', privacy: 'public',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    description: 'A chill summer track to relax to.',
    waveformData: [20,25,30,35,32,28,22,26,31,27,21,18,23,28,33,36,30,24,19,22],
    duration: 180, date: '2026-02-20T00:00:00.000Z', createdAt: '2026-02-20T00:00:00.000Z',
    likes: 520, comments: 67, reposts: 88, downloads: 120, plays: 8900,
    isHD: true, isPrivate: false,
    thumbnailUrl: 'https://picsum.photos/seed/trk005/300/300', userId: 'user-uuid-2',
  },
  {
    id: 'trk_006', title: 'Night Drive', artist: 'ava_mix',
    genre: 'pop', tags: ['night', 'drive', 'mood'],
    status: 'finished', visibility: 'public', privacy: 'public',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    description: 'Perfect for late night drives.',
    waveformData: [15,20,28,33,30,24,19,22,27,25,20,16,21,26,30,34,29,23,18,21],
    duration: 240, date: '2026-03-01T00:00:00.000Z', createdAt: '2026-03-01T00:00:00.000Z',
    likes: 180, comments: 52, reposts: 67, downloads: 95, plays: 2200,
    isHD: false, isPrivate: false,
    thumbnailUrl: 'https://picsum.photos/seed/trk006/300/300', userId: 'user-uuid-3',
  },
];

let artists = [
  { id: 1, name: "كلاسيكيات", avatar: "https://randomuser.me/api/portraits/men/34.jpg", followers: "10.1K", tracks: 3 },
  { id: 2, name: "Chill Beats", avatar: "https://randomuser.me/api/portraits/men/12.jpg", followers: "8.4K", tracks: 5 },
  { id: 3, name: "Night Vibes", avatar: "https://randomuser.me/api/portraits/women/22.jpg", followers: "15.2K", tracks: 7 },
];

let feedItems = [
  {
    type: "track", source: "original", postedAt: "2026-02-28T13:45:00Z",
    track: {
      id: "trk_005", title: "Summer Vibes", artistId: "user-uuid-2",
      duration: 180, likesCount: 520, repostsCount: 88,
      createdAt: "2026-02-20T00:00:00.000Z",
      interaction: { isLiked: true, isReposted: false },
    },
  },
  {
    type: "track", source: "repost", postedAt: "2026-03-01T10:00:00Z",
    track: {
      id: "trk_006", title: "Night Drive", artistId: "user-uuid-3",
      duration: 240, likesCount: 180, repostsCount: 67,
      createdAt: "2026-03-01T00:00:00.000Z",
      interaction: { isLiked: false, isReposted: true },
    },
  },
];

let conversations = [
  {
    conversationId: 'conv-uuid-1',
    otherUser: { id: 'user-uuid-1', displayName: 'Test User', avatarUrl: 'https://i.pravatar.cc/150?img=2' },
    lastMessagePreview: 'Shared 2 tracks', lastMessageAt: '2026-03-14T18:00:00.000Z', unreadCount: 1,
  },
  {
    conversationId: 'conv-uuid-2',
    otherUser: { id: 'user-uuid-2', displayName: 'Jordan Beats', avatarUrl: 'https://i.pravatar.cc/150?img=3' },
    lastMessagePreview: 'Can you send the updated track?', lastMessageAt: '2026-03-14T17:30:00.000Z', unreadCount: 0,
  },
  {
    conversationId: 'conv-uuid-3',
    otherUser: { id: 'user-uuid-3', displayName: 'Ava Mix', avatarUrl: 'https://i.pravatar.cc/150?img=4' },
    lastMessagePreview: 'Nice drop on that chorus.', lastMessageAt: '2026-03-13T21:10:00.000Z', unreadCount: 3,
  },
];

let messages = {
  'conv-uuid-1': [
    { id: 'msg-1-1', conversationId: 'conv-uuid-1', senderId: 'user-uuid-1', sender: { id: 'user-uuid-1', displayName: 'Test User', avatarUrl: 'https://i.pravatar.cc/150?img=2' }, receiverId: 'mock-user-001', type: 'TEXT', text: 'Hey! Want feedback on your latest mix?', createdAt: '2026-03-14T16:05:00.000Z', status: 'READ' },
    { id: 'msg-1-2', conversationId: 'conv-uuid-1', senderId: 'mock-user-001', sender: { id: 'mock-user-001', displayName: 'You', avatarUrl: 'https://i.pravatar.cc/150?img=1' }, receiverId: 'user-uuid-1', type: 'TEXT', text: 'Yes please, send your notes.', createdAt: '2026-03-14T16:08:00.000Z', status: 'READ' },
    { id: 'msg-1-3', conversationId: 'conv-uuid-1', senderId: 'user-uuid-1', sender: { id: 'user-uuid-1', displayName: 'Test User', avatarUrl: 'https://i.pravatar.cc/150?img=2' }, receiverId: 'mock-user-001', type: 'TEXT', text: 'Shared 2 tracks', createdAt: '2026-03-14T18:00:00.000Z', status: 'DELIVERED' },
  ],
  'conv-uuid-2': [
    { id: 'msg-2-1', conversationId: 'conv-uuid-2', senderId: 'user-uuid-2', sender: { id: 'user-uuid-2', displayName: 'Jordan Beats', avatarUrl: 'https://i.pravatar.cc/150?img=3' }, receiverId: 'mock-user-001', type: 'TEXT', text: 'Hey! Want to collab on a track?', createdAt: '2026-03-14T17:00:00.000Z', status: 'READ' },
    { id: 'msg-2-2', conversationId: 'conv-uuid-2', senderId: 'mock-user-001', sender: { id: 'mock-user-001', displayName: 'You', avatarUrl: 'https://i.pravatar.cc/150?img=1' }, receiverId: 'user-uuid-2', type: 'TEXT', text: 'Sure! Which track?', createdAt: '2026-03-14T17:15:00.000Z', status: 'READ' },
    { id: 'msg-2-3', conversationId: 'conv-uuid-2', senderId: 'user-uuid-2', sender: { id: 'user-uuid-2', displayName: 'Jordan Beats', avatarUrl: 'https://i.pravatar.cc/150?img=3' }, receiverId: 'mock-user-001', type: 'TEXT', text: 'Can you send the updated track?', createdAt: '2026-03-14T17:30:00.000Z', status: 'READ' },
  ],
  'conv-uuid-3': [
    { id: 'msg-3-1', conversationId: 'conv-uuid-3', senderId: 'user-uuid-3', sender: { id: 'user-uuid-3', displayName: 'Ava Mix', avatarUrl: 'https://i.pravatar.cc/150?img=4' }, receiverId: 'mock-user-001', type: 'TEXT', text: 'Listened to Midnight Echoes — fire!', createdAt: '2026-03-13T20:00:00.000Z', status: 'READ' },
    { id: 'msg-3-2', conversationId: 'conv-uuid-3', senderId: 'mock-user-001', sender: { id: 'mock-user-001', displayName: 'You', avatarUrl: 'https://i.pravatar.cc/150?img=1' }, receiverId: 'user-uuid-3', type: 'TEXT', text: 'Thanks! Which part did you like?', createdAt: '2026-03-13T20:30:00.000Z', status: 'READ' },
    { id: 'msg-3-3', conversationId: 'conv-uuid-3', senderId: 'user-uuid-3', sender: { id: 'user-uuid-3', displayName: 'Ava Mix', avatarUrl: 'https://i.pravatar.cc/150?img=4' }, receiverId: 'mock-user-001', type: 'TEXT', text: 'Nice drop on that chorus.', createdAt: '2026-03-13T21:10:00.000Z', status: 'DELIVERED' },
  ],
};

let socialLinks = [
  { platform: 'INSTAGRAM', url: 'https://instagram.com/tunify_dev' },
  { platform: 'YOUTUBE',   url: 'https://youtube.com/@tunify_dev' },
  { platform: 'SPOTIFY',   url: 'https://open.spotify.com/artist/tunify_dev' },
];

let genres = { genres: ['ambient', 'electronic', 'jazz_and_blues', 'pop'] };
// ─── Albums / Collections Data ────────────────────────────────────────────────
let collections = [
  {
    id: 'col_001',
    type: 'album',
    title: 'Midnight Sessions',
    artist: 'tunify_dev',
    description: 'A collection of late night ambient tracks.',
    coverUrl: 'https://picsum.photos/seed/col001/300/300',
    createdAt: '2026-02-01T00:00:00.000Z',
    score: 1,
    tracks: [
      { id: 'col_001_t1', number: 1, title: 'Midnight Echoes', artist: 'tunify_dev', playsCount: 1240 },
      { id: 'col_001_t2', number: 2, title: 'Midnight Stroll', artist: 'tunify_dev', playsCount: 15234 },
      { id: 'col_001_t3', number: 3, title: 'Velvet Dreams',   artist: 'tunify_dev', playsCount: 5 },
      { id: 'col_001_t4', number: 4, title: 'Unreleased Horizon', artist: 'tunify_dev', playsCount: 12 },
      { id: 'col_001_t5', number: 5, title: 'Bonus Track',     artist: 'tunify_dev', playsCount: 300 },
    ],
  },
  {
    id: 'col_002',
    type: 'playlist',
    title: 'Summer Chill Mix',
    artist: 'jordan_beats',
    description: 'Best tracks for a summer afternoon.',
    coverUrl: 'https://picsum.photos/seed/col002/300/300',
    createdAt: '2026-01-15T00:00:00.000Z',
    score: 1,
    tracks: [
      { id: 'col_002_t1', number: 1, title: 'Summer Vibes', artist: 'jordan_beats', playsCount: 8900 },
      { id: 'col_002_t2', number: 2, title: 'Night Drive',  artist: 'ava_mix',      playsCount: 2200 },
      { id: 'col_002_t3', number: 3, title: 'Chill Wave',   artist: 'jordan_beats', playsCount: 430 },
    ],
  },
];
let following = [
  { id: 'user-uuid-2', username: 'jordan_beats', avatarUrl: 'https://i.pravatar.cc/150?img=3', isCertified: true },
  { id: 'user-uuid-3', username: 'ava_mix',       avatarUrl: 'https://i.pravatar.cc/150?img=4', isCertified: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const delay    = (ms = 200) => new Promise(r => setTimeout(r, ms));
const randomId = () => Math.random().toString(36).slice(2, 10);

// ─── Auth Routes ──────────────────────────────────────────────────────────────

app.post('/auth/check-email', async (req, res) => {
  await delay();
  const { email } = req.body;
  const knownEmails = ['test@tunify.com', 'test@soundcloud.com', 'sara@tunify.com', 'ahmed@tunify.com', 'nada@tunify.com'];
  const exists = knownEmails.includes((email || '').toLowerCase());
  res.json({ exists, message: exists ? 'Welcome back! Please sign in.' : 'Email available. Please continue with registration.' });
});

app.post('/auth/login', async (req, res) => {
  await delay();
  const { email, password } = req.body;
  if (email === 'test@tunify.com' && password === 'Password123') {
    return res.json({
      user: { id: 'mock-user-001', username: 'tunify_dev', email, avatarUrl: null, isCertified: true, role: 'user' },
      accessToken: 'mock.access.token.' + Date.now(),
      refreshToken: 'mock.refresh.token.' + Date.now(),
      expiresIn: 3600,
    });
  }
  res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials', statusCode: 401 } });
});

app.post('/auth/register', async (req, res) => {
  await delay();
  res.status(201).json({
    user: { id: 'mock-user-001', username: req.body.username || 'new_user', email: req.body.email, avatarUrl: null, isCertified: true, role: 'user' },
    accessToken: 'mock.access.token.' + Date.now(),
    refreshToken: 'mock.refresh.token.' + Date.now(),
    expiresIn: 3600,
  });
});

app.post('/auth/verify-email', async (req, res) => {
  await delay();
  res.json({
    user: { id: 'mock-user-001', username: 'tunify_dev', email: req.body.email, avatarUrl: null, isCertified: true, role: 'user' },
    accessToken: 'mock.access.token.' + Date.now(),
    refreshToken: 'mock.refresh.token.' + Date.now(),
    expiresIn: 3600,
  });
});

app.post('/auth/resend-verification', async (req, res) => {
  await delay();
  res.json({ message: 'Verification email resent.' });
});

app.post('/auth/forgot-password', async (req, res) => {
  await delay();
  res.json({ message: 'If an account exists with this email, you will receive a password reset link shortly.' });
});

app.post('/auth/reset-password', async (req, res) => {
  await delay();
  res.json({ message: 'Password reset successfully.' });
});

app.post('/auth/refresh-token', async (req, res) => {
  await delay(100);
  res.json({
    accessToken: 'mock.access.token.' + Date.now(),
    refreshToken: req.body.refreshToken,
    expiresIn: 3600,
  });
});

app.post('/auth/signout', async (req, res) => {
  await delay(100);
  res.json({ message: 'Signed out successfully.' });
});

app.post('/auth/social-login', async (req, res) => {
  await delay();
  res.json({
    user: { id: 'mock-user-001', username: 'tunify_dev', email: 'test@tunify.com', avatarUrl: null, isCertified: true, role: 'user' },
    accessToken: 'mock.access.token.' + Date.now(),
    refreshToken: 'mock.refresh.token.' + Date.now(),
    expiresIn: 3600,
  });
});

app.post('/auth/google', async (req, res) => {
  await delay();
  res.json({
    user: { id: 'mock-user-001', username: 'tunify_dev', email: 'test@tunify.com', avatarUrl: null, isCertified: true, role: 'user' },
    accessToken: 'mock.access.token.' + Date.now(),
    refreshToken: 'mock.refresh.token.' + Date.now(),
    expiresIn: 3600,
    requiresLinking: false,
  });
});

app.post('/auth/google/link', async (req, res) => {
  await delay();
  res.json({
    accessToken: 'mock.access.token.' + Date.now(),
    refreshToken: 'mock.refresh.token.' + Date.now(),
    expiresIn: 3600,
  });
});

// ─── User / Profile Routes ────────────────────────────────────────────────────

app.get('/users/me', async (req, res) => {
  await delay();
  res.json(MOCK_USER);
});

app.patch('/users/me/profile', async (req, res) => {
  await delay();
  Object.assign(MOCK_USER, req.body);
  res.json(MOCK_USER);
});

app.get('/users/me/social-links', async (req, res) => {
  await delay();
  res.json({ links: socialLinks });
});

app.patch('/users/me/social-links', async (req, res) => {
  await delay();
  const incoming = req.body?.links || [];
  incoming.forEach(newLink => {
    const idx = socialLinks.findIndex(l => l.platform === newLink.platform);
    if (idx >= 0) socialLinks[idx] = newLink;
    else socialLinks.push(newLink);
  });
  res.json({ links: socialLinks });
});

app.delete('/users/me/social-links/:platform', async (req, res) => {
  await delay();
  const platform = req.params.platform.toUpperCase();
  socialLinks = socialLinks.filter(l => l.platform !== platform);
  res.json({ message: 'Social link removed.' });
});

app.get('/users/me/genres', async (req, res) => {
  await delay();
  res.json(genres);
});

app.patch('/users/me/genres', async (req, res) => {
  await delay();
  genres = { ...genres, ...req.body };
  res.json(genres);
});

app.get('/users/me/tracks', async (req, res) => {
  await delay();
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;
  const myTracks = tracks.filter(t => t.userId === 'mock-user-001');
  res.json({
    page, limit, total: myTracks.length,
    tracks: myTracks.slice((page - 1) * limit, page * limit).map(t => ({
      id: t.id, title: t.title, description: t.description || null,
      coverUrl: t.thumbnailUrl || null, audioUrl: t.audioUrl,
      genre: t.genre, createdAt: t.createdAt,
    })),
  });
});

// GET /users/me/likes — liked tracks sidebar section
app.get('/users/me/likes', async (req, res) => {
  await delay();
  const limit = parseInt(req.query.limit) || 4;
  const likedTracks = tracks
    .filter(t => (t.likes || 0) > 0)
    .slice(0, limit)
    .map(t => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      coverUrl: t.thumbnailUrl || null,
      likesCount: t.likes || 0,
      repostsCount: t.reposts || 0,
      commentsCount: t.comments || 0,
      playsCount: t.plays || 0,
    }));
  res.json({ items: likedTracks, total: likedTracks.length });
});

app.get('/users/me/following', async (req, res) => {
  await delay();
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;
  res.json({ page, limit, hasMore: false, following: following.slice((page - 1) * limit, page * limit) });
});

app.get('/users/me/suggested', async (req, res) => {
  await delay();
  const suggested = Object.values(USERS)
    .filter(u => u.id !== 'mock-user-001')
    .map(u => ({
      id: u.id, username: u.username, avatarUrl: u.avatarUrl,
      coverUrl: u.coverUrl, role: u.role,
      mutualFollowersCount: Math.floor(Math.random() * 10),
      tracksUploadedCount: u.tracksUploadedCount || 0,
      followersCount: u.followersCount || 0,
      followingCount: u.followingCount || 0,
    }));
  res.json({ page: 1, limit: 20, total: suggested.length, users: suggested });
});

// Must come after all /users/me routes
app.get('/users/:userIdOrUsername', async (req, res) => {
  await delay();
  const param = req.params.userIdOrUsername;
  const user  = USERS[param] || Object.values(USERS).find(u => u.username === param);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    id: user.id, username: user.username, displayName: user.displayName,
    role: user.role, bio: user.bio || null, location: user.location || null,
    avatarUrl: user.avatarUrl || null, coverUrl: user.coverUrl || null,
    followersCount: user.followersCount || 0,
    followingCount: user.followingCount || 0,
    tracksUploadedCount: user.tracksUploadedCount || 0,
  });
});

app.get('/users/:userId/following', async (req, res) => {
  await delay();
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;
  res.json({ page, limit, hasMore: false, following: [] });
});

// ─── Track Routes ─────────────────────────────────────────────────────────────

// Must come before /tracks/:id
app.get('/tracks/me', async (req, res) => {
  await delay();
  res.json(tracks.filter(t => t.userId === 'mock-user-001'));
});

app.post('/tracks', async (req, res) => {
  await delay();
  const newTrack = {
    id: 'trk_' + randomId(),
    title: req.body.title || 'Untitled', artist: 'tunify_dev',
    genre: req.body.genre || 'electronic', tags: req.body.tags || [],
    status: 'uploading', visibility: req.body.privacy || 'public',
    privacy: req.body.privacy || 'public', audioUrl: '',
    description: req.body.description || '', waveformData: [], duration: 0,
    date: new Date().toISOString(), createdAt: new Date().toISOString(),
    likes: 0, comments: 0, reposts: 0, downloads: 0, plays: 0,
    isHD: false, isPrivate: req.body.privacy === 'private',
    thumbnailUrl: null, userId: 'mock-user-001',
  };
  tracks.push(newTrack);
  res.status(201).json(newTrack);
});

app.post('/tracks/:id/audio', async (req, res) => {
  await delay(300);
  const track = tracks.find(t => t.id === req.params.id);
  if (!track) return res.status(404).json({ error: 'Track not found' });
  track.status   = 'finished';
  track.audioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
  res.json(track);
});

// POST /tracks/:id/like — like a track
app.post('/tracks/:id/like', async (req, res) => {
  await delay(100);
  const track = tracks.find(t => t.id === req.params.id);
  if (!track) return res.status(404).json({ error: 'Track not found' });
  track.likes = (track.likes || 0) + 1;
  const feedItem = feedItems.find(f => f.track.id === req.params.id);
  if (feedItem) {
    feedItem.track.likesCount = (feedItem.track.likesCount || 0) + 1;
    feedItem.track.interaction.isLiked = true;
  }
  res.status(201).json({ message: 'Track liked.', likesCount: track.likes });
});

// DELETE /tracks/:id/like — unlike a track
app.delete('/tracks/:id/like', async (req, res) => {
  await delay(100);
  const track = tracks.find(t => t.id === req.params.id);
  if (!track) return res.status(404).json({ error: 'Track not found' });
  track.likes = Math.max(0, (track.likes || 0) - 1);
  const feedItem = feedItems.find(f => f.track.id === req.params.id);
  if (feedItem) {
    feedItem.track.likesCount = Math.max(0, (feedItem.track.likesCount || 0) - 1);
    feedItem.track.interaction.isLiked = false;
  }
  res.status(200).json({ message: 'Track unliked.', likesCount: track.likes });
});

app.patch('/tracks/:id', async (req, res) => {
  await delay();
  const track = tracks.find(t => t.id === req.params.id);
  if (!track) return res.status(404).json({ error: 'Track not found' });
  if (req.body && typeof req.body === 'object') Object.assign(track, req.body);
  res.json(track);
});

app.delete('/tracks/:id', async (req, res) => {
  await delay();
  const idx = tracks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Track not found' });
  tracks.splice(idx, 1);
  res.status(204).send();
});

// ─── Conversation / Messages Routes ──────────────────────────────────────────

app.get('/me/conversations', async (req, res) => {
  await delay();
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;
  res.json({ data: conversations.slice((page - 1) * limit, page * limit) });
});

app.post('/me/conversations', async (req, res) => {
  await delay();
  const { userId } = req.body;
  const existing = conversations.find(c => c.otherUser.id === userId);
  if (existing) return res.json({ conversationId: existing.conversationId });
  const user = USERS[userId];
  const newConv = {
    conversationId: 'conv-' + randomId(),
    otherUser: { id: userId, displayName: user?.displayName || 'Unknown User', avatarUrl: user?.avatarUrl || null },
    lastMessagePreview: '', lastMessageAt: new Date().toISOString(), unreadCount: 0,
  };
  conversations.push(newConv);
  messages[newConv.conversationId] = [];
  res.status(201).json({ conversationId: newConv.conversationId });
});

app.get('/conversations/:conversationId/messages', async (req, res) => {
  await delay();
  const { conversationId } = req.params;
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;
  const convMessages = messages[conversationId] || [];
  res.json({ data: convMessages.slice((page - 1) * limit, page * limit) });
});

app.post('/conversations/:conversationId/messages', async (req, res) => {
  await delay();
  const { conversationId } = req.params;
  if (!messages[conversationId]) messages[conversationId] = [];
  const newMsg = {
    id: 'msg-' + randomId(), conversationId,
    senderId: 'mock-user-001',
    sender: { id: 'mock-user-001', displayName: 'You', avatarUrl: 'https://i.pravatar.cc/150?img=1' },
    receiverId: req.body.receiverId || 'unknown',
    type: req.body.type || 'TEXT', text: req.body.text || '',
    createdAt: new Date().toISOString(), status: 'SENT',
  };
  messages[conversationId].push(newMsg);
  const conv = conversations.find(c => c.conversationId === conversationId);
  if (conv) { conv.lastMessagePreview = newMsg.text?.slice(0, 60) || ''; conv.lastMessageAt = newMsg.createdAt; }
  res.status(201).json(newMsg);
});

app.post('/conversations/:conversationId/read', async (req, res) => {
  await delay(100);
  const conv = conversations.find(c => c.conversationId === req.params.conversationId);
  if (conv) conv.unreadCount = 0;
  res.json({ message: 'Marked as read.' });
});

// ─── Feed/Me Route ────────────────────────────────────────────────────────────

app.get('/feed/me', async (req, res) => {
  await delay();
  const page            = parseInt(req.query.page)  || 1;
  const limit           = parseInt(req.query.limit) || 20;
  const includeReposts  = req.query.includeReposts !== 'false';
  const start = (page - 1) * limit;
  const end   = page * limit;

  const filtered = includeReposts
    ? feedItems
    : feedItems.filter(item => item.source !== 'repost');

  const fullItems = filtered.slice(start, end).map(item => {
    const fullTrack = tracks.find(t => t.id === item.track.id);
    const fullUser  = Object.values(USERS).find(u => u.id === fullTrack?.userId);
    return {
      id: item.track.id,
      action: {
        username: fullUser?.username || 'unknown',
        displayName: fullUser?.displayName || null,
        userAvatarUrl: fullUser?.avatarUrl || null,
        action: item.source === 'repost' ? 'repost' : 'post',
        date: item.postedAt,
      },
      title: fullTrack?.title || item.track.title,
      artist: fullTrack?.artist || 'Unknown Artist',
      genre: fullTrack?.genre || null,
      durationInSeconds: fullTrack?.duration || item.track.duration,
      coverUrl: fullTrack?.thumbnailUrl || null,
      waveformUrl: null,
      numberOfComments: fullTrack?.comments || 0,
      numberOfLikes: item.track.likesCount ?? fullTrack?.likes ?? 0,
      numberOfListens: fullTrack?.plays || 0,
      isLiked: item.track.interaction?.isLiked ?? false,
      isReposted: item.track.interaction?.isReposted ?? false,
    };
  });

  res.json({ items: fullItems, page, limit, hasMore: end < filtered.length });
});

// ─── Feed Route (legacy, kept for compatibility) ──────────────────────────────

app.get('/feed', async (req, res) => {
  await delay();
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;
  const start = (page - 1) * limit;
  const end   = page * limit;
  const fullItems = feedItems.slice(start, end).map(item => {
    const fullTrack = tracks.find(t => t.id === item.track.id);
    return { ...item, track: { ...item.track, thumbnailUrl: fullTrack?.thumbnailUrl || null, audioUrl: fullTrack?.audioUrl || null, waveformData: fullTrack?.waveformData || [], plays: fullTrack?.plays || 0 } };
  });
  res.json({ items: fullItems, page, limit, total: feedItems.length });
});

// ─── Search Route ─────────────────────────────────────────────────────────────

app.get('/search', async (req, res) => {
  await delay();
  const q    = (req.query.q    || '').toLowerCase().trim();
  const type =  req.query.type;

  if (!q) return res.json({ results: [] });

  let results = [];

  // Tracks
  if (!type || type === 'track') {
    const trackResults = tracks
      .filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        (t.genre || '').toLowerCase().includes(q)
      )
      .map(t => ({
        id: t.id, type: 'track',
        title: t.title, artist: t.artist,
        genre: t.genre || null,
        durationSeconds: t.duration,
        coverUrl: t.thumbnailUrl || null,
        likesCount: t.likes || 0,
        playsCount: t.plays || 0,
        allowDownloads: true,
        createdAt: t.createdAt,
        score: t.title.toLowerCase().startsWith(q) ? 2 : 1,
      }));
    results = [...results, ...trackResults];
  }

  // Users
  if (!type || type === 'user') {
    const userResults = Object.values(USERS)
      .filter(u =>
        (u.username    || '').toLowerCase().includes(q) ||
        (u.displayName || '').toLowerCase().includes(q)
      )
      .map(u => ({
        id: u.id, type: 'user',
        username: u.username,
        displayName: u.displayName || null,
        bio: u.bio || null,
        location: u.location || null,
        isCertified: u.isCertified || false,
        followersCount: u.followersCount || 0,
        score: u.username.toLowerCase().startsWith(q) ? 2 : 1,
      }));
    results = [...results, ...userResults];
  }

if (!type || type === 'album' || type === 'playlist') {
  const collectionResults = collections
    .filter(c =>
      (!type || c.type === type) &&
      (
        c.title.toLowerCase().includes(q) ||
        c.artist.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q)
      )
    )
    .map(c => ({
      id: c.id,
      type: c.type,
      title: c.title,
      artist: c.artist,
      description: c.description || null,
      coverUrl: c.coverUrl || null,
      createdAt: c.createdAt,
      score: c.title.toLowerCase().startsWith(q) ? 2 : 1,
    }));
  results = [...results, ...collectionResults];
}

results = results.sort((a, b) => b.score - a.score);
res.json({ results });
});

// ─── Artists Route ────────────────────────────────────────────────────────────

app.get('/artists', async (req, res) => {
  await delay();
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;
  const start = (page - 1) * limit;
  const end   = page * limit;
  res.json({ artists: artists.slice(start, end), page, limit, total: artists.length });
});

// ─── Fallback ─────────────────────────────────────────────────────────────────
// GET /collections/:id/tracks
app.get('/collections/:id/tracks', async (req, res) => {
  await delay();
  const collection = collections.find(c => c.id === req.params.id);
  if (!collection) return res.status(404).json({ error: 'Collection not found' });
  res.json({ tracks: collection.tracks, total: collection.tracks.length });
});
app.use((req, res) => {
  console.log(`[mock] 404 — ${req.method} ${req.url}`);
  res.status(404).json({ error: `Mock: no handler for ${req.method} ${req.url}` });
});

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n🎵 Mock server running at http://localhost:${PORT}\n`);
  console.log('  Auth:          POST /auth/login  (test@tunify.com / Password123)');
  console.log('  Profile:       GET  /users/me');
  console.log('  Tracks:        GET  /tracks/me');
  console.log('  Feed:          GET  /feed/me');
  console.log('  Search:        GET  /search?q=keyword');
  console.log('  Likes:         GET  /users/me/likes');
  console.log('  Like track:    POST /tracks/:id/like');
  console.log('  Unlike track:  DELETE /tracks/:id/like');
  console.log('  Conversations: GET  /me/conversations');
  console.log('  Messages:      GET  /conversations/:id/messages');
  console.log('  Artists:       GET  /artists\n');
});