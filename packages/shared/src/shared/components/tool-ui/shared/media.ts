import { z } from "zod";

/**
 * Sanitize a URL for safe use in href attributes.
 * Returns empty string for invalid or empty URLs.
 */
export function sanitizeHref(url: string | null | undefined): string {
  if (url == null || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  try {
    const parsed = new URL(trimmed);
    if (!["http:", "https:"].includes(parsed.protocol)) return "";
    return parsed.href;
  } catch {
    return "";
  }
}

/**
 * Aspect ratio keys mapped to Tailwind classes.
 */
export const RATIO_CLASS_MAP: Record<string, string> = {
  "1:1": "aspect-square",
  "4:3": "aspect-[4/3]",
  "3:4": "aspect-[3/4]",
  "16:9": "aspect-video",
  "9:16": "aspect-[9/16]",
  "5:3": "aspect-[5/3]",
  "5:4": "aspect-[5/4]",
  "3:2": "aspect-[3/2]",
  "2:3": "aspect-[2/3]",
} as const;

/**
 * Get Tailwind class for object-fit.
 */
export function getFitClass(fit?: string): string {
  switch (fit) {
    case "contain":
      return "object-contain";
    case "fill":
      return "object-fill";
    case "none":
      return "object-none";
    case "cover":
    default:
      return "object-cover";
  }
}

/**
 * CSS gradient for media overlay (e.g. video title overlay).
 */
export const OVERLAY_GRADIENT =
  "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)";

export const AspectRatioSchema = z.enum([
  "1:1",
  "4:3",
  "3:4",
  "16:9",
  "9:16",
  "5:3",
  "5:4",
  "3:2",
  "2:3",
  "auto",
]);
export type AspectRatio = z.infer<typeof AspectRatioSchema>;

export const MediaFitSchema = z.enum(["cover", "contain", "fill", "none"]);
export type MediaFit = z.infer<typeof MediaFitSchema>;
