import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../modal/Modal";
import Button from "../button/Button";
import { useSocket } from "../../context/SocketContext";
import styles from "../modal/ModalForm.module.css";

function CreateRoomModal({ onClose }) {
  const { createRoom, connected } = useSocket();
  const navigate = useNavigate();

 
  const [username, setUsername] = useState(() => localStorage.getItem("wp_username") || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = username.trim();
    if (!name) return setError("Please enter your name");

    setLoading(true);
    setError("");
    const res = await createRoom(name); 
    setLoading(false);

    if (!res.ok) return setError(res.message); 

    localStorage.setItem("wp_username", name);
    onClose();
    navigate(`/room/${res.roomId}`);
  };

  return (
    <Modal title="Create a Watch Party" onClose={onClose}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label} htmlFor="create-name">Your name</label>
        <input
          id="create-name"
          className={styles.input}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={20}
          placeholder="e.g. Komal"
          autoFocus
        />

        <p className={styles.hint}>You will be the Host of this room.</p>
        {!connected && <p className={styles.error}>Connecting to server...</p>}
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <Button type="submit" fullWidth disabled={loading || !connected}>
            {loading ? "Creating..." : "Create Room"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateRoomModal;