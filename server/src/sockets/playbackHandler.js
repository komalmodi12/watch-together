import {authorize, fail, reply} from '../utils/socketHelpers.js';

import { isValidTime, isValidVideoId } from "../utils/validators.js";




function applySenderTime(room, payload) {
  if (isValidTime(payload?.currentTime)) room.seek(payload.currentTime);
}

export function registerPlaybackHandlers(io, socket) {
  const broadcastState = (room) => {
    io.to(room.roomId).emit("sync_state", room.getCurrentState());

  };

   socket.on("play", (payload, cb) => {
    const ctx = authorize(socket, "play", cb);
    if (!ctx) return;

    applySenderTime(ctx.room, payload);
    ctx.room.play();
    broadcastState(ctx.room);
    reply(cb, { ok: true });
  });

  socket.on("pause", (payload, cb) => {
    const ctx = authorize(socket, "pause", cb);
    if (!ctx) return;

    applySenderTime(ctx.room, payload);
    ctx.room.pause();
    broadcastState(ctx.room);
    reply(cb, { ok: true });
  });

   socket.on("seek", (payload, cb) => {
    const ctx = authorize(socket, "seek", cb);
    if (!ctx) return;

    if (!isValidTime(payload?.time)) {
      return fail(socket, cb, "seek", "Seek time must be a number (seconds)");
    }
    ctx.room.seek(payload.time);
    broadcastState(ctx.room);
    reply(cb, { ok: true });
  });

  socket.on("change_video", (payload, cb) => {
    const ctx = authorize(socket, "change_video", cb);
    if (!ctx) return;

    // The client will parse URLs (Task 12), but the server re-checks anyway
    const videoId = payload?.videoId;
    if (!isValidVideoId(videoId)) {
      return fail(socket, cb, "change_video", "Invalid YouTube video id");
    }

    ctx.room.changeVideo(videoId);
    broadcastState(ctx.room);
    reply(cb, { ok: true });
  });
}

