import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { AuthSessionProvider } from "@/components/providers/auth-session-provider";
import { getPublishedSiteContent } from "@/lib/site-content/db";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getPublishedSiteContent();

  return (
    <AuthSessionProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar services={content.services} siteSettings={content.settings} />
        <main className="flex-1">{children}</main>
        <Footer siteSettings={content.settings} services={content.services} />
      </div>
    </AuthSessionProvider>
  );
}
