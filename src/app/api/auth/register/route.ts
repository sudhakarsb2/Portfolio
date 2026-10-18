import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { HttpError, handle, json } from "@/lib/api";
import { createSession, hashPassword } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { toText } from "@/lib/utils";

export const POST = async (req: Request) =>
  handle(async () => {
    await ensureSeeded();
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const email = toText(body.email).toLowerCase();
    const password = toText(body.password);

    if (!email || !password) throw new HttpError("Email and password are both required.", 422);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError("That email looks invalid.", 422);
    if (password.length < 8) throw new HttpError("Passwords need to be at least 8 characters.", 422);

    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing.length) throw new HttpError("An account with that email already exists.", 409);

    const name = toText(body.name) || email.split("@")[0];
    const inserted = (await db
      .insert(users)
      .values({ email, name, passwordHash: hashPassword(password), role: "editor", title: "Designer" })
      .returning()) as Array<typeof users.$inferSelect>;

    const user = inserted[0];
    await createSession(user.id);

    return json(
      { user: { id: user.id, name: user.name, email: user.email, role: user.role } },
      { status: 201 },
    );
  });
