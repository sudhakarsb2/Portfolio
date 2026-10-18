import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { HttpError, handle, json, requireApiUser } from "@/lib/api";

/**
 * Chunked upload.
 *
 * Hosting platforms cap a single request body at roughly 4.5 MB, so large
 * PDFs, videos and high-resolution images are sent as several small pieces and
 * stitched together here. Each piece must be well under the platform limit.
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

/** Base64 characters accepted per request. ~3 MB binary, safely under 4.5 MB. */
const MAX_PART_LENGTH = 4_000_000;
const MAX_TOTAL_LENGTH = 96_000_000; // ~72 MB finished file
const MAX_PARTS = 200;

/** POST one piece of a file. */
export const POST = async (req: Request) =>
  handle(async () => {
    await requireApiUser();
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const uploadId = typeof body.uploadId === "string" ? body.uploadId : "";
    const mime = typeof body.mime === "string" ? body.mime.toLowerCase() : "";
    const data = typeof body.data === "string" ? body.data : "";
    const partIndex = Number(body.partIndex);
    const totalParts = Number(body.totalParts);

    if (!uploadId) throw new HttpError("Upload session is missing.", 422);
    if (!ALLOWED.includes(mime)) {
      throw new HttpError(`That file type (${mime || "unknown"}) is not supported here.`, 422);
    }
    if (!Number.isInteger(partIndex) || !Number.isInteger(totalParts)) {
      throw new HttpError("Upload piece information is incomplete.", 422);
    }
    if (partIndex < 0 || partIndex >= totalParts) throw new HttpError("Upload piece is out of range.", 422);
    if (totalParts < 1 || totalParts > MAX_PARTS) throw new HttpError("That file has too many pieces.", 422);
    if (!data) throw new HttpError("That piece is empty.", 422);
    if (data.length > MAX_PART_LENGTH) {
      throw new HttpError("That piece is too large. Please try uploading again.", 413);
    }

    await db.insert(media).values({
      mime,
      data,
      uploadId,
      partIndex,
      totalParts,
      complete: false,
    });

    return json({ ok: true, received: partIndex + 1, of: totalParts });
  });

/** PUT finishes an upload: stitch every piece, in order, into one file. */
export const PUT = async (req: Request) =>
  handle(async () => {
    await requireApiUser();
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const uploadId = typeof body.uploadId === "string" ? body.uploadId : "";
    if (!uploadId) throw new HttpError("Upload session is missing.", 422);

    const parts = await db
      .select({ partIndex: media.partIndex, data: media.data, totalParts: media.totalParts })
      .from(media)
      .where(and(eq(media.uploadId, uploadId), eq(media.complete, false)));

    if (!parts.length) throw new HttpError("That upload session has no pieces to join.", 404);

    const total = parts[0].totalParts ?? parts.length;
    if (parts.length !== total) {
      throw new HttpError(
        `Upload is incomplete — received ${parts.length} of ${total} pieces. Please try again.`,
        409,
      );
    }

    const ordered = [...parts].sort((a, b) => (a.partIndex ?? 0) - (b.partIndex ?? 0));
    const joined = ordered.map((part) => part.data).join("");
    if (joined.length > MAX_TOTAL_LENGTH) {
      throw new HttpError("That file is too large to store. Please keep it under 72 MB.", 413);
    }

    const mime = typeof body.mime === "string" ? body.mime.toLowerCase() : "";
    const inserted = (await db
      .insert(media)
      .values({ mime: mime || "application/octet-stream", data: joined, complete: true })
      .returning({ id: media.id })) as Array<{ id: number }>;

    // The pieces have served their purpose.
    await db.delete(media).where(and(eq(media.uploadId, uploadId), eq(media.complete, false)));

    return json({ id: inserted[0].id, url: `/api/media/${inserted[0].id}` }, { status: 201 });
  });

/** DELETE abandons an in-flight upload, tidying any pieces already received. */
export const DELETE = async (req: Request) =>
  handle(async () => {
    await requireApiUser();
    const uploadId = new URL(req.url).searchParams.get("uploadId") ?? "";
    if (uploadId) {
      await db.delete(media).where(and(eq(media.uploadId, uploadId), eq(media.complete, false)));
    }
    return json({ ok: true });
  });

export const dynamic = "force-dynamic";
