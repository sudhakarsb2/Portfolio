import { db } from "@/db";
import { media } from "@/db/schema";
import { HttpError, handle, json, requireApiUser } from "@/lib/api";

/**
 * Accepts any portfolio asset: images, video, PDFs and vector files.
 * Files are stored as base64 in Postgres and served back through
 * /api/media/[id] with their original content type.
 */
const ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
  "application/postscript",
  "application/illustrator",
];

const MAX_BASE64_LENGTH = 4_000_000; // stay well under the platform 4.5 MB body cap

export const POST = async (req: Request) =>
  handle(async () => {
    await requireApiUser();
    const body = (await req.json().catch(() => ({}))) as { dataUrl?: unknown };
    const dataUrl = typeof body.dataUrl === "string" ? body.dataUrl : "";
    const separator = dataUrl.indexOf(";base64,");
    if (separator === -1) {
      throw new HttpError("Please upload an image, video, PDF or vector file.", 422);
    }

    const mime = dataUrl.slice(5, separator).toLowerCase();
    const payload = dataUrl.slice(separator + 8);

    if (!ALLOWED.includes(mime)) {
      throw new HttpError(`That file type (${mime || "unknown"}) is not supported here.`, 422);
    }
    if (!payload || payload.length > MAX_BASE64_LENGTH) {
      throw new HttpError("That file is too large for a single upload. Please use the chunked uploader.", 413);
    }

    const inserted = (await db
      .insert(media)
      .values({ mime, data: payload })
      .returning({ id: media.id })) as Array<{ id: number }>;

    return json({ id: inserted[0].id, url: `/api/media/${inserted[0].id}` }, { status: 201 });
  });
