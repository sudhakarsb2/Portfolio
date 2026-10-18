"use client";

import { useEffect, useMemo, useState } from "react";
import { Artwork } from "@/components/artwork";
import { Icon, type IconName } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export type StageCategory = {
  id: number;
  name: string;
  slug: string;
  color: string;
  description: string;
};

/**
 * Well-known categories get a bespoke scene. Anything else falls back to a
 * framed poster built from the category's own name and colour, so a category
 * added in the dashboard automatically gets a frame here.
 */
function sceneFor(slug: string): "billboard" | "stand" | "pack" | "phone" | "poster" {
  switch (slug) {
    case "out-of-home":
    case "ooh":
      return "billboard";
    case "point-of-sale":
    case "posm":
      return "stand";
    case "packaging":
      return "pack";
    case "digital":
      return "phone";
    default:
      return "poster";
  }
}

function iconFor(slug: string): IconName {
  const scene = sceneFor(slug);
  if (scene === "billboard") return "compass";
  if (scene === "stand") return "layers";
  if (scene === "pack") return "box";
  if (scene === "phone") return "monitor";
  return "aperture";
}

function frameClass(active: boolean) {
  return cn(
    "absolute inset-0 flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)]",
    active ? "scale-100 opacity-100" : "pointer-events-none scale-90 opacity-0",
  );
}

export function RolloutStage({ categories }: { categories: StageCategory[] }) {
  const items = useMemo(
    () =>
      categories
        .filter((category) => category.name.trim() !== "")
        .map((category) => ({
          id: category.slug,
          name: category.name,
          description: category.description,
          color: category.color || "#ff4a1c",
          scene: sceneFor(category.slug),
          icon: iconFor(category.slug),
        })),
    [categories],
  );

  const [active, setActive] = useState<string>("");
  const [paused, setPaused] = useState(false);

  // Keep the selection valid as categories come and go.
  useEffect(() => {
    if (!items.length) return;
    if (items.some((item) => item.id === active)) return;
    const timer = window.setTimeout(() => setActive(items[0].id), 0);
    return () => window.clearTimeout(timer);
  }, [items, active]);

  useEffect(() => {
    if (paused || items.length < 2) return;
    const timer = window.setInterval(() => {
      setActive((current) => {
        const index = Math.max(0, items.findIndex((item) => item.id === current));
        return items[(index + 1) % items.length].id;
      });
    }, 4800);
    return () => window.clearInterval(timer);
  }, [paused, items]);

  if (!items.length) {
    return (
      <div className="rounded-[32px] border border-dashed border-white/15 bg-white/[0.02] px-6 py-20 text-center">
        <p className="text-lg font-medium text-white/70">No disciplines yet</p>
        <p className="mt-2 text-sm text-white/40">
          Add disciplines in the dashboard and each one appears here as its own frame.
        </p>
      </div>
    );
  }

  const current = items.find((item) => item.id === active) ?? items[0];

  return (
    <div onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
      <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-[#121214] to-black">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_45%,rgba(122,92,255,0.22),transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:44px_44px]"
        />

        <div className="relative flex items-center justify-between gap-4 px-6 pt-6">
          <span className="micro text-[10px] text-white/45">
            One key visual → {current.name}
          </span>
          <span className="micro shrink-0 text-[10px] text-white/30">
            {items.findIndex((item) => item.id === current.id) + 1} / {items.length}
          </span>
        </div>

        <div className="relative h-[24rem] sm:h-[28rem]">
          {items.map((item) => (
            <div key={item.id} className={frameClass(item.id === current.id)}>
              <Scene scene={item.scene} name={item.name} color={item.color} />
            </div>
          ))}
        </div>

        <div className="relative flex flex-wrap gap-2 px-6 pb-6">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActive(item.id);
                setPaused(true);
              }}
              aria-pressed={item.id === current.id}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition-all duration-300",
                item.id === current.id
                  ? "border-white bg-white text-black"
                  : "border-white/15 bg-white/5 text-white/70 hover:border-white/40 hover:text-white",
              )}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <Icon name={item.icon} className="h-3.5 w-3.5" />
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {current.description ? (
        <p key={current.id} className="animate-rise mx-auto mt-6 max-w-2xl text-center text-[15px] leading-relaxed text-white/50">
          {current.description}
        </p>
      ) : null}
    </div>
  );
}

function Scene({ scene, name, color }: { scene: string; name: string; color: string }) {
  const art = (client: string, className?: string) => (
    <Artwork seed={name} title={name} client={client} className={className ?? "h-full w-full"} />
  );

  if (scene === "billboard") {
    return (
      <div className="relative w-[min(88%,36rem)]">
        <div className="absolute -top-3 left-6 right-6 flex justify-between">
          {[0, 1, 2, 3].map((light) => (
            <span key={light} className="h-2 w-8 rounded-b-full bg-gradient-to-b from-white/80 to-transparent" />
          ))}
        </div>
        <div className="aspect-[3/1] overflow-hidden rounded-md border-[7px] border-[#2b2b2e] bg-black shadow-lift">
          {art("Key visual · OOH", "h-full w-full")}
        </div>
        <span className="absolute -bottom-16 left-[18%] h-16 w-3 bg-gradient-to-b from-[#3a3a3d] to-transparent" />
        <span className="absolute -bottom-16 right-[18%] h-16 w-3 bg-gradient-to-b from-[#3a3a3d] to-transparent" />
      </div>
    );
  }

  if (scene === "stand") {
    return (
      <div className="relative flex flex-col items-center">
        <div className="relative h-[17rem] w-[11.5rem] overflow-hidden rounded-t-2xl border-[5px] border-[#2b2b2e] bg-black shadow-lift sm:h-[20rem] sm:w-[13.5rem]">
          {art("Key visual · In-store")}
        </div>
        <div className="h-3 w-[14.5rem] rounded-b-xl bg-[#2b2b2e] sm:w-[16.5rem]" />
        <div
          className="absolute -right-12 top-10 flex h-20 w-20 rotate-12 animate-float items-center justify-center rounded-full border-4 border-white text-center text-[10px] font-bold uppercase leading-tight tracking-wide text-white shadow-lift"
          style={{ backgroundColor: color }}
        >
          Shelf
          <br />
          tag
        </div>
      </div>
    );
  }

  if (scene === "pack") {
    return (
      <div style={{ perspective: "1200px" }}>
        <div className="relative animate-box-sway" style={{ width: 180, height: 240, transformStyle: "preserve-3d" }}>
          <div
            className="absolute inset-0 overflow-hidden rounded-[3px] border border-white/15"
            style={{ transform: "translateZ(50px)", backfaceVisibility: "hidden" }}
          >
            {art("Key visual · Pack")}
          </div>
          <div
            className="absolute overflow-hidden border border-white/10"
            style={{
              left: 40,
              top: 0,
              width: 100,
              height: 240,
              transform: "rotateY(90deg) translateZ(90px)",
              backfaceVisibility: "hidden",
              backgroundImage: `linear-gradient(to bottom, ${color}, #7a5cff)`,
            }}
          >
            <span className="absolute inset-0 flex items-center justify-center [writing-mode:vertical-rl] text-[11px] font-bold uppercase tracking-[0.3em] text-white/85">
              {name}
            </span>
          </div>
          <div
            className="absolute border border-white/10 bg-[#1b1b1e]"
            style={{
              left: 0,
              top: 70,
              width: 180,
              height: 100,
              transform: "rotateX(90deg) translateZ(120px)",
              backfaceVisibility: "hidden",
            }}
          >
            <span className="absolute inset-x-6 top-1/2 h-px bg-white/25" />
          </div>
        </div>
        <div className="absolute bottom-10 h-6 w-48 rounded-[50%] bg-black/60 blur-xl" />
      </div>
    );
  }

  if (scene === "phone") {
    return (
      <div className="relative h-[21rem] w-[10.5rem] overflow-hidden rounded-[2.2rem] border-[6px] border-[#2b2b2e] bg-black shadow-lift sm:h-[25rem] sm:w-[12.5rem]">
        {art("Key visual · Story")}
        <div className="absolute inset-x-3 top-3 flex gap-1">
          {[0, 1, 2].map((bar) => (
            <span key={bar} className={cn("h-0.5 flex-1 rounded-full", bar === 0 ? "bg-white" : "bg-white/40")} />
          ))}
        </div>
        <span className="absolute left-1/2 top-1.5 h-4 w-16 -translate-x-1/2 rounded-full bg-black" />
        <div className="absolute inset-x-4 bottom-4 rounded-full bg-white px-4 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-black">
          Learn more
        </div>
      </div>
    );
  }

  // Framed poster — the default for any category without a bespoke scene.
  return (
    <div className="relative w-[min(86%,30rem)]">
      <div
        className="relative overflow-hidden rounded-[10px] border-[10px] bg-black shadow-lift"
        style={{ borderColor: "#2b2b2e" }}
      >
        <div className="aspect-[4/3]">
          {art("Key visual", "h-full w-full")}
        </div>
      </div>
      <div
        className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-lift"
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
      <div className="mx-auto mt-8 h-3 w-24 rounded-b-lg bg-[#2b2b2e]" />
    </div>
  );
}
