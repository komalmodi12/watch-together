import {io} from 'socket.io-client';

const URL = "http://localhost:5000";

const connect = (name)=> new Promise((resolve)=>{
  const s = io(URL);
  s.on("connect",()=> resolve(s));
  s.onAny((event,data)=> console.log(` [${name}] recieved "${event}"`, JSON.stringify(data)));
});

const emitAck = (socket, event, payload)=> new Promise((resolve)=> socket.emit(event, payload, resolve));


const wait = (ms)=> new Promise((r)=> setTimeout(r,ms));

const komal = await connect('Komal');
const rahul = await connect('Rahul');
const aman = await connect('Aman');

console.log("\n1. Komal creates a room");
const created = await emitAck(komal, "create_room", {username:"Komal"});
console.log(" ack:", created);

const code = created.roomId;

console.log("\n2. Rahul joins with a Lowercase code");
console.log(" ack:", await emitAck(rahul,"join_room", {roomId:code.toLowerCase(), username:"Rahule"}));
await wait(200);

console.log("\n3. Join a room that does not exist");
console.log("   ack:", await emitAck(aman, "join_room", { roomId: "ZZZZZZ", username: "Aman" }));

console.log("\n4. Join with an empty username");
console.log("   ack:", await emitAck(aman, "join_room", { roomId: code, username: "   " }));

console.log("\n5. Aman joins properly");
await emitAck(aman, "join_room", { roomId: code, username: "Aman" });
await wait(200);

console.log("\n6. Host (Komal) leaves, so Rahul should become host");
await emitAck(komal, "leave_room");
await wait(300);

console.log("\n7. Aman's connection closes (like closing a tab)");
aman.disconnect();
await wait(300);

console.log("\n8. Rahul (last person) leaves, so the room is deleted");
await emitAck(rahul, "leave_room");
console.log("   ack when joining the deleted room:", await emitAck(rahul, "join_room", { roomId: code, username: "Rahul" }));

komal.close();
rahul.close();
process.exit(0);
