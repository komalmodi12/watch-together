import styles from "./ActiveRooms.module.css";
import ActiveRoomItem from "../activeroomitem/ActiveRoomItem";
import { activeRooms } from "../../data/mockData";

function ActiveRooms({ onJoin }) {
  return (
    <section className={styles.card}>
      <h3 className={styles.title}>
        <span className={styles.dot} /> Active Rooms
      </h3>
      {activeRooms.map((room) => (
        <ActiveRoomItem key={room.roomId} room={room} onJoin={onJoin} />
      ))}
    </section>
  );
}

export default ActiveRooms;