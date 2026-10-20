import styles from "./TrendingItem.module.css";

function TrendingItem({ item }) {
  const hasImage = Boolean(item.thumbnail);

  return (
    <div className={styles.item}>
      <div className={styles.thumb} style={hasImage ? undefined : { background: item.bg }}>
        {hasImage && <img className={styles.img} src={item.thumbnail} alt="" loading="lazy" />}
      </div>
      <div className={styles.info}>
        <strong className={styles.title}>{item.title}</strong>
        <span>{item.channel}</span>
        <span>{item.views}</span>
      </div>
    </div>
  );
}

export default TrendingItem;