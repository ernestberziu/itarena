import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "sq" ? "Kushtet e Shërbimit — IT Arena" : "Terms of Service — IT Arena",
  };
}

export default async function KushtetPage({
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
            {locale === "sq" ? "Kushtet e Shërbimit" : "Terms of Service"}
          </h1>
          <p className="text-white/50 text-sm mt-2">
            {locale === "sq" ? "Efektive nga: 1 Janar 2026" : "Effective from: January 1, 2026"}
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-8">
            {locale === "sq" ? (
              <>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">1. Palët e Kontratës</h2>
                  <p className="text-muted-foreground leading-relaxed">Këto kushte rregullojnë marrëdhënien midis IT Arena sh.p.k. (NIPT M11905015A, "Ofruesi") dhe personit fizik ose juridik që porositë shërbime ("Klienti"). Duke porositur shërbime, Klienti pranon këto kushte.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">2. Shërbimet e Ofruara</h2>
                  <p className="text-muted-foreground leading-relaxed">IT Arena ofron shërbime IT sipas ofertës së miratuar me shkrim. Detajet e shërbimit, SLA-të dhe çmimet specifikohen në kontratën individuale ose ofertën e pranuar nga Klienti.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">3. Çmimet dhe Pagesa</h2>
                  <p className="text-muted-foreground leading-relaxed">Çmimet janë ato të specifikuara në ofertë ose kontratë. Faturat lëshohen sipas kushteve të dakorduara. Vonesa në pagesë prej &gt;30 ditësh sjell penalitet 0.5%/ditë. Çmimet mund të ndryshohen me njoftim 30-ditor.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">4. SLA dhe Garancitë</h2>
                  <p className="text-muted-foreground leading-relaxed">SLA-të specifike janë të definuara në kontratën individuale. Kohët e reagimit dhe zgjidhjes zbatohen vetëm gjatë orarit të specifikuar në kontratë. Forcat madhore (emergjenca kombëtare, fatkeqësi natyrore) pezullojnë SLA-të.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">5. Detyrimet e Klientit</h2>
                  <p className="text-muted-foreground leading-relaxed">Klienti merr përsipër të: ofrojë akses të nevojshëm për ekipin IT Arena; informojë për ndryshime teknike relevante; paguajë faturat sipas kushteve; mos përdorë shërbimet në kundërshtim me ligjin.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">6. Konfidencialiteti</h2>
                  <p className="text-muted-foreground leading-relaxed">Të dyja palët marrin përsipër të ruajnë konfidencialitetin e informacionit tregtar dhe teknik të njëra-tjetrës. Ky detyrim mbetet aktiv edhe pas përfundimit të kontratës për 3 vjet.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">7. Pronësia Intelektuale</h2>
                  <p className="text-muted-foreground leading-relaxed">Softueret dhe zgjidhjet e zhvilluara nga IT Arena mbeten pronë e IT Arena-s, me përjashtim të rasteve kur kontrata parashikon ndryshe. Licenca e përdorimit i jepet Klientit gjatë periudhës së kontratës.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">8. Kufizimi i Përgjegjësisë</h2>
                  <p className="text-muted-foreground leading-relaxed">Përgjegjësia totale e IT Arena nuk mund të tejkalojë shumën e paguar nga Klienti në 3 muajt e fundit. IT Arena nuk është përgjegjëse për dëme indirekte, humbje profiti ose të dhënash për shkak të forcës madhore.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">9. Zgjidhja e Mosmarrëveshjeve</h2>
                  <p className="text-muted-foreground leading-relaxed">Palët do të tentojnë zgjidhjen miqësore të çdo mosmarrëveshje. Nëse kjo dështon brenda 30 ditësh, mosmarrëveshjet zgjidhen nga gjykatat kompetente të Tiranës, Shqipëri, sipas ligjit shqiptar.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">10. Ndryshimi i Kushteve</h2>
                  <p className="text-muted-foreground leading-relaxed">IT Arena rezervon të drejtën të ndryshojë këto kushte me njoftim 30-ditor. Vazhdimi i shërbimit pas njoftimit konsiderohet pranim i kushteve të reja.</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">1. Parties to the Contract</h2>
                  <p className="text-muted-foreground leading-relaxed">These terms govern the relationship between IT Arena sh.p.k. (VAT M11905015A, "Provider") and the individual or legal entity ordering services ("Client"). By ordering services, the Client accepts these terms.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">2. Services Provided</h2>
                  <p className="text-muted-foreground leading-relaxed">IT Arena provides IT services according to the written approved offer. Service details, SLAs and pricing are specified in the individual contract or offer accepted by the Client.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">3. Pricing and Payment</h2>
                  <p className="text-muted-foreground leading-relaxed">Prices are those specified in the offer or contract. Invoices are issued according to agreed terms. Payment delays of &gt;30 days incur a penalty of 0.5%/day. Prices may change with 30 days notice.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">4. SLAs and Warranties</h2>
                  <p className="text-muted-foreground leading-relaxed">Specific SLAs are defined in the individual contract. Response and resolution times apply only during the hours specified in the contract. Force majeure (national emergencies, natural disasters) suspends SLAs.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">5. Client Obligations</h2>
                  <p className="text-muted-foreground leading-relaxed">The Client undertakes to: provide necessary access for the IT Arena team; inform of relevant technical changes; pay invoices per terms; not use services contrary to law.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">6. Confidentiality</h2>
                  <p className="text-muted-foreground leading-relaxed">Both parties undertake to maintain confidentiality of each other's commercial and technical information. This obligation remains active after contract termination for 3 years.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">7. Intellectual Property</h2>
                  <p className="text-muted-foreground leading-relaxed">Software and solutions developed by IT Arena remain the property of IT Arena, unless the contract provides otherwise. A use license is granted to the Client during the contract period.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">8. Limitation of Liability</h2>
                  <p className="text-muted-foreground leading-relaxed">IT Arena's total liability cannot exceed the amount paid by the Client in the last 3 months. IT Arena is not responsible for indirect damages, lost profits or data loss due to force majeure.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">9. Dispute Resolution</h2>
                  <p className="text-muted-foreground leading-relaxed">Parties will attempt friendly resolution of any dispute. If this fails within 30 days, disputes are resolved by the competent courts of Tirana, Albania, under Albanian law.</p>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-3">10. Changes to Terms</h2>
                  <p className="text-muted-foreground leading-relaxed">IT Arena reserves the right to change these terms with 30 days notice. Continuation of service after notification is considered acceptance of the new terms.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
