import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  // API routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Proxy to Google Apps Script Web App to bypass browser CORS / redirect issues
  app.post("/api/gas-proxy", async (req, res) => {
    try {
      const { url, payload } = req.body;
      if (!url) {
        return res.status(400).json({ success: false, error: "Missing Google Apps Script URL" });
      }

      // Google Apps Script requires following 302 redirects
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload || {}),
        redirect: "follow",
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { success: false, raw: text, error: "Не удалось распарсить JSON ответ от Google Apps Script" };
      }

      return res.json(data);
    } catch (err: any) {
      console.error("GAS Proxy Error:", err);
      return res.status(500).json({ success: false, error: err.message || "Ошибка соединения с Google Apps Script" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CRM Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
