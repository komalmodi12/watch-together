const API = "https://www.googleapis.com/youtube/v3";

const CACHE_MS = 6 * 60 * 60 * 1000; // refresh at most every 6 hours, to protect the daily quota
const RETRY_MS = 5 * 60 * 1000;      // after a failed refresh, wait 5 minutes before trying again
const MAX_SHORT_SECONDS = 180;       // Shorts can be up to 3 minutes long

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

/* ---------- Small helpers ---------- */

// YouTube sends durations like "PT1H2M5S". Live streams send "P0D", which gives 0.
export function parseDuration(iso) {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso || "");
  if (!m) return 0;
  return (Number(m[1]) || 0) * 3600 + (Number(m[2]) || 0) * 60 + (Number(m[3]) || 0);
}

export function formatDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = String(totalSeconds % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

export function timeAgo(iso, now = Date.now()) {
  const seconds = Math.max(0, (now - new Date(iso).getTime()) / 1000);
  const units = [
    ["year", 31536000], ["month", 2592000], ["week", 604800],
    ["day", 86400], ["hour", 3600], ["minute", 60],
  ];
  for (const [name, size] of units) {
    const n = Math.floor(seconds / size);
    if (n >= 1) return `${n} ${name}${n > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

// Only public videos that the owner allows to be embedded can play in our Room page
export const isPlayable = (item) =>
  item.status?.embeddable === true && item.status?.privacyStatus === "public";

// Turn one YouTube item into the shape our React cards already use
export function toCard(item) {
  const { snippet, contentDetails, statistics } = item;
  const seconds = parseDuration(contentDetails?.duration);
  const thumbs = snippet.thumbnails || {};

  return {
    id: item.id,
    videoId: item.id,
    title: snippet.title,
    channel: snippet.channelTitle,
    views: statistics?.viewCount ? `${compact.format(Number(statistics.viewCount))} views` : "",
    likes: statistics?.likeCount ? compact.format(Number(statistics.likeCount)) : "Like", // owners can hide likes
    age: timeAgo(snippet.publishedAt),
    duration: formatDuration(seconds),
    seconds,
    thumbnail:
      (thumbs.high || thumbs.medium || thumbs.default)?.url ||
      `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
  };
}

async function callYouTube(path, params, apiKey) {
  const url = new URL(`${API}/${path}`);
  for (const [key, value] of Object.entries({ ...params, key: apiKey })) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) {
    // Log Google's own message only. NEVER log the URL: it contains the API key.
    const body = await res.json().catch(() => ({}));
    throw new Error(`YouTube API ${res.status}: ${body.error?.message || "request failed"}`);
  }
  return res.json();
}

/* ---------- The service ---------- */

export class YouTubeService {
  constructor({ apiKey, region = "IN" }) {
    this.apiKey = apiKey;
    this.region = region;
    this.cache = null;     // { data: { videos, shorts }, fetchedAt }
    this.inflight = null;  // a refresh that is already running
    this.failedAt = null;  // when the last refresh failed
  }

  get enabled() {
    return Boolean(this.apiKey);
  }

  async getFeed() {
    if (!this.enabled) throw new Error("YOUTUBE_API_KEY is not set");

    // 1. Fresh cache: no API call at all
    if (this.cache && Date.now() - this.cache.fetchedAt < CACHE_MS) return this.cache.data;

    // 2. Just failed (for example the daily quota ran out): do not hammer the API.
    //    Even a failed request costs quota, so wait before trying again.
    if (this.failedAt && Date.now() - this.failedAt < RETRY_MS) {
      if (this.cache) return this.cache.data;
      throw new Error("YouTube API is unavailable right now");
    }

    // 3. Many visitors arriving together share ONE refresh
    if (!this.inflight) {
      this.inflight = this._refresh().finally(() => {
        this.inflight = null;
      });
    }

    try {
      return await this.inflight;
    } catch (err) {
      if (this.cache) return this.cache.data; // serve the old data instead of nothing
      throw err;
    }
  }

  async _refresh() {
    // allSettled: if Shorts fail, the trending videos can still be shown
    const [trending, shorts] = await Promise.allSettled([this._trending(), this._shorts()]);

    for (const r of [trending, shorts]) {
      if (r.status === "rejected") console.error("YouTube feed:", r.reason.message);
    }

    if (trending.status === "rejected" && shorts.status === "rejected") {
      this.failedAt = Date.now();
      throw trending.reason;
    }

    this.failedAt = null;
    const old = this.cache?.data;
    const data = {
      videos: trending.status === "fulfilled" ? trending.value : old?.videos ?? [],
      shorts: shorts.status === "fulfilled" ? shorts.value : old?.shorts ?? [],
    };
    this.cache = { data, fetchedAt: Date.now() };
    return data;
  }

  // Costs 1 quota unit
  async _trending() {
    const json = await callYouTube(
      "videos",
      {
        part: "snippet,contentDetails,statistics,status",
        chart: "mostPopular",
        regionCode: this.region,
        maxResults: 50,
      },
      this.apiKey
    );

    return (json.items || [])
      .filter(isPlayable)
      .map(toCard)
      .filter((v) => v.seconds > 0) // drops live streams
      .slice(0, 20);
  }

  // Costs about 101 quota units (search is the expensive one, which is why we cache)
  async _shorts() {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const search = await callYouTube(
      "search",
      {
        part: "snippet",
        type: "video",
        q: "#shorts",
        videoDuration: "short",   // under 4 minutes
        videoEmbeddable: "true",
        order: "viewCount",
        publishedAfter: weekAgo,  // popular THIS week, not popular ten years ago
        regionCode: this.region,
        maxResults: 25,
      },
      this.apiKey
    );

    const ids = (search.items || []).map((i) => i.id?.videoId).filter(Boolean);
    if (ids.length === 0) return [];

    // search results have no duration or view count, so ask for those (1 unit)
    const details = await callYouTube(
      "videos",
      { part: "snippet,contentDetails,statistics,status", id: ids.join(",") },
      this.apiKey
    );

    return (details.items || [])
      .filter(isPlayable)
      .map(toCard)
      .filter((v) => v.seconds > 0 && v.seconds <= MAX_SHORT_SECONDS)
      .slice(0, 12);
  }
}

export const youtubeService = new YouTubeService({
  apiKey: process.env.YOUTUBE_API_KEY,
  region: process.env.YOUTUBE_REGION || "IN",
});