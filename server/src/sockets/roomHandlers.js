import {randomUUID} from "crypto";
import {roomManager} from "../services/RoomManager.js";
import { syncApprovals } from "../utils/socketHelpers.js";

const reply = (cb, payload)=>{
  if(typeof cb === "function") cb(payload);
};

function cleanUsername(name){
  if(typeof name !== "string") return null;
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <=20 ? trimmed:null;
}

function enterRoom(socket, room, username){
  const userId = randomUUID();
  const participant = room.addParticipant({ userId, username, socketId: socket.id});

  socket.join(room.roomId);
  socket.data.roomId = room.roomId;
  socket.data.userId = userId;

  return participant;
}

export function leaveCurrentRoom(io, socket){
  const {roomId, userId} = socket.data;
  if(!roomId) return;

  socket.leave(roomId);
  socket.data.roomId=null;
  socket.data.userId = null;

  const room = roomManager.getRoom(roomId);

  if(!room) return;

  const {removed, newHost}= room.removeParticipant(userId);

  if(!removed) return;

  io.to(roomId).emit("user_left",{
    username: removed.username,
    userId,
    participants:room.getParticipantsList(),
  });

  if(newHost){
    io.to(roomId).emit("role_assigned",{
      userId:newHost.userId,
      username:newHost.username,
      role:newHost.role,
      participants:room.getParticipantsList(),
    });
  }

  syncApprovals(io, room); 

 if (roomManager.deleteIfEmpty(roomId)) console.log("ROOM DELETED (empty):", roomId);
}

export function registerRoomHandlers(io, socket){
  socket.on("create_room",(payload,cb)=>{
    const username = cleanUsername(payload?.username);

    if(!username){
      return reply(cb,{ok:false,message:"Username must be 1 to 20 characters"});

    }

    leaveCurrentRoom(io,socket);

    const room = roomManager.createRoom();
    const me = enterRoom(socket,room,username);

    reply(cb,{
      ok:true,
      roomId:room.roomId,
      userId:me.userId,
      role:me.role,
      participants:room.getParticipantsList(),
    });
    socket.emit("sync_state", room.getCurrentState());
  });


  socket.on("join_room", (payload,cb)=>{

    console.log("JOIN attempt:", JSON.stringify(payload?.roomId), "| rooms now:", [...roomManager.rooms.keys()]);

    const username = cleanUsername(payload?.username);
    if(!username){
      return reply(cb, {ok:false, message:"Username must be 1 to 20 characters"});
    }
    const room = roomManager.getRoom(payload?.roomId);

    if(!room){
      return reply(cb, {ok:false, message:"Room not found, Check the code."});

    }

    leaveCurrentRoom(io,socket);

    const me = enterRoom(socket, room, username);
    console.log("CREATED:", room.roomId, "| by:", username, "| socket:", socket.id);

    socket.to(room.roomId).emit("user_joined",{
      username:me.username,
      userId:me.userId,
      role:me.role,
      participants:room.getParticipantsList(),
    });

    reply(cb,{
      ok:true,
      roomId:room.roomId,
      userId:me.userId,
      role:me.role,
      participants:room.getParticipantsList(),
    });

    socket.emit("sync_state", room.getCurrentState());
    socket.emit("chat_history", room.messages); 

  });

  socket.on("leave_room", (payload,cb)=>{
    leaveCurrentRoom(io,socket);
    reply(cb,{ok:true});
  });

  socket.on("disconnect",(reason)=>{
    console.log("User Disconnected:", socket.id, "| reason:", reason);
    leaveCurrentRoom(io,socket);
  });
}