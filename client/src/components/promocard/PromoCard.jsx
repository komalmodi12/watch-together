import styles from "./PromoCard.module.css";

function PromoCard() {
  return (
    <section className={styles.card}>
      <svg width="48" height="34" viewBox="0 0 32 22" aria-hidden="true">
        <rect width="32" height="22" rx="6" fill="#ff0000" />
        <path d="M13 6.5 L21 11 L13 15.5 Z" fill="#fff" />
      </svg>
      <h3>Watch Party Together is Better!</h3>
    </section>
  );
}

export default PromoCard;