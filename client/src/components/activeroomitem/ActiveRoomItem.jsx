import { Users } from "lucide-react";
import styles from "./ActiveRoomItem.module.css";

function ActiveRoomItem({ room, onJoin }) {
  return (
    <div className={styles.item}>
      <div className={styles.row}>
        <div className={styles.thumb} style={{ background: room.bg }} />
        <div className={styles.info}>
          <strong>{room.roomId}</strong>
          <span className={styles.count}>
            <Users size={14} /> {room.watching} watching
          </span>
        </div>
        <span className={styles.live}>Live</span>
      </div>
     
      <button className={styles.join} onClick={() => onJoin(room.roomId)}>
        Join
      </button>
    </div>
  );
}

export default ActiveRoomItem;
