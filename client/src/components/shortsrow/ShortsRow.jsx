import styles from "./ShortsRow.module.css";
import ShortCard from "../shortcard/ShortCard";
import useTrending from "../../hooks/useTrending";

function ShortsRow() {
  const { shorts } = useTrending();

  return (
    <div className={styles.row}>
      {shorts.map((s) => (
        <ShortCard key={s.id} short={s} />
      ))}
    </div>
  );
}

export default ShortsRow;