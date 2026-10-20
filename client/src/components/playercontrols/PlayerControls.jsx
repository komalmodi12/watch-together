import { useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import styles from "./PlayerControls.module.css";
import { formatTime } from "../../utils/time";



function PlayerControls({
  playing, current, duration, canControl, volume, muted,
  onTogglePlay, onSeek, onVolume, onToggleMute, onFullscreen,
}) {
  
  const [scrub, setScrub] = useState(null); 

  const shown = scrub ?? current;
  const pct = duration > 0 ? Math.min(100, (shown / duration) * 100) : 0;
  const askTip = canControl ? "" : " (sends a request to the host)";

  const commit = () => {
    if (scrub === null) return;
    onSeek(scrub);
    setScrub(null);
  };

  return (
    <div className={styles.bar}>
      <button
        className={styles.btn}
        onClick={onTogglePlay}
      
        title={(playing ? "Pause" : "Play") + askTip}
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? <Pause size={20} /> : <Play size={20} />}
      </button>

      <span className={styles.time}>
        {formatTime(shown)} / {formatTime(duration)}
      </span>

      <input
        type="range"
        className={`${styles.range} ${styles.seek}`}
        style={{ "--pct": `${pct}%` }}
        min={0}
        max={duration || 0}
        step={0.1}
        value={shown}
        disabled={!duration}
        title={canControl ? undefined : "Drag to ask the host to jump here"}
        onChange={(e) => setScrub(Number(e.target.value))}
        onPointerUp={commit} 
        onKeyUp={commit}    
      />

     
      <button
        className={styles.btn}
        onClick={onToggleMute}
        title={muted ? "Unmute" : "Mute"}
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
      <input
        type="range"
        className={`${styles.range} ${styles.volume}`}
        style={{ "--pct": `${muted ? 0 : volume}%` }}
        min={0}
        max={100}
        value={muted ? 0 : volume}
        aria-label="Volume"
        onChange={(e) => onVolume(Number(e.target.value))}
      />
      <button className={styles.btn} onClick={onFullscreen} title="Fullscreen" aria-label="Fullscreen">
        <Maximize size={18} />
      </button>
    </div>
  );
}

export default PlayerControls;