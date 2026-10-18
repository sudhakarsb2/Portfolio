"use client";

import { useEffect, useState } from "react";
import { Artwork } from "@/components/artwork";
import { Icon, type IconName } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type FormatId = "ooh" | "posm" | "pack" | "digital";

const formats: Array<{
  id: FormatId;
  label: string;
  icon: IconName;
  tagline: string;
  specs: Array<[string, string]>;
  checks: string[];
}> = [
  {
    id: "ooh",
    label: "Out of Home",
    icon: "compass",
    tagline: "Billboards, unipoles, bus shelters and mall media.",
    specs: [
      ["Platform", "Unipole · Bus shelter · Mall media"],
      ["Colour", "CMYK + Pantone spot"],
      ["Bleed", "Per media-owner spec · safe zone checked"],
      ["Deliverable", "Press-ready PDF + live vector AI"],
    ],
    checks: ["Safe zones clear of crops", "Resolution right for viewing distance", "Legal line legible at scale", "Media-owner spec matched"],
  },
  {
    id: "posm",
    label: "Point of Sale",
    icon: "layers",
    tagline: "Shelf-talkers, wobblers, floor stands, counter displays.",
    specs: [
      ["Platform", "Retail · In-store · Exhibitions"],
      ["Colour", "CMYK + approved Pantones"],
      ["Construction", "Die-cut · fold · glue lines"],
      ["Deliverable", "Annotated die-line + print files"],
    ],
    checks: ["Die-lines on their own layer", "Fold & glue allowances set", "Pantone references locked", "Arabic version mirrored correctly"],
  },
  {
    id: "pack",
    label: "Packaging",
    icon: "box",
    tagline: "Master templates and press-ready pack artwork.",
    specs: [
      ["Platform", "Carton · Tin · Gift box · Sleeve"],
      ["Colour", "CMYK + spot · traps & overprint"],
      ["Bleed", "3 mm · registration allowances"],
      ["Deliverable", "Vendor-spec Illustrator package"],
    ],
    checks: ["Die-line library version confirmed", "Barcode & legal panels verified", "Spot colours & finishes mapped", "SKU naming convention applied"],
  },
  {
    id: "digital",
    label: "Digital",
    icon: "monitor",
    tagline: "Resize matrices and platform-ready asset sets.",
    specs: [
      ["Platform", "Social · Display · Web · Email"],
      ["Colour", "RGB · sRGB profile"],
      ["Safe area", "Per-platform UI overlays respected"],
      ["Deliverable", "Named, versioned delivery package"],
    ],
    checks: ["Platform safe areas respected", "File-weight limits met", "Copy hierarchy intact at every size", "Figma source linked"],
  },
];

const SEED = "GCC Campaign Rollout";

function frameClass(active: boolean) {
  return cn(
    "absolute inset-0 flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)]",
    active ? "scale-100 opacity-100" : "pointer-events-none scale-90 opacity-0",
  );
}

export function RolloutStage() {
  const [active, setActive] = useState<FormatId>("ooh");
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setActive((current) => {
        const index = formats.findIndex((item) => item.id === current);
        return formats[(index + 1) % formats.length].id;
      });
    }, 4800);
    return () => window.clearInterval(timer);
  }, [paused]);

  const format = formats.find((item) => item.id === active) ?? formats[0];

  return (
    <div
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]"
    >
      {/* stage */}
      <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-[#121214] to-black">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_45%,rgba(122,92,255,0.22),transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:44px_44px]"
        />

        <div className="relative flex items-center justify-between px-6 pt-6">
          <span className="micro text-[10px] text-white/45">Master key visual → {format.label}</span>
          <span className="micro flex items-center gap-2 text-[10px] text-white/45">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-acid" />
            Live adaptation
          </span>
        </div>

        <div className="relative h-[24rem] sm:h-[28rem]">
          {/* OOH billboard */}
          <div className={frameClass(active === "ooh")}>
            <div className="relative w-[min(88%,36rem)]">
              <div className="absolute -top-3 left-6 right-6 flex justify-between">
                {[0, 1, 2, 3].map((light) => (
                  <span key={light} className="h-2 w-8 rounded-b-full bg-gradient-to-b from-white/80 to-transparent" />
                ))}
              </div>
              <div className="aspect-[3/1] overflow-hidden rounded-md border-[7px] border-[#2b2b2e] bg-black shadow-lift">
                <Artwork
                  seed={SEED}
                  title="GCC Campaign"
                  client="Rollout · OOH"
                  className="h-full w-full"
                  align="xMidYMax"
                />
              </div>
              <span className="absolute -bottom-16 left-[18%] h-16 w-3 bg-gradient-to-b from-[#3a3a3d] to-transparent" />
              <span className="absolute -bottom-16 right-[18%] h-16 w-3 bg-gradient-to-b from-[#3a3a3d] to-transparent" />
            </div>
          </div>

          {/* POSM floor stand */}
          <div className={frameClass(active === "posm")}>
            <div className="relative flex flex-col items-center">
              <div className="relative h-[17rem] w-[11.5rem] overflow-hidden rounded-t-2xl border-[5px] border-[#2b2b2e] bg-black shadow-lift sm:h-[20rem] sm:w-[13.5rem]">
                <Artwork seed={SEED} title="GCC Campaign" client="Rollout · POSM" className="h-full w-full" />
              </div>
              <div className="h-3 w-[14.5rem] rounded-b-xl bg-[#2b2b2e] sm:w-[16.5rem]" />
              <div className="absolute -right-12 top-10 flex h-20 w-20 rotate-12 animate-float items-center justify-center rounded-full border-4 border-white bg-vermilion text-center text-[10px] font-bold uppercase leading-tight tracking-wide text-white shadow-lift">
                Wobbler
                <br />
                tag
              </div>
            </div>
          </div>

          {/* Packaging 3D */}
          <div className={frameClass(active === "pack")}>
            <div style={{ perspective: "1200px" }}>
              <div
                className="relative animate-box-sway"
                style={{ width: 180, height: 240, transformStyle: "preserve-3d" }}
              >
                <div
                  className="absolute inset-0 overflow-hidden rounded-[3px] border border-white/15"
                  style={{ transform: "translateZ(50px)", backfaceVisibility: "hidden" }}
                >
                  <Artwork seed={SEED} title="GCC Campaign" client="Rollout · Pack" className="h-full w-full" />
                </div>
                <div
                  className="absolute overflow-hidden border border-white/10 bg-gradient-to-b from-[#ff4a1c] to-[#7a5cff]"
                  style={{
                    left: 40,
                    top: 0,
                    width: 100,
                    height: 240,
                    transform: "rotateY(90deg) translateZ(90px)",
                    backfaceVisibility: "hidden",
                  }}
                >
                  <span className="absolute inset-0 flex items-center justify-center [writing-mode:vertical-rl] text-[11px] font-bold uppercase tracking-[0.3em] text-white/80">
                    Master template · 3 mm bleed
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
            </div>
            <div className="absolute bottom-10 h-6 w-48 rounded-[50%] bg-black/60 blur-xl" />
          </div>

          {/* Digital phone */}
          <div className={frameClass(active === "digital")}>
            <div className="relative h-[21rem] w-[10.5rem] overflow-hidden rounded-[2.2rem] border-[6px] border-[#2b2b2e] bg-black shadow-lift sm:h-[25rem] sm:w-[12.5rem]">
              <Artwork seed={SEED} title="GCC Campaign" client="Rollout · Story" className="h-full w-full" />
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
          </div>
        </div>

        <div className="relative flex flex-wrap gap-2 px-6 pb-6">
          {formats.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActive(item.id);
                setPaused(true);
              }}
              aria-pressed={active === item.id}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition-all duration-300",
                active === item.id
                  ? "border-white bg-white text-black"
                  : "border-white/15 bg-white/5 text-white/70 hover:border-white/40 hover:text-white",
              )}
            >
              <Icon name={item.icon} className="h-3.5 w-3.5" />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* spec panel */}
      <div className="flex flex-col rounded-[32px] border border-white/10 bg-[#0c0c0e] p-7">
        <p className="micro text-[10px] text-white/40">Production spec</p>
        <h3 key={format.id} className="display mt-3 text-4xl text-white animate-rise">
          {format.label}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-white/55">{format.tagline}</p>

        <dl className="mt-6 space-y-3.5">
          {format.specs.map(([term, value]) => (
            <div key={`${format.id}-${term}`} className="flex items-start justify-between gap-4 border-b border-white/10 pb-3.5">
              <dt className="micro shrink-0 text-[9px] text-white/35">{term}</dt>
              <dd className="text-right text-[13px] text-white/85">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="micro mt-7 text-[10px] text-white/40">Preflight</p>
        <ul className="mt-3 space-y-2.5">
          {format.checks.map((check, index) => (
            <li
              key={`${format.id}-${check}`}
              className="flex items-center gap-3 text-[13px] text-white/80"
              style={{ animation: "check-in .5s ease both", animationDelay: `${index * 140}ms` }}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-acid text-black">
                <Icon name="check" className="h-3 w-3" strokeWidth={3} />
              </span>
              {check}
            </li>
          ))}
        </ul>

        <p className="mt-auto pt-7 text-[11px] leading-relaxed text-white/35">
          Typical specs shown for illustration. Every project is built to the vendor&apos;s own technical sheet.
        </p>
      </div>
    </div>
  );
}
