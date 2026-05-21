import type { Metadata } from "next";
import { LegalDocument } from "@/components/public/legal-document";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { SeoLocale } from "@/lib/seo/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale: (locale === "en" ? "en" : "sq") as SeoLocale,
    page: "legalCookies",
  });
}

export default async function PolitikaCookiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const sq = locale === "sq";

  const sections = sq
    ? [
        {
          title: "1. Çfarë janë cookies",
          content: (
            <p>
              Cookies janë skedarë të vegjël teksti që ruhen në pajisjen tuaj kur vizitoni
              itarena.al. Ne përdorim cookies dhe teknologji të ngjashme (p.sh. localStorage për
              preferencat e pëlqimit) për funksione thelbësore dhe, vetëm me pëlqimin tuaj, për
              analitikë.
            </p>
          ),
        },
        {
          title: "2. Llojet e cookies që përdorim",
          content: (
            <>
              <p className="font-semibold text-foreground">Cookies thelbësore (gjithmonë aktive)</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Autentifikim dhe sesion (portali, zona e klientit)</li>
                <li>Siguria (CSRF, mbrojtje nga abuzimi)</li>
                <li>Preferenca gjuhësore dhe ruajtja e zgjedhjes së cookies</li>
                <li>Shporta dhe funksione të dyqanit online</li>
              </ul>
              <p className="font-semibold text-foreground mt-4">Cookies analitike (me pëlqim)</p>
              <p className="mt-2">
                Mund të aktivizojmë mjete si Google Analytics për të kuptuar përdorimin e faqes.
                Këto cookies nuk vendosen pa pëlqimin tuaj të qartë përmes banner-it të cookies.
              </p>
            </>
          ),
        },
        {
          title: "3. Baza ligjore",
          content: (
            <p>
              Cookies thelbësore përpunohen për interesin legjitim të ofrimit të shërbimit dhe
              sigurisë. Cookies analitike bazohen në pëlqimin tuaj (GDPR neni 6(1)(a) dhe Ligji
              124/2024 për mbrojtjen e të dhënave personale në Republikën e Shqipërisë), të cilin
              mund ta tërhiqni në çdo kohë.
            </p>
          ),
        },
        {
          title: "4. Kohëzgjatja",
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Sesion: deri sa mbyllni browser-in</li>
              <li>Autentifikim: sipas politikës së sesionit (zakonisht deri 30 ditë)</li>
              <li>Preferenca cookies: 12 muaj (rinovohet kur ndryshoni zgjedhjen)</li>
              <li>Analitikë: sipas furnizuesit (p.sh. 14 muaj për GA4, nëse aktivizohet)</li>
            </ul>
          ),
        },
        {
          title: "5. Si të menaxhoni cookies",
          content: (
            <p>
              Përdorni butonin &ldquo;Menaxho preferencat&rdquo; në fund të faqes, cilësimet e
              browser-it, ose refuzoni cookies jo-thelbësore në banner-in e parë. Tërheqja e
              pëlqimit nuk ndikon në ligjshmërinë e përpunimit para tërheqjes.
            </p>
          ),
        },
        {
          title: "6. Cookies të palëve të treta",
          content: (
            <p>
              Kur aktivizoni analitikën, furnizuesi i palës së tretë mund të vendosë cookies sipas
              politikës së vet. Ne nuk shesim të dhënat tuaja. Për transferime jashtë BE-së,
              përdorim garanci të përshtatshme kontraktuale kur zbatohet.
            </p>
          ),
        },
        {
          title: "7. Kontakt",
          content: (
            <p>
              Pyetje për cookies:{" "}
              <a href="mailto:privacy@itarena.al" className="text-primary hover:underline">
                privacy@itarena.al
              </a>
              . Për të drejtat GDPR, shihni{" "}
              <a href={sq ? "/privatesia" : `/${locale}/privatesia`} className="text-primary hover:underline">
                Politikën e Privatësisë
              </a>
              .
            </p>
          ),
        },
      ]
    : [
        {
          title: "1. What are cookies",
          content: (
            <p>
              Cookies are small text files stored on your device when you visit itarena.al. We use
              cookies and similar technologies (e.g. localStorage for consent preferences) for
              essential functions and, only with your consent, for analytics.
            </p>
          ),
        },
        {
          title: "2. Types of cookies we use",
          content: (
            <>
              <p className="font-semibold text-foreground">Essential cookies (always on)</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Authentication and session (portal, client area)</li>
                <li>Security (CSRF, abuse protection)</li>
                <li>Language preference and cookie choice storage</li>
                <li>Cart and online shop functionality</li>
              </ul>
              <p className="font-semibold text-foreground mt-4">Analytics cookies (consent required)</p>
              <p className="mt-2">
                We may enable tools such as Google Analytics to understand site usage. These cookies
                are not placed without your explicit consent via our cookie banner.
              </p>
            </>
          ),
        },
        {
          title: "3. Legal basis",
          content: (
            <p>
              Essential cookies are processed for our legitimate interest in providing and securing
              the service. Analytics cookies rely on your consent (GDPR Art. 6(1)(a) and Albanian Law
              124/2024 on personal data protection), which you may withdraw at any time.
            </p>
          ),
        },
        {
          title: "4. Retention",
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Session: until you close the browser</li>
              <li>Authentication: per session policy (typically up to 30 days)</li>
              <li>Cookie preferences: 12 months (renewed when you change your choice)</li>
              <li>Analytics: per provider (e.g. 14 months for GA4 if enabled)</li>
            </ul>
          ),
        },
        {
          title: "5. How to manage cookies",
          content: (
            <p>
              Use the &ldquo;Manage preferences&rdquo; button in the site footer, your browser
              settings, or reject non-essential cookies on the first banner. Withdrawing consent does
              not affect the lawfulness of processing before withdrawal.
            </p>
          ),
        },
        {
          title: "6. Third-party cookies",
          content: (
            <p>
              When you enable analytics, the third-party provider may set cookies under its own
              policy. We do not sell your data. For transfers outside the EU, we use appropriate
              contractual safeguards where applicable.
            </p>
          ),
        },
        {
          title: "7. Contact",
          content: (
            <p>
              Cookie questions:{" "}
              <a href="mailto:privacy@itarena.al" className="text-primary hover:underline">
                privacy@itarena.al
              </a>
              . For GDPR rights, see our{" "}
              <a href={sq ? "/privatesia" : `/${locale}/privatesia`} className="text-primary hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          ),
        },
      ];

  return (
    <LegalDocument
      locale={locale}
      title={sq ? "Politika e Cookies" : "Cookie Policy"}
      updated={sq ? "Përditësuar: 21 Maj 2026" : "Updated: May 21, 2026"}
      relatedLinks={[
        { href: "/privatesia", label: sq ? "Privatësia" : "Privacy" },
        { href: "/kushtet", label: sq ? "Kushtet" : "Terms" },
      ]}
      sections={sections}
    />
  );
}
