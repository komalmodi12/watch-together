import styles from "./Chip.module.css";

function Chip({ label, active, onClick }) {
  return (
    <button className={`${styles.chip} ${active ? styles.active : ""}`} onClick={onClick}>
      {label}
    </button>
  );
}

export default Chip;