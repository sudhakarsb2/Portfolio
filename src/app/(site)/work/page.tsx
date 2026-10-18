import type { Metadata } from "next";
import { WorkExplorer } from "@/components/site/work-explorer";
import { Reveal } from "@/components/ui/reveal";
import { getCategories, getPublishedProjects, getSettings, getTags } from "@/lib/data";
import { pageText } from "@/lib/page-content";

export const metadata: Metadata = {
  title: "Selected Work",
  description:
    "Brand rollouts, out-of-home, point of sale, packaging and digital production by Sudhakar Bhambade.",
};

export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const [projects, categories, tags, settings] = await Promise.all([
    getPublishedProjects(),
    getCategories(),
    getTags(),
    getSettings(),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden bg-black pb-16 pt-36 md:pb-24 md:pt-44">
        <div className="pointer-events-none absolute -right-24 -top-24 h-[30rem] w-[30rem] rounded-full bg-violet/25 blur-[130px] animate-aurora-2" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-vermilion/20 blur-[120px] animate-aurora" />
        <div className="relative shell">
          <Reveal>
            <p className="micro text-white/40">{pageText(settings, "workEyebrow")}</p>
            <h1 className="mt-6 max-w-4xl text-[clamp(2.8rem,8vw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-white">
              {pageText(settings, "workTitle")}
            </h1>
            <p className="mt-7 max-w-xl text-[17px] leading-relaxed text-white/55">
              {`${projects.length} `}{pageText(settings, "workIntro")}
            </p>
          </Reveal>
        </div>
      </section>

      <div className="shell pb-24 pt-8">
        <WorkExplorer
          projects={projects.map((project) => ({
            id: project.id,
            title: project.title,
            slug: project.slug,
            client: project.client,
            year: project.year,
            summary: project.summary,
            featured: project.featured,
            coverImage: project.coverImage,
            category: project.category
              ? { id: project.category.id, name: project.category.name, color: project.category.color }
              : null,
            tags: project.tags.map((tag) => ({ id: tag.id, name: tag.name })),
          }))}
          categories={categories.map((category) => ({
            id: category.id,
            name: category.name,
            color: category.color,
          }))}
          tags={tags.map((tag) => ({ id: tag.id, name: tag.name }))}
        />
      </div>
    </div>
  );
}
