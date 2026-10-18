"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, Field, Input } from "@/components/ui/kit";
import { Icon } from "@/components/ui/icons";

const demoAccounts = [
  { label: "Owner", email: "sudhakar.bhambade2@gmail.com", password: "portfolio2026" },
  { label: "Editor", email: "editor@portfolio.app", password: "portfolio2026" },
];

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = mode === "signin" ? "/api/auth/login" : "/api/auth/register";
    const body = mode === "signin" ? { email, password } : { name, email, password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "We could not sign you in.");
        setLoading(false);
        return;
      }
      router.push(nextPath);
      router.refresh();
    } catch {
      setError("We could not reach the studio server. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex rounded-2xl border border-line bg-bone-2/60 p-1">
        {(["signin", "signup"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setMode(option);
              setError("");
            }}
            className={
              mode === option
                ? "flex-1 rounded-xl bg-ink py-2.5 text-xs font-semibold text-bone transition-all"
                : "flex-1 rounded-xl py-2.5 text-xs font-semibold text-ink/55 transition-all hover:text-ink"
            }
          >
            {option === "signin" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {mode === "signup" ? (
          <Field label="Your name" required>
            <Input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Jordan Blake"
              autoComplete="name"
            />
          </Field>
        ) : null}

        <Field label="Email" required>
          <Input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
          />
        </Field>
        <Field
          label="Password"
          required
          hint={mode === "signup" ? "At least 8 characters." : undefined}
        >
          <Input
            type="password"
            required
            minLength={mode === "signup" ? 8 : undefined}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />
        </Field>

        {error ? (
          <div className="flex items-start gap-2.5 rounded-2xl border border-crimson/25 bg-[#fff3f3] px-4 py-3 text-sm text-crimson">
            <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          {loading ? "One moment…" : mode === "signin" ? "Sign in to the studio" : "Create my account"}
        </Button>
      </form>

      {mode === "signin" ? (
        <div className="mt-8 rounded-3xl border border-line bg-bone-2/50 p-4">
          <p className="micro text-[9px] text-ink/40">Demo accounts</p>
          <div className="mt-3 space-y-2">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                  setError("");
                }}
                className="flex w-full items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-4 py-3 text-left transition-all hover:border-ink"
              >
                <span>
                  <span className="block text-[13px] font-semibold text-ink">{account.email}</span>
                  <span className="mt-0.5 block text-[11px] text-ink/45">
                    {account.label} · {account.password}
                  </span>
                </span>
                <span className="micro rounded-full bg-bone-2 px-2.5 py-1 text-[9px] text-ink/60">
                  Use
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
