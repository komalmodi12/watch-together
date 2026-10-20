import {randomInt} from "crypto";
import {Room} from "../models/Room.js";

const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

export class RoomManager{
  constructor(){
    this.rooms = new Map();

  }

  _generateRoomId(){
    let id;
    do{
      id = Array.from({length:CODE_LENGTH},()=>
         CODE_CHARS[randomInt(CODE_CHARS.length)]).join("");

    } while(this.rooms.has(id));
    return id;

  }

  createRoom() {
    const room = new Room(this._generateRoomId());
    this.rooms.set(room.roomId, room);
    return room;
  }

  getRoom(roomId){
    if (typeof roomId !== "string") return undefined;
    return this.rooms.get(roomId.trim().toUpperCase());
  }

  deleteRoom(roomId){
    return this.rooms.delete(roomId);
  }

  deleteIfEmpty(roomId){
    const room = this.rooms.get(roomId);
    if(room && room.isEmpty()){
      this.rooms.delete(roomId);
      return true;
    }
    return false;
  }

  getActiveRooms(){
    return [...this.rooms.values()].map((r)=>({
      roomId: r.roomId,
      watching: r.participants.size,
    }));
  }
}

export const roomManager = new RoomManager();