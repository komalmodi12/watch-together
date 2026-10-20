import styles from "./ShortsRow.module.css";
import ShortCard from "../shortcard/ShortCard";
import { shorts } from "../../data/mockData";

function ShortsRow() {
  return (
    <div className={styles.row}>
      {shorts.map((s) => (
        <ShortCard key={s.id} short={s} />
      ))}
    </div>
  );
}

export default ShortsRow;