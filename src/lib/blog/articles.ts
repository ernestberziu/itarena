/** Shared blog articles for pages, sitemap, and SEO. */
export type BlogArticle = {
  slug: string;
  coverImg: string;
  tagSq: string;
  tagEn: string;
  tagColor: string;
  readMin: number;
  dateSq: string;
  dateEn: string;
  authorSq: string;
  authorEn: string;
  titleSq: string;
  titleEn: string;
  bodySq: string;
  bodyEn: string;
};

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: "wifi-6-bizneset-shqiptare",
    coverImg: "https://picsum.photos/seed/wifi6-blog/1200/600",
    tagSq: "Rrjetëzim",
    tagEn: "Networking",
    tagColor: "bg-emerald-100 text-emerald-700",
    readMin: 5,
    dateSq: "10 Maj 2026",
    dateEn: "May 10, 2026",
    authorSq: "Erion Haxhiu, CTO",
    authorEn: "Erion Haxhiu, CTO",
    titleSq: "WiFi 6: A Ia Vlen Investimi për Bizneset Shqiptare?",
    titleEn: "WiFi 6: Is the Investment Worth It for Albanian Businesses?",
    bodySq: `WiFi 6 (802.11ax) është standardi i ri wireless që premton ndryshime të rëndësishme. Por a ia vlen investimi për bizneset shqiptare?

**Çfarë sjell WiFi 6?**

WiFi 6 ofron deri 9.6 Gbps — rreth 4× shpejtësi më shumë se WiFi 5. Por ajo që e dallon vërtet është efikasiteti me shumë pajisje njëkohësisht (MU-MIMO 8×8 dhe teknologjia OFDMA).

**Kur ia vlen?**

- Zyra me >20 pajisje wireless njëkohësisht
- Hapësira të dendura si hotele, konferenca, spitale
- Aplikacione që kërkojnë latencë të ulët (VoIP, video-konferencing)

**Kur nuk ia vlen?**

Nëse keni <10 pajisje dhe hapësirë të vogël, WiFi 5 mbetet plotësisht i mjaftueshëm dhe zgjidhja ekonomikisht më e zgjuar.

**Kostot në Shqipëri**

Access Point WiFi 6 enterprise (Ubiquiti U6 Pro) kushton rreth 190€, krahasuar me 120€ për WiFi 5. Diferenca është e arsyeshme nëse zgjidhja afatgjatë është prioritet.

**Rekomandimi ynë**

Për biznese me >15 pajisje wireless ose environment me shumë lëvizje (konferenca, showroom), WiFi 6 është investim i arsyeshëm. Për zyra të vogla, WiFi 5 mbetet i mjaftueshëm.`,
    bodyEn: `WiFi 6 (802.11ax) is the new wireless standard promising significant changes. But is the investment worth it for Albanian businesses?

**What does WiFi 6 bring?**

WiFi 6 offers up to 9.6 Gbps — about 4× faster than WiFi 5. But what truly sets it apart is efficiency with many simultaneous devices (8×8 MU-MIMO and OFDMA technology).

**When is it worth it?**

- Offices with >20 simultaneous wireless devices
- Dense spaces like hotels, conferences, hospitals
- Applications requiring low latency (VoIP, video conferencing)

**When is it not?**

If you have <10 devices and a small space, WiFi 5 remains perfectly sufficient and the economically smarter solution.

**Costs in Albania**

An enterprise WiFi 6 access point (Ubiquiti U6 Pro) costs around €190, compared to €120 for WiFi 5. The difference is reasonable if a long-term solution is the priority.

**Our recommendation**

For businesses with >15 wireless devices or high-mobility environments (conferences, showrooms), WiFi 6 is a reasonable investment. For small offices, WiFi 5 remains sufficient.`,
  },
  {
    slug: "microsoft-365-copilot-shqiperi",
    coverImg: "https://picsum.photos/seed/copilot-m365/1200/600",
    tagSq: "Cloud",
    tagEn: "Cloud",
    tagColor: "bg-blue-100 text-blue-700",
    readMin: 7,
    dateSq: "5 Maj 2026",
    dateEn: "May 5, 2026",
    authorSq: "Klevis Shehu, Cloud Engineer",
    authorEn: "Klevis Shehu, Cloud Engineer",
    titleSq: "Microsoft 365 Copilot: Çfarë Ndryshon për Biznesin Tuaj?",
    titleEn: "Microsoft 365 Copilot: What Changes for Your Business?",
    bodySq: `Microsoft 365 Copilot është integrimi i AI-t (GPT-4) direkt brenda Word, Excel, Teams, Outlook dhe PowerPoint. A është gati biznesi juaj?

**Çfarë bën Copilot?**

- **Word**: Gjeneron draft dokumente nga udhëzimet tuaja
- **Excel**: Analizon të dhënat dhe krijon grafika me komandë natyrale
- **Teams**: Përshtill mbledhjet, krijon action items automatikisht
- **Outlook**: Harton email-e, përshtill konversacione

**Kërkesat teknike**

Copilot kërkon licencë Microsoft 365 Business Standard ose lart + shtesën Copilot (30$/user/muaj). Gjithashtu kërkon Microsoft Entra ID.

**A ia vlen për bizneset shqiptare?**

Për bizneset me >10 user që kalojnë shumë kohë me dokumente, raporte dhe email, kthimi i investimit është i shpejtë. Llogarisim kursim mesatar 1.5 orë/ditë/punonjës.

**Si të filloni**

Si partner Microsoft i çertifikuar, IT Arena mund t'ju ndihmojë me licencimin, konfigurimin dhe trajnimin. Kontaktoni për demo falas.`,
    bodyEn: `Microsoft 365 Copilot is the integration of AI (GPT-4) directly inside Word, Excel, Teams, Outlook and PowerPoint. Is your business ready?

**What does Copilot do?**

- **Word**: Generates draft documents from your instructions
- **Excel**: Analyzes data and creates charts with natural commands
- **Teams**: Summarizes meetings, creates action items automatically
- **Outlook**: Drafts emails, summarizes conversations

**Technical requirements**

Copilot requires Microsoft 365 Business Standard or above + the Copilot add-on ($30/user/month). Also requires Microsoft Entra ID.

**Is it worth it for Albanian businesses?**

For businesses with >10 users who spend a lot of time with documents, reports and emails, the return on investment is quick. We estimate an average saving of 1.5 hours/day/employee.

**How to start**

As a certified Microsoft partner, IT Arena can help you with licensing, configuration and training. Contact us for a free demo.`,
  },
  {
    slug: "ransomware-mbrojtja-2025",
    coverImg: "https://picsum.photos/seed/ransomware-protect/1200/600",
    tagSq: "Praktika IT",
    tagEn: "IT Best Practices",
    tagColor: "bg-red-100 text-red-700",
    readMin: 8,
    dateSq: "28 Prill 2026",
    dateEn: "April 28, 2026",
    authorSq: "Erion Haxhiu, CTO",
    authorEn: "Erion Haxhiu, CTO",
    titleSq: "5 Mënyra për t'u Mbrojtur nga Ransomware në 2026",
    titleEn: "5 Ways to Protect Yourself from Ransomware in 2026",
    bodySq: `Sulmet ransomware janë rritur 300% gjatë 3 viteve të fundit. Mesatarisht, një sulm kushton bizneset 270,000$ në dëme dhe kohë joproduktive. Ja 5 mënyrat kyçe:

**1. Backup 3-2-1**
3 kopje, 2 media të ndryshme, 1 jashtë lokacionit. Backup cloud + lokal është minimumi.

**2. EDR (Endpoint Detection & Response)**
Antivirus klasik nuk mjafton. EDR si CrowdStrike ose SentinelOne zbulojnë sjellje të dyshimta para sulmit.

**3. Patching i rregullt**
80% e sulmeve shfrytëzojnë vulnerabilitete të njohura. Update-t janë mbrojtja nr. 1.

**4. Trajnim stafi**
Phishing është dera kryesore e ransomware-it. Simulimet mujore të phishing-ut reduktojnë riskun me 70%.

**5. MFA kudo**
Multi-Factor Authentication në email, RDP dhe VPN eliminon sulmet credential-based.

**Çfarë të bëni tani?**

Kontaktoni IT Arena për konsulencë IT, backup dhe mbrojtje bazë të të dhënave sipas nevojave tuaja.`,
    bodyEn: `Ransomware attacks have increased 300% over the past 3 years. On average, an attack costs businesses $270,000 in damages and downtime. Here are 5 key ways to protect yourself:

**1. 3-2-1 Backup**
3 copies, 2 different media, 1 off-site. Cloud backup + local is the minimum.

**2. EDR (Endpoint Detection & Response)**
Classic antivirus isn't enough. EDR solutions like CrowdStrike or SentinelOne detect suspicious behavior before an attack.

**3. Regular Patching**
80% of attacks exploit known vulnerabilities. Updates are the #1 protection.

**4. Staff Training**
Phishing is the main entry point for ransomware. Monthly phishing simulations reduce risk by 70%.

**5. MFA Everywhere**
Multi-Factor Authentication on email, RDP and VPN eliminates credential-based attacks.

**What to do now?**

Contact IT Arena for IT consulting, backups, and foundational data protection tailored to your needs.`,
  },
  {
    slug: "server-cloud-vs-lokal",
    coverImg: "https://picsum.photos/seed/cloud-vs-server/1200/600",
    tagSq: "Cloud",
    tagEn: "Cloud",
    tagColor: "bg-blue-100 text-blue-700",
    readMin: 6,
    dateSq: "20 Prill 2026",
    dateEn: "April 20, 2026",
    authorSq: "Klevis Shehu, Cloud Engineer",
    authorEn: "Klevis Shehu, Cloud Engineer",
    titleSq: "Server Lokal vs Cloud: Cili është Zgjidhja e Duhur?",
    titleEn: "Local Server vs Cloud: Which is the Right Choice?",
    bodySq: `Pyetja "server lokal apo cloud?" shfaqet pothuajse tek çdo biznes shqiptar. Ja analiza jonë e ndershme.

**Kostot fillestare**

| | Server Lokal | Cloud (Azure) |
|---|---|---|
| Setup | 3,000–15,000€ | 0€ |
| Muajore | 0–50€ | 150–500€ |
| 3 vjet total | 3,000–15,000€ | 5,400–18,000€ |

**Avantazhet e serverit lokal**

- Kontroll i plotë i të dhënave
- Kosto fikse pas investimit fillestar
- Performancë e lartë për aplikacione lokale
- Pa varësi nga interneti

**Avantazhet e cloud-it**

- Shkallëzueshmëri e menjëhershme
- Disaster Recovery automatik
- Asnjë kosto mirëmbajtjeje hardware
- Akses nga kudo

**Rekomandimi ynë**

Hibride: server lokal për të dhëna sensitive + cloud për backup dhe Microsoft 365. Kjo kombinon të mirat e të dy botëve.`,
    bodyEn: `The question "local server or cloud?" comes up with almost every Albanian business. Here is our honest analysis.

**Upfront costs**

| | Local Server | Cloud (Azure) |
|---|---|---|
| Setup | €3,000–15,000 | €0 |
| Monthly | €0–50 | €150–500 |
| 3-year total | €3,000–15,000 | €5,400–18,000 |

**Local server advantages**

- Full data control
- Fixed cost after initial investment
- High performance for local applications
- No internet dependency

**Cloud advantages**

- Instant scalability
- Automatic Disaster Recovery
- No hardware maintenance cost
- Access from anywhere

**Our recommendation**

Hybrid: local server for sensitive data + cloud for backup and Microsoft 365. This combines the best of both worlds.`,
  },
  {
    slug: "cctv-ai-bizneset",
    coverImg: "https://picsum.photos/seed/cctv-ai-blog/1200/600",
    tagSq: "CCTV & Siguri",
    tagEn: "CCTV & Security",
    tagColor: "bg-rose-100 text-rose-700",
    readMin: 5,
    dateSq: "10 Prill 2026",
    dateEn: "April 10, 2026",
    authorSq: "Gjergj Prela, Kryeinxhinier",
    authorEn: "Gjergj Prela, Lead Engineer",
    titleSq: "CCTV me AI: Detektimi i Personave dhe Automjeteve",
    titleEn: "AI CCTV: Person and Vehicle Detection",
    bodySq: `Kamerat e reja AI nuk janë thjesht "sy" — janë sisteme inteligjente që kuptojnë çfarë shohin. Çfarë ofrojnë kamerat AI dhe kur ia vlen?

**Çfarë bën AI në kamera?**

- **Detektim personi**: Dallon njerëzit nga kafshët — zero false alarm
- **Detektim automjeti**: Lexon targa, gjurmon hyrje/dalje
- **Intruder alert**: Sinjalizon kur dikush hyn jashtë orarit
- **Face recognition**: Sistem hyrjeje me fytyrë (opsional)

**Hikvision AcuSense — seria jonë top**

Seria AcuSense e Hikvision ofron AI on-device, domethënë nuk kërkon server të veçantë AI. Kamerat 4MP me AcuSense fillojnë nga 59€.

**Kur ia vlen?**

- Depozita dhe zona zyrtare me akses të kufizuar
- Parkingje dhe garazhe
- Dyqane dhe supermarkete

**Kur nuk ia vlen?**

Nëse keni thjesht nevojë të shikoni çfarë ndodh (jo të alarmoheni), kamerat standarde mbeten ekonomike.`,
    bodyEn: `New AI cameras aren't just "eyes" — they're intelligent systems that understand what they see. What do AI cameras offer and when is it worth it?

**What does AI do in cameras?**

- **Person detection**: Distinguishes people from animals — zero false alarms
- **Vehicle detection**: Reads license plates, tracks entries/exits
- **Intruder alert**: Alerts when someone enters outside hours
- **Face recognition**: Face-based entry system (optional)

**Hikvision AcuSense — our top series**

Hikvision's AcuSense series offers on-device AI, meaning no separate AI server is needed. 4MP cameras with AcuSense start from €59.

**When is it worth it?**

- Warehouses and office areas with restricted access
- Parking lots and garages
- Shops and supermarkets

**When is it not?**

If you simply need to see what's happening (not be alerted), standard cameras remain economical.`,
  },
  {
    slug: "outsourcing-it-vs-staf-i-brendshem",
    coverImg: "https://picsum.photos/seed/outsource-it/1200/600",
    tagSq: "IT Support",
    tagEn: "IT Support",
    tagColor: "bg-violet-100 text-violet-700",
    readMin: 6,
    dateSq: "1 Prill 2026",
    dateEn: "April 1, 2026",
    authorSq: "Arion Krasniqi, CEO",
    authorEn: "Arion Krasniqi, CEO",
    titleSq: "IT Outsourcing vs Staf i Brendshëm: Analiza e Kostove",
    titleEn: "IT Outsourcing vs In-house Staff: Cost Analysis",
    bodySq: `Pyetja që marrim rregullisht: "A ia vlen outsourcing-u apo duhet të punësojmë IT-ist?" Ja analiza jonë me numra reale.

**Kostot e stafit IT të brendshëm (vjetor)**

- Pagë bruto: 18,000–30,000€/vit
- Sigurime shoqërore (23%): 4,140–6,900€
- Pushime, trajnime, certifikime: 2,000–4,000€
- Hardware + softuer: 1,500–3,000€
- **Total: 25,640–43,900€/vit**

**Kostot e IT Outsourcing (IT Arena)**

- Paketë Business (deri 25 user): 4,788€/vit
- Asnjë kosto shtesë HR ose trajnimi
- **Total: 4,788€/vit**

**Kur ia vlen stafi i brendshëm?**

- >100 user me nevoja komplekse e të vazhdueshme
- Industri me rregullore të veçanta (banka, shëndetësi)
- Projekte zhvillimi softuerësh in-house

**Konkluzion**

Për bizneset 10–80 user, outsourcing IT është 4–8× më ekonomik dhe ofron njohuri shumëfish më të gjera.`,
    bodyEn: `The question we get regularly: "Is outsourcing worth it or should we hire an IT person?" Here's our analysis with real numbers.

**Costs of in-house IT staff (annual)**

- Gross salary: €18,000–30,000/year
- Social insurance (23%): €4,140–6,900
- Holidays, training, certifications: €2,000–4,000
- Hardware + software: €1,500–3,000
- **Total: €25,640–43,900/year**

**IT Outsourcing costs (IT Arena)**

- Business package (up to 25 users): €4,788/year
- No additional HR or training costs
- **Total: €4,788/year**

**When is in-house staff worth it?**

- >100 users with complex and continuous needs
- Industries with special regulations (banking, healthcare)
- In-house software development projects

**Conclusion**

For businesses with 10–80 users, IT outsourcing is 4–8× more economical and offers far broader expertise.`,
  },
];

export function getBlogArticle(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((a) => a.slug === slug);
}
