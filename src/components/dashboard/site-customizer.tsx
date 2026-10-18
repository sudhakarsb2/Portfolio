"use client";

import { useState } from "react";
import { Button, Field, Input, useToast } from "@/components/ui/kit";

type Colors = {
  colorVermilion: string;
  colorViolet: string;
  colorAzure: string;
  colorAcid: string;
};

const swatches: Array<{ key: keyof Colors; label: string }> = [
  { key: "colorVermilion", label: "Highlight" },
  { key: "colorViolet", label: "Violet" },
  { key: "colorAzure", label: "Azure" },
  { key: "colorAcid", label: "Acid" },
];

async function saveSettings(body: Record<string, string>): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) return { ok: false, error: payload.error ?? "Could not save that." };
    return { ok: true };
  } catch {
    return { ok: false, error: "We could not reach the server. Please try again." };
  }
}

export function SiteCustomizer({
  initialColors,
  initialUrl,
}: {
  initialColors: Colors;
  initialUrl: string;
}) {
  const { push } = useToast();
  const [colors, setColors] = useState(initialColors);
  const [siteUrl, setSiteUrl] = useState(initialUrl);
  const [savingColors, setSavingColors] = useState(false);
  const [savingUrl, setSavingUrl] = useState(false);
  const [urlError, setUrlError] = useState("");

  async function onSaveColors() {
    setSavingColors(true);
    const result = await saveSettings(colors);
    setSavingColors(false);
    push(result.ok ? "Colours updated on the live site" : result.error ?? "Save failed.", result.ok ? "success" : "error");
  }

  async function onSaveUrl() {
    const value = siteUrl.trim();
    if (value && !/^https?:\/\/[^/]+/i.test(value)) {
      setUrlError("Use a full address, like https://your-name.vercel.app");
      return;
    }
    setUrlError("");
    setSavingUrl(true);
    const result = await saveSettings({ siteUrl: value.replace(/\/$/, "") });
    setSavingUrl(false);
    push(result.ok ? "Site address saved" : result.error ?? "Save failed.", result.ok ? "success" : "error");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-3xl border border-line bg-paper p-6">
        <h3 className="font-display text-xl text-ink">Colours</h3>
        <p className="mt-1 text-sm text-ink/55">
          Four swatches drive the whole public site. Change one and it updates live.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-4">
          {swatches.map((swatch) => (
            <label key={swatch.key} className="block">
              <span className="micro text-[9px] text-ink/45">{swatch.label}</span>
              <span className="mt-2 flex items-center gap-3 rounded-2xl border border-line bg-bone/50 px-3 py-2">
                <input
                  type="color"
                  value={colors[swatch.key]}
                  onChange={(event) => setColors({ ...colors, [swatch.key]: event.target.value })}
                  className="h-9 w-9 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  aria-label={swatch.label}
                />
                <span className="font-mono text-xs uppercase text-ink/70">{colors[swatch.key]}</span>
              </span>
            </label>
          ))}
        </div>
        <div className="mt-5 flex h-14 overflow-hidden rounded-2xl">
          {swatches.map((swatch) => (
            <span key={swatch.key} className="flex-1" style={{ backgroundColor: colors[swatch.key] }} />
          ))}
        </div>
        <Button type="button" className="mt-5" onClick={onSaveColors} loading={savingColors}>
          {savingColors ? "Saving…" : "Save colours"}
        </Button>
      </section>

      <section className="rounded-3xl border border-line bg-paper p-6">
        <h3 className="font-display text-xl text-ink">Publish on your domain</h3>
        <p className="mt-1 text-sm leading-relaxed text-ink/55">
          Deploy this project to Vercel and you get a free address such as
          your-name.vercel.app. Paste it here so the sitemap and share previews use it. A
          domain you already own can be attached in Vercel under Settings → Domains.
        </p>
        <Field
          label="Public site URL"
          className="mt-5"
          error={urlError}
          hint="Leave blank while you are still previewing."
        >
          <Input
            value={siteUrl}
            onChange={(event) => setSiteUrl(event.target.value)}
            placeholder="https://your-name.vercel.app"
            inputMode="url"
          />
        </Field>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button type="button" onClick={onSaveUrl} loading={savingUrl}>
            {savingUrl ? "Saving…" : "Save site address"}
          </Button>
          <span className="text-xs text-ink/45">
            Content edits publish themselves — they are already live.
          </span>
        </div>
      </section>
    </div>
  );
}
