import styles from "./VideoCard.module.css";
import VideoActions from "../videoactions/VideoActions";

function VideoCard({ video }) {
  const hasImage = Boolean(video.thumbnail);
  const meta = [video.views, video.age].filter(Boolean).join(" • "); // skips a missing part

  return (
    <article className={styles.card}>
      <div className={styles.thumb} style={hasImage ? undefined : { background: video.bg }}>
        {hasImage && <img className={styles.img} src={video.thumbnail} alt="" loading="lazy" />}
        <span className={styles.duration}>{video.duration}</span>
      </div>

      <div className={styles.info}>
        <h3 className={styles.title}>{video.title}</h3>
        <p className={styles.channel}>{video.channel}</p>
        <p className={styles.meta}>{meta}</p>
        <VideoActions likes={video.likes} />
      </div>
    </article>
  );
}

export default VideoCard;