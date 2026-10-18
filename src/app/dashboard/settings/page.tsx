import { ProfilePhotoCard } from "@/components/dashboard/profile-photo-card";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

const siteFieldLabels: Record<string, { label: string; multiline?: boolean; group: string }> = {
  studioName: { label: "Display name", group: "Identity" },
  designerName: { label: "Designer name", group: "Identity" },
  roleTitle: { label: "Role title", group: "Identity" },
  subheadline: { label: "Hero sub-headline", multiline: true, group: "Identity" },
  about: { label: "About text (blank line = new paragraph)", multiline: true, group: "Identity" },
  clients: { label: "Brands produced for (comma separated)", multiline: true, group: "Credibility" },
  skills: { label: "Skills (comma separated)", multiline: true, group: "Credibility" },
  email: { label: "Contact email", group: "Contact" },
  location: { label: "Location", group: "Contact" },
  availability: { label: "Availability badge", group: "Contact" },
  responseTime: { label: "Response time note", group: "Contact" },
  linkedin: { label: "LinkedIn URL", group: "Contact" },
  yearsExperience: { label: "Stat — years in design & production", group: "Stats" },
  agencyYears: { label: "Stat — years at current agency", group: "Stats" },
  brandsCount: { label: "Stat — global brands", group: "Stats" },
  channelsCount: { label: "Stat — platforms", group: "Stats" },
};

export default async function DashboardSettingsPage() {
  const [user, settings] = await Promise.all([getCurrentUser(), getSettings()]);

  const siteFields = Object.entries(siteFieldLabels).map(([key, meta]) => ({
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
        initialUrl={settings.profilePhoto ?? ""}
        name={settings.designerName ?? user?.name ?? "Portfolio"}
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
