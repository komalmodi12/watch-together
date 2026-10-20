import styles from "./Avatar.module.css";

function Avatar({ letter = "K", size = 36 }) {
  return (
    <div
      className={styles.avatar}
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {letter}
    </div>
  );
}

export default Avatar;