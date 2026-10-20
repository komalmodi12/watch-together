import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../modal/Modal";
import Button from "../button/Button";
import { useSocket } from "../../context/SocketContext";
import styles from "../modal/ModalForm.module.css";


function JoinRoomModal({ onClose, initialCode = "" }) {
  const { joinRoom, connected } = useSocket();
  const navigate = useNavigate();

  const [code, setCode] = useState(initialCode);
  const [username, setUsername] = useState(() => localStorage.getItem("wp_username") || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanCode = code.trim().toUpperCase();
    const name = username.trim();
    if (!cleanCode) return setError("Please enter the room code");
    if (!name) return setError("Please enter your name");

    setLoading(true);
    setError("");
    const res = await joinRoom(cleanCode, name);
    setLoading(false);

    if (!res.ok) return setError(res.message); 

    localStorage.setItem("wp_username", name);
    onClose();
    navigate(`/room/${res.roomId}`);
  };

  return (
    <Modal title="Join a Watch Party" onClose={onClose}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label} htmlFor="join-code">Room code</label>
        <input
          id="join-code"
          className={`${styles.input} ${styles.code}`}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={6}
          placeholder="ABC123"
          autoFocus={!initialCode} 
        />

        <label className={styles.label} htmlFor="join-name">Your name</label>
        <input
          id="join-name"
          className={styles.input}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={20}
          placeholder="e.g. Rahul"
          autoFocus={!!initialCode}
        />

        {!connected && <p className={styles.error}>Connecting to server...</p>}
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <Button type="submit" fullWidth disabled={loading || !connected}>
            {loading ? "Joining..." : "Join Room"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default JoinRoomModal;