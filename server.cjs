

const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

// add this BEFORE server.use(router)
server.use("/assets", (req, res) => {
  const filePath = path.join(__dirname, "src/assets", req.path);
  res.sendFile(filePath);
});


server.use(middlewares);
server.use(jsonServer.bodyParser);
const path = require("path");


// GET /tracks/:trackId/playback
// Returns a full playbackBundle (shape defined in types.ts).
// Optional ?privateToken query param is accepted but ignored in the mock.
server.get("/tracks/:trackId/playback", (req, res) => {
  const db = router.db.getState();
  const track = db.tracks.find((t) => t.id === req.params.trackId);
  if (!track) return res.status(404).json({ message: "Track not found" });
  res.json(track);
});

// GET /tracks/:trackId/stream
// Returns a streamBundle: { trackId, stream: { url, expiresInSeconds, format } }
// Shape must exactly match the streamBundle interface in types.ts because
// usePlayback.ts accesses fresh.stream.url and fresh.stream.expiresInSeconds.
server.get("/tracks/:trackId/stream", (req, res) => {
  const db = router.db.getState();
  const track = db.tracks.find((t) => t.id === req.params.trackId);
  if (!track) return res.status(404).json({ message: "Track not found" });

  res.json({
    trackId: req.params.trackId,
    stream: {
      url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", // public HLS test stream — keep for testing
      expiresInSeconds: 3600,
      format: "hls",
    },
  });
});

// POST /tracks/:trackId/played
// Called only when a track ends naturally (audio "ended" event).
// Not called on manual skip or pause. Just acknowledge — no body needed.
server.post("/tracks/:trackId/played", (req, res) => {
  res.status(204).send();
});


const TRACKS = [
  {
    trackId: "test-track-1",
    title: "Never Ending Story",
    artist: { id: "artist-1", name: "Test Artist", tier: "pro" },
    durationSeconds: 175,
    waveformUrl: "",
    coverUrl: "C:/Users/Nada Serag/Documents/Software Engineering CMPS203/Project/soundcloud-team8-frontend/src/assets/neverendingstory.png",
    contentWarning: false,
    engagement: { likeCount: 0, commentCount: 0, repostCount: 0, isLiked: false, isReposted: false, isSaved: false },
    playability: { status: "playable", regionBlocked: false, tierBlocked: false, requiresSubscription: false, blockedReason: null },
    preview: { enabled: false, previewStartSeconds: 0, previewDurationSeconds: 0 },
    scheduledReleaseDate: null,
  },
  {
    trackId: "test-track-2",
    title: "Test Track Two",
    artist: { id: "artist-1", name: "Test Artist", tier: "pro" },
    durationSeconds: 210,
    waveformUrl: "",
    coverUrl: "",
    contentWarning: false,
    engagement: { likeCount: 5, commentCount: 1, repostCount: 0, isLiked: false, isReposted: false, isSaved: false },
    playability: { status: "playable", regionBlocked: false, tierBlocked: false, requiresSubscription: false, blockedReason: null },
    preview: { enabled: false, previewStartSeconds: 0, previewDurationSeconds: 0 },
    scheduledReleaseDate: null,
  },
  {
    trackId: "test-track-3",
    title: "Test Track Three",
    artist: { id: "artist-2", name: "Another Artist", tier: "free" },
    durationSeconds: 195,
    waveformUrl: "",
    coverUrl: "",
    contentWarning: false,
    engagement: { likeCount: 0, commentCount: 0, repostCount: 0, isLiked: false, isReposted: false, isSaved: false },
    playability: { status: "playable", regionBlocked: false, tierBlocked: false, requiresSubscription: false, blockedReason: null },
    preview: { enabled: false, previewStartSeconds: 0, previewDurationSeconds: 0 },
    scheduledReleaseDate: null,
  },
];

server.post("/tracks/playback-context", (req, res) => {
  res.json({
    queue: TRACKS.map((t) => ({
      trackId:         t.trackId,
      title:           t.title,
      artist:          t.artist.name,
      durationSeconds: t.durationSeconds,
    })),
    currentIndex: 0,
    repeat:       "none",
    shuffle:      false,
  });
});

server.use(router);
server.listen(3001, () => console.log("JSON Server running on port 3001"));
