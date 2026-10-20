import {ROLES,Participant} from './Participant.js';
import { randomUUID } from "crypto";

const MAX_MESSAGES = 100;

export class Room{
  constructor(roomId){
    this.roomId = roomId;
    this.participants = new Map();
    this.hostId = null;

    this.videoState ={
      videoId: "pPbq6sJsGYg",
      playState: "paused",
      currentTime: 0,
      updatedAt: Date.now(),
    };

  
    this.messages = [];
    this.requests = new Map();

  }

  addParticipant({userId,username,socketId}){

    const role = this.participants.size === 0 ? ROLES.HOST:ROLES.PARTICIPANT;
    const participant = new Participant({userId,username,socketId,role});


    this.participants.set(userId,participant);
    if(role===ROLES.HOST) this.hostId = userId;

    return participant;
  }




  getParticipant(userId){
    return this.participants.get(userId);
  }


  getParticipantBySocketId(socketId){
    for(const p of this.participants.values()){
      if(p.socketId === socketId) return p;
    }
    return undefined;
  }



  removeParticipant(userId){
    const removed = this.participants.get(userId);
    if(!removed) return {removed:null, newHost:null};

    this.participants.delete(userId);

    let newHost = null;

    if(userId === this.hostId && this.participants.size > 0) {
      newHost = this._pickNextHost();
      newHost.role = ROLES.HOST;
      this.hostId = newHost.userId;
    }
    else if(this.participants.size === 0){
      this.hostId = null;
    }

    return {removed, newHost};

  }

  _pickNextHost() {
    const all = [...this.participants.values()];
    return all.find((p) => p.role === ROLES.MODERATOR) || all[0];
  }

  isEmpty(){
    return this.participants.size === 0;
  }

  assignRole(userId, role){
    const target= this.participants.get(userId);
    if(!target) throw new Error("User not found in room");
    if(target.role === ROLES.HOST) throw new Error("Host's role cannot be changed");
    if(role !== ROLES.MODERATOR && role!==ROLES.PARTICIPANT){
      throw new Error("Invalid role");

    }
    target.role = role;
    return target;
  }

  transferHost(newHostId){
    const newHost = this.participants.get(newHostId);
    const oldHost = this.participants.get(this.hostId);
    if(newHostId === this.hostId) throw new Error("User is already the host");

    oldHost.role = ROLES.MODERATOR;
    newHost.role = ROLES.HOST;
    this.hostId = newHostId;
    return {oldHost, newHost};
  }

  canControl(userId){
    const p = this.participants.get(userId);
    return !!p && (p.role === ROLES.HOST || p.role === ROLES.MODERATOR);
  }

  isHost(userId) {
    return userId === this.hostId;
  }

  getCurrentState(){
    const {videoId, playState, currentTime, updatedAt} = this.videoState;
    const elapsed = playState === "playing" ? (Date.now() - updatedAt) / 1000 : 0;

    return {
      videoId,
      playState,
      currentTime: currentTime + elapsed,
      serverTime: Date.now(),
    };
  }

  play(){
    this.videoState.currentTime = this.getCurrentState().currentTime;
    this.videoState.playState = "playing";
    this.videoState.updatedAt = Date.now();
  }

  pause(){
    this.videoState.currentTime = this.getCurrentState().currentTime;
    this.videoState.playState = "paused";
    this.videoState.updatedAt = Date.now();
  }

  seek(time){
    this.videoState.currentTime = Math.max(0, Number(time) || 0);
    this.videoState.updatedAt = Date.now();
  }

  changeVideo(videoId){
    this.videoState = {
      videoId,
      playState:"paused",
      currentTime: 0,
      updatedAt: Date.now(),
    };
  }

  addMessage(message) {
    this.messages.push(message);
    if (this.messages.length > MAX_MESSAGES) this.messages.shift();
  }

   addRequest({ userId, username, type, time, videoId }) {
    const request = { id: randomUUID(), userId, username, type, time, videoId, createdAt: Date.now() };
    this.requests.set(userId, request); // same key = a new request REPLACES the old one
    return request;
  }

  findRequest(requestId) {
    for (const r of this.requests.values()) {
      if (r.id === requestId) return r;
    }
    return undefined;
  }

  removeRequest(userId) {
    this.requests.delete(userId);
  }

  // Drop requests that no longer make sense: the user left, or was promoted
  // (a moderator can act directly, so asking makes no sense)
  pruneRequests() {
    for (const userId of [...this.requests.keys()]) { // copy the keys first, we delete while looping
      if (!this.participants.has(userId) || this.canControl(userId)) {
        this.requests.delete(userId);
      }
    }
  }

 
  getRequestsFor(userId) {
    const all = [...this.requests.values()];
    return this.canControl(userId) ? all : all.filter((r) => r.userId === userId);


  } 

  getParticipantsList(){
    return [...this.participants.values()].map((p) => p.toJSON());
  }
}