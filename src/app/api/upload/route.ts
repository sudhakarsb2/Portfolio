import { db } from "@/db";
import { media } from "@/db/schema";
import { HttpError, handle, json, requireApiUser } from "@/lib/api";

/** Accepted upload formats and the extension used in the served URL. */
const FORMATS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

const DATA_URL = /^data:([a-z0-9.+/-]+);base64,([A-Za-z0-9+/=]+)$/i;

/** ~6 MB files for images, ~35 MB for video/PDF (base64 is ~33% larger). */
const MAX_IMAGE_BASE64 = 8_000_000;
const MAX_FILE_BASE64 = 48_000_000;

export const POST = async (req: Request) =>
  handle(async () => {
    await requireApiUser();
    const body = (await req.json().catch(() => ({}))) as { dataUrl?: unknown };
    const dataUrl = typeof body.dataUrl === "string" ? body.dataUrl : "";
    const match = DATA_URL.exec(dataUrl);
    if (!match) throw new HttpError("That file could not be read. Please try again.", 422);

    const mime = match[1].toLowerCase();
    const extension = FORMATS[mime];
    if (!extension) {
      throw new HttpError(
        "Supported formats: JPG, PNG, WebP, GIF, SVG, PDF, MP4, WebM and MOV.",
        422,
      );
    }

    const limit = mime.startsWith("image/") ? MAX_IMAGE_BASE64 : MAX_FILE_BASE64;
    if (match[2].length > limit) {
      const size = mime.startsWith("image/") ? "6 MB" : "35 MB";
      throw new HttpError(`That file is too large. Please keep it under ${size}.`, 413);
    }

    const inserted = (await db
      .insert(media)
      .values({ mime, data: match[2] })
      .returning({ id: media.id })) as Array<{ id: number }>;

    return json(
      { id: inserted[0].id, url: `/api/media/${inserted[0].id}.${extension}`, mime },
      { status: 201 },
    );
  });
