import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type {
  Message,
  SendMessagePayload,
  SocketMessageReceived,
  SocketMessageSent,
  SocketTypingPayload,
  SocketReadPayload,
} from "../types";



const SOCKET_BASE =
  (import.meta.env.VITE_SOCKET_URL as string | undefined)?.replace(/\/$/, "") ??
  "https://tunify.duckdns.org";

const SOCKET_NS = "/conversations";
const SOCKET_URL = SOCKET_BASE;

// ─── Internal event bus ───────────────────────────────────────────────────────

type BusEvent =
  | { type: "message:received"; message: Message }
  | { type: "message:sent"; messageId: string; tempId: string }
  | { type: "message:read"; payload: SocketReadPayload }
  | { type: "typing:active"; payload: SocketTypingPayload }
  | { type: "typing:inactive"; payload: SocketTypingPayload };

type BusListener = (event: BusEvent) => void;

// ─── Singleton class ──────────────────────────────────────────────────────────

class SocketSingleton {
  private socket: Socket | null = null;
  private token: string | null = null;

  // Global connection state — shared across all hook instances
  connected = false;
  authenticated = false;

  // Rooms we want to be in (re-joined after every reconnect)
  private rooms = new Set<string>();
  // The "primary" open conversation (used for getState())
  currentRoom: string | null = null;

  // Outbound messages waiting for socket readiness, keyed by tempId
  private pending = new Map<string, SendMessagePayload>();

  // Hook-instance subscribers
  private listeners = new Set<BusListener>();

  // ── Pub/sub ───────────────────────────────────────────────────────────────

  subscribe(fn: BusListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private publish(event: BusEvent) {
    this.listeners.forEach((fn) => fn(event));
  }

  // ── Connection ────────────────────────────────────────────────────────────

  connect(token: string) {
    // Already connected with the same token — nothing to do
    if (this.socket && this.token === token && this.socket.connected) return;

    // Tear down any stale socket
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.token = token;
    this.connected = false;
    this.authenticated = false;

    const socket = io(`${SOCKET_URL}${SOCKET_NS}`, {
      transports: ["websocket"],
      auth: { token },
      extraHeaders: { authorization: `Bearer ${token}` },
      query: { token },
      path: "/socket.io",
      timeout: 10_000,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 10_000,
      forceNew: true,
    });

    this.socket = socket;
    this.bindSocketEvents(socket);
    socket.connect();
  }

  private bindSocketEvents(socket: Socket) {
    socket.on("connect", () => {
      console.log("[Socket] connected");
      this.connected = true;
      // Re-join every room — backend loses membership on disconnect
      this.rooms.forEach((id) =>
        socket.emit("conversation:join", { conversationId: id }),
      );
    });

    socket.on("disconnect", () => {
      console.log("[Socket] disconnected");
      this.connected = false;
      this.authenticated = false;
    });

    socket.on("connect_error", (err: Error) => {
      console.error("[Socket] connect error:", err.message);
      this.connected = false;
      this.authenticated = false;
    });

    // Backend emits `authenticated` once the JWT handshake succeeds
    socket.on("authenticated", () => {
      console.log("[Socket] authenticated ✓");
      this.authenticated = true;
      // Re-join rooms — authenticated may fire after connect in some flows
      this.rooms.forEach((id) =>
        socket.emit("conversation:join", { conversationId: id }),
      );
    });

    socket.on("joined", (data: { conversationId: string }) => {
      console.log("[Socket] joined room:", data.conversationId);
      this.flushPending();
    });

    socket.on("left", (data: { conversationId: string }) => {
      console.log("[Socket] left room:", data.conversationId);
    });

    // ── Inbound messages ────────────────────────────────────────────────────

    socket.on("message:received", (payload: SocketMessageReceived) => {
      const msg = payload.message;
      const normalised: Message = {
        id: msg.id,
        conversationId: msg.conversationId ?? payload.conversationId,
        senderId: msg.sender.id,
        sender: {
          id: msg.sender.id,
          displayName: msg.sender.username, // backend field is `username`
          avatarUrl: msg.sender.avatarUrl,
        },
        type: msg.type,
        content: msg.text ?? null,           // gateway broadcasts use `text`
        read: msg.read,
        createdAt: msg.createdAt,
        attachment: msg.attachment ?? null,
      };
      this.publish({ type: "message:received", message: normalised });
    });

    socket.on("message:sent", (payload: SocketMessageSent) => {
      this.publish({
        type: "message:sent",
        messageId: payload.messageId,
        tempId: payload.tempId ?? "",
      });
    });

    socket.on("message:read", (payload: SocketReadPayload) => {
      this.publish({ type: "message:read", payload });
    });

    socket.on("typing:active", (payload: SocketTypingPayload) => {
      this.publish({ type: "typing:active", payload });
    });

    socket.on("typing:inactive", (payload: SocketTypingPayload) => {
      this.publish({ type: "typing:inactive", payload });
    });

    socket.on("error", (err: { message: string }) => {
      console.error("[Socket] server error:", err.message);
    });
  }

  // ── Room management ───────────────────────────────────────────────────────

  joinRoom(conversationId: string) {
    this.rooms.add(conversationId);
    if (this.socket && this.connected) {
      this.socket.emit("conversation:join", { conversationId });
    }
    // If not connected yet, connect/authenticated handlers will re-join
  }

  leaveRoom(conversationId: string) {
    this.rooms.delete(conversationId);
    if (conversationId === this.currentRoom) this.currentRoom = null;
    if (this.socket && this.connected) {
      this.socket.emit("conversation:leave", { conversationId });
    }
  }

  // ── Outbound ──────────────────────────────────────────────────────────────

  sendMessage(payload: SendMessagePayload) {
    // Always ensure we're tracking this room
    this.joinRoom(payload.conversationId);

    const ready =
      this.connected &&
      this.authenticated &&
      this.rooms.has(payload.conversationId);

    if (!ready) {
      console.warn("[Socket] queuing message (not ready yet):", payload.tempId);
      if (payload.tempId) this.pending.set(payload.tempId, payload);
      return;
    }

    console.log("[Socket] emitting message:send", payload.tempId ?? "");
    this.socket!.emit("message:send", payload);
  }

  private flushPending() {
    if (!this.connected || !this.authenticated || this.pending.size === 0)
      return;

    const retry: SendMessagePayload[] = [];
    this.pending.forEach((p) => {
      if (this.rooms.has(p.conversationId)) {
        console.log("[Socket] flushing pending:", p.tempId);
        this.socket!.emit("message:send", p);
      } else {
        retry.push(p);
      }
    });

    this.pending.clear();
    retry.forEach((p) => p.tempId && this.pending.set(p.tempId, p));
  }

  emitTypingStart(conversationId: string) {
    this.socket?.emit("typing:start", { conversationId });
  }

  emitTypingStop(conversationId: string) {
    this.socket?.emit("typing:stop", { conversationId });
  }

  markMessageRead(conversationId: string, messageId: string) {
    this.socket?.emit("message:markRead", { conversationId, messageId });
  }

  getState() {
    return {
      connected: this.connected,
      authenticated: this.authenticated,
      joinedConversation: this.currentRoom,
    };
  }
}

// ─── The one instance ─────────────────────────────────────────────────────────

export const socketSingleton = new SocketSingleton();

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseSocketOptions {
  conversationId: string | null;
  onMessageReceived?: (message: Message) => void;
  onMessageSent?: (messageId: string, tempId: string) => void;
  onMessageRead?: (payload: SocketReadPayload) => void;
  onTypingActive?: (payload: SocketTypingPayload) => void;
  onTypingInactive?: (payload: SocketTypingPayload) => void;
}

export function useSocket({
  conversationId,
  onMessageReceived,
  onMessageSent,
  onMessageRead,
  onTypingActive,
  onTypingInactive,
}: UseSocketOptions) {
  // Stable ref — callbacks update every render but the closure stays the same
  const cbRef = useRef({
    onMessageReceived,
    onMessageSent,
    onMessageRead,
    onTypingActive,
    onTypingInactive,
  });
  useEffect(() => {
    cbRef.current = {
      onMessageReceived,
      onMessageSent,
      onMessageRead,
      onTypingActive,
      onTypingInactive,
    };
  });

  // ── Boot singleton on first mount ─────────────────────────────────────────

  useEffect(() => {
    const token = localStorage.getItem("sc_access_token");
    if (!token) {
      console.warn("[Socket] No access token — cannot connect");
      return;
    }
    socketSingleton.connect(token);
  }, []); // runs once per hook instance; connect() is idempotent

  // ── Subscribe to the event bus ────────────────────────────────────────────
  // Returns an unsubscribe fn — only removes THIS hook's listener.
  // The socket itself stays alive.

  useEffect(() => {
    return socketSingleton.subscribe((event) => {
      switch (event.type) {
        case "message:received":
          cbRef.current.onMessageReceived?.(event.message);
          break;
        case "message:sent":
          cbRef.current.onMessageSent?.(event.messageId, event.tempId);
          break;
        case "message:read":
          cbRef.current.onMessageRead?.(event.payload);
          break;
        case "typing:active":
          cbRef.current.onTypingActive?.(event.payload);
          break;
        case "typing:inactive":
          cbRef.current.onTypingInactive?.(event.payload);
          break;
      }
    });
  }, []); // subscribe once; callbacks stay fresh via cbRef

  // ── Room management ───────────────────────────────────────────────────────

  const prevRoomRef = useRef<string | null>(null);

  useEffect(() => {
    const prev = prevRoomRef.current;
    const next = conversationId;

    // Leave old room when switching conversations
    if (prev && prev !== next) {
      socketSingleton.leaveRoom(prev);
    }

    if (next) {
      socketSingleton.joinRoom(next);
      socketSingleton.currentRoom = next;
    }

    prevRoomRef.current = next;
  }, [conversationId]);

  // ── Stable public API ─────────────────────────────────────────────────────

  const sendMessage = useCallback(
    (payload: SendMessagePayload) => socketSingleton.sendMessage(payload),
    [],
  );

  const emitTypingStart = useCallback(
    (convId: string) => socketSingleton.emitTypingStart(convId),
    [],
  );

  const emitTypingStop = useCallback(
    (convId: string) => socketSingleton.emitTypingStop(convId),
    [],
  );

  const markMessageRead = useCallback(
    (convId: string, messageId: string) =>
      socketSingleton.markMessageRead(convId, messageId),
    [],
  );

  const getSocketState = useCallback(() => socketSingleton.getState(), []);

  return {
    sendMessage,
    emitTypingStart,
    emitTypingStop,
    markMessageRead,
    getSocketState,
  };
}
