import {roomManager} from "./services/RoomManager.js";
import {checkPermission} from "./utils/permissions.js";

const room = roomManager.createRoom();
console.log("1. Room code:", room.roomId);
console.log("2. Found with lowercase code?", roomManager.getRoom(room.roomId.toLowerCase()) === room);
console.log("3. Unknown room:", roomManager.getRoom("ZZZZZZ"));

room.addParticipant({ userId:"u1", username:"Komal",socketId:"s1"});
room.addParticipant({userId:"u2", username:"Rahul",socketId:"s2"});

console.log("4. Host play:", checkPermission(room,"u1","play"));
console.log("5. Participant play:", checkPermission(room,"u2","play"));
console.log("6. Participant assign_role:", checkPermission(room,"u2","assign_role"));

room.assignRole("u2","moderator");
console.log("7. Moderator change_video:", checkPermission(room,"u2","change_video"));
console.log("8. Moderator assign_role:", checkPermission(room,"u2","assign_role"));
console.log("9. Stranger play:", checkPermission(room, "u99","play"));
console.log("10. Unknown action:", checkPermission(room, "u1", "fly"));

console.log("11. Active rooms:", roomManager.getActiveRooms());

room.removeParticipant("u1");
room.removeParticipant("u2");
console.log("12. Deleted when empty?", roomManager.deleteIfEmpty(room.roomId));
console.log("13. Room after delete:", roomManager.getRoom(room.roomId));

