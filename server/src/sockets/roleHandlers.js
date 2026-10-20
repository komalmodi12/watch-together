import { authorize, fail, reply } from "../utils/socketHelpers.js";
import {syncApprovals } from "../utils/socketHelpers.js";

export function registerRoleHandlers(io, socket) {
  socket.on("assign_role", (payload, cb) => {
    const ctx = authorize(socket, "assign_role", cb); 
    if (!ctx) return;
    const { room } = ctx;

     try {

       const target = room.assignRole(payload?.userId, payload?.role);

       io.to(room.roomId).emit("role_assigned", {
        userId: target.userId,
        username: target.username,
        role: target.role,
        participants: room.getParticipantsList(),
      });

      syncApprovals(io, room);

       reply(cb, { ok: true });
    } catch (err) {
      fail(socket, cb, "assign_role", err.message);
    }
  });

  socket.on("remove_participant", (payload, cb) => {
    const ctx = authorize(socket, "remove_participant", cb); // Host only
    if (!ctx) return;
    const { room } = ctx;

    const targetId = payload?.userId;
    const target = typeof targetId === "string" ? room.getParticipant(targetId) : undefined;

    if (!target) return fail(socket, cb, "remove_participant", "User not found in room");
    if (room.isHost(targetId)) {
      return fail(socket, cb, "remove_participant", "Host cannot be removed");
    }

    room.removeParticipant(targetId);
    io.to(room.roomId).emit("participant_removed", {
      userId: targetId,
      username: target.username,
      participants: room.getParticipantsList(),
    });

    const targetSocket = io.sockets.sockets.get(target.socketId);
    if (targetSocket) {
      targetSocket.leave(room.roomId);
      targetSocket.data.roomId = null; 
      targetSocket.data.userId = null;
    }

    syncApprovals(io, room);

    reply(cb, { ok: true });
  });

    socket.on("transfer_host", (payload, cb) => {
    const ctx = authorize(socket, "transfer_host", cb); 
    if (!ctx) return;
    const { room } = ctx;

    try {
      const { newHost } = room.transferHost(payload?.userId);

     
      io.to(room.roomId).emit("role_assigned", {
        userId: newHost.userId,
        username: newHost.username,
        role: newHost.role,
        participants: room.getParticipantsList(),
      });

      syncApprovals(io, room);

      reply(cb, { ok: true });
    } catch (err) {
      fail(socket, cb, "transfer_host", err.message);
    }
  });
}






