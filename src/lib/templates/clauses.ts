import type { TemplateLanguage } from "./types";

const SERVICE_SQ = `## 1. Hyrje

Ky kontratë shërbimi ("Kontrata") lidhet ndërmjet **{{itarena_company}}** ("Ofruesi"), me NIPT {{itarena_nipt}}, me seli në {{itarena_address}}, e përfaqësuar nga {{itarena_representative}}, {{itarena_title}}, dhe **{{company_name}}** ("Klienti"), me datë {{contract_date}}.

Kontrata rregullon kushtet dhe afatet sipas të cilave Ofruesi do të kryejë shërbime dhe/ose do të dorëzojë produkte tek Klienti.

---

## 2. Palët kontraktuese

**Ofruesi:**
- Emri ligjor: {{itarena_company}}
- NIPT: {{itarena_nipt}}
- Adresa: {{itarena_address}}
- Përfaqësuesi i autorizuar: {{itarena_representative}}, {{itarena_title}}

**Klienti:**
- Emri ligjor: {{company_name}}
- {{customer_tax_id_label}}: {{customer_nipt}}
- Adresa: {{customer_address}}
- Kontakt: {{customer_email}} · {{customer_phone}}

---

## 3. Objekti i kontratës

Ofruesi angazhohet të kryejë shërbimet dhe/ose të dorëzojë produktet e specifikuara dhe të dakorduara me shkrim midis palëve. Çdo ndryshim i fushëveprimit duhet të miratohet me shkrim nga të dyja palët. Ofrimi i shërbimeve pa ndryshim të shkruar nuk krijon detyrime të reja kontraktore.

---

## 4. Çmimi dhe pagesa

Shërbimet dhe produktet e mëposhtme janë objekt i kësaj Kontrate:

{{pricing_table}}

{{recurring_schedule}}

Kushtet e pagesës: **{{payment_terms}}**.

Pagesat e vonuara i nënshtrohen interesit ligjor në përputhje me legjislacionin në fuqi. Faturat duhet të paguhen brenda afatit të rënë dakord. Mosmarrëveshjet mbi faturën duhet të ngrihen me shkrim brenda 7 ditëve nga marrja e saj.

---

## 5. Kushtet e dorëzimit

Dorëzimi i shërbimeve dhe produkteve do të kryhet sipas kushteve: **{{delivery_terms}}**. Ofruesi do të njoftojë Klientin paraprakisht nëse parashikohen vonesa. Klienti është i detyruar të pranojë dorëzimet sipas kushteve të rëna dakord.

---

## 6. Detyrimet e palëve

**Ofruesi detyrohet të:**
1. Kryejë shërbimet me profesionalizëm, kujdes dhe ekspertizë të duhur.
2. Respektojë afatet e dakorduara dhe të njoftojë menjëherë çdo vonesë të parashikueshme.
3. Angazhojë personel të kualifikuar dhe të mjaftueshëm.
4. Mbajë konfidenciale të gjitha të dhënat e Klientit.
5. Pajtojë shërbimet me ligjet dhe rregulloret aplikueshme.

**Klienti detyrohet të:**
1. Ofrojë informacionin, materialet dhe aksesin e nevojshëm në kohën e duhur.
2. Emërojë një person kontakti me të drejtë vendimmarrjeje.
3. Kryejë pagesat sipas afateve të kontratës.
4. Njoftojë me shkrim çdo ndryshim të kërkesave të tij.

---

## 7. Pronësia intelektuale

Të gjitha rezultatet, raportet, softueri dhe materialet e krijuara nga Ofruesi gjatë ekzekutimit të kësaj Kontrate mbeten pronë e Ofruesit deri në kryerjen e plotë të pagesës. Pas pagesës së plotë, Ofruesi i transferon Klientit licencën joekskluzive dhe të parevokueshme për përdorimin e materialeve të dorëzuara. Klienti nuk ka të drejtë të ri-shesë, modifikojë apo shpërndarë rezultatet pa pëlqimin me shkrim të Ofruesit.

---

## 8. Konfidencialiteti

Palët bien dakord të trajtojnë si konfidenciale të gjitha informacionet teknike, tregtare dhe organizative të palës tjetër, të mësuara gjatë ekzekutimit të kësaj Kontrate. Ky detyrim vazhdon edhe pas mbarimit të Kontratës për një periudhë prej **3 (tre) vjetësh**. Informacioni që është tashmë publik, ose që kërkohet të zbulohet nga ligji, nuk konsiderohet konfidencial.

---

## 9. Mbrojtja e të dhënave

Palët do të zbatojnë legjislacionin shqiptar dhe europian mbi mbrojtjen e të dhënave personale. Ofruesi nuk do të transferojë të dhëna personale të Klientit tek palë të treta pa autorizimin me shkrim të Klientit, përveç rasteve kur kërkohet nga ligji.

---

## 10. Kufizimi i përgjegjësisë

Përgjegjësia e Ofruesit nën këtë Kontratë, pavarësisht shkakut, kufizohet në vlerën e shumave të paguara nga Klienti gjatë 6 muajve të fundit para ngjarjes që shkaktoi dëmin. Ofruesi nuk mban përgjegjësi për humbje indirekte, të ardhura të humbura, dëme të veçanta apo pasojore. Kufizimi nuk zbatohet në rastet e mashtrimit ose neglizhencës së rëndë.

---

## 11. Forca madhore

Asnjëra palë nuk do të konsiderohet në shkelje të kësaj Kontrate nëse ekzekutimi bëhet i pamundur nga ngjarje jashtë kontrollit të arsyeshëm të saj (fatkeqësi natyrore, luftë, pandemi, ndryshime legjislative urgjente). Pala e prekur duhet të njoftojë tjetrën brenda 5 ditëve pune. Nëse forca madhore vazhdon më shumë se **60 ditë**, secila palë mund ta zgjidhë Kontratën me njoftim me shkrim.

---

## 12. Ndryshimet

Çdo ndryshim i kësaj Kontrate duhet të bëhet me aneks me shkrim, i nënshkruar nga të dyja palët. Konfirmimet me e-mail me nënshkrim dixhital konsiderohen me shkrim. Asnjë komunikim verbal nuk ka fuqi juridike.

---

## 13. Periudha e njoftimit dhe zgjidhja e kontratës

{{termination_clause}}

---

## 14. Zgjidhja e mosmarrëveshjeve

Palët do të bëjnë çdo përpjekje për të zgjidhur mosmarrëveshjet me rrugë negocimi brenda 30 ditëve. Nëse negocimi dështon, çështja i dërgohet ndërmjetësimit ose arbitrazhit sipas marrëveshjes. Gjykata kompetente, nëse e nevojshme, është ajo e Tiranës, Shqipëri.

---

## 15. Dispozita përfundimtare

Kontrata rregullohet nga ligjet e Republikës së Shqipërisë. Nëse ndonjë dispozitë e kësaj Kontrate është e pavlefshme, dispozitat e tjera mbeten në fuqi. Kontrata nënshkruhet në dy kopje origjinale, një për secilën palë, dhe hyn në fuqi me nënshkrimin e të dyja palëve.

`;

const SERVICE_EN = `## 1. Introduction

This Service Agreement ("Agreement") is entered into between **{{itarena_company}}** ("Provider"), NIPT: {{itarena_nipt}}, registered at {{itarena_address}}, represented by {{itarena_representative}}, {{itarena_title}}, and **{{company_name}}** ("Client"), as of {{contract_date}}.

This Agreement governs the terms under which the Provider will perform services and/or deliver products to the Client.

---

## 2. Parties

**Provider:**
- Legal name: {{itarena_company}}
- NIPT: {{itarena_nipt}}
- Address: {{itarena_address}}
- Authorised representative: {{itarena_representative}}, {{itarena_title}}

**Client:**
- Legal name: {{company_name}}
- {{customer_tax_id_label}}: {{customer_nipt}}
- Address: {{customer_address}}
- Contact: {{customer_email}} · {{customer_phone}}

---

## 3. Scope of services

The Provider agrees to perform the services and/or deliver the products specified and agreed in writing between the parties. Any change to scope must be approved in writing by both parties. Providing services without a written change order does not create new contractual obligations.

---

## 4. Pricing and payment

The following services and products are covered by this Agreement:

{{pricing_table}}

{{recurring_schedule}}

Payment terms: **{{payment_terms}}**.

Late payments will attract statutory interest in accordance with applicable law. Invoices are due within the agreed period. Disputes over an invoice must be raised in writing within 7 days of receipt.

---

## 5. Delivery conditions

Services and products will be delivered under the following conditions: **{{delivery_terms}}**. The Provider will notify the Client in advance of any foreseeable delays. The Client is obliged to accept deliveries in accordance with the agreed terms.

---

## 6. Obligations of the parties

**The Provider shall:**
1. Perform all services with appropriate professionalism, care and expertise.
2. Respect agreed timelines and promptly notify the Client of any foreseeable delay.
3. Engage qualified and sufficient personnel.
4. Keep all Client data strictly confidential.
5. Ensure services comply with applicable laws and regulations.

**The Client shall:**
1. Provide necessary information, materials and access in a timely manner.
2. Designate a contact person with decision-making authority.
3. Make payments in accordance with contractual timelines.
4. Notify the Provider in writing of any change in requirements.

---

## 7. Intellectual property

All deliverables, reports, software and materials created by the Provider in the execution of this Agreement remain the property of the Provider until full payment is received. Upon full payment, the Provider grants the Client a non-exclusive, irrevocable licence to use the delivered materials. The Client may not resell, modify or distribute the deliverables without the Provider's prior written consent.

---

## 8. Confidentiality

The parties agree to treat as confidential all technical, commercial and organisational information of the other party learned in the course of this Agreement. This obligation survives termination for a period of **3 (three) years**. Publicly available information, or information required to be disclosed by law, is not considered confidential.

---

## 9. Data protection

The parties will comply with Albanian and applicable European data protection legislation. The Provider shall not transfer the Client's personal data to third parties without the Client's written authorisation, except where required by law.

---

## 10. Limitation of liability

The Provider's total liability under this Agreement, regardless of cause, is limited to the amounts paid by the Client in the 6 months preceding the event giving rise to the claim. The Provider shall not be liable for indirect losses, lost revenue, special or consequential damages. This limitation does not apply in cases of fraud or gross negligence.

---

## 11. Force majeure

Neither party will be considered in breach of this Agreement if performance becomes impossible due to events beyond its reasonable control (natural disasters, war, pandemic, urgent legislative changes). The affected party must notify the other within 5 business days. If force majeure continues for more than **60 days**, either party may terminate the Agreement upon written notice.

---

## 12. Amendments

Any amendment to this Agreement must be made by written addendum, signed by both parties. Emails bearing digital signatures are considered written. No verbal communication has legal force.

---

## 13. Notice period and termination

{{termination_clause}}

---

## 14. Dispute resolution

The parties will make every effort to resolve disputes through negotiation within 30 days. If negotiation fails, the matter shall be referred to mediation or arbitration by mutual agreement. The competent court, if necessary, is that of Tirana, Albania.

---

## 15. Final provisions

This Agreement is governed by the laws of the Republic of Albania. If any provision is found invalid, the remaining provisions remain in force. This Agreement is signed in two original copies, one for each party, and enters into force upon signature by both parties.

`;

const EMPLOYMENT_SQ = `## 1. Kontratë pune

Kjo kontratë pune ("Kontrata") lidhet ndërmjet **{{itarena_company}}** ("Punëdhënësi"), me NIPT {{itarena_nipt}}, me seli në {{itarena_address}}, i përfaqësuar nga {{itarena_representative}}, {{itarena_title}}, dhe **{{employee_name}}** ("Punonjësi"), Nr. ID: {{employee_id}}, me datë {{contract_date}}.

Kontrata hyn në fuqi me datë {{contract_start}} dhe rregullohet nga Kodi i Punës i Republikës së Shqipërisë dhe legjislacioni tjetër i aplikueshëm.

---

## 2. Pozicioni dhe detyrat e punonjësit

Punonjësi punësohet në pozicionin **{{employee_position}}**.

{{employee_duties}}

---

## 3. Detyrimet e punëdhënësit

{{employer_duties}}

---

## 4. Kompensimi dhe përfitimet

**Paga bruto mujore:** {{employee_salary}}

Paga paguhet me transfertë bankare brenda datës 10 të muajit pasardhës. Punëdhënësi mban dhe paguan kontributet e detyrueshme shoqërore dhe shëndetësore sipas ligjit shqiptar. Punonjësi ka të drejtë:
- Pagës së pushimeve vjetore sipas Kodit të Punës.
- Çdo përfitimi tjetër të parashikuar nga politika e brendshme e kompanisë.
- Rimbursimet e shpenzimeve të arsyeshme profesionale, me dokumentacion.

---

## 5. Orari i punës

Orari i punës është **{{employee_working_hours}}**, sipas marrëveshjes dhe ligjit. Punonjësi mund të kërkohet të punojë jashtë orarit kur nevojat e biznesit e kërkojnë, me kompensim sipas ligjit. Koha e pushimit të drekës dhe pushimet nuk përfshihen në orarin e punës.

---

## 6. Lloji i kontratës

Lloji i kontratës: **{{employee_contract_type}}**.

Kontrata është e vlefshme nga data {{contract_start}}{{contract_end_clause}}. Çdo ndryshim i kushteve të punësimit kërkon aneks të nënshkruar nga të dyja palët.

---

## 7. Pushimet dhe lejet

{{annual_leave}}

---

## 8. Konfidencialiteti dhe mbrojtja e të dhënave

Punonjësi merr përsipër të mbajë konfidenciale të gjitha informacionet e kompanisë, klientëve, partnerëve dhe proceseve teknike e tregtare, gjatë dhe pas marrëdhënies së punës, pa kufizim kohor. Ky detyrim përfshin:
- Të dhënat e klientëve dhe kontratave.
- Çmimet, strategjitë dhe planet e biznesit.
- Kodin burimor, algoritmet dhe zgjidhjet teknike.
- Çdo informacion të shënuar si konfidencial nga kompania.

Shkeljet e konfidencialitetit mund të çojnë në zgjidhje të menjëhershme të kontratës dhe ndjekje ligjore.

---

## 9. Pronësia intelektuale

Çdo vepër, kod, projekt apo material tjetër i krijuar nga punonjësi gjatë kohës së punësimit, lidhur me veprimtarinë e kompanisë, konsiderohet pronë e Punëdhënësit. Punonjësi heq dorë nga çdo pretendim pronësie mbi rezultate të tilla dhe detyrohet t'i dorëzojë ato menjëherë pas kërkesës.

---

## 10. Sjellja profesionale dhe standardet etike

Punonjësi detyrohet të respektojë kodin e etikës, politikat e brendshme dhe rregulloren e brendshme të kompanisë. Sjelljet e papranueshme, duke përfshirë ngacmimin, diskriminimin, shpërdorimin e burimeve apo konfliktin e interesit të pazgjidhur, mund të çojnë në masa disiplinore deri në zgjidhje kontrate.

---

## 11. Periudha e njoftimit dhe zgjidhja e kontratës

**Njoftimi:** Secila palë detyrohet të njoftojë tjetrën me shkrim jo më pak se **{{notice_period}}** para zgjidhjes së kontratës, përveç rasteve të zgjidhjes me shkak.

**Zgjidhja me shkak:** Punëdhënësi mund ta zgjidhë kontratën menjëherë pa njoftim paraprak në rastet e parashikuara nga ligji (shkelje të rënda, vjedhje, mashtrim etj.).

**Efektet e zgjidhjes:** Me zgjidhjen e kontratës, punonjësi kthen çdo pajisje, dokument apo material të kompanisë. Shumat e paguara por pa punë të kryer rimbursohen proporcionalisht.

---

## 12. Jo-konkurrenca dhe jo-rekrutimi

Gjatë periudhës së punësimit dhe **12 (dymbëdhjetë) muajve** pas zgjidhjes së kontratës, punonjësi nuk mund:
1. Të punojë drejtpërdrejt ose tërthorazi për konkurrentë të drejtpërdrejtë të Punëdhënësit.
2. T'u ofrojë shërbime të drejtpërdrejta klientëve të kompanisë pa miratim me shkrim.
3. Të rekrutojë ose nxisë punonjës të tjerë të kompanisë të largohen.

Kufizimi i jo-konkurrencës zbatohet vetëm nëse Punëdhënësi paguan kompensim shtesë sipas ligjit.

---

## 13. Zgjidhja e mosmarrëveshjeve

Mosmarrëveshjet do të zgjidhen fillimisht me negociata brenda 15 ditëve. Nëse dështon, palët mund t'i drejtohen Inspektoratit Shtetëror të Punës ose gjykatave kompetente të Tiranës, Shqipëri.

---

## 14. Dispozita përfundimtare

Kjo Kontratë nënshkruhet në dy kopje origjinale. Çdo ndryshim bëhet me aneks të nënshkruar nga të dyja palët. Kontrata rregullohet nga Kodi i Punës dhe ligjet e Republikës së Shqipërisë.

`;

const EMPLOYMENT_EN = `## 1. Employment Agreement

This Employment Agreement ("Agreement") is entered into between **{{itarena_company}}** ("Employer"), NIPT: {{itarena_nipt}}, registered at {{itarena_address}}, represented by {{itarena_representative}}, {{itarena_title}}, and **{{employee_name}}** ("Employee"), ID No.: {{employee_id}}, as of {{contract_date}}.

This Agreement enters into force on {{contract_start}} and is governed by the Labour Code of the Republic of Albania and other applicable legislation.

---

## 2. Position and duties of the employee

The Employee is employed in the position of **{{employee_position}}**.

{{employee_duties}}

---

## 3. Employer obligations

{{employer_duties}}

---

## 4. Compensation and benefits

**Gross monthly salary:** {{employee_salary}}

Salary is paid by bank transfer by the 10th day of the following month. The Employer withholds and pays mandatory social and health contributions in accordance with Albanian law. The Employee is entitled to:
- Annual leave pay in accordance with the Labour Code.
- Any other benefits set out in the Company's internal policy.
- Reimbursement of reasonable professional expenses, subject to documentation.

---

## 5. Working hours

Working hours are **{{employee_working_hours}}**, in accordance with the agreement and applicable law. The Employee may be required to work overtime when business needs demand, with compensation as required by law. Lunch breaks and rest periods are not included in working hours.

---

## 6. Contract type

Contract type: **{{employee_contract_type}}**.

This Agreement is valid from {{contract_start}}{{contract_end_clause}}. Any change to the terms of employment requires a written addendum signed by both parties.

---

## 7. Leave and holidays

{{annual_leave}}

---

## 8. Confidentiality and data protection

The Employee undertakes to keep confidential all information regarding the Company, its clients, partners and technical and commercial processes, during and after employment, without time limit. This obligation covers:
- Client and contract data.
- Prices, strategies and business plans.
- Source code, algorithms and technical solutions.
- Any information marked as confidential by the Company.

Breaches of confidentiality may result in immediate termination and legal proceedings.

---

## 9. Intellectual property

Any work, code, design or other material created by the Employee during the course of employment and related to the Company's activities is the property of the Employer. The Employee waives any ownership claim over such deliverables and is required to hand them over immediately upon request.

---

## 10. Professional conduct and ethical standards

The Employee is required to comply with the Company's code of ethics, internal policies and working regulations. Unacceptable conduct, including harassment, discrimination, misuse of resources or unresolved conflicts of interest, may result in disciplinary action up to and including termination.

---

## 11. Notice period and termination

**Notice:** Either party is required to give the other written notice of not less than **{{notice_period}}** prior to termination, except in cases of termination for cause.

**Termination for cause:** The Employer may terminate the Agreement immediately without prior notice in cases provided for by law (serious misconduct, theft, fraud, etc.).

**Effects of termination:** Upon termination, the Employee returns all Company equipment, documents and materials. Amounts paid for work not yet performed are reimbursed on a pro-rata basis.

---

## 12. Non-competition and non-solicitation

During employment and for **12 (twelve) months** following termination, the Employee may not:
1. Work directly or indirectly for direct competitors of the Employer.
2. Provide direct services to Company clients without prior written approval.
3. Recruit or solicit other Company employees to leave.

The non-competition restriction applies only if the Employer pays additional compensation as required by law.

---

## 13. Dispute resolution

Disputes shall first be resolved through negotiation within 15 days. If unsuccessful, the parties may refer the matter to the State Labour Inspectorate or the competent courts of Tirana, Albania.

---

## 14. Final provisions

This Agreement is signed in two original copies. Any amendment is made by addendum signed by both parties. This Agreement is governed by the Labour Code and the laws of the Republic of Albania.

`;

export function getDefaultClauseBody(
  type: "SERVICE_CONTRACT" | "EMPLOYMENT",
  language: TemplateLanguage
): string {
  if (type === "SERVICE_CONTRACT") return language === "en" ? SERVICE_EN : SERVICE_SQ;
  return language === "en" ? EMPLOYMENT_EN : EMPLOYMENT_SQ;
}
