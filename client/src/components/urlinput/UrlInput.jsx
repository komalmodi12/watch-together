import { useState } from "react";
import { extractVideoId } from "../../utils/youtube";
import { useSocket } from "../../context/SocketContext";
import Button from "../button/Button";
import styles from "./UrlInput.module.css";

function UrlInput() {
  const { canControl, changeVideo, requestAction } = useSocket();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const videoId = extractVideoId(url);
    if (!videoId) return setError("Paste a valid YouTube link");

    setLoading(true);
    setError("");
    // Host/Moderator change the video directly. A participant sends a request instead.
    const res = canControl
      ? await changeVideo(videoId)
      : await requestAction({ type: "change_video", videoId });
    setLoading(false);

    if (!res.ok) return setError(res.message);
    setUrl("");
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder={
          canControl
            ? "Paste a YouTube link to change the video"
            : "Paste a YouTube link to request a video change"
        }
      />
      <Button type="submit" disabled={loading || !url.trim()}>
        {loading
          ? canControl ? "Changing..." : "Sending..."
          : canControl ? "Change video" : "Request change"}
      </Button>
      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
}

export default UrlInput;