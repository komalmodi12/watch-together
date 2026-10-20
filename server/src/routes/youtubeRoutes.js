import { Router } from "express";
import { youtubeService } from "../services/YouTubeService.js";

const router = Router();

// GET /api/trending  ->  { videos: [...], shorts: [...] }
router.get("/trending", async (req, res) => {
  if (!youtubeService.enabled) {
    return res.status(503).json({ error: "Live YouTube content is not configured" });
  }

  try {
    const data = await youtubeService.getFeed();
    res.set("Cache-Control", "public, max-age=300"); // browsers may reuse it for 5 minutes
    res.json(data);
  } catch (err) {
    console.error("GET /api/trending failed:", err.message);
    res.status(503).json({ error: "Could not load YouTube content right now" });
  }
});

export default router;