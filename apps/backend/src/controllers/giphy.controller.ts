import { Router } from "express";

const router = Router();

const GIPHY_BASE = "https://api.giphy.com/v1/gifs";

function getApiKey() {
  return process.env.GIPHY_API_KEY;
}

router.get("/trending", async (req, res) => {
  const apiKey = getApiKey();
  if (!apiKey) return res.status(500).json({ error: "GIPHY API key not configured" });

  const limit = req.query.limit ?? "12";
  const rating = req.query.rating ?? "g";

  try {
    const resp = await fetch(`${GIPHY_BASE}/trending?api_key=${apiKey}&limit=${limit}&rating=${rating}`);
    const json = await resp.json();
    res.json(json);
  } catch (err) {
    console.error("Giphy proxy error", err);
    res.status(502).json({ error: "giphy proxy error" });
  }
});

router.get("/search", async (req, res) => {
  const apiKey = getApiKey();
  if (!apiKey) return res.status(500).json({ error: "GIPHY API key not configured" });

  const q = String(req.query.q || "");
  const limit = req.query.limit ?? "12";
  const rating = req.query.rating ?? "g";

  try {
    const resp = await fetch(`${GIPHY_BASE}/search?api_key=${apiKey}&q=${encodeURIComponent(q)}&limit=${limit}&rating=${rating}`);
    const json = await resp.json();
    res.json(json);
  } catch (err) {
    console.error("Giphy proxy error", err);
    res.status(502).json({ error: "giphy proxy error" });
  }
});

export default router;
