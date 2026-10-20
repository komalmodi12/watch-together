import { io } from "socket.io-client";

const URL = "http://localhost:5000";

const connect = () =>
  new Promise((resolve) => {
    const s = io(URL);
    s.on("connect", () => resolve(s));
  });
const emitAck = (socket, event, payload) =>
  new Promise((resolve) => socket.emit(event, payload, resolve));
const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const step = (text) => console.log(`\n${text}`);

const seen = {}; // the latest approval_requests each watched user received

// Attached AFTER setup, so the join noise is not printed
function watch(name, socket) {
  socket.on("approval_requests", (list) => {
    seen[name] = list;
    const who = list.map((r) => `${r.username} wants ${r.type}`).join(", ");
    console.log(`      [${name}] approval_requests: ${list.length} pending${who ? ": " + who : ""}`);
  });
  socket.on("request_result", (d) =>
    console.log(`      [${name}] request_result: ${d.approved ? "APPROVED" : "REJECTED"} your ${d.type} request (by ${d.by})`)
  );
  socket.on("sync_state", (d) =>
    console.log(`      [${name}] sync_state: ${d.playState} @ ${d.currentTime.toFixed(0)}s, video ${d.videoId}`)
  );
  socket.on("role_assigned", (d) =>
    console.log(`      [${name}] role_assigned: ${d.username} is now ${d.role}`)
  );
}

const komal = await connect();
const rahul = await connect();
const aman = await connect();
const zoya = await connect();

const created = await emitAck(komal, "create_room", { username: "Komal" });
const rahulJoin = await emitAck(rahul, "join_room", { roomId: created.roomId, username: "Rahul" });
await emitAck(aman, "join_room", { roomId: created.roomId, username: "Aman" });
const zoyaJoin = await emitAck(zoya, "join_room", { roomId: created.roomId, username: "Zoya" });
await wait(300);

watch("Komal", komal);
watch("Rahul", rahul);
watch("Aman", aman);
console.log("--- setup done: Komal=host, Rahul, Aman, Zoya = participants (Zoya is not watched) ---");

step("1. Rahul asks to PLAY");
console.log("   ack:", await emitAck(rahul, "request_action", { type: "play" }));
await wait();

step("2. Aman asks to SEEK to 90s");
console.log("   ack:", await emitAck(aman, "request_action", { type: "seek", time: 90 }));
await wait();

step("3. Komal (host) tries to send a request");
console.log("   ack:", await emitAck(komal, "request_action", { type: "play" }));
await wait();

step("4. Rahul sends garbage: unknown type, seek 'abc', video id 'hello'");
console.log("   ack:", await emitAck(rahul, "request_action", { type: "fly" }));
console.log("   ack:", await emitAck(rahul, "request_action", { type: "seek", time: "abc" }));
console.log("   ack:", await emitAck(rahul, "request_action", { type: "change_video", videoId: "hello" }));
await wait();

step("5. Rahul asks for a video change (replaces his play request), then asks again at once");
await wait(1100); // let the 1s cooldown from step 1 pass
console.log("   ack:", await emitAck(rahul, "request_action", { type: "change_video", videoId: "9bZkp7q19f0" }));
console.log("   ack:", await emitAck(rahul, "request_action", { type: "pause" }));
await wait();

step("6. Rahul (participant) tries to approve his own request");
console.log("   ack:", await emitAck(rahul, "resolve_request", { requestId: seen.Rahul[0].id, approve: true }));
await wait();

step("7. Komal APPROVES Aman's seek");
const amanReq = seen.Komal.find((r) => r.username === "Aman");
console.log("   ack:", await emitAck(komal, "resolve_request", { requestId: amanReq.id, approve: true }));
await wait();

step("8. Komal REJECTS Rahul's change_video");
const staleId = seen.Komal[0].id;
console.log("   ack:", await emitAck(komal, "resolve_request", { requestId: staleId, approve: false }));
await wait();

step("9. Komal resolves the SAME request again (already handled)");
console.log("   ack:", await emitAck(komal, "resolve_request", { requestId: staleId, approve: true }));
await wait();

step("10. Rahul asks for a video change again, Komal approves");
await wait(1100);
await emitAck(rahul, "request_action", { type: "change_video", videoId: "9bZkp7q19f0" });
await wait();
await emitAck(komal, "resolve_request", { requestId: seen.Komal[0].id, approve: true });
await wait();

step("11. Aman asks to PLAY, then Komal promotes Rahul to moderator");
await emitAck(aman, "request_action", { type: "play" });
await wait();
await emitAck(komal, "assign_role", { userId: rahulJoin.userId, role: "moderator" });
await wait();

step("12. Rahul (moderator) approves Aman's play");
await emitAck(rahul, "resolve_request", { requestId: seen.Rahul[0].id, approve: true });
await wait();

step("13. Zoya asks to PAUSE, then Komal promotes Zoya (her request must vanish)");
await emitAck(zoya, "request_action", { type: "pause" });
await wait();
await emitAck(komal, "assign_role", { userId: zoyaJoin.userId, role: "moderator" });
await wait();

step("14. Aman asks to PAUSE, then closes his tab (his request must vanish)");
await wait(1100);
await emitAck(aman, "request_action", { type: "pause" });
await wait();
aman.close();
await wait(400);

[komal, rahul, zoya].forEach((s) => s.close());
process.exit(0);