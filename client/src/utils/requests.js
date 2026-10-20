import { formatTime } from "./time";


export function describeRequest(r) {
  switch (r.type) {
    case "play":         return "play the video";
    case "pause":        return "pause the video";
    case "seek":         return `jump to ${formatTime(r.time)}`;
    case "change_video": return "change the video";
    default:             return "do something";
  }
}