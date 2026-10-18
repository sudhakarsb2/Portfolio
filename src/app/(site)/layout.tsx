import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { ScrollProgress } from "@/components/site/scroll-progress";
import { getSettings } from "@/lib/data";
import { publicThemeCss } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const settings = await getSettings();

  return (
    <div className="dark-site relative flex min-h-screen flex-col bg-black text-snow">
      <style dangerouslySetInnerHTML={{ __html: publicThemeCss(settings) }} />
      <ScrollProgress />
      <SiteHeader linkedin={settings.linkedin} photo={settings.profilePhoto || "/images/profile.jpg"} />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
    </div>
  );
}
