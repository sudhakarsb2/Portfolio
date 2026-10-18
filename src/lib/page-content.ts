/**
 * Every piece of copy on the public pages that is not stored in another
 * resource (projects, services, testimonials, experience). Each entry maps a
 * settings key to a friendly label so the studio owner can rewrite the site
 * from the dashboard without touching code.
 *
 * `value` is only the starting default: once a key exists in site_settings the
 * database value always wins.
 */
export type PageField = {
  key: string;
  label: string;
  page: string;
  multiline?: boolean;
  value: string;
};

export const PAGE_GROUPS = ["Home", "Work", "Services", "About", "Contact", "Footer"] as const;

export const pageFields: PageField[] = [
  // ───────── Home ─────────
  {
    key: "homeHeroRole",
    label: "Line under your name",
    page: "Home",
    value: "Visual Identity & Production",
  },
  {
    key: "homeHeroLine1",
    label: "Headline — line 1",
    page: "Home",
    value: "Your brand,",
  },
  {
    key: "homeHeroLine2",
    label: "Headline — line 2",
    page: "Home",
    value: "on every",
  },
  {
    key: "homeCraftEyebrow",
    label: "Section label — the craft",
    page: "Home",
    value: "The craft",
  },
  {
    key: "homeCraftTitle",
    label: "Section heading — the craft",
    page: "Home",
    value: "One idea. Every touchpoint.",
  },
  {
    key: "homeCraftBody",
    label: "Section paragraph — the craft",
    page: "Home",
    multiline: true,
    value:
      "One idea, taken across out-of-home, point of sale, packaging and digital — the same visual thinking, adapted so it works whatever the size or surface.",
  },
  {
    key: "homeWorkEyebrow",
    label: "Section label — work",
    page: "Home",
    value: "Selected rollouts",
  },
  { key: "homeWorkTitle", label: "Section heading — work", page: "Home", value: "Recent work" },
  {
    key: "homeServicesEyebrow",
    label: "Section label — what I produce",
    page: "Home",
    value: "What I produce",
  },
  {
    key: "homeServicesTitle",
    label: "Section heading — what I produce",
    page: "Home",
    value: "Creative eye. Production hand.",
  },
  {
    key: "homeCareerEyebrow",
    label: "Section label — career",
    page: "Home",
    value: "Career",
  },
  {
    key: "homeCareerTitle",
    label: "Section heading — career",
    page: "Home",
    value: "From first sketch to final press run",
  },
  {
    key: "homeTestimonialsEyebrow",
    label: "Section label — recommendations",
    page: "Home",
    value: "Recommendations",
  },
  {
    key: "homeTestimonialsTitle",
    label: "Section heading — recommendations",
    page: "Home",
    value: "What the people I've worked for say",
  },
  // ───────── Work ─────────
  { key: "workEyebrow", label: "Label above heading", page: "Work", value: "The full portfolio" },
  { key: "workTitle", label: "Page heading", page: "Work", value: "Every channel. One standard." },
  {
    key: "workIntro",
    label: "Intro paragraph",
    page: "Work",
    multiline: true,
    value:
      "Projects across brand rollouts, out-of-home, point of sale, packaging, digital and print — filter by discipline or tag to find what you need.",
  },
  { key: "workEmptyTitle", label: "Empty state heading", page: "Work", value: "Nothing here yet" },
  {
    key: "workEmptyBody",
    label: "Empty state text",
    page: "Work",
    multiline: true,
    value: "Try a different discipline, or clear the filters to see the whole archive.",
  },

  // ───────── Services ─────────
  {
    key: "servicesEyebrow",
    label: "Label above heading",
    page: "Services",
    value: "What I produce",
  },
  {
    key: "servicesTitle",
    label: "Page heading",
    page: "Services",
    value: "Built to spec. Delivered clean.",
  },
  {
    key: "servicesIntro",
    label: "Intro paragraph",
    page: "Services",
    multiline: true,
    value:
      "Six disciplines, one standard: creative analysed for brand impact, then every file structured, colour-managed and preflighted so the first press run is the right one.",
  },

  // ───────── About ─────────
  { key: "aboutEyebrow", label: "Label above heading", page: "About", value: "About" },
  {
    key: "aboutTitle",
    label: "Page heading",
    page: "About",
    value: "The person who makes sure it looks right — and prints right.",
  },
  {
    key: "aboutToolsTitle",
    label: "Toolkit heading",
    page: "About",
    value: "The toolkit",
  },
  {
    key: "aboutToolsBody",
    label: "Toolkit paragraph",
    page: "About",
    multiline: true,
    value:
      "Source files arrive in all kinds of formats. I convert them into friendly Illustrator and InDesign files — easier to optimise, easier to handle, and quick enough for a rollout turnaround. Pre-flight and colour management do the rest.",
  },
  {
    key: "aboutExperienceEyebrow",
    label: "Experience label",
    page: "About",
    value: "Experience",
  },
  {
    key: "aboutExperienceTitle",
    label: "Experience heading",
    page: "About",
    value: "Where the work came from",
  },

  // ───────── Contact ─────────
  { key: "contactEyebrow", label: "Label above heading", page: "Contact", value: "Start a project" },
  {
    key: "contactTitle",
    label: "Page heading",
    page: "Contact",
    value: "Let's get your brand production-ready.",
  },
  {
    key: "contactIntro",
    label: "Intro paragraph",
    page: "Contact",
    multiline: true,
    value:
      "Share the brief, the channels and the deadline. I read every message myself and reply with questions, a plan, or an honest \"that's not a fit.\"",
  },

  // ───────── Footer ─────────
];

const byKey = new Map(pageFields.map((field) => [field.key, field]));

/** Reads a page string from settings, falling back to the written default. */
export function pageText(settings: Record<string, string | undefined>, key: string): string {
  const fromDb = settings[key];
  if (fromDb !== undefined && fromDb.trim() !== "") return fromDb;
  return byKey.get(key)?.value ?? "";
}

/** Seed rows so the dashboard editor starts with real, editable values. */
export function pageContentSeed(): Array<{ key: string; value: string; group: string }> {
  return pageFields.map((field) => ({ key: field.key, value: field.value, group: "pages" }));
}
