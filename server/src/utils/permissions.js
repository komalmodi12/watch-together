import {ROLES} from "../models/Participant.js";

const PERMISSIONS = {
  play: [ROLES.HOST, ROLES.MODERATOR],
  pause: [ROLES.HOST, ROLES.MODERATOR],
  seek: [ROLES.HOST, ROLES.MODERATOR],
  change_video: [ROLES.HOST, ROLES.MODERATOR],
  assign_role: [ROLES.HOST],
  remove_participant: [ROLES.HOST],
  transfer_host: [ROLES.HOST],
  chat: [ROLES.HOST, ROLES.MODERATOR, ROLES.PARTICIPANT],
  request_action: [ROLES.PARTICIPANT], 
  resolve_request: [ROLES.HOST, ROLES.MODERATOR],
};

export function checkPermission(room, userId, action) {

  if(!room) return {ok:false, message: "Room not found"};

  const participant = room.getParticipant(userId);

  if(!participant) return {ok:false, message:"You are not in this room"};

  const allowedRoles = PERMISSIONS[action];
  if(!allowedRoles) return {ok:false, message: `Unknown action: ${action}`};

  if(!allowedRoles.includes(participant.role)){
    return {
      ok:false,
      message:`Your role (${participant.role}) cannot ${action.replace("_"," ")}`,
    };
  }
  return {ok:true, participant };
}