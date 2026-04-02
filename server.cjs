const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

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

// POST /tracks/playback-context
// Builds an ordered queue from a context (playlist, profile, history, etc.).
// Body: { contextType, contextId, startTrackId?, shuffle?, repeat? }
// Returns queueResponse: { queue, currentIndex, shuffle, repeat }
//
// IMPORTANT: this route must be registered BEFORE json-server's wildcard router
// or it will be swallowed by the generic /tracks POST handler.
server.post("/tracks/playback-context", (req, res) => {
  const db = router.db.getState();
  const { contextType, contextId, startTrackId, shuffle, repeat } = req.body;

  // Find a matching context; fall back to all tracks
  let tracks = [];
  if (contextType && db.contexts) {
    const ctx = db.contexts.find(
      (c) => c.type === contextType && c.id === contextId
    );
    if (ctx) {
      tracks = ctx.trackIds
        .map((id) => db.tracks.find((t) => t.id === id))
        .filter(Boolean);
    }
  }

  if (!tracks.length) {
    tracks = [...db.tracks];
  }

  // Respect shuffle
  if (shuffle) {
    for (let i = tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
    }
  }

  // Place startTrackId at index 0 when specified
  if (startTrackId) {
    const idx = tracks.findIndex((t) => t.id === startTrackId);
    if (idx > 0) {
      const [item] = tracks.splice(idx, 1);
      tracks.unshift(item);
    }
  }

  const currentIndex = 0;

  res.json({
    queue: tracks.map((t) => ({ trackId: t.id })),
    currentIndex,
    repeat: repeat ?? "none",
    shuffle: shuffle ?? false,
  });
});

server.use(router);
server.listen(3001, () => console.log("JSON Server running on port 3001"));
