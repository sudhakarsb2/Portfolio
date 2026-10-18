"use client";

import { useMemo, useState } from "react";
import { Button, Field, Input, useToast } from "@/components/ui/kit";
import { Icon } from "@/components/ui/icons";
import { PAGE_GROUPS, pageFields } from "@/lib/page-content";

type Values = Record<string, string>;

export function PageContentEditor({ initial }: { initial: Values }) {
  const { push } = useToast();
  const [group, setGroup] = useState<string>(PAGE_GROUPS[0]);
  const [values, setValues] = useState<Values>(() => {
    const seeded: Values = {};
    for (const field of pageFields) {
      seeded[field.key] = initial[field.key]?.trim() ? initial[field.key] : field.value;
    }
    return seeded;
  });
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const fields = useMemo(() => pageFields.filter((field) => field.page === group), [group]);
  const dirtyCount = Object.keys(dirty).length;

  async function save() {
    if (!dirtyCount) {
      push("Nothing to save yet.", "info");
      return;
    }
    setSaving(true);
    try {
      const body: Values = {};
      for (const key of Object.keys(dirty)) body[key] = values[key];
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        push(payload.error ?? "Could not save that.", "error");
        return;
      }
      setDirty({});
      push("Published — the live site is updated", "success");
    } catch {
      push("We could not reach the server. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  function set(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setDirty((current) => ({ ...current, [key]: true }));
  }

  function resetField(fieldKey: string) {
    const field = pageFields.find((entry) => entry.key === fieldKey);
    if (!field) return;
    set(fieldKey, field.value);
  }

  return (
    <div className="space-y-5">
      <div className="scroll-x flex items-center gap-2 overflow-x-auto pb-1">
        {PAGE_GROUPS.map((name) => {
          const count = pageFields.filter((field) => field.page === name).length;
          return (
            <button
              key={name}
              type="button"
              onClick={() => setGroup(name)}
              className={
                group === name
                  ? "flex shrink-0 items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-bone"
                  : "flex shrink-0 items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-xs font-semibold text-ink/55 transition-colors hover:border-ink hover:text-ink"
              }
            >
              {name}
              <span className={group === name ? "text-bone/50" : "text-ink/30"}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-3xl border border-line bg-paper p-6 md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-xl text-ink">{group} page</h3>
            <p className="mt-1 text-sm text-ink/55">
              Rewrite the words exactly as visitors see them. Saves only what you changed.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {dirtyCount ? (
              <span className="text-xs font-medium text-crimson">{dirtyCount} unsaved</span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-ink/40">
                <Icon name="check" className="h-3.5 w-3.5" />
                All saved
              </span>
            )}
            <Button type="button" onClick={save} loading={saving}>
              {saving ? "Publishing…" : "Publish changes"}
            </Button>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {fields.map((field) => (
            <div key={field.key} className={field.multiline ? "md:col-span-2" : undefined}>
              <Field label={field.label}>
                {field.multiline ? (
                  <textarea
                    rows={3}
                    value={values[field.key] ?? ""}
                    onChange={(event) => set(field.key, event.target.value)}
                    className="w-full rounded-2xl border border-line bg-bone/40 px-4 py-3 text-sm leading-relaxed text-ink transition-colors focus:border-ink focus:outline-none focus:ring-4 focus:ring-ink/5"
                  />
                ) : (
                  <Input
                    value={values[field.key] ?? ""}
                    onChange={(event) => set(field.key, event.target.value)}
                  />
                )}
              </Field>
              {dirty[field.key] ? (
                <button
                  type="button"
                  onClick={() => resetField(field.key)}
                  className="mt-1.5 text-[11px] font-medium text-ink/45 underline underline-offset-2 hover:text-ink"
                >
                  Reset this field
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
