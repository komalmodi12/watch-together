import { io } from "socket.io-client";

const URL = "http://localhost:5000";

// Only sockets created with log=true print what they receive
const connect = (name, log = false) =>
  new Promise((resolve) => {
    const s = io(URL);
    s.on("connect", () => resolve(s));
    if (log) {
      s.onAny((event, data) => {
        let info = "";
        if (event === "chat_message") info = `${data.username}: "${data.text}"`;
        else if (event === "chat_history") info = `${data.length} old messages`;
        else if (event === "error_message") info = data.message;
        else return; // ignore user_joined, sync_state, etc.
        console.log(`      [${name}] ${event}: ${info}`);
      });
    }
  });

const emitAck = (socket, event, payload) =>
  new Promise((resolve) => socket.emit(event, payload, resolve));
const wait = (ms = 200) => new Promise((r) => setTimeout(r, ms));
const step = (text) => console.log(`\n${text}`);

const komal = await connect("Komal", true); // observer: prints every chat_message
const rahul = await connect("Rahul");
const aman = await connect("Aman");
const stranger = await connect("Stranger"); // never joins any room

const created = await emitAck(komal, "create_room", { username: "Komal" });
await emitAck(rahul, "join_room", { roomId: created.roomId, username: "Rahul" });
await emitAck(aman, "join_room", { roomId: created.roomId, username: "Aman" });
await wait(300);
console.log("--- setup done: Komal=host, Rahul and Aman=participants ---");

step("1. Rahul (a plain participant) sends a message → allowed");
console.log("   ack:", await emitAck(rahul, "chat_message", { text: "hello everyone" }));
await wait();

step("2. Only spaces → rejected");
console.log("   ack:", await emitAck(rahul, "chat_message", { text: "     " }));

step("3. 501 characters → rejected");
console.log("   ack:", await emitAck(rahul, "chat_message", { text: "x".repeat(501) }));

step("4. text is a number, not a string → rejected");
console.log("   ack:", await emitAck(rahul, "chat_message", { text: 123 }));

step('5. Line breaks and extra spaces are squashed ("a\\n\\n   b")');
await emitAck(rahul, "chat_message", { text: "a\n\n   b" });
await wait();

step("6. Rahul tries to impersonate Komal (fake username and userId in the payload)");
await emitAck(rahul, "chat_message", {
  text: "I am the host",
  username: "Komal",
  userId: created.userId,
});
await wait();

step("7. Aman sends 6 messages quickly → the 6th must be blocked");
for (let i = 1; i <= 6; i++) {
  const res = await emitAck(aman, "chat_message", { text: `spam ${i}` });
  console.log(`   message ${i}:`, res.ok ? "ok" : res.message);
}
await wait();

step("8. A socket that never joined a room tries to chat");
console.log("   ack:", await emitAck(stranger, "chat_message", { text: "hi" }));

step("9. Zoya joins late → she should get the old messages");
const zoya = await connect("Zoya", true);
await emitAck(zoya, "join_room", { roomId: created.roomId, username: "Zoya" });
await wait(300);

[komal, rahul, aman, stranger, zoya].forEach((s) => s.close());
process.exit(0);