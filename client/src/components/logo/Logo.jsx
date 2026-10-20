import styles from "./Logo.module.css";

function Logo() {
  return (
    <div className={styles.logo}>
      
      <svg width="32" height="22" viewBox="0 0 32 22" aria-hidden="true">
        <rect width="32" height="22" rx="6" fill="#ff0000" />
        <path d="M13 6.5 L21 11 L13 15.5 Z" fill="#fff" />
      </svg>
      <span className={styles.text}>WatchTogether</span>
    </div>
  );
}

export default Logo;