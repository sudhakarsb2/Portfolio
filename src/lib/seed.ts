import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  experiences,
  messages,
  projectTags,
  projects,
  services,
  sessions,
  siteSettings,
  tags,
  testimonials,
  users,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { slugify } from "@/lib/utils";

/** Bump this to replace the demo content on every existing database once. */
const SEED_VERSION = "sudhakar-2026-v1";

const categorySeed = [
  { name: "Brand Rollouts", slug: "brand-rollouts", color: "#ff4a1c", description: "Approved ideas, produced across every channel without drift.", sortOrder: 1 },
  { name: "Out of Home", slug: "out-of-home", color: "#3ba9ff", description: "Billboards, unipoles, bus shelters and mall media — built to scale.", sortOrder: 2 },
  { name: "Point of Sale", slug: "point-of-sale", color: "#d7f24b", description: "POSM and in-store communication that survives the shop floor.", sortOrder: 3 },
  { name: "Packaging", slug: "packaging", color: "#7a5cff", description: "Die-lines, master templates and press-ready pack artwork.", sortOrder: 4 },
  { name: "Digital", slug: "digital", color: "#ff9a3c", description: "Resize matrices and platform-ready assets from Figma to final.", sortOrder: 5 },
  { name: "Print & Editorial", slug: "print-editorial", color: "#e0a100", description: "Magazines, collateral and information design for print.", sortOrder: 6 },
];

const tagSeed = [
  "Rollout",
  "Production",
  "Preflight",
  "CMYK",
  "Pantone",
  "Die-line",
  "Arabic",
  "Figma to Print",
  "Master Templates",
  "Large Format",
  "Retail",
  "FMCG",
  "Luxury",
  "QSR",
  "Automotive",
  "Banking",
  "Infographics",
  "Magazine",
  "Multi-lingual",
];

const serviceSeed = [
  {
    title: "Brand Rollouts & Guardianship",
    slug: "brand-rollouts",
    description:
      "A dedicated brand guardian for your campaigns. Every output is checked against identity frameworks and guidelines — across every channel and touchpoint.",
    deliverables: ["Guideline compliance audits", "Multi-brand font rollouts", "Master template systems", "Managed colour swatches", "Version-controlled asset library"],
    priceFrom: 0,
    accent: "#ff4a1c",
    icon: "aperture",
    sortOrder: 1,
  },
  {
    title: "Packaging Production",
    slug: "packaging-production",
    description:
      "High-volume packaging produced to exact vendor specifications — from master die-line templates to zero-error press runs.",
    deliverables: ["Die-line guide library", "Master packaging templates", "CMYK & Pantone colour management", "Bleed & trap setups", "Press-ready Illustrator files"],
    priceFrom: 0,
    accent: "#7a5cff",
    icon: "box",
    sortOrder: 2,
  },
  {
    title: "Out-of-Home Production",
    slug: "out-of-home",
    description:
      "Billboards, unipoles, bus shelters and mall media. One approved key visual, scaled to every format without losing structure or proportion.",
    deliverables: ["Format-by-format adaptation", "Large-format file prep", "Safe-zone & bleed checks", "Vendor spec compliance", "Final proof sign-off"],
    priceFrom: 0,
    accent: "#3ba9ff",
    icon: "compass",
    sortOrder: 3,
  },
  {
    title: "POSM & In-Store",
    slug: "posm-in-store",
    description:
      "Shelf-talkers, wobblers, floor stands, counter displays and gondola ends — produced for corporate, in-store and retail environments.",
    deliverables: ["POSM artwork & die-cuts", "Retail format adaptation", "Multi-lingual versions", "Production schedules", "Print vendor handover"],
    priceFrom: 0,
    accent: "#d7f24b",
    icon: "layers",
    sortOrder: 4,
  },
  {
    title: "Digital Rollouts",
    slug: "digital-rollouts",
    description:
      "Figma layouts and visual concepts converted into complete, platform-ready asset sets for every digital placement.",
    deliverables: ["Resize matrices", "Platform spec compliance", "Figma to production handoff", "Arabic & bilingual adaptation", "Organised delivery packages"],
    priceFrom: 0,
    accent: "#ff9a3c",
    icon: "monitor",
    sortOrder: 5,
  },
  {
    title: "Prepress & Preflight",
    slug: "prepress-preflight",
    description:
      "Rigorous pre-flight checks so the first press run is the right one: colour, bleed, layers, links, naming and alignment — all verified.",
    deliverables: ["Pre-flight reports", "Layer & naming standards", "Alignment & margin audits", "File management systems", "Archive & version control"],
    priceFrom: 0,
    accent: "#e0a100",
    icon: "book",
    sortOrder: 6,
  },
];

const testimonialSeed = [
  {
    name: "Muhammad Jaan Faruqui",
    role: "Creative Director",
    company: "Mediascope Publicitas India Pvt. Ltd.",
    quote:
      "He doesn't succumb to pressure and gets things completed in a short turnaround time which has awarded him with lots of appreciation.",
    rating: 5,
    sortOrder: 1,
  },
  {
    name: "Asavari Virshid",
    role: "Deputy Manager, Communication Design",
    company: "Tata Interactive Systems",
    quote:
      "His efforts have produced high quality results time again. I feel his promising leadership abilities will become even more effective in a creative field.",
    rating: 5,
    sortOrder: 2,
  },
  {
    name: "Aditya Dalvi",
    role: "Project Manager",
    company: "Tata Interactive Systems",
    quote:
      "Process orientation and completion of assignment with keen skill set and strong graphical background is what he is equipped with.",
    rating: 5,
    sortOrder: 3,
  },
  {
    name: "Ravindra Shinde",
    role: "Manager, Design and Print",
    company: "Orient Press Ltd",
    quote:
      "During his tenure, Sudhakar has consistently demonstrated a strong work ethic and a dedication to success.",
    rating: 5,
    sortOrder: 4,
  },
];

const experienceSeed = [
  {
    role: "Graphic Designer — Production Artist",
    company: "Leo Burnett MEA (Middle East & Africa)",
    period: "April 2018 — Present",
    location: "United Arab Emirates",
    description:
      "Dedicated brand guardian ensuring every creative output adheres to established identity frameworks across every channel. Designer and production artist for high-volume packaging, rollouts for all digital platforms, POSMs and print campaigns for major global accounts — including McDonald's GCC campaigns across corporate, in-store, outdoor (OOH) and packaging collateral. Converts Figma layouts and concepts into press-ready Illustrator and InDesign assets built to exact vendor specifications, with rigorous pre-flight, CMYK and Pantone colour management and bleed setups. Built and manages the die-line library, file-management system and version-control framework; directs multi-brand font rollouts and master packaging templates; manages multi-lingual campaigns.",
    sortOrder: 1,
  },
  {
    role: "Analyst — Graphic Design",
    company: "BlackRock",
    period: "July 2016 — March 2018",
    location: "",
    description:
      "Summarised complicated information into simplified visualisations, and designed information graphics and interactive presentations for print and digital. Recommended reusable deliverable formats, coached the in-house team on data-visualisation practice and ensured designs were implemented correctly in their final form on time.",
    sortOrder: 2,
  },
  {
    role: "Graphic Designer",
    company: "Comart / Comartone",
    period: "March 2015 — April 2016",
    location: "Mumbai Metropolitan Region",
    description:
      "Worked on the Leo Burnett Dubai account — brand-standards compliance, campaign ideas across print, outdoor and digital, and Arabic versions of approved layouts. Produced collateral, newspaper/magazine and OOH ads, and sales-promotion material (POSM, FMOT) for P&G, Bel Group, GMC, du, Ooredoo, McDonald's and Kellogg's.",
    sortOrder: 3,
  },
  {
    role: "Graphic Designer / Magazine Designer",
    company: "Publicitas Publishing",
    period: "October 2012 — February 2015",
    location: "Mumbai Metropolitan Region",
    description:
      "Designed lifestyle, fashion and business magazines — composition and pagination to project specifications — including luxury titles such as Taj Coffee Table, DLF Emporio, The Leela Magazine and The Oberoi Magazine, and in-house titles like Blackbook and Eat Stay Love.",
    sortOrder: 4,
  },
  {
    role: "Team Lead",
    company: "Tata Interactive Systems",
    period: "November 2010 — October 2012",
    location: "Mumbai Metropolitan Region",
    description:
      "Analysed storyboards, coordinated with instructional designers and illustrators, and produced accurate, high-quality, compressed assets and templates against project standards.",
    sortOrder: 5,
  },
  {
    role: "Graphic Designer",
    company: "Orient Press Ltd",
    period: "January 2008 — July 2010",
    location: "Mumbai Area, India",
    description:
      "Electronic prepress and print production: page layouts, plate-making preparation, colour separations and prepress file management for brochures, newsletters, activity books, cartons, calendars, banners and annual reports.",
    sortOrder: 6,
  },
];

type ProjectSeed = {
  title: string;
  client: string;
  year: number;
  category: string;
  featured: boolean;
  order: number;
  summary: string;
  description: string;
  credits: string[];
  tags: string[];
};

const projectSeed: ProjectSeed[] = [
  {
    title: "GCC Campaign Rollout",
    client: "McDonald's — GCC",
    year: 2025,
    category: "brand-rollouts",
    featured: true,
    order: 1,
    summary: "One campaign idea, produced across corporate, in-store, outdoor and packaging collateral for the GCC.",
    description:
      "A single approved creative had to land identically in dozens of formats across the GCC: corporate communication, in-store material, outdoor and packaging collateral. The job was less about invention than discipline — building master files, locking colour and proportion rules, and adapting every layout without letting the idea drift.\n\nEvery asset moved through the same pipeline: structured artwork, pre-flight, vendor-spec checks and a clean hand-off package. The result is a rollout where a tray liner, a window cling and a billboard still read as one campaign.",
    credits: ["Role — Production artist & brand guardian", "Agency — Leo Burnett MEA", "Scope — Corporate · In-store · OOH · Packaging"],
    tags: ["Rollout", "QSR", "Production", "Master Templates"],
  },
  {
    title: "Masterfile & Die-line System",
    client: "Leo Burnett MEA",
    year: 2024,
    category: "brand-rollouts",
    featured: true,
    order: 2,
    summary: "A standardised file-management system, die-line library and version-control framework for distributed teams.",
    description:
      "High-volume production only stays accurate if everyone starts from the same file. This system standardises naming conventions, layer structure, alignment guides and managed colour swatches, so distributed teams always work with active, up-to-date materials.\n\nIt includes a searchable die-line guide library for packaging and a version-control framework that makes it obvious which file is live. Fewer re-dos, cleaner hand-offs and zero ambiguity at the printer.",
    credits: ["Role — System design & maintenance", "Includes — Naming standards · Layer rules · Swatch libraries", "Used by — Studio & vendor teams"],
    tags: ["Master Templates", "Die-line", "Production", "Preflight"],
  },
  {
    title: "Highway Unipole & Mall Media Series",
    client: "Automotive group",
    year: 2025,
    category: "out-of-home",
    featured: true,
    order: 3,
    summary: "A launch key visual scaled from mall media to 48-sheet unipoles with structure and proportion intact.",
    description:
      "Large-format work punishes small mistakes. The key visual was rebuilt per format with safe zones, bleed and resolution handled at the right scale, so the vehicle, headline and legal line stayed legible from highway distance to mall concourse.\n\nFiles were delivered as vendor-ready packages with notes for each site, which meant fewer queries and no reprints at install.",
    credits: ["Role — Large-format production", "Formats — Unipole · Mall media · Bus shelter", "Handover — Vendor spec packages"],
    tags: ["Large Format", "Automotive", "Production", "Rollout"],
  },
  {
    title: "Bus Shelter to Billboard",
    client: "Banking portfolio",
    year: 2024,
    category: "out-of-home",
    featured: false,
    order: 4,
    summary: "A financial-services campaign adapted across OOH formats with strict brand-proportion rules.",
    description:
      "Financial brands are unforgiving about logo clear-space and legal copy. Each OOH format was built from a locked master, with proportions and typography rules audited before artwork left the studio.\n\nThe set shipped as a single, organised package — consistent naming, flattened proofs, and live files — ready for multiple media owners.",
    credits: ["Role — Production & guideline audit", "Formats — Bus shelter · Billboard · Digital OOH"],
    tags: ["Banking", "Large Format", "Preflight"],
  },
  {
    title: "Aisle Takeover Kit",
    client: "FMCG portfolio",
    year: 2024,
    category: "point-of-sale",
    featured: false,
    order: 5,
    summary: "Shelf-talkers, wobblers and floor stands produced as a modular family for in-store activation.",
    description:
      "In-store communication has to work at arm's length and from across the aisle. The kit was built as modular components — shelf strips, wobblers and a floor stand — sharing one grid, so a store team could mix and match without breaking the look.\n\nEach piece was supplied with die-cuts, fold lines and a production schedule for the printer.",
    credits: ["Role — POSM artwork & die-cuts", "Deliverables — Shelf-talker · Wobbler · Floor stand"],
    tags: ["Retail", "FMCG", "Die-line", "Production"],
  },
  {
    title: "Counter Display & Gondola End",
    client: "Confectionery brand",
    year: 2023,
    category: "point-of-sale",
    featured: false,
    order: 6,
    summary: "Impulse-purchase displays built to exact retailer and fabricator specifications.",
    description:
      "Counter and gondola-end displays have to satisfy both the brand and the retailer's fixture rules. Artwork was planned around the construction — fold, glue and cut — with colour managed against approved Pantone references.\n\nThe finished files went to the fabricator as a single clean package with annotated die-lines.",
    credits: ["Role — Production artist", "Deliverables — Counter display · Gondola end · Header cards"],
    tags: ["Retail", "Pantone", "Die-line"],
  },
  {
    title: "Seasonal Gift Box Rollout",
    client: "Luxury group",
    year: 2024,
    category: "packaging",
    featured: true,
    order: 7,
    summary: "Premium seasonal packaging with spot-colour and finishing precision across a multi-maison range.",
    description:
      "Luxury packaging allows no visible compromise. Artwork was set on exact die-lines with managed spot colours, bleed and registration allowances for foils and embossing, then checked against vendor technical specifications before release.\n\nA master template made it possible to roll the same structure across several maisons without losing each house's character.",
    credits: ["Role — Packaging production", "Finishes — Spot colour · Foil · Emboss", "Output — Press-ready Illustrator files"],
    tags: ["Luxury", "Pantone", "Die-line", "CMYK"],
  },
  {
    title: "Multi-SKU Pack Family",
    client: "Dairy & cheese brand",
    year: 2023,
    category: "packaging",
    featured: false,
    order: 8,
    summary: "A consistent pack architecture across dozens of SKUs, flavours and sizes.",
    description:
      "A range lives or dies on consistency at the shelf. A master packaging template governed layout, typography and colour for every SKU, so new variants could be produced quickly and without drift.\n\nEvery pack was pre-flighted for colour, bleeds and barcodes, and filed to a strict naming convention.",
    credits: ["Role — Master templates & SKU production", "Scope — Multiple sizes and flavours"],
    tags: ["FMCG", "Master Templates", "Preflight", "CMYK"],
  },
  {
    title: "Resize Matrix — Social & Display",
    client: "Retail group",
    year: 2025,
    category: "digital",
    featured: false,
    order: 9,
    summary: "Figma concepts converted into complete, platform-ready asset sets.",
    description:
      "Approved Figma layouts were translated into a full matrix of digital placements, each respecting platform safe areas, file-weight limits and brand rules. Layout logic was built once and re-used, so updates ripple through every size at once.\n\nAssets were delivered in organised packages — named, versioned and ready for trafficking.",
    credits: ["Role — Digital production", "Workflow — Figma to final delivery"],
    tags: ["Figma to Print", "Retail", "Rollout"],
  },
  {
    title: "Bilingual Arabic Adaptation",
    client: "Telecom campaign",
    year: 2023,
    category: "digital",
    featured: false,
    order: 10,
    summary: "Right-to-left adaptations that keep structure, margins and brand proportion intact.",
    description:
      "Arabic versions are not mirrored layouts. Each adaptation was rebuilt for right-to-left reading, with typography, line-breaks and hierarchy re-balanced so the Arabic and English versions carry equal weight.\n\nMargins and proportion rules were kept identical across languages, so both versions share one visual identity.",
    credits: ["Role — Multi-lingual production", "Languages — English · Arabic"],
    tags: ["Arabic", "Multi-lingual", "Rollout"],
  },
  {
    title: "Luxury Magazine Pagination",
    client: "Publicitas Publishing",
    year: 2014,
    category: "print-editorial",
    featured: false,
    order: 11,
    summary: "Composition and pagination for luxury lifestyle and hospitality magazines.",
    description:
      "Designed and paginated lifestyle, fashion and business magazines for luxury and hospitality brands, working from editorial briefs through pre-print steps to final files.\n\nThe craft here — rhythm, white space and typographic discipline — is the same one that now underpins high-volume production work.",
    credits: ["Role — Magazine designer", "Titles — Luxury hospitality & lifestyle publications"],
    tags: ["Magazine", "Production", "CMYK"],
  },
  {
    title: "Information Graphics for Finance",
    client: "BlackRock",
    year: 2017,
    category: "print-editorial",
    featured: false,
    order: 12,
    summary: "Complex financial information turned into clear visualisations for print and digital.",
    description:
      "Worked with stakeholders to summarise complicated information into simplified visualisations, presentations and infographics for both print and digital — and set standards so the in-house team could re-use them.\n\nConcepts were sketched first, then built into final formats and delivered on time.",
    credits: ["Role — Graphic design analyst", "Output — Infographics · Presentations"],
    tags: ["Infographics", "Banking", "Production"],
  },
];

const messageSeed = [
  {
    name: "Hannah Weber",
    email: "hannah@example.com",
    company: "Brand studio",
    subject: "Packaging rollout support",
    budget: "Campaign rollout",
    message:
      "We have a multi-SKU packaging refresh landing next quarter and need a production artist who can build master templates and pre-flight everything for print. Are you available for a project-based engagement?",
    status: "new" as const,
  },
  {
    name: "Marcus Chen",
    email: "marcus@example.com",
    company: "Agency",
    subject: "OOH adaptation for a launch",
    budget: "Single project",
    message:
      "Looking for help adapting a launch key visual across unipoles, mall media and bus shelters. Files need to meet media-owner specs.",
    status: "new" as const,
  },
  {
    name: "Sofia Almeida",
    email: "sofia@example.com",
    company: "Retail",
    subject: "POSM kit for a seasonal promotion",
    budget: "Single project",
    message:
      "We need shelf-talkers, wobblers and a floor stand for a seasonal activation across three markets, with Arabic versions.",
    status: "read" as const,
  },
  {
    name: "Daniel Ross",
    email: "daniel@example.com",
    company: "Consumer goods",
    subject: "Ongoing production support",
    budget: "Retainer / ongoing",
    message:
      "Interested in ongoing support for packaging and digital rollouts — someone to guard the guidelines and keep our file system tidy.",
    status: "read" as const,
  },
];

const settingSeed: Array<{ key: string; value: string; group: string }> = [
  { key: "studioName", value: "Sudhakar Bhambade", group: "general" },
  { key: "designerName", value: "Sudhakar Bhambade", group: "general" },
  { key: "roleTitle", value: "Graphic Designer / Production Specialist", group: "general" },
  { key: "headline", value: "Your brand, on every touchpoint.", group: "general" },
  {
    key: "subheadline",
    value:
      "Graphic designer and production artist turning approved ideas into flawless, press-ready rollouts — across digital, out-of-home, point of sale and packaging.",
    group: "general",
  },
  {
    key: "about",
    value:
      "Graphic designer with a demonstrated history of working in advertising and print. Strong business development professional with a post graduate degree in advertising and media from the University of Mumbai and a certificate diploma in applied art from Rachana Sansad, School of Applied Art.\n\nSince 2018 I have worked at Leo Burnett MEA as a dedicated brand guardian and production artist — taking approved creative and producing high-volume packaging, rollouts for every digital platform, POSMs and print campaigns for major global accounts. I bridge digital design and physical production, converting Figma layouts and visual concepts into press-ready Adobe Illustrator and InDesign assets built to exact vendor specifications.",
    group: "general",
  },
  { key: "email", value: "sudhakar.bhambade2@gmail.com", group: "contact" },
  { key: "location", value: "United Arab Emirates", group: "contact" },
  { key: "availability", value: "Open to production & rollout projects", group: "contact" },
  { key: "responseTime", value: "Replies within one working day", group: "contact" },
  { key: "linkedin", value: "https://www.linkedin.com/in/sudhakar-bhambade-596231111", group: "social" },
  { key: "yearsExperience", value: "18", group: "stats" },
  { key: "agencyYears", value: "8", group: "stats" },
  { key: "brandsCount", value: "15", group: "stats" },
  { key: "channelsCount", value: "4", group: "stats" },
  {
    key: "clients",
    value:
      "McDonald's, P&G, Ferrero, Bel Group, Kellogg's, Visa, Emirates NBD, ADCB, Dubai Holding, Richemont, Van Cleef & Arpels, Panerai, AGMC, Mercedes-Benz, Geely, Home Centre, Philip Morris, du, Ooredoo",
    group: "general",
  },
  {
    key: "skills",
    value:
      "Production schedules, Brand guardianship, Press-ready artwork, CMYK & Pantone colour management, Die-line libraries, Pre-flight & bleed setups, Figma to Illustrator / InDesign, File naming & version control, Arabic & bilingual adaptation, Exhibitions, Personal management",
    group: "general",
  },
  {
    key: "education",
    value: JSON.stringify([
      {
        school: "Rachana Sansad's College of Applied Arts and Craft",
        program: "Certification in Applied Art",
        period: "2016 — 2018",
      },
      {
        school: "University of Mumbai",
        program: "Master's degree in Commerce, Accounting and Business / Management",
        period: "2012 — 2014",
      },
      {
        school: "University of Mumbai",
        program: "PGDAM — Post Graduate Diploma in Advertising and Media",
        period: "2012 — 2013",
      },
    ]),
    group: "general",
  },
  {
    key: "process",
    value: JSON.stringify([
      {
        title: "Decode",
        body: "Read the brief, the guidelines, the vendor specs and the schedule — and flag risks before a single artboard is opened.",
      },
      {
        title: "Build",
        body: "Master templates and structured files, converting Figma layouts and concepts into Illustrator and InDesign built to spec.",
      },
      {
        title: "Preflight",
        body: "Colour, bleed, layers, links, naming and alignment — checked until the first press run is the right one.",
      },
      {
        title: "Deliver",
        body: "Organised, versioned packages with clear hand-over to every vendor, plus a clean archive for next time.",
      },
    ]),
    group: "general",
  },
];

let seedPromise: Promise<void> | null = null;

async function runSeed(): Promise<void> {
  const current = await db
    .select({ value: siteSettings.value })
    .from(siteSettings)
    .where(eq(siteSettings.key, "seedVersion"))
    .limit(1);
  if (current[0]?.value === SEED_VERSION) return;

  // One-time migration: replace any earlier demo content (media uploads are kept).
  await db.delete(projectTags);
  await db.delete(projects);
  await db.delete(tags);
  await db.delete(categories);
  await db.delete(services);
  await db.delete(testimonials);
  await db.delete(experiences);
  await db.delete(messages);
  await db.delete(siteSettings);
  await db.delete(sessions);
  await db.delete(users);

  const passwordHash = hashPassword("portfolio2026");

  await db.insert(users).values([
    {
      email: "sudhakar.bhambade2@gmail.com",
      passwordHash,
      name: "Sudhakar Bhambade",
      role: "owner",
      title: "Graphic Designer / Production Specialist",
      bio: "Production artist producing brand rollouts for digital, out-of-home, point of sale and packaging.",
    },
    {
      email: "editor@portfolio.app",
      passwordHash,
      name: "Studio Editor",
      role: "editor",
      title: "Content Editor",
      bio: "Helps keep the portfolio up to date.",
    },
  ]);

  const insertedCategories = await db.insert(categories).values(categorySeed).returning();
  const insertedTags = await db
    .insert(tags)
    .values(tagSeed.map((name) => ({ name, slug: slugify(name) })))
    .returning();

  await db.insert(services).values(serviceSeed);
  await db.insert(testimonials).values(testimonialSeed);
  await db.insert(experiences).values(experienceSeed);

  const categoryIdBySlug = new Map(insertedCategories.map((row) => [row.slug, row.id]));
  const tagIdByName = new Map(insertedTags.map((row) => [row.name, row.id]));

  for (const project of projectSeed) {
    const [row] = await db
      .insert(projects)
      .values({
        title: project.title,
        slug: slugify(project.title),
        client: project.client,
        year: project.year,
        categoryId: categoryIdBySlug.get(project.category) ?? null,
        summary: project.summary,
        description: project.description,
        credits: project.credits,
        featured: project.featured,
        order: project.order,
        status: "published",
      })
      .returning();

    const tagIds = project.tags
      .map((tag) => tagIdByName.get(tag))
      .filter((id): id is number => typeof id === "number");

    if (tagIds.length) {
      await db.insert(projectTags).values(tagIds.map((tagId) => ({ projectId: row.id, tagId })));
    }
  }

  await db.insert(messages).values(messageSeed);
  await db.insert(siteSettings).values([
    ...settingSeed,
    { key: "seedVersion", value: SEED_VERSION, group: "system" },
  ]);
}

export async function countProjects(): Promise<number> {
  const [{ total }] = await db.select({ total: count() }).from(projects);
  return total;
}

export function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}
