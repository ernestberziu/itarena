import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { CookieConsent } from "@/components/public/cookie-consent";
import { AuthSessionProvider } from "@/components/providers/auth-session-provider";
import { getPublishedSiteContent } from "@/lib/site-content/db";
import { OrganizationWebSiteJsonLd } from "@/lib/seo/json-ld";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getPublishedSiteContent();

  return (
    <AuthSessionProvider>
      <OrganizationWebSiteJsonLd
        logoUrl={content.settings.branding.logoUrl}
        socialLinks={content.settings.social.links}
      />
      <div className="flex min-h-screen flex-col">
        <Navbar services={content.services} siteSettings={content.settings} />
        <main className="flex-1">{children}</main>
        <Footer siteSettings={content.settings} services={content.services} />
        <CookieConsent />
      </div>
    </AuthSessionProvider>
  );
}
