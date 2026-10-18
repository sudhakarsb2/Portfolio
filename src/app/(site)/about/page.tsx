import type { Metadata } from "next";
import Link from "next/link";
import { HeroPortrait } from "@/components/site/hero-portrait";
import { Icon } from "@/components/ui/icons";
import { Counter, Reveal } from "@/components/ui/reveal";
import { getExperiences, getSettings, getTestimonials } from "@/lib/data";

export const metadata: Metadata = {
  title: "About",
  description:
    "Sudhakar Bhambade — graphic designer and production specialist, brand guardian at Leo Burnett MEA.",
};

export const dynamic = "force-dynamic";

type Education = { school: string; program: string; period: string };

const list = (value?: string) =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const tools = [
  { code: "Ai", name: "Illustrator", color: "#ff9a00" },
  { code: "Id", name: "InDesign", color: "#ff3d7f" },
  { code: "Fg", name: "Figma", color: "#a259ff" },
];

export default async function AboutPage() {
  const [experiences, settings, testimonials] = await Promise.all([
    getExperiences(),
    getSettings(),
    getTestimonials(),
  ]);

  const name = settings.designerName ?? "Sudhakar Bhambade";
  const role = settings.roleTitle ?? "Graphic Designer / Production Specialist";
  const paragraphs = (settings.about ?? "").split("\n\n").filter(Boolean);
  const skills = list(settings.skills);

  let education: Education[] = [];
  try {
    education = JSON.parse(settings.education ?? "[]") as Education[];
  } catch {
    education = [];
  }

  const stats = [
    { label: "Years in design & production", value: Number(settings.yearsExperience ?? 18), suffix: "+" },
    { label: "Years at Leo Burnett MEA", value: Number(settings.agencyYears ?? 8), suffix: "+" },
    { label: "Global brands", value: Number(settings.brandsCount ?? 15), suffix: "+" },
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
              <p className="micro text-white/40">About</p>
              <h1 className="mt-6 text-[clamp(2.8rem,7.5vw,5.75rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-white">
                The person who makes sure it{" "}
                <span className="bg-gradient-to-r from-azure via-violet to-vermilion bg-clip-text text-transparent">
                  prints right.
                </span>
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
            <HeroPortrait src={settings.profilePhoto} name={name} role={role} />
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

        <section className="mt-24 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <div className="h-full rounded-[32px] border border-white/10 bg-[#0d0d0f] p-8 md:p-10">
              <p className="micro text-white/40">Skills</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-[13px] font-medium text-white/80"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="h-full rounded-[32px] border border-white/10 bg-[#0d0d0f] p-8 md:p-10">
              <p className="micro text-white/40">Daily tools</p>
              <div className="mt-6 grid grid-cols-3 gap-4">
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
                Plus pre-flight, colour management and file-system discipline — the unglamorous tools that
                make press runs go right.
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
                  <p className="max-w-3xl text-[15px] leading-relaxed text-white/60">{experience.description}</p>
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
