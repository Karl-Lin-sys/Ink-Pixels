import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 images
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // AI Endpoint: Analyze Image and Start Story
  app.post("/api/analyze-image", async (req, res) => {
    try {
      const { image, mimeType } = req.body;
      if (!image || !mimeType) {
        return res.status(400).json({ error: "Image data and mimeType are required." });
      }

      // We extract base64 string without data:image... prefix if present
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            {
              text: "Analyze the mood, atmosphere, and setting of this image. Then, act as a master storyteller and write an immersive, captivating opening paragraph for a creative story set in this world.",
            },
          ],
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Image analysis error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze image." });
    }
  });

  // AI Endpoint: Chat continuation
  app.post("/api/chat", async (req, res) => {
    try {
      const { history, message } = req.body;
      if (!history || !message) {
        return res.status(400).json({ error: "History and message are required." });
      }

      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction: "You are a creative writing partner and master storyteller. A user is writing a story based on an image prompt. Continue the story in a collaborative way, adding vivid descriptions, character development, or moving the plot forward based on the user's inputs. Keep your responses immersive and engaging.",
        },
      });

      // Load history into the chat state (GenAI SDK chat history typically expects the user to maintain it or we can pass messages iteratively, 
      // but the GenAI SDK might require sending a new message to a chat session. Let's just use generateContent with the full history).
      const contents = history.map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      }));
      contents.push({ role: "user", parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction: "You are a creative writing partner and master storyteller. A user is writing a story based on an image prompt. Continue the story in a collaborative way, adding vivid descriptions, character development, or moving the plot forward based on the user's inputs. Keep your responses immersive and engaging.",
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: error.message || "Failed to chat." });
    }
  });

  // AI Endpoint: Text-to-Speech
  app.post("/api/tts", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required." });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' }, // expressive voice
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
         throw new Error("No audio generated.");
      }

      res.json({ audio: base64Audio });
    } catch (error: any) {
      console.error("TTS error:", error);
      res.status(500).json({ error: error.message || "Failed to generate speech." });
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
