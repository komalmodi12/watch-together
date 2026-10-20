import { useState } from "react";
import { Copy, Check, Link2, LogOut } from "lucide-react";
import Button from "../button/Button";
import styles from "./RoomHeader.module.css";

function RoomHeader({ roomId, onLeave }) {
  const [copied, setCopied] = useState("");

  const copy = async (text, which) => {
    try {
      await navigator.clipboard.writeText(text); 
      setCopied(which);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      
    }
  };

  
  const link = `${window.location.origin}/room/${roomId}`;

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.title}>Watch Party</h1>
        <span className={styles.code}>{roomId}</span>

        <button className={styles.copyBtn} onClick={() => copy(roomId, "code")}>
          {copied === "code" ? <Check size={16} /> : <Copy size={16} />}
          {copied === "code" ? "Copied" : "Copy code"}
        </button>
        <button className={styles.copyBtn} onClick={() => copy(link, "link")}>
          {copied === "link" ? <Check size={16} /> : <Link2 size={16} />}
          {copied === "link" ? "Copied" : "Copy link"}
        </button>
      </div>

      <Button variant="danger" icon={<LogOut size={16} />} onClick={onLeave}>
        Leave
      </Button>
    </header>
  );
}

export default RoomHeader;