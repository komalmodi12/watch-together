import styles from "./TrendingItem.module.css";

function TrendingItem({ item }) {
  return (
    <div className={styles.item}>
      <div className={styles.thumb} style={{ background: item.bg }} />
      <div className={styles.info}>
        <strong className={styles.title}>{item.title}</strong>
        <span>{item.channel}</span>
        <span>{item.views}</span>
      </div>
    </div>
  );
}

export default TrendingItem;