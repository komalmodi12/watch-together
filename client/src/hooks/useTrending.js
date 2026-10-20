import { useEffect, useState } from "react";
import { fetchTrending } from "../utils/api";
import {
  videos as sampleVideos,
  shorts as sampleShorts,
  trending as sampleTrending,
} from "../data/mockData";

const FEED_VIDEOS = 6; 
const SIDE_VIDEOS = 5;


export default function useTrending() {
  const [live, setLive] = useState(null); 

  useEffect(() => {
    let cancelled = false; 

    fetchTrending()
      .then((data) => {
        if (!cancelled) setLive(data);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const liveVideos = live?.videos ?? [];
  const side = liveVideos.slice(FEED_VIDEOS, FEED_VIDEOS + SIDE_VIDEOS);

  return {
    videos: liveVideos.length ? liveVideos.slice(0, FEED_VIDEOS) : sampleVideos,
    shorts: live?.shorts?.length ? live.shorts : sampleShorts,
    trending: side.length ? side : sampleTrending,
  };
}