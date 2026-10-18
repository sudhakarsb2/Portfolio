import { ProfilePhotoCard } from "@/components/dashboard/profile-photo-card";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { pageFields } from "@/lib/page-content";
import { SiteCustomizer } from "@/components/dashboard/site-customizer";
import { color } from "@/lib/theme";

export const dynamic = "force-dynamic";

const siteFieldLabels: Record<string, { label: string; multiline?: boolean; group: string }> = {
  studioName: { label: "Display name", group: "Identity" },
  designerName: { label: "Designer name", group: "Identity" },
  roleTitle: { label: "Role title", group: "Identity" },
  subheadline: { label: "Hero sub-headline", multiline: true, group: "Identity" },
  heroWords: { label: "Homepage rotating words (comma separated)", multiline: true, group: "Identity" },
  about: { label: "About text (blank line = new paragraph)", multiline: true, group: "Identity" },
  clients: { label: "Brands produced for (comma separated)", multiline: true, group: "Credibility" },
  skills: { label: "Skills (comma separated)", multiline: true, group: "Credibility" },
  dailyTools: {
    label: "Daily tools — one per line: Code | Name | Colour",
    multiline: true,
    group: "Credibility",
  },
  email: { label: "Contact email", group: "Contact" },
  availability: { label: "Availability badge", group: "Contact" },
  relocation: {
    label: "Relocation note (leave blank to hide that pill)",
    group: "Contact",
  },
  responseTime: { label: "Response time note", group: "Contact" },
  linkedin: { label: "LinkedIn URL", group: "Contact" },
  yearsExperience: { label: "Stat — years in design & production", group: "Stats" },
  agencyYears: { label: "Stat — years at current agency", group: "Stats" },
  brandsCount: { label: "Stat — global brands", group: "Stats" },
  channelsCount: { label: "Stat — platforms", group: "Stats" },
};

export default async function DashboardSettingsPage() {
  const [user, settings] = await Promise.all([getCurrentUser(), getSettings()]);

  const pageKeys = new Set(pageFields.map((field) => field.key));
  const siteFields = Object.entries(siteFieldLabels)
    .filter(([key]) => !pageKeys.has(key))
    .map(([key, meta]) => ({
      key,
      label: meta.label,
      value: settings[key] ?? "",
      multiline: meta.multiline,
      group: meta.group,
    }));

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-3xl text-ink">Settings</h2>
        <p className="mt-1.5 text-sm text-ink/55">
          Manage your account, profile photo and the copy that appears on the public portfolio.
        </p>
      </header>

      <ProfilePhotoCard
        initialUrl={settings.profilePhoto || "/images/profile.jpg"}
        name={settings.designerName ?? user?.name ?? "Portfolio"}
      />

      <SiteCustomizer
        initialUrl={settings.siteUrl ?? ""}
        initialColors={{
          colorVermilion: color(settings.colorVermilion, "#ff4a1c"),
          colorViolet: color(settings.colorViolet, "#7a5cff"),
          colorAzure: color(settings.colorAzure, "#3ba9ff"),
          colorAcid: color(settings.colorAcid, "#d7f24b"),
        }}
      />

      <SettingsForm
        profile={{
          name: user?.name ?? "",
          email: user?.email ?? "",
          title: user?.title ?? "",
          bio: user?.bio ?? "",
          avatarUrl: user?.avatarUrl ?? "",
        }}
        siteFields={siteFields}
      />
    </div>
  );
}
