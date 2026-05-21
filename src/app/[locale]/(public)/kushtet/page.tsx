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
    page: "legalTerms",
  });
}

export default async function KushtetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const sq = locale === "sq";

  const sections = sq
    ? [
        {
          title: "1. Zbatimi",
          content: (
            <p>
              Këto kushte rregullojnë përdorimin e faqes itarena.al, dyqanit online, portaleve dhe
              shërbimeve të ofruara nga IT Arena sh.p.k. (NIPT M11905015A). Duke porositur shërbime
              ose duke përdorur platformën, pranoni këto kushte dhe ofertën/kontratën individuale
              që ka prioritet për detajet komerciale.
            </p>
          ),
        },
        {
          title: "2. Shërbimet",
          content: (
            <p>
              Ofruam shërbime IT (mbështetje, cloud, rrjet, siguri, zhvillim softuerësh, etj.) sipas
              përshkrimit në faqe, ofertë ose kontratë. Përmasat, SLA-të, çmimet dhe afatet janë ato
              të dakorduara me shkrim — jo informacione të përgjithshme në marketing.
            </p>
          ),
        },
        {
          title: "3. Porositë dhe ofertat",
          content: (
            <p>
              Ofertat janë të vlefshme për periudhën e shënuar. Porositë online në dyqan i nënshtrohen
              konfirmimit të stokut dhe çmimit. IT Arena mund të refuzojë porosi që duken abuzive ose
              në kundërshtim me ligjin.
            </p>
          ),
        },
        {
          title: "4. Çmimet dhe pagesa",
          content: (
            <p>
              Çmimet në faturë/ofertë janë përfundimtare përkushtuese (përveç gabimeve evidente).
              Pagesa sipas kushteve të kontratës. Vonesa &gt;30 ditë mund të sjellë interes ligjor dhe
              pezullim shërbimi. Çmimet e abonimeve mund të ndryshojnë me njoftim 30-ditor.
            </p>
          ),
        },
        {
          title: "5. SLA dhe garanci",
          content: (
            <p>
              SLA specifike vlen vetëm kur janë në kontratë të nënshkruar. Kohët e reagimit
              zbatohen në orarin e punës të përcaktuar, përveç paketave 24/7. Forca madhore pezullon
              detyrimet. Garanci për hardware/software sipas prodhuesit ose kontratës.
            </p>
          ),
        },
        {
          title: "6. Detyrimet e klientit",
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Të sigurojë akses dhe informacion të nevojshëm</li>
              <li>Të ruajë konfidencialitetin e kredencialeve të portaleve</li>
              <li>Të paguajë në kohë dhe të respektojë politikën e përdorimit të drejtë</li>
              <li>Të mos përdorë shërbimet për aktivitete të paligjshme</li>
            </ul>
          ),
        },
        {
          title: "7. Pronësia intelektuale",
          content: (
            <p>
              Softueri, dokumentacioni dhe metodologjitë e IT Arena mbeten pronë e IT Arena-s, përveç
              kur kontrata parashikon transferim. Klientit i jepet licencë përdorimi për qëllimin e
              kontratës. Materialet e klientit mbeten pronë e klientit.
            </p>
          ),
        },
        {
          title: "8. Konfidencialiteti",
          content: (
            <p>
              Të dyja palët mbrojnë informacionin konfidencial për 3 vjet pas përfundimit të
              marrëdhënies, përveç kur zbulimi kërkohet me ligj.
            </p>
          ),
        },
        {
          title: "9. Kufizimi i përgjegjësisë",
          content: (
            <p>
              Përgjegjësia totale e IT Arena për dëme direkte nuk tejkalon shumën e paguar nga
              klienti për shërbimin specifik në 12 muajt e fundit, përveç rasteve ku ligji ndalon
              kufizimin (dëme me qëllim, etj.). Nuk përgjigjemi për dëme indirekte, humbje fitimi
              ose të dhënash për shkak të forcës madhore ose përdorimit të gabuar nga klienti.
            </p>
          ),
        },
        {
          title: "10. Privatësia dhe cookies",
          content: (
            <p>
              Përpunimi i të dhënave rregullohet nga{" "}
              <a href="/privatesia" className="text-primary hover:underline">
                Politika e Privatësisë
              </a>{" "}
              dhe{" "}
              <a href="/politika-cookies" className="text-primary hover:underline">
                Politika e Cookies
              </a>
              .
            </p>
          ),
        },
        {
          title: "11. Zgjidhja e mosmarrëveshjeve",
          content: (
            <p>
              Ligji shqiptar. Tentativë zgjidhje miqësore 30 ditë. Pas kësaj, gjykatat kompetente të
              Tiranës.
            </p>
          ),
        },
        {
          title: "12. Ndryshime",
          content: (
            <p>
              IT Arena mund të përditësojë kushtet me njoftim në faqe. Vazhdimi i përdorimit pas
              datës së efektit konsiderohet pranim, përveç kur ligji kërkon pëlqim të veçantë.
            </p>
          ),
        },
      ]
    : [
        {
          title: "1. Scope",
          content: (
            <p>
              These terms govern use of itarena.al, the online shop, portals, and services provided
              by IT Arena sh.p.k. (VAT M11905015A). By ordering services or using the platform, you
              accept these terms and the individual offer/contract that prevails for commercial
              details.
            </p>
          ),
        },
        {
          title: "2. Services",
          content: (
            <p>
              We provide IT services (support, cloud, network, security, software development, etc.)
              as described on the site, in quotes, or contracts. Scope, SLAs, pricing, and timelines
              are those agreed in writing — not general marketing information.
            </p>
          ),
        },
        {
          title: "3. Orders and quotes",
          content: (
            <p>
              Quotes are valid for the stated period. Online shop orders are subject to stock and
              price confirmation. IT Arena may refuse orders that appear abusive or unlawful.
            </p>
          ),
        },
        {
          title: "4. Pricing and payment",
          content: (
            <p>
              Prices on invoice/quote are binding (except obvious errors). Payment per contract terms.
              Delays over 30 days may incur legal interest and service suspension. Subscription prices
              may change with 30 days notice.
            </p>
          ),
        },
        {
          title: "5. SLA and warranties",
          content: (
            <p>
              Specific SLAs apply only when in a signed contract. Response times apply during agreed
              business hours except on 24/7 packages. Force majeure suspends obligations. Hardware/software
              warranties per manufacturer or contract.
            </p>
          ),
        },
        {
          title: "6. Client obligations",
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide necessary access and information</li>
              <li>Keep portal credentials confidential</li>
              <li>Pay on time and respect fair use policy</li>
              <li>Not use services for unlawful activities</li>
            </ul>
          ),
        },
        {
          title: "7. Intellectual property",
          content: (
            <p>
              IT Arena software, documentation, and methodologies remain IT Arena property unless
              the contract provides transfer. The client receives a use license for the contract
              purpose. Client materials remain client property.
            </p>
          ),
        },
        {
          title: "8. Confidentiality",
          content: (
            <p>
              Both parties protect confidential information for 3 years after the relationship ends,
              except where disclosure is required by law.
            </p>
          ),
        },
        {
          title: "9. Limitation of liability",
          content: (
            <p>
              IT Arena&apos;s total liability for direct damages shall not exceed amounts paid by the
              client for the specific service in the last 12 months, except where law prohibits
              limitation. We are not liable for indirect damages, lost profits, or data loss due to
              force majeure or client misuse.
            </p>
          ),
        },
        {
          title: "10. Privacy and cookies",
          content: (
            <p>
              Data processing is governed by our{" "}
              <a href={sq ? "/privatesia" : `/${locale}/privatesia`} className="text-primary hover:underline">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a href={sq ? "/politika-cookies" : `/${locale}/politika-cookies`} className="text-primary hover:underline">
                Cookie Policy
              </a>
              .
            </p>
          ),
        },
        {
          title: "11. Disputes",
          content: (
            <p>
              Albanian law. 30-day friendly resolution attempt. Thereafter, competent courts of
              Tirana.
            </p>
          ),
        },
        {
          title: "12. Changes",
          content: (
            <p>
              IT Arena may update terms with notice on the site. Continued use after the effective
              date constitutes acceptance, except where law requires separate consent.
            </p>
          ),
        },
      ];

  return (
    <LegalDocument
      locale={locale}
      title={sq ? "Kushtet e Shërbimit" : "Terms of Service"}
      updated={sq ? "Efektive nga: 21 Maj 2026" : "Effective from: May 21, 2026"}
      relatedLinks={[
        { href: "/privatesia", label: sq ? "Privatësia" : "Privacy" },
        { href: "/politika-cookies", label: sq ? "Cookies" : "Cookies" },
      ]}
      sections={sections}
    />
  );
}
