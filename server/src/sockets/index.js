import {registerRoomHandlers} from './roomHandlers.js';
import {registerPlaybackHandlers} from "./playbackHandler.js";
import {registerRoleHandlers} from "./roleHandlers.js";
import { registerChatHandlers } from "./chatHandlers.js";
import { registerApprovalHandlers } from "./approvalHandlers.js";




export function registerSocketHandlers(io){
  io.on("connection", (socket)=>{
    console.log("User connected:", socket.id);

    registerRoomHandlers(io,socket);
    registerPlaybackHandlers(io, socket);
    registerRoleHandlers(io, socket);
     registerChatHandlers(io, socket);
     registerApprovalHandlers(io, socket);
  });
}