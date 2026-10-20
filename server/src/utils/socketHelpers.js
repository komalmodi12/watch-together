import {roomManager} from '../services/RoomManager.js';
import {checkPermission} from './permissions.js';

export const reply = (cb, payload)=>{
  if(typeof cb === "function") cb(payload);
};


export function fail(socket, cb, action, message){
  socket.emit("error_message", {action, message});
  reply(cb, {ok:false, message});
  return null;
}

export function authorize(socket,action,cb){

  const {roomId, userId} = socket.data;
  const room = roomManager.getRoom(roomId);

  const result = checkPermission(room, userId, action);

  if(!result.ok) return fail(socket, cb, action, result.message);

  


  return {room, userId};
}

export function syncApprovals(io, room) {
  room.pruneRequests();
  for (const p of room.participants.values()) {
    io.to(p.socketId).emit("approval_requests", room.getRequestsFor(p.userId));
  }
}