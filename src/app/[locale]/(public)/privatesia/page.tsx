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
    page: "legalPrivacy",
  });
}

export default async function PrivatesiaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const sq = locale === "sq";

  const sections = sq
    ? [
        {
          title: "1. Kontrolluesi i të dhënave",
          content: (
            <p>
              IT Arena sh.p.k., NIPT M11905015A, Rr. Loni Ligori, Astir, Tiranë, Shqipëri
              (&ldquo;IT Arena&rdquo;, &ldquo;ne&rdquo;). Email:{" "}
              <a href="mailto:privacy@itarena.al" className="text-primary hover:underline">
                privacy@itarena.al
              </a>
              .
            </p>
          ),
        },
        {
          title: "2. Të dhënat që mbledhim",
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Identifikim: emër, email, telefon, kompani, NIPT (kur aplikohet)</li>
              <li>Kontratë &amp; faturim: adresa, të dhëna pagese, historik porosish</li>
              <li>Portali klientit: kredenciale, ticket-e, dokumente të ngarkuara</li>
              <li>Formularë publikë: kontakt, kërkesa oferte, abonime</li>
              <li>Teknike: IP, log serveri, pajisje/browser (cookies sipas politikës së cookies)</li>
            </ul>
          ),
        },
        {
          title: "3. Qëllimet dhe baza ligjore",
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Kontratë / ofertë — ekzekutimi i kontratës (neni 6(1)(b) GDPR)</li>
              <li>Mbështetje IT — interes legjitim për shërbim dhe siguri</li>
              <li>Marketing — pëlqim i qartë (newsletter, mund të tërhiqet)</li>
              <li>Detyrime ligjore — faturim, kontabilitet, autoritete</li>
              <li>Analitikë web — vetëm me pëlqim (shih politika cookies)</li>
            </ul>
          ),
        },
        {
          title: "4. Ndarja me palë të treta",
          content: (
            <p>
              Mund të përdorim procesues (hosting, email SMTP, pagesa, CRM) me kontrata përpunimi
              (DPA). Nuk shesim të dhëna personale. Transferime jashtë BE-së vetëm me garanci të
              përshtatshme (SCC, vendim mjaftueshmërie, etj.).
            </p>
          ),
        },
        {
          title: "5. Ruajtja",
          content: (
            <p>
              Ruajmë të dhënat sa kohë nevojiten për qëllimin e mbledhjes: kontratat deri 10 vjet
              pas mbarimit (ligj fiskal), ticket-e deri 3 vjet, marketing deri tërheqja e pëlqimit,
              log teknike deri 12 muaj (në varësi të nevojës së sigurisë).
            </p>
          ),
        },
        {
          title: "6. Siguria",
          content: (
            <p>
              Masat teknike dhe organizative sipas ISO 27001: kontroll aksesi, enkriptim në tranzit,
              backup, trajnime stafi, menaxhim incidentesh. Njoftojmë autoritetin dhe ju brenda 72
              orëve kur një shkelje rrezikon të drejtat tuaja.
            </p>
          ),
        },
        {
          title: "7. Të drejtat tuaja",
          content: (
            <p>
              Akses, korrigjim, fshirje, kufizim, portabilitet, kundërshtim, tërheqje pëlqimi.
              Kërkesa në{" "}
              <a href="mailto:privacy@itarena.al" className="text-primary hover:underline">
                privacy@itarena.al
              </a>
              . Përgjigje brenda 30 ditëve. Ankesë te Komisioneri për Mbrojtjen e të Dhënave
              Personale (Shqipëri).
            </p>
          ),
        },
        {
          title: "8. Cookies",
          content: (
            <p>
              Përdorim cookies thelbësore dhe, me pëlqim, analitike. Detaje në{" "}
              <a href="/politika-cookies" className="text-primary hover:underline">
                Politikën e Cookies
              </a>
              . Menaxhoni preferencat nga banner-i ose fundi i faqes.
            </p>
          ),
        },
        {
          title: "9. Ndryshime",
          content: (
            <p>
              Mund të përditësojmë këtë politikë; data e fundit shfaqet në krye. Ndryshime materiale
              njoftohen në faqe ose me email për klientët aktivë.
            </p>
          ),
        },
      ]
    : [
        {
          title: "1. Data controller",
          content: (
            <p>
              IT Arena sh.p.k., VAT M11905015A, Rr. Loni Ligori, Astir, Tirana, Albania
              (&ldquo;IT Arena&rdquo;, &ldquo;we&rdquo;). Email:{" "}
              <a href="mailto:privacy@itarena.al" className="text-primary hover:underline">
                privacy@itarena.al
              </a>
              .
            </p>
          ),
        },
        {
          title: "2. Data we collect",
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Identity: name, email, phone, company, VAT ID (where applicable)</li>
              <li>Contract &amp; billing: address, payment data, order history</li>
              <li>Client portal: credentials, tickets, uploaded documents</li>
              <li>Public forms: contact, quote requests, subscriptions</li>
              <li>Technical: IP, server logs, device/browser (cookies per cookie policy)</li>
            </ul>
          ),
        },
        {
          title: "3. Purposes and legal bases",
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Contract / quote — performance of contract (GDPR Art. 6(1)(b))</li>
              <li>IT support — legitimate interest in service and security</li>
              <li>Marketing — explicit consent (newsletter, withdraw anytime)</li>
              <li>Legal obligations — invoicing, accounting, authorities</li>
              <li>Web analytics — consent only (see cookie policy)</li>
            </ul>
          ),
        },
        {
          title: "4. Sharing with third parties",
          content: (
            <p>
              We use processors (hosting, SMTP email, payments, CRM) under data processing
              agreements. We do not sell personal data. Transfers outside the EU only with appropriate
              safeguards (SCCs, adequacy decisions, etc.).
            </p>
          ),
        },
        {
          title: "5. Retention",
          content: (
            <p>
              We keep data as long as needed for the purpose: contracts up to 10 years after end
              (tax law), tickets up to 3 years, marketing until consent withdrawal, technical logs up
              to 12 months (depending on security needs).
            </p>
          ),
        },
        {
          title: "6. Security",
          content: (
            <p>
              Technical and organizational measures aligned with ISO 27001: access control,
              encryption in transit, backups, staff training, incident management. We notify the
              authority and you within 72 hours when a breach risks your rights.
            </p>
          ),
        },
        {
          title: "7. Your rights",
          content: (
            <p>
              Access, rectification, erasure, restriction, portability, objection, withdraw consent.
              Requests to{" "}
              <a href="mailto:privacy@itarena.al" className="text-primary hover:underline">
                privacy@itarena.al
              </a>
              . Response within 30 days. Complaint to the Albanian Data Protection Commissioner.
            </p>
          ),
        },
        {
          title: "8. Cookies",
          content: (
            <p>
              We use essential cookies and, with consent, analytics. Details in our{" "}
              <a href={sq ? "/politika-cookies" : `/${locale}/politika-cookies`} className="text-primary hover:underline">
                Cookie Policy
              </a>
              . Manage preferences via the banner or site footer.
            </p>
          ),
        },
        {
          title: "9. Changes",
          content: (
            <p>
              We may update this policy; the latest date is shown at the top. Material changes are
              announced on the site or by email to active clients.
            </p>
          ),
        },
      ];

  return (
    <LegalDocument
      locale={locale}
      title={sq ? "Politika e Privatësisë" : "Privacy Policy"}
      updated={sq ? "Përditësuar: 21 Maj 2026" : "Updated: May 21, 2026"}
      relatedLinks={[
        { href: "/politika-cookies", label: sq ? "Cookies" : "Cookies" },
        { href: "/kushtet", label: sq ? "Kushtet" : "Terms" },
      ]}
      sections={sections}
    />
  );
}
