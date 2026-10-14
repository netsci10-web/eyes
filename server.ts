import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory audio cache for zero-latency playback of coaching commands
const audioCache = new Map<string, string>();

const ai = new GoogleGenAI();

app.post("/api/tts", async (req, res) => {
  try {
    const { text, voiceName = "Kore" } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required" });
    }

    const cleanText = text.trim();
    const cacheKey = `${voiceName}:${cleanText}`;

    if (audioCache.has(cacheKey)) {
      return res.json({ audioBase64: audioCache.get(cacheKey) });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash-lite-tts",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: "Warm, empathetic, professional Korean optometrist and meditation instructor voice. Clear articulation and soothing, natural rhythm.",
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      if (audioCache.size > 200) {
        const oldestKey = audioCache.keys().next().value;
        if (oldestKey) audioCache.delete(oldestKey);
      }
      audioCache.set(cacheKey, base64Audio);
      return res.json({ audioBase64: base64Audio });
    }

    res.status(500).json({ error: "No audio generated from model" });
  } catch (error: any) {
    console.error("Gemini TTS Error:", error?.message || error);
    res.status(500).json({ error: error?.message || "Internal TTS error" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === "production") {
    app.use(express.static("dist"));
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
