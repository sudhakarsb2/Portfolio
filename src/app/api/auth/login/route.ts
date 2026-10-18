import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { HttpError, handle, json } from "@/lib/api";
import { createSession, verifyPassword } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { attempt, clear, tooMany } from "@/lib/rate-limit";
import { toText } from "@/lib/utils";

/** The only account allowed to manage this portfolio. */
const OWNER_EMAIL = "sudhakar.bhambade2@gmail.com";

export const POST = async (req: Request) =>
  handle(async () => {
    await ensureSeeded();
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const email = toText(body.email).toLowerCase();
    const password = toText(body.password);

    if (!email || !password) throw new HttpError("Email and password are both required.", 422);

    // Anything that is not the owner account is refused before we even look
    // it up, so no other login can ever be created or used.
    if (email !== OWNER_EMAIL) {
      throw new HttpError("This studio area is restricted to the owner account.", 403);
    }

    // Slow down repeated guessing without leaking anything useful.
    if (tooMany(email)) {
      throw new HttpError("Too many attempts. Please wait a minute and try again.", 429);
    }

    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = rows[0];

    if (!user || !verifyPassword(password, user.passwordHash)) {
      attempt(email);
      throw new HttpError("Those credentials do not match our records.", 401);
    }

    clear(email);
    await createSession(user.id);

    return json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  });
