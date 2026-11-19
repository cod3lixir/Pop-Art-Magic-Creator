import type { PopArtConfig } from "../types";

export const transformToPopArt = async (
  base64Image: string,
  mimeType: string,
  config: PopArtConfig
): Promise<string> => {
  const response = await fetch("/api/pop-art", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      base64Image,
      mimeType,
      config,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data?.error === "string" && data.error.length > 0
        ? data.error
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  if (!data?.imageUrl) {
    throw new Error("Processing failed.");
  }

  return data.imageUrl;
};
