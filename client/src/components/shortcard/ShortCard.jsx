import styles from "./ShortCard.module.css";

function ShortCard({ short }) {
  return (
    <article className={styles.card} style={{ background: short.bg }}>
      <div className={styles.info}>
        <h4 className={styles.title}>{short.title}</h4>
        <span className={styles.views}>{short.views}</span>
      </div>
    </article>
  );
}

export default ShortCard;