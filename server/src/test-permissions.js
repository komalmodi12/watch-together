import { io } from "socket.io-client";
const URL = "http://localhost:5000";

const connect = (name) =>
  new Promise((resolve) => {
    const s = io(URL);
    s.on("connect", () => resolve(s));
    s.onAny((event, data) => {
      let info = "";
      if (event === "sync_state") info = `${data.playState} @ ${data.currentTime.toFixed(0)}s, video ${data.videoId}`;
      else if (event === "error_message") info = data.message;
      else if (event === "role_assigned") info = `${data.username} is now ${data.role}`;
      else if (event === "participant_removed") info = `${data.username} removed`;
      else info = data.username || "";
      console.log(`      [${name}] ${event}: ${info}`);
    });
  });

  const emitAck = (socket, event, payload) =>
  new Promise((resolve) => socket.emit(event, payload, resolve));
const wait = (ms = 200) => new Promise((r) => setTimeout(r, ms));
const step = (text) => console.log(`\n${text}`);

const komal = await connect("Komal");
const rahul = await connect("Rahul");
const aman = await connect("Aman");

const created = await emitAck(komal, "create_room", { username: "Komal" });
const rahulJoin = await emitAck(rahul, "join_room", { roomId: created.roomId, username: "Rahul" });
const amanJoin = await emitAck(aman, "join_room", { roomId: created.roomId, username: "Aman" });
await wait(300);
console.log("--- setup done: Komal=host, Rahul=participant, Aman=participant ---");

step("1. Rahul (participant) tries PLAY → must be DENIED, nobody else gets anything");
console.log("   ack:", await emitAck(rahul, "play", {}));
await wait();

step("2. Komal (host) PLAY at 10s → everyone gets sync_state");
await emitAck(komal, "play", { currentTime: 10 });
await wait();

step("3. Rahul tries CHANGE_VIDEO → DENIED");
console.log("   ack:", await emitAck(rahul, "change_video", { videoId: "9bZkp7q19f0" }));
await wait();

step("4. Komal promotes Rahul to moderator → role_assigned to all");
await emitAck(komal, "assign_role", { userId: rahulJoin.userId, role: "moderator" });
await wait();

step("5. Rahul (moderator) SEEK to 60s → allowed");
await emitAck(rahul, "seek", { time: 60 });
await wait();

step("6. Rahul sends garbage: seek 'abc', video id 'hello'");
console.log("   seek ack:  ", await emitAck(rahul, "seek", { time: "abc" }));
console.log("   video ack: ", await emitAck(rahul, "change_video", { videoId: "hello" }));

step("7. Rahul CHANGE_VIDEO with a valid id → video changes, paused at 0");
await emitAck(rahul, "change_video", { videoId: "9bZkp7q19f0" });
await wait();

step("8. Rahul (moderator) tries ASSIGN_ROLE and REMOVE → both DENIED (host only)");
console.log("   assign ack:", await emitAck(rahul, "assign_role", { userId: amanJoin.userId, role: "moderator" }));
console.log("   remove ack:", await emitAck(rahul, "remove_participant", { userId: amanJoin.userId }));
await wait();

step("9. Komal tries to demote herself and to remove herself");
console.log("   assign ack:", await emitAck(komal, "assign_role", { userId: created.userId, role: "participant" }));
console.log("   remove ack:", await emitAck(komal, "remove_participant", { userId: created.userId }));

step("10. Komal REMOVES Aman → everyone incl. Aman gets participant_removed");
await emitAck(komal, "remove_participant", { userId: amanJoin.userId });
await wait();

step("11. Aman (now kicked) tries PLAY → DENIED, and he receives no more room events");
console.log("   ack:", await emitAck(aman, "play", {}));
await wait();

step("12. Komal TRANSFERS host to Rahul");
await emitAck(komal, "transfer_host", { userId: rahulJoin.userId });
await wait();

step("13. Komal (now moderator) can still PAUSE but cannot REMOVE");
console.log("   pause ack: ", await emitAck(komal, "pause", {}));
console.log("   remove ack:", await emitAck(komal, "remove_participant", { userId: rahulJoin.userId }));
await wait();

komal.close(); rahul.close(); aman.close();
process.exit(0);



