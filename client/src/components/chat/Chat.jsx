import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import ChatMessage from "../chatmessage/ChatMessage";
import styles from "./Chat.module.css";

const MAX_LENGTH = 500; // keep in sync with the server

function Chat({ messages, meId, onSend }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);
  const stickToBottom = useRef(true); // true = follow new messages

  // If the user scrolled up to read old messages, don't yank them down.
  // "Near the bottom" (within 80px) means they want to follow the chat.
  const handleScroll = () => {
    const el = listRef.current;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  useEffect(() => {
    const el = listRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clean = text.trim();
    if (!clean || sending) return;

    stickToBottom.current = true; // my own message should always scroll into view
    setSending(true);
    const res = await onSend(clean);
    setSending(false);

    if (res.ok) setText(""); // on failure (spam, no connection) the text stays so it can be resent
  };

  return (
    <section className={styles.chat}>
      <h3 className={styles.title}>Chat</h3>

      <div className={styles.list} ref={listRef} onScroll={handleScroll}>
        {messages.length === 0 ? (
          <p className={styles.empty}>No messages yet. Say hi 👋</p>
        ) : (
          messages.map((m, i) => (
            <ChatMessage
              key={m.id}
              message={m}
              isMe={m.userId === meId}
              // show the name only when the sender changes, like WhatsApp groups
              showName={i === 0 || messages[i - 1].userId !== m.userId}
            />
          ))
        )}
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_LENGTH}
          placeholder="Type a message..."
          aria-label="Chat message"
        />
        {/* Only the BUTTON is disabled while sending. Disabling the input would drop its focus. */}
        <button
          type="submit"
          className={styles.send}
          disabled={sending || !text.trim()}
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </form>

      {text.length > 400 && (
        <span className={styles.counter}>
          {text.length}/{MAX_LENGTH}
        </span>
      )}
    </section>
  );
}

export default Chat;