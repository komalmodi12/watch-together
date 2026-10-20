const VIDEO_ID_REGEX = /^[A-Za-z0-9_-]{11}$/; // every YouTube video id is exactly 11 chars

export const isValidVideoId = (id) => typeof id === "string" && VIDEO_ID_REGEX.test(id);
export const isValidTime = (t) => typeof t === "number" && Number.isFinite(t) && t >= 0;