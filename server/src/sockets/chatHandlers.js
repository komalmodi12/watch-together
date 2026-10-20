import { randomUUID } from "crypto";
import { authorize, fail, reply } from "../utils/socketHelpers.js";

const MAX_LENGTH = 500;
const WINDOW_MS = 10_000;  // spam rule: at most 5 messages in any 10 seconds, per socket
const MAX_IN_WINDOW = 5;

export function registerChatHandlers(io, socket) {
  socket.data.chatTimes = []; // timestamps of this socket's recent messages

  socket.on("chat_message", (payload, cb) => {
    const ctx = authorize(socket, "chat", cb); // must be inside a room
    if (!ctx) return;
    const { room, userId } = ctx;

    // Never trust the client. Collapsing whitespace also turns line breaks into spaces,
    // so nobody can post a 500-line-tall message.
    const text =
      typeof payload?.text === "string" ? payload.text.replace(/\s+/g, " ").trim() : "";

    if (!text) return fail(socket, cb, "chat", "Message cannot be empty");
    if (text.length > MAX_LENGTH) {
      return fail(socket, cb, "chat", `Message is too long (max ${MAX_LENGTH} characters)`);
    }

    // Rate limit (sliding window): keep only the timestamps from the last 10 seconds
    const now = Date.now();
    socket.data.chatTimes = socket.data.chatTimes.filter((t) => now - t < WINDOW_MS);
    if (socket.data.chatTimes.length >= MAX_IN_WINDOW) {
      return fail(socket, cb, "chat", "You are sending messages too fast. Slow down.");
    }
    socket.data.chatTimes.push(now);

    // Name and id come from the SERVER's record of this user. Any username or userId the
    // client puts in the payload is ignored, so nobody can pretend to be someone else.
    const sender = room.getParticipant(userId);
    const message = {
      id: randomUUID(),
      userId,
      username: sender.username,
      text,
      timestamp: now,
    };

    room.addMessage(message);
    io.to(room.roomId).emit("chat_message", message); // everyone in the room, including the sender
    reply(cb, { ok: true });
  });
}