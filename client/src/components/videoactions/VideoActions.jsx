import { ThumbsUp, ThumbsDown, Share2, Bookmark, MoreVertical } from "lucide-react";
import styles from "./VideoActions.module.css";

function VideoActions({ likes }) {
  return (
    <div className={styles.actions}>
      <div className={styles.group}>
        <button className={styles.btn}>
          <ThumbsUp size={18} /> {likes}
        </button>
        <button className={styles.btn} aria-label="Dislike">
          <ThumbsDown size={18} />
        </button>
      </div>
      <button className={`${styles.btn} ${styles.pill}`}>
        <Share2 size={18} /> Share
      </button>
      <button className={`${styles.btn} ${styles.pill}`}>
        <Bookmark size={18} /> Save
      </button>
      <button className={styles.btn} aria-label="More">
        <MoreVertical size={18} />
      </button>
    </div>
  );
}

export default VideoActions;