import { GoogleGenAI } from "@google/genai";
import type { PopArtConfig } from "../types.ts";

let cachedClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please check your API key in Settings > Secrets."
    );
  }

  if (!cachedClient) {
    cachedClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  return cachedClient;
}

export async function generatePopArtImage(
  base64Image: string,
  mimeType: string,
  config: PopArtConfig
): Promise<string> {
  const ai = getGeminiClient();

  let styleSpecifics = "";
  switch (config.mood) {
    case "Cartoonish Pop Art":
      styleSpecifics = `- Style: Playful 2D cartoon/animation aesthetic. Round thick outlines, bubbly colors.`;
      break;
    case "Futuristic Pop":
      styleSpecifics = `- Style: Hyper-Neon, glowing holographic textures, neon halos.`;
      break;
    case "Synthwave Glow":
      styleSpecifics = `- Style: 80s radical aesthetics, pinks, purples, blues, retro sunset background.`;
      break;
    case "Graffiti Urban":
      styleSpecifics = `- Style: Gritty street art, paint drips, explosive marker splatters.`;
      break;
    case "Manga Noir":
      styleSpecifics = `- Style: High-contrast black and white, sharp screen-tones.`;
      break;
    case "Anime Inspired":
      styleSpecifics = `- Style: Shonen anime cel-shading, dynamic energy particles, vivid lighting.`;
      break;
    case "Haldi Special":
      styleSpecifics = `- Style: Professional pop-art vector illustration. Clean vector shapes with accurate facial features, soft cartoon detailing, minimal halftone shading.
      - Elements: Add comic bursts, dotted patterns, motion lines, energy effects, spark highlights using the photo's dominant colors.
      - Finish: Bold outlines, crisp edges, vibrant balanced colors, fully color-adaptive pop-art background.
      - Text: Place the title "Haldi" in a clean comic-style font, integrated naturally into the composition.`;
      break;
    default:
      styleSpecifics = `- Style: Classic bold Pop-Art colors with halftone dots.`;
  }

  const prompt = `
    TASK: Transform this photo into a ${config.mood} masterpiece.
    ${styleSpecifics}
    
    CRITICAL SPATIAL CONSTRAINTS:
    - Do NOT change subject size, scale, proportion, height, width, or distance.
    - Subject must remain EXACT same size and position from start to end.
    - No zoom in, no zoom out, no crop, no resize, no reframing.
    - No perspective change, no camera movement affecting scale.

    AUTO-DETECTION RULES:
    1. If no names are provided, analyze the environment and subjects. 
       - If there are people, invent a catchy duo/solo alias (e.g., "TEAM DYNAMIC", "THE HERO", "VIBE MASTER").
       - If it's a scene, use an environment-specific title (e.g., "STREET VIBES", "CITY PULSE").
    2. If no caption is provided, add a contextually relevant comic-style sound effect or phrase (e.g., "ZAP!", "BOOM!", "STYLISH!", "POW!") in a stylized bubble.

    PROVIDED TEXT:
    - Names/Title: "${config.coupleName || "DETECT AUTOMATICALLY"}"
    - Caption/Word: "${config.customText || "DETECT AUTOMATICALLY"}"

    CORE CONSTRAINTS:
    - Maintain 100% facial likeness. DO NOT replace the person's identity.
    - Colors must be EXTREMELY SATURATED and VIBRANT.
    - Use thick black outlines and halftone dots.
    - Background must be an abstract, energetic pop-art burst.
  `;

  const imageData = base64Image.includes(",")
    ? base64Image.split(",")[1]
    : base64Image;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        {
          inlineData: {
            data: imageData,
            mimeType: mimeType || "image/png",
          },
        },
        { text: prompt },
      ],
    },
  });

  let generatedImageUrl = "";
  const parts = response.candidates?.[0]?.content?.parts;
  if (parts) {
    for (const part of parts) {
      if (part.inlineData?.data) {
        const outputMime = part.inlineData.mimeType || "image/png";
        generatedImageUrl = `data:${outputMime};base64,${part.inlineData.data}`;
        break;
      }
    }
  }

  if (!generatedImageUrl) {
    throw new Error("Processing failed.");
  }

  return generatedImageUrl;
}
