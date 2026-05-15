import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "sq" ? "Politika e Privatësisë — IT Arena" : "Privacy Policy — IT Arena",
  };
}

export default async function PrivatesiaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="flex flex-col">
      <section className="bg-[hsl(222,47%,9%)] text-white py-14">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-extrabold">
            {locale === "sq" ? "Politika e Privatësisë" : "Privacy Policy"}
          </h1>
          <p className="text-white/50 text-sm mt-2">
            {locale === "sq" ? "Përditësuar: 1 Janar 2026" : "Updated: January 1, 2026"}
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="prose prose-slate max-w-none space-y-8">
            {locale === "sq" ? (
              <>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">1. Kush jemi ne</h2>
                  <p className="text-muted-foreground leading-relaxed">IT Arena sh.p.k, NIPT M11905015A, me seli në Rr. Loni Ligori, Astir, Tiranë, Shqipëri, është kontrollues i të dhënave personale të mbledhura nëpërmjet faqes sonë të internetit dhe shërbimeve tona.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">2. Çfarë të dhënash mbledhim</h2>
                  <p className="text-muted-foreground leading-relaxed">Mbledhim të dhëna që ju jepni drejtpërdrejt: emër, email, numër telefoni, emër kompanie dhe mesazhe kur plotësoni formularët tanë. Gjithashtu mbledhim automatikisht të dhëna teknike si adresa IP, tipi i browser-it dhe faqet e vizituara.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">3. Si i përdorim të dhënat</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Për t'iu kthyer përgjigje kërkesave dhe ofertave tuaja</li>
                    <li>• Për të menaxhuar kontratën dhe shërbimet e miratuara</li>
                    <li>• Për t'iu dërguar njoftime teknike dhe updates</li>
                    <li>• Për të përmirësuar faqen dhe shërbimet tona</li>
                    <li>• Për të plotësuar detyrimet ligjore dhe rregullatore</li>
                  </ul>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">4. Baza ligjore e përpunimit</h2>
                  <p className="text-muted-foreground leading-relaxed">Përpunojmë të dhënat tuaja bazuar në: (a) ekzekutimin e kontratës kur jeni klient i IT Arena; (b) interesin tonë legjitim për të ofruar shërbime cilësore; (c) pëlqimin tuaj për marketingun; (d) detyrimet ligjore.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">5. Mbrojtja e të dhënave</h2>
                  <p className="text-muted-foreground leading-relaxed">IT Arena aplikon masa teknike dhe organizative sipas ISO 27001 për mbrojtjen e të dhënave tuaja. Të dhënat ruhen në serverë brenda BE-së ose me garanci të nivelit të ekuivalent të mbrojtjes.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">6. Të drejtat tuaja</h2>
                  <p className="text-muted-foreground leading-relaxed">Keni të drejtë të: aksesoni, korrigjoni, fshini të dhënat tuaja; kufizoni ose kundërshtoni përpunimin; portatilitetit të të dhënave; tërhiqni pëlqimin. Dërgoni kërkesën tek <a href="mailto:privacy@itarena.al" className="text-primary hover:underline">privacy@itarena.al</a>.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">7. Cookies</h2>
                  <p className="text-muted-foreground leading-relaxed">Faqja jonë përdor cookies thelbësore për funksionimin e saj dhe cookies analitike (Google Analytics) me pëlqimin tuaj. Mund të kontrolloni cookies nëpërmjet cilësimeve të browser-it tuaj.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">8. Na kontaktoni</h2>
                  <p className="text-muted-foreground leading-relaxed">Për çdo pyetje mbi privatësinë: <a href="mailto:privacy@itarena.al" className="text-primary hover:underline">privacy@itarena.al</a> ose Rr. Loni Ligori, Astir, Tiranë.</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">1. Who we are</h2>
                  <p className="text-muted-foreground leading-relaxed">IT Arena sh.p.k, VAT M11905015A, headquartered at Rr. Loni Ligori, Astir, Tirana, Albania, is the controller of personal data collected through our website and services.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">2. What data we collect</h2>
                  <p className="text-muted-foreground leading-relaxed">We collect data you provide directly: name, email, phone number, company name and messages when you fill in our forms. We also automatically collect technical data such as IP address, browser type and pages visited.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">3. How we use your data</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• To respond to your requests and quotes</li>
                    <li>• To manage the agreed contract and services</li>
                    <li>• To send you technical notifications and updates</li>
                    <li>• To improve our website and services</li>
                    <li>• To fulfill legal and regulatory obligations</li>
                  </ul>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">4. Legal basis for processing</h2>
                  <p className="text-muted-foreground leading-relaxed">We process your data based on: (a) contract performance when you are an IT Arena client; (b) our legitimate interest in providing quality services; (c) your consent for marketing; (d) legal obligations.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">5. Data protection</h2>
                  <p className="text-muted-foreground leading-relaxed">IT Arena applies technical and organizational measures in accordance with ISO 27001 to protect your data. Data is stored on servers within the EU or with equivalent level protection guarantees.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">6. Your rights</h2>
                  <p className="text-muted-foreground leading-relaxed">You have the right to: access, correct, delete your data; restrict or object to processing; data portability; withdraw consent. Send your request to <a href="mailto:privacy@itarena.al" className="text-primary hover:underline">privacy@itarena.al</a>.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">7. Cookies</h2>
                  <p className="text-muted-foreground leading-relaxed">Our website uses essential cookies for its operation and analytical cookies (Google Analytics) with your consent. You can control cookies through your browser settings.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">8. Contact us</h2>
                  <p className="text-muted-foreground leading-relaxed">For any privacy questions: <a href="mailto:privacy@itarena.al" className="text-primary hover:underline">privacy@itarena.al</a> or Rr. Loni Ligori, Astir, Tirana.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
