import { authorize, fail, reply, syncApprovals } from "../utils/socketHelpers.js";
import { isValidTime, isValidVideoId } from "../utils/validators.js";

const TYPES = ["play", "pause", "seek", "change_video"];
const COOLDOWN_MS = 1000; // one request per second per socket

// The SAME Room methods the direct events use, so an approved request behaves exactly
// like the host pressing the button himself
function applyRequest(room, request) {
  switch (request.type) {
    case "play":         return room.play();
    case "pause":        return room.pause();
    case "seek":         return room.seek(request.time);
    case "change_video": return room.changeVideo(request.videoId);
  }
}

export function registerApprovalHandlers(io, socket) {
  /* ---------- Participant asks ---------- */
  socket.on("request_action", (payload, cb) => {
    const ctx = authorize(socket, "request_action", cb); // participants only
    if (!ctx) return;
    const { room, userId } = ctx;

    const type = payload?.type;
    if (!TYPES.includes(type)) {
      return fail(socket, cb, "request_action", "Unknown request type");
    }

    // Same rules as the direct events: the server never trusts the client
    const extra = {};
    if (type === "seek") {
      if (!isValidTime(payload.time)) {
        return fail(socket, cb, "request_action", "Seek time must be a number (seconds)");
      }
      extra.time = payload.time;
    }
    if (type === "change_video") {
      if (!isValidVideoId(payload.videoId)) {
        return fail(socket, cb, "request_action", "Invalid YouTube video id");
      }
      extra.videoId = payload.videoId;
    }

    // Cooldown comes AFTER validation, so a typo does not use up the participant's turn
    const now = Date.now();
    if (now - (socket.data.lastRequestAt || 0) < COOLDOWN_MS) {
      return fail(socket, cb, "request_action", "Please wait a moment before sending another request");
    }
    socket.data.lastRequestAt = now;

    // userId and username come from the server's own record, never from the payload
    const username = room.getParticipant(userId).username;
    room.addRequest({ userId, username, type, ...extra });

    syncApprovals(io, room);
    reply(cb, { ok: true });
  });

  /* ---------- Host / Moderator decides ---------- */
  socket.on("resolve_request", (payload, cb) => {
    const ctx = authorize(socket, "resolve_request", cb); // host and moderators only
    if (!ctx) return;
    const { room, userId } = ctx;

    const request =
      typeof payload?.requestId === "string" ? room.findRequest(payload.requestId) : undefined;
    if (!request) {
      // Another moderator was faster, or the requester left. First decision wins.
      return fail(socket, cb, "resolve_request", "Request not found. Someone may have handled it already.");
    }

    const approved = payload.approve === true; // strict: the string "false" must NOT count as yes
    room.removeRequest(request.userId);

    if (approved) {
      applyRequest(room, request);
      io.to(room.roomId).emit("sync_state", room.getCurrentState()); // everyone follows the new state
    }

    // Tell only the person who asked
    const requester = room.getParticipant(request.userId);
    if (requester) {
      io.to(requester.socketId).emit("request_result", {
        requestId: request.id,
        type: request.type,
        time: request.time,
        approved,
        by: room.getParticipant(userId).username,
      });
    }

    syncApprovals(io, room);
    reply(cb, { ok: true });
  });
}