import styles from "./IconButton.module.css";

function IconButton({ children, label, onClick }) {
  return (
    <button className={styles.btn} onClick={onClick} aria-label={label} title={label}>
      {children}
    </button>
  );
}

export default IconButton;