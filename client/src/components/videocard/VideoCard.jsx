import { BadgeCheck } from "lucide-react";
import styles from "./VideoCard.module.css";
import VideoActions from "../videoactions/VideoActions";

function VideoCard({ video }) {
  return (
    <article className={styles.card}>
      <div className={styles.thumb} style={{ background: video.bg }}>
        <span className={styles.duration}>{video.duration}</span>
      </div>

      <div className={styles.info}>
        <h3 className={styles.title}>{video.title}</h3>
        <p className={styles.channel}>
          {video.channel} <BadgeCheck size={14} />
        </p>
        <p className={styles.meta}>
          {video.views} • {video.age}
        </p>
        <VideoActions likes={video.likes} />
      </div>
    </article>
  );
}

export default VideoCard;