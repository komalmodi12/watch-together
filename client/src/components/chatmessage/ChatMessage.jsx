import styles from "./ChatMessage.module.css";

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// {message.text} is plain text: React escapes it, so "<script>" typed by a user is shown
// as text and never runs. That is why we never use dangerouslySetInnerHTML.
function ChatMessage({ message, isMe, showName }) {
  return (
    <div className={`${styles.msg} ${isMe ? styles.me : ""}`}>
      {showName && !isMe && <span className={styles.name}>{message.username}</span>}
      <div className={styles.bubble}>
        <span className={styles.text}>{message.text}</span>
        <span className={styles.time}>{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
}

export default ChatMessage;