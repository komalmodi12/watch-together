import {Room} from './models/Room.js';

const room = new Room("ABC123");

room.addParticipant({userId:"u1", username:"Shree", socketId:"s1"});
room.addParticipant({userId:"u2", username:"Neel", socketId:"s2"});
room.addParticipant({userId:"u3", username:"Kajal", socketId:"s3"});

console.log("1. Participants:",room.getParticipantsList());
console.log("2. Neel can control?",room.canControl("u2"));

room.assignRole("u2","moderator");
console.log("3. After promote, Neel can control?", room.canControl("u2"));

try{
  room.assignRole("u1","participant");
}catch(e){
  console.log("4. Blocked:", e.message);
}

room.play();
setTimeout(()=>{
  console.log("5. Time after -2s of playing:", room.getCurrentState().currentTime.toFixed(1));

  room.pause();
  console.log("6. Paused at:", room.getCurrentState().currentTime.toFixed(1));

  const { removed, newHost } = room.removeParticipant("u1");

  console.log("7. Host left:", removed.username, "| new host:", newHost.username);
  console.log("8. Final list:", room.getParticipantsList());
},2000);
