import { useCallback, useEffect, useRef, useState } from "react";
import { loadYouTubeApi } from "../../utils/youtubeApi";
import { useSocket } from "../../context/SocketContext";
import Button from "../button/Button";
import PlayerControls from "../playercontrols/PlayerControls";
import styles from "./YouTubePlayer.module.css";


const PLAYING = 1;
const BUFFERING = 3;

const EVENT_DRIFT = 1;      
const PERIODIC_DRIFT = 2; 
const DRIFT_CHECK_MS = 5000;
const AUTOPLAY_CHECK_MS = 1500;

function errorMessage(code) {
  if (code === 101 || code === 150) {
    return "The owner of this video does not allow it to be played here. Ask the host to pick another video.";
  }
  if (code === 100) return "This video was removed or is private.";
  if (code === 2) return "This video link is invalid.";
  return "Something went wrong while playing this video.";
}


function expectedTime(vs) {
  if (vs.playState !== "playing") return vs.currentTime;
  return vs.currentTime + (Date.now() - vs.receivedAt) / 1000;
}

function YouTubePlayer() {
  const { videoState, canControl, play, pause, seek, requestAction} = useSocket();

  const boxRef = useRef(null);
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const initialId = useRef(videoState?.videoId); 
  const loadedId = useRef(videoState?.videoId); 
  const stateRef = useRef(videoState); 
  const blockTimer = useRef(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState(false); 
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [muted, setMuted] = useState(false);

  
  useEffect(() => {
    let cancelled = false;
    let player = null;

   
    const mount = document.createElement("div");
    hostRef.current.appendChild(mount);

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled) return;
        player = new YT.Player(mount, {
          videoId: initialId.current,
          width: "100%",
          height: "100%",
          playerVars: {
            controls: 0, 
            disablekb: 1,  
            fs: 0,
            modestbranding: 1,
            iv_load_policy: 3, 
            rel: 0,
            playsinline: 1,
          },
          events: {
            onReady: (e) => {
              if (cancelled) return;
              setVolume(e.target.getVolume());
              setMuted(e.target.isMuted());
              setReady(true);
            },
            onError: (e) => setError(errorMessage(e.data)),
          },
        });
        playerRef.current = player;
        window.__ytPlayer = player; 
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load the YouTube player. Check your internet connection or ad blocker.");
        }
      });

    return () => {
      cancelled = true;
      clearTimeout(blockTimer.current);
      if (player) player.destroy();
      playerRef.current = null;
    };
  }, []);

  
  const applyState = useCallback(() => {
    const player = playerRef.current;
    const vs = stateRef.current;
    if (!player || !vs) return;

    const target = expectedTime(vs);

    
    if (loadedId.current !== vs.videoId) {
      loadedId.current = vs.videoId;
      setError("");
      setBlocked(false);
      const args = { videoId: vs.videoId, startSeconds: target };
      if (vs.playState === "playing") player.loadVideoById(args); 
      else player.cueVideoById(args);                             
      return;
    }

    
    const needSeek = Math.abs(player.getCurrentTime() - target) > EVENT_DRIFT;

    if (vs.playState === "playing") {
      if (needSeek) player.seekTo(target, true);

      const s = player.getPlayerState();
      if (s !== PLAYING && s !== BUFFERING) player.playVideo();

      clearTimeout(blockTimer.current);
      blockTimer.current = setTimeout(() => {
        const st = playerRef.current?.getPlayerState();
        if (stateRef.current?.playState === "playing" && st !== PLAYING && st !== BUFFERING) {
          setBlocked(true);
        }
      }, AUTOPLAY_CHECK_MS);
    } else {
      clearTimeout(blockTimer.current);
      setBlocked(false);
      if (needSeek) player.seekTo(target, true);
      
      player.pauseVideo();
    }
  }, []);

 
  useEffect(() => {
    stateRef.current = videoState;
    if (ready) applyState();
  }, [ready, videoState, applyState]);

  
  useEffect(() => {
    if (!ready) return;
    const id = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      setCurrent(p.getCurrentTime());
      setDuration(p.getDuration());
      if (p.getPlayerState() === PLAYING) setBlocked(false); 
    }, 500);
    return () => clearInterval(id);
  }, [ready]);

 
  useEffect(() => {
    if (!ready) return;
    const id = setInterval(() => {
      const p = playerRef.current;
      const vs = stateRef.current;
      if (!p || !vs || vs.playState !== "playing") return;
      if (loadedId.current !== vs.videoId) return;  
      if (p.getPlayerState() !== PLAYING) return; 

      const want = expectedTime(vs);
      if (Math.abs(p.getCurrentTime() - want) > PERIODIC_DRIFT) p.seekTo(want, true);
    }, DRIFT_CHECK_MS);
    return () => clearInterval(id);
  }, [ready]);

 
    const handleTogglePlay = () => {
    const p = playerRef.current;
    if (!ready || !p || !videoState) return;
    const playing = videoState.playState === "playing";

    if (!canControl) {
      // A participant can only ASK. Nothing changes until a host or moderator approves.
      requestAction({ type: playing ? "pause" : "play" });
      return;
    }

    const t = p.getCurrentTime();
    if (playing) pause(t);
    else play(t);
  };

  const handleSeek = (time) => {
    if (!canControl) {
      requestAction({ type: "seek", time }); // the bar snaps back within half a second
      return;
    }
    setCurrent(time);
    seek(time);
  };
  const handleVolume = (v) => {
    const p = playerRef.current;
    if (!p) return;
    p.setVolume(v);
    if (v > 0 && muted) {
      p.unMute();
      setMuted(false);
    }
    setVolume(v);
  };

  const handleToggleMute = () => {
    const p = playerRef.current;
    if (!p) return;
    if (muted) p.unMute();
    else p.mute();
    setMuted(!muted);
  };

  const handleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else boxRef.current?.requestFullscreen?.();
  };

  
  const handleJoinPlayback = () => {
    setBlocked(false);
    applyState();
  };

  return (
    <div className={styles.box} ref={boxRef}>
      <div ref={hostRef} className={styles.host} />

      
      <div className={styles.shield} />

      {ready && !error && (
        <PlayerControls
          playing={videoState?.playState === "playing"}
          current={current}
          duration={duration}
          canControl={canControl}
          volume={volume}
          muted={muted}
          onTogglePlay={handleTogglePlay}
          onSeek={handleSeek}
          onVolume={handleVolume}
          onToggleMute={handleToggleMute}
          onFullscreen={handleFullscreen}
        />
      )}

      {!ready && !error && <div className={styles.overlay}>Loading player...</div>}
      {error && <div className={styles.overlay}>{error}</div>}
      {blocked && !error && (
        <div className={styles.overlay}>
          <div>
            <p className={styles.blockedText}>Your browser blocked autoplay.</p>
            <Button onClick={handleJoinPlayback}>Click to join playback</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default YouTubePlayer;