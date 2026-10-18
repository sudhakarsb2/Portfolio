import { db } from "@/db";
import { media } from "@/db/schema";
import { HttpError, handle, json, requireApiUser } from "@/lib/api";

const DATA_URL = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;
const MAX_BASE64_LENGTH = 6_000_000;

export const POST = async (req: Request) =>
  handle(async () => {
    await requireApiUser();
    const body = (await req.json().catch(() => ({}))) as { dataUrl?: unknown };
    const dataUrl = typeof body.dataUrl === "string" ? body.dataUrl : "";
    const match = DATA_URL.exec(dataUrl);
    if (!match) throw new HttpError("Please upload a JPEG, PNG or WebP image.", 422);
    if (match[2].length > MAX_BASE64_LENGTH) {
      throw new HttpError("That image is too large. Please use one under 4 MB.", 413);
    }

    const inserted = (await db
      .insert(media)
      .values({ mime: match[1], data: match[2] })
      .returning({ id: media.id })) as Array<{ id: number }>;

    return json({ id: inserted[0].id, url: `/api/media/${inserted[0].id}` }, { status: 201 });
  });
