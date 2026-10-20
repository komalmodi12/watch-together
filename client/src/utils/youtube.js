
const ID_REGEX = /^[A-Za-z0-9_-]{11}$/;


export function extractVideoId(input) {
  if (typeof input !== "string") return null;

  const text = input.trim();
  if (ID_REGEX.test(text)) return text; // user pasted just the id

  let url;
  try {
    
    url = new URL(text.startsWith("http") ? text : `https://${text}`);
  } catch {
    return null; 
  }

  const host = url.hostname.replace(/^(www|m)\./, ""); 
  let id = null;

  if (host === "youtu.be") {
   
    id = url.pathname.slice(1).split("/")[0];
  } else if (
    host === "youtube.com" ||
    host === "music.youtube.com" ||
    host === "youtube-nocookie.com"
  ) {
    if (url.pathname === "/watch") {
      id = url.searchParams.get("v"); 
    } else {
      
      const match = url.pathname.match(/^\/(embed|shorts|live|v)\/([^/?]+)/);
      if (match) id = match[2];
    }
  }

 
  return id && ID_REGEX.test(id) ? id : null;
}