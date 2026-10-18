"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/kit";

/** Reads any file as a base64 data URL without touching its contents. */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

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

/**
 * Reads a JSON response without throwing when the server replies with plain
 * text — for example a hosting platform's size rejection. Without this the
 * visitor sees a confusing parser message instead of the real reason.
 */
async function readResponse(response: Response): Promise<{ url?: string; error?: string }> {
  const text = await response.text();
  if (!text) return { error: `Upload failed (${response.status}).` };
  try {
    return JSON.parse(text) as { url?: string; error?: string };
  } catch {
    if (response.status === 413) {
      return { error: "That file was too large for the server to accept. Please try a smaller file." };
    }
    return { error: `Upload failed (${response.status}). Please try again.` };
  }
}

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif";

const ANY_ACCEPT = [
  ...IMAGE_ACCEPT.split(","),
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
].join(",");

/** Base64 characters per request — safely under the ~4.5 MB platform cap. */
const CHUNK_SIZE = 3_000_000;

/** Anything larger than one request is split into pieces automatically. */
const SINGLE_REQUEST_LIMIT = 3_000_000;

export function ImageUploader({
  onUploaded,
  label = "Upload image",
  maxSize = 1600,
  anyFile = false,
}: {
  onUploaded: (url: string) => void;
  label?: string;
  maxSize?: number;
  /** Allow video, PDF and vector files as well as images. */
  anyFile?: boolean;
}) {
  const input = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  function splitDataUrl(dataUrl: string) {
    const separator = dataUrl.indexOf(";base64,");
    if (separator === -1) throw new Error("Could not read that file.");
    return {
      mime: dataUrl.slice(5, separator).toLowerCase(),
      payload: dataUrl.slice(separator + 8),
    };
  }

  async function sendInChunks(mime: string, payload: string) {
    const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const totalParts = Math.ceil(payload.length / CHUNK_SIZE);

    for (let index = 0; index < totalParts; index += 1) {
      const part = payload.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE);
      const response = await fetch("/api/upload/chunk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId, mime, data: part, partIndex: index, totalParts }),
      });
      const result = await readResponse(response);
      if (!response.ok) {
        await fetch(`/api/upload/chunk?uploadId=${encodeURIComponent(uploadId)}`, { method: "DELETE" });
        throw new Error(result.error ?? "Upload failed. Please try again.");
      }
      setProgress(Math.round(((index + 1) / totalParts) * 100));
    }

    const finalise = await fetch("/api/upload/chunk", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uploadId, mime }),
    });
    const finished = await readResponse(finalise);
    if (!finalise.ok || !finished.url) {
      throw new Error(finished.error ?? "Could not finish the upload. Please try again.");
    }
    return finished.url;
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setProgress(0);
    setError("");
    try {
      // Images are downscaled in the browser, so they normally fit in one
      // request. Everything else is sent as-is and chunked when needed.
      const dataUrl = anyFile
        ? await fileToDataUrl(file)
        : await fileToResizedDataUrl(file, maxSize);
      const { mime, payload } = splitDataUrl(dataUrl);

      let url: string;
      if (payload.length <= SINGLE_REQUEST_LIMIT) {
        setProgress(60);
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl }),
        });
        const result = await readResponse(response);
        if (!response.ok || !result.url) {
          throw new Error(result.error ?? "Upload failed. Please try again.");
        }
        url = result.url;
        setProgress(100);
      } else {
        url = await sendInChunks(mime, payload);
      }

      onUploaded(url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed. Please try again.");
    } finally {
      setBusy(false);
      setProgress(0);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={input}
        type="file"
        accept={anyFile ? ANY_ACCEPT : IMAGE_ACCEPT}
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
        {busy
          ? progress > 0 && progress < 100
            ? `Uploading ${progress}%`
            : "Uploading…"
          : label}
      </Button>
      {error ? (
        <p className="mt-2 max-w-xs text-xs leading-relaxed text-crimson">{error}</p>
      ) : null}
    </div>
  );
}
