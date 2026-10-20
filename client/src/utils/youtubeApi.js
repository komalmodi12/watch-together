let apiPromise = null; 

export function loadYouTubeApi() {
 
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise; 

  apiPromise = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previous === "function") previous();
      resolve(window.YT);
    };

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.onerror = () => {
      apiPromise = null; 
      reject(new Error("Failed to load the YouTube IFrame API"));
    };
    document.head.appendChild(tag);
  });

  return apiPromise;
}