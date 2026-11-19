import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import type { Request, Response } from "express";
import { generatePopArtImage } from "./server/gemini.ts";
import type { PopArtConfig } from "./types.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "50mb" }));

  app.post("/api/pop-art", async (req: Request, res: Response) => {
    try {
      const { base64Image, mimeType, config } = req.body as {
        base64Image?: string;
        mimeType?: string;
        config?: PopArtConfig;
      };

      if (!base64Image || !config?.mood) {
        res.status(400).json({ error: "Missing image data or style configuration." });
        return;
      }

      const imageUrl = await generatePopArtImage(
        base64Image,
        mimeType || "image/png",
        config
      );

      res.json({ imageUrl });
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      const message = err?.message || "Failed to generate art.";
      let status = typeof err?.status === "number" ? err.status : 500;
      if (
        status === 500 &&
        (message.includes("429") || message.toLowerCase().includes("quota"))
      ) {
        status = 429;
      }
      res.status(status).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.use((_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
