import { Users } from "lucide-react";
import styles from "./WatchPartyCard.module.css";
import Button from "../button/Button";

function WatchPartyCard({ onCreate, onJoin }) {
  return (
    <section className={styles.card}>
      <h3 className={styles.title}>
        <Users size={26} color="#a78bfa" /> Your Watch Party
      </h3>
      <p className={styles.text}>Join or create a Watch Party to enjoy videos together!</p>
      <Button variant="primary" fullWidth onClick={onCreate}>Create Room</Button>
     
      <Button variant="outline" fullWidth onClick={() => onJoin()}>Join Room</Button>
    </section>
  );
}

export default WatchPartyCard;