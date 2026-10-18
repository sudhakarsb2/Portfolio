import { PageContentEditor } from "@/components/dashboard/page-content-editor";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DashboardPagesPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-3xl text-ink">Pages</h2>
        <p className="mt-1.5 text-sm text-ink/55">
          Every heading, label and paragraph on the public site. Pick a page, rewrite the words,
          publish — it is live immediately.
        </p>
      </header>

      <PageContentEditor initial={settings} />
    </div>
  );
}
