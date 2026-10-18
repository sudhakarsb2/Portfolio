"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/kit";

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
const MEDIA_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/svg+xml,application/pdf,video/mp4,video/webm,video/quicktime";

/** Images that can safely be downscaled through a canvas. */
const RESIZABLE = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_RAW_BYTES = 35 * 1024 * 1024;

async function fileToResizedDataUrl(file: File, maxSize: number): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Could not read that image."));
      element.src = objectUrl;
    });
    const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not process that image.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.88);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

export function ImageUploader({
  onUploaded,
  label = "Upload image",
  maxSize = 1600,
  kind = "image",
}: {
  onUploaded: (url: string, mime?: string) => void;
  label?: string;
  maxSize?: number;
  /** "image" = photos only (resized). "media" = any graphic format, PDF or video. */
  kind?: "image" | "media";
}) {
  const input = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      let dataUrl: string;
      if (RESIZABLE.has(file.type)) {
        dataUrl = await fileToResizedDataUrl(file, maxSize);
      } else {
        if (file.size > MAX_RAW_BYTES) {
          throw new Error("That file is over 35 MB. Please compress it first.");
        }
        dataUrl = await fileToDataUrl(file);
      }
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      });
      const payload = (await response.json()) as { url?: string; mime?: string; error?: string };
      if (!response.ok || !payload.url) {
        setError(payload.error ?? "Upload failed. Please try again.");
        return;
      }
      onUploaded(payload.url, payload.mime);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed. Please try again.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={input}
        type="file"
        accept={kind === "media" ? MEDIA_ACCEPT : IMAGE_ACCEPT}
        className="hidden"
        onChange={(event) => void onFile(event.target.files?.[0])}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        icon="upload"
        loading={busy}
        onClick={() => input.current?.click()}
      >
        {busy ? "Uploading…" : label}
      </Button>
      {error ? <p className="mt-2 text-xs text-crimson">{error}</p> : null}
    </div>
  );
}
