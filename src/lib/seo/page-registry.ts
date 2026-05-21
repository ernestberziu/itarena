import type { BilingualString } from "@/lib/site-content/types";

export type PageSeoEntry = {
  path: string;
  title: BilingualString;
  description: BilingualString;
  keywords?: BilingualString;
  ogType?: "website" | "article";
};

export const STATIC_PAGE_SEO: Record<string, PageSeoEntry> = {
  home: {
    path: "/",
    title: {
      sq: "IT Arena — Zgjidhje IT për Biznese në Shqipëri",
      en: "IT Arena — IT Solutions for Businesses in Albania",
    },
    description: {
      sq: "Partneri juaj IT në Shqipëri: cloud, rrjet, CCTV, software dhe mbështetje 24/7. ISO 9001 & ISO 27001. Mbi 500 klientë aktivë.",
      en: "Your IT partner in Albania: cloud, networking, CCTV, software and 24/7 support. ISO 9001 & ISO 27001. 500+ active clients.",
    },
    keywords: {
      sq: "IT Arena, IT Support Shqipëri, cloud Albania, Microsoft 365, CCTV Tiranë, rrjet, software",
      en: "IT Arena, IT support Albania, cloud Albania, Microsoft 365, CCTV Tirana, networking, software",
    },
  },
  services: {
    path: "/sherbime",
    title: {
      sq: "Shërbimet IT — IT Arena",
      en: "IT Services — IT Arena",
    },
    description: {
      sq: "8 divizione shërbimi: helpdesk 24/7, cloud, rrjet, CCTV, web, software, telekomunikacion dhe printim. Ofertë të personalizuar.",
      en: "8 service divisions: 24/7 helpdesk, cloud, networking, CCTV, web, software, telecom and print. Tailored quotes.",
    },
    keywords: {
      sq: "shërbime IT, helpdesk, cloud, CCTV, rrjet, zhvillim software",
      en: "IT services, helpdesk, cloud, CCTV, networking, software development",
    },
  },
  contact: {
    path: "/kontakt",
    title: { sq: "Kontakt — IT Arena", en: "Contact — IT Arena" },
    description: {
      sq: "Na kontaktoni për konsultë falas, ofertë ose emergjencë IT. Telefon, email dhe zyra në Tiranë.",
      en: "Contact us for a free consultation, quote or IT emergency. Phone, email and office in Tirana.",
    },
  },
  quote: {
    path: "/kerko-oferte",
    title: { sq: "Kërko Ofertë — IT Arena", en: "Request a Quote — IT Arena" },
    description: {
      sq: "Dërgoni kërkesën tuaj për ofertë IT — përgjigje brenda 24 orëve pune nga ekipi IT Arena.",
      en: "Submit your IT quote request — response within one business day from the IT Arena team.",
    },
  },
  about: {
    path: "/rreth-nesh",
    title: { sq: "Rreth Nesh — IT Arena", en: "About Us — IT Arena" },
    description: {
      sq: "IT Arena nga 2012 — partner strategjik teknologjik për biznese shqiptare. ISO 9001 & ISO 27001.",
      en: "IT Arena since 2012 — strategic technology partner for Albanian businesses. ISO 9001 & ISO 27001.",
    },
  },
  partners: {
    path: "/partneret",
    title: { sq: "Partnerët — IT Arena", en: "Partners — IT Arena" },
    description: {
      sq: "Partnerë teknologjikë të çertifikuar: Microsoft, Hikvision, Ubiquiti dhe më shumë.",
      en: "Certified technology partners: Microsoft, Hikvision, Ubiquiti and more.",
    },
  },
  industries: {
    path: "/industrite",
    title: { sq: "Industritë — IT Arena", en: "Industries — IT Arena" },
    description: {
      sq: "Zgjidhje IT për kontabilitet, ndërtim, shëndetësi, hoteleri, retail dhe sektorë të tjerë.",
      en: "IT solutions for accounting, construction, healthcare, hospitality, retail and more sectors.",
    },
  },
  market: {
    path: "/tregu",
    title: { sq: "Tregu IT — IT Arena", en: "IT Market — IT Arena" },
    description: {
      sq: "Përmbledhje e tregut IT në Shqipëri dhe trendet që ndikojnë në biznesin tuaj.",
      en: "Overview of the IT market in Albania and trends affecting your business.",
    },
  },
  remoteSupport: {
    path: "/mbeshtetje-remote",
    title: { sq: "Mbështetje Remote — IT Arena", en: "Remote Support — IT Arena" },
    description: {
      sq: "Mbështetje IT në distancë me SLA — zgjidhje të shpejta pa pritje onsite.",
      en: "Remote IT support with SLA — fast resolution without waiting for onsite visits.",
    },
  },
  blog: {
    path: "/blog",
    title: { sq: "Blog IT — IT Arena", en: "IT Blog — IT Arena" },
    description: {
      sq: "Artikuj, këshilla dhe analiza mbi cloud, rrjetin, sigurinë dhe transformimin dixhital.",
      en: "Articles, tips and analysis on cloud, networking, security and digital transformation.",
    },
    ogType: "website",
  },
  legalPrivacy: {
    path: "/privatesia",
    title: { sq: "Politika e Privatësisë — IT Arena", en: "Privacy Policy — IT Arena" },
    description: {
      sq: "Si mbledhim, përpunojmë dhe mbrojmë të dhënat tuaja personale (GDPR).",
      en: "How we collect, process and protect your personal data (GDPR).",
    },
  },
  legalTerms: {
    path: "/kushtet",
    title: { sq: "Kushtet e Shërbimit — IT Arena", en: "Terms of Service — IT Arena" },
    description: {
      sq: "Kushtet e përdorimit të faqes dhe shërbimeve IT Arena sh.p.k.",
      en: "Terms of use for the website and services of IT Arena sh.p.k.",
    },
  },
  legalCookies: {
    path: "/politika-cookies",
    title: { sq: "Politika e Cookies — IT Arena", en: "Cookie Policy — IT Arena" },
    description: {
      sq: "Cookies thelbësore dhe analitike — si i menaxhoni dhe bazat ligjore.",
      en: "Essential and analytics cookies — how to manage them and legal bases.",
    },
  },
  shop: {
    path: "/shop",
    title: {
      sq: "IT Arena Shop — Hardware & Software",
      en: "IT Arena Shop — Hardware & Software",
    },
    description: {
      sq: "Dyqani online: kompjuterë, serverë, rrjete dhe periferikë me dorëzim në Shqipëri.",
      en: "Online store: computers, servers, networking and peripherals with delivery in Albania.",
    },
  },
  login: {
    path: "/hyr",
    title: { sq: "Hyrje — IT Arena", en: "Sign In — IT Arena" },
    description: {
      sq: "Hyni në portalin e klientit IT Arena.",
      en: "Sign in to the IT Arena client portal.",
    },
  },
  register: {
    path: "/regjistrohu",
    title: { sq: "Regjistrim — IT Arena", en: "Register — IT Arena" },
    description: {
      sq: "Krijoni llogari në portalin IT Arena.",
      en: "Create an account on the IT Arena portal.",
    },
  },
  forgotPassword: {
    path: "/forgot-password",
    title: { sq: "Harruat fjalëkalimin — IT Arena", en: "Forgot Password — IT Arena" },
    description: {
      sq: "Rivendosni fjalëkalimin e llogarisë suaj IT Arena.",
      en: "Reset your IT Arena account password.",
    },
  },
  resetPassword: {
    path: "/reset-password",
    title: { sq: "Rivendos fjalëkalimin — IT Arena", en: "Reset Password — IT Arena" },
    description: {
      sq: "Vendosni fjalëkalimin e ri për llogarinë IT Arena.",
      en: "Set a new password for your IT Arena account.",
    },
  },
  verifyEmail: {
    path: "/verify-email",
    title: { sq: "Verifikimi i email-it — IT Arena", en: "Email Verification — IT Arena" },
    description: {
      sq: "Verifikoni adresën e email-it për llogarinë IT Arena.",
      en: "Verify your email address for your IT Arena account.",
    },
  },
  sharePrivate: {
    path: "/share",
    title: { sq: "Lidhje private — IT Arena", en: "Private link — IT Arena" },
    description: {
      sq: "Qasje e kufizuar me kod kalimi.",
      en: "Restricted access with passcode.",
    },
  },
};

export function blogPostExcerpt(body: string, maxLen = 160): string {
  const plain = body
    .replace(/\*\*/g, "")
    .replace(/#{1,6}\s/g, "")
    .replace(/\n+/g, " ")
    .trim();
  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, maxLen - 1).trim()}…`;
}
