import type { Metadata } from "next";
import Link from "next/link";
import { HeroPortrait } from "@/components/site/hero-portrait";
import { Icon } from "@/components/ui/icons";
import { Counter, Reveal } from "@/components/ui/reveal";
import { getExperiences, getSettings, getTestimonials } from "@/lib/data";
import { pageText } from "@/lib/page-content";

export const metadata: Metadata = {
  title: "About",
  description:
    "Sudhakar Bhambade — graphic designer, visual identity designer and production specialist, brand guardian at Leo Burnett MEA.",
};

export const dynamic = "force-dynamic";

type Education = { school: string; program: string; period: string };

const list = (value?: string) =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

/**
 * Daily tools. The list lives in site settings so it can be edited from the
 * dashboard. Each entry is `Code | Name | Hex colour`.
 */
const DEFAULT_TOOLS = [
  { code: "Id", name: "InDesign", color: "#ff3d7f" },
  { code: "Ps", name: "Photoshop", color: "#31a8ff" },
  { code: "Ai", name: "Illustrator", color: "#ff9a00" },
  { code: "Ac", name: "Acrobat Pro", color: "#ec1c24" },
  { code: "Of", name: "Microsoft Office", color: "#d83b01" },
  { code: "Cc", name: "Adobe Creative Cloud", color: "#ff0000" },
];

const SWATCHES = ["#ff3d7f", "#31a8ff", "#ff9a00", "#ec1c24", "#d83b01", "#7a5cff", "#00d4a0", "#d7f24b", "#e0a100", "#f5f5f7"];

function parseTools(value: string | undefined) {
  const entries = (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [code, name, color] = line.split("|").map((part) => part.trim());
      if (!name) return null;
      return {
        code: (code || name.slice(0, 2)).toUpperCase(),
        name,
        color: color || SWATCHES[index % SWATCHES.length],
      };
    })
    .filter((entry): entry is { code: string; name: string; color: string } => entry !== null);
  return entries.length ? entries : DEFAULT_TOOLS;
}

export default async function AboutPage() {
  const [experiences, settings, testimonials] = await Promise.all([
    getExperiences(),
    getSettings(),
    getTestimonials(),
  ]);

  const name = settings.designerName ?? "Sudhakar Bhambade";
  const role = settings.roleTitle ?? "Graphic Designer / Identity & Production Specialist";
  const paragraphs = (settings.about ?? "").split("\n\n").filter(Boolean);
  const tools = parseTools(settings.dailyTools);

/** Skills are grouped for a tidy grid on every screen size. Anything unknown
 *  still appears, under "Other", so dashboard edits are never lost. */
const SKILL_GROUPS: Array<{ heading: string; match: string[] }> = [
  {
    heading: "Creative",
    match: ["visual identity", "creative analysis", "information design", "composition"],
  },
  {
    heading: "Print & production",
    match: ["production schedules", "press-ready", "pre-flight", "cmyk", "die-line", "print"],
  },
  {
    heading: "Brand",
    match: ["brand guardian", "file naming", "version control"],
  },
  {
    heading: "Adaptation",
    match: ["arabic", "bilingual", "illustrator & indesign", "masters"],
  },
];

function buildSkillGroups(skills: string[]) {
  const used = new Set<string>();
  const groups = SKILL_GROUPS.map((group) => {
    const items = skills.filter((skill) => {
      const lower = skill.toLowerCase();
      const hit = !used.has(skill) && group.match.some((needle) => lower.includes(needle));
      if (hit) used.add(skill);
      return hit;
    });
    return { heading: group.heading, items };
  }).filter((group) => group.items.length > 0);

  const rest = skills.filter((skill) => !used.has(skill));
  if (rest.length) groups.push({ heading: "Other", items: rest });
  return groups;
}
  const skills = list(settings.skills);
  const skillGroups = buildSkillGroups(skills);

  let education: Education[] = [];
  try {
    education = JSON.parse(settings.education ?? "[]") as Education[];
  } catch {
    education = [];
  }

  const stats = [
    { label: "Years in design & production", value: Number(settings.yearsExperience ?? 18), suffix: "+" },
    { label: "Years at Leo Burnett MEA", value: Number(settings.agencyYears ?? 8), suffix: "+" },
    { label: "Global brands", value: Number(settings.brandsCount ?? 20), suffix: "+" },
    { label: "Platforms", value: Number(settings.channelsCount ?? 4), suffix: "" },
  ];

  return (
    <div>
      <section className="relative overflow-hidden bg-black pb-24 pt-36 md:pb-32 md:pt-44">
        <div className="pointer-events-none absolute -right-24 -top-24 h-[30rem] w-[30rem] rounded-full bg-vermilion/20 blur-[130px] animate-aurora-2" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-azure/20 blur-[120px] animate-aurora" />
        <div className="relative shell grid items-center gap-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Reveal>
              <p className="micro text-white/40">{pageText(settings, "aboutEyebrow")}</p>
              <h1 className="mt-6 text-[clamp(2.8rem,7.5vw,5.75rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-white">
                {pageText(settings, "aboutTitle")}
              </h1>
            </Reveal>
            <Reveal delay={100}>
              <div className="mt-8 space-y-5 text-[17px] leading-[1.75] text-white/60">
                {paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>
            </Reveal>
            <Reveal delay={180}>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[13px] font-semibold text-black transition-all hover:bg-vermilion hover:text-white"
                >
                  Work with me
                </Link>
                {settings.linkedin ? (
                  <a
                    href={settings.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-12 items-center gap-2 rounded-full border border-white/25 px-6 text-[13px] font-semibold text-white transition-all hover:border-white hover:bg-white/10"
                  >
                    <Icon name="linkedin" className="h-4 w-4" />
                    LinkedIn
                  </a>
                ) : null}
              </div>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <HeroPortrait src={settings.profilePhoto || "/images/profile.jpg"} name={name} role={role} />
          </Reveal>
        </div>
      </section>

      <div className="shell pb-24">
        <Reveal>
          <section className="grid grid-cols-2 gap-8 rounded-[32px] border border-white/10 bg-gradient-to-b from-[#141416] to-[#09090a] p-8 md:grid-cols-4 md:p-10">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-5xl font-semibold tracking-[-0.05em] text-white">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-3 text-[13px] leading-snug text-white/45">{stat.label}</p>
              </div>
            ))}
          </section>
        </Reveal>

        <section className="mt-24 space-y-6">
          <Reveal>
            <div className="rounded-[32px] border border-white/10 bg-[#0d0d0f] p-8 md:p-10">
              <p className="micro text-white/40">Skills</p>
              <div className="mt-7 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {skillGroups.map((group) => (
                  <div key={group.heading}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
                      {group.heading}
                    </p>
                    <ul className="mt-3.5 space-y-2">
                      {group.items.map((skill) => (
                        <li
                          key={skill}
                          className="flex items-start gap-2.5 border-b border-white/[0.06] pb-2 text-[13px] leading-snug text-white/75"
                        >
                          <span
                            className="mt-[0.4rem] h-1.5 w-1.5 shrink-0 rounded-full bg-vermilion"
                            aria-hidden="true"
                          />
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="h-full rounded-[32px] border border-white/10 bg-[#0d0d0f] p-8 md:p-10">
              <p className="micro text-white/40">Daily tools</p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {tools.map((tool) => (
                  <div
                    key={tool.name}
                    className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-500 hover:-translate-y-1.5 hover:border-white/25"
                  >
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-black transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110"
                      style={{ backgroundColor: tool.color }}
                    >
                      {tool.code}
                    </span>
                    <p className="mt-4 text-sm font-semibold text-white">{tool.name}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm leading-relaxed text-white/45">
                Different format files converted into friendly, editable masters — plus pre-flight,
                colour management and file-system discipline, the unglamorous tools that make press
                runs go right.
              </p>
            </div>
          </Reveal>
        </section>

        <section className="mt-28">
          <Reveal>
            <p className="micro text-white/40">Experience</p>
            <h2 className="mt-5 text-[clamp(2.2rem,5vw,3.75rem)] font-semibold leading-[1] tracking-[-0.045em] text-white">
              Where the work came from
            </h2>
          </Reveal>

          <ol className="mt-12">
            {experiences.map((experience, index) => (
              <Reveal key={experience.id} delay={index * 60}>
                <li className="grid gap-4 border-t border-white/10 py-9 transition-colors hover:bg-white/[0.02] md:grid-cols-[300px_1fr] md:gap-14">
                  <div>
                    <p className="text-xl font-semibold tracking-tight text-white">{experience.role}</p>
                    <p className="mt-1.5 text-sm text-white/55">{experience.company}</p>
                    <p className="micro mt-3 text-[9px] text-white/35">
                      {experience.period}
                      {experience.location ? ` · ${experience.location}` : ""}
                    </p>
                  </div>
                  <div className="max-w-3xl space-y-4">
                    {experience.description
                      .split("\n\n")
                      .filter(Boolean)
                      .map((paragraph) => (
                        <p key={paragraph.slice(0, 32)} className="text-[15px] leading-relaxed text-white/60">
                          {paragraph}
                        </p>
                      ))}
                  </div>
                </li>
              </Reveal>
            ))}
            <li className="border-t border-white/10" />
          </ol>
        </section>

        {education.length ? (
          <section className="mt-24">
            <Reveal>
              <p className="micro text-white/40">Education</p>
            </Reveal>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {education.map((item, index) => (
                <Reveal key={`${item.school}-${item.period}`} delay={index * 80} className="h-full">
                  <div className="h-full rounded-[28px] border border-white/10 bg-[#0d0d0f] p-7">
                    <p className="micro text-[9px] text-vermilion">{item.period}</p>
                    <p className="mt-4 text-lg font-semibold leading-snug tracking-tight text-white">
                      {item.school}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-white/55">{item.program}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        ) : null}

        {testimonials.length ? (
          <section className="mt-28 rounded-[36px] border border-white/10 bg-gradient-to-br from-[#141416] to-[#09090a] p-8 md:p-12">
            <Reveal>
              <p className="micro text-white/40">Recommendations</p>
            </Reveal>
            <div className="mt-10 grid gap-10 md:grid-cols-2">
              {testimonials.map((testimonial, index) => (
                <Reveal key={testimonial.id} delay={index * 70}>
                  <figure className="border-l-2 border-vermilion pl-6">
                    <blockquote className="text-xl font-medium leading-snug tracking-tight text-white">
                      &ldquo;{testimonial.quote}&rdquo;
                    </blockquote>
                    <figcaption className="mt-5 text-sm text-white/50">
                      <span className="font-semibold text-white">{testimonial.name}</span>
                      {testimonial.role ? ` · ${testimonial.role}` : ""}
                      {testimonial.company ? `, ${testimonial.company}` : ""}
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
