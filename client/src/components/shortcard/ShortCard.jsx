import styles from "./ShortCard.module.css";

function ShortCard({ short }) {
  // Real YouTube content has a thumbnail. The sample data only has a gradient (bg).
  const hasImage = Boolean(short.thumbnail);

  return (
    <article className={styles.card} style={hasImage ? undefined : { background: short.bg }}>
      {hasImage && <img className={styles.thumb} src={short.thumbnail} alt="" loading="lazy" />}
      <div className={styles.info}>
        <h4 className={styles.title}>{short.title}</h4>
        <span className={styles.views}>{short.views}</span>
      </div>
    </article>
  );
}

export default ShortCard;