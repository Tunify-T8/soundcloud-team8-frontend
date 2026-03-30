const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// GET /tracks/:trackId/playback
server.get("/tracks/:trackId/playback", (req, res) => {
  const db = router.db.getState();
  const track = db.tracks.find((t) => t.id === req.params.trackId);
  if (!track) return res.status(404).json({ message: "Track not found" });
  res.json(track);
});

// POST /tracks/:trackId/stream
server.post("/tracks/:trackId/stream", (req, res) => {
  res.json({
    stream: {
      url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", // public HLS test stream
      expiresInSeconds: 3600,
    },
  });
});

// PATCH /me/playback/events — just swallow it
server.patch("/me/playback/events", (req, res) => {
  res.status(204).send();
});

server.use(router);
server.listen(3001, () => console.log("JSON Server running on port 3001"));