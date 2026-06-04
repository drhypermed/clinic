# Guidelines Specialty Roadmap

Last updated: 2026-05-25

## User Goal

Build the guidelines chat as a clinical-grade assistant for physicians. It should:

- Use the full uploaded guideline books, not disconnected summaries.
- Preserve source file name, page number, and original source text.
- Search intelligently inside the uploaded corpus.
- Support Arabic medical colloquial discussion and clear scientific English.
- Keep answers grounded in guideline evidence and show source confidence.
- Add a specialty layer so each medical specialty searches the right books by default.

## Specialty Layer Design

Each indexed guideline chunk should have these metadata fields:

- `specialty`: primary specialty, e.g. `diabetes_endocrinology`, `nephrology`, `hepatology`, `respiratory`, `cardiology`.
- `secondarySpecialties`: related specialties, e.g. ADA CKD chapter can be both `diabetes_endocrinology` and `nephrology`.
- `guidelineBody`: ADA, KDIGO, EASL, GINA, GOLD, ESC, AACE, EASD, IDSA, ACOG, AAP, AUA, EAU, ACR, EULAR, ASCO, NCCN, AAO, AAD, AAN.
- `year`: guideline year or latest known update year.
- `clinicalDomains`: diagnosis, treatment, emergency, monitoring, prevention, pregnancy, pediatrics, inpatient, perioperative, imaging, oncology.
- `sourceTitle`, `sourceFile`, `page`, `chunkIndex`, `text`, `concepts`, `intentTags`, `embedding`.

## Search Behavior By Scope

### Current File

Search only chunks from the selected book/file. Use this when the doctor is reading one guideline and asks follow-up questions.

### Current Collection

Search all books under the selected guideline body/year, for example all ADA 2026 sections or all KDIGO kidney guidelines.

### Current Specialty

Search all books tagged with the selected specialty and related secondary specialties. This should become the default once the specialty router is implemented.

### All Guidelines

Search all indexed books. Use only when:

- The doctor explicitly chooses all books.
- The query is cross-specialty, e.g. diabetes plus CKD, cirrhosis plus AKI, pregnancy plus diabetes.
- The specialty router is uncertain.

## How Each Specialty Should Search

### General Internal Medicine

Primary: ACP, BMJ Best Practice-style internal medicine references if licensed/available, NICE clinical guidelines, Merck/MSD professional manual-style references if allowed, plus major disease-specific societies.
Default local search should include high-yield adult medicine guidelines across cardiology, diabetes/endocrinology, nephrology, hepatology/gastroenterology, respiratory, infectious disease, hematology, rheumatology, geriatrics, and emergency/inpatient medicine.
Do not search obstetrics, pediatrics, surgery, dentistry, ophthalmology, dermatology, psychiatry, or ENT by default unless the query contains clear terms for those domains.

### Diabetes / Endocrinology

Primary: ADA, AACE, EASD, Endocrine Society.
Secondary: KDIGO diabetes in CKD, ESC cardiovascular risk in diabetes, ACOG pregnancy diabetes, AAP pediatric diabetes where available.

### Nephrology

Primary: KDIGO.
Secondary: ADA CKD chapters, EASL hepatitis C in CKD/liver-kidney overlap, ESC heart failure/CKD overlap.

### Hepatology / Gastroenterology

Primary: EASL.
Secondary: AASLD, ACG, AGA where available, plus KDIGO hepatitis C in CKD when relevant.

### Respiratory

Primary: GINA for asthma, GOLD for COPD.
Secondary: ERS/ATS where available, IDSA if pneumonia/infection-focused.

### Cardiology

Primary: ESC, ACC/AHA.
Secondary: ADA cardiovascular risk, KDIGO BP/lipids/heart failure in CKD.

### Obstetrics / Gynecology

Primary: ACOG, RCOG/NICE where available.
Secondary: ADA pregnancy diabetes, ACR reproductive health in rheumatic disease.

### Pediatrics

Primary: AAP.
Secondary: GINA child asthma, ADA children/adolescents, KDIGO nephrotic syndrome in children, pediatric vaccination schedules.

### Infectious Disease / Antibiotics / Vaccines

Primary: IDSA, CDC/ACIP, WHO where relevant.
Secondary: specialty-specific infection guidelines, e.g. EAU urological infections, EASL viral hepatitis, KDIGO transplant infection.

### Urology

Primary: AUA and EAU.
Secondary: oncology sources for prostate/bladder/renal cancer, IDSA/EAU for urinary infections.

### Neurology

Primary: AAN.
Secondary: NICE/ESO where available, plus ACR imaging appropriateness for neurologic imaging questions.

### Dermatology

Primary: AAD.
Secondary: allergy/immunology or pediatrics for atopic dermatitis, IDSA for skin infections.

### Ophthalmology

Primary: AAO Preferred Practice Patterns.
Secondary: ADA retinopathy chapter for diabetic eye disease.

### Rheumatology / Musculoskeletal

Primary: ACR and EULAR.
Secondary: KDIGO lupus nephritis/vasculitis overlap, ACR imaging criteria for MSK imaging.

### Hematology / Oncology

Primary: ASCO and NCCN.
Secondary: EASL for liver cancers, AUA/EAU for GU cancers, specialty-specific oncology guidelines.

### Radiology / Imaging Decision Support

Primary: ACR Appropriateness Criteria.
Secondary: specialty guideline imaging sections.

## App Specialty Coverage Notes

The app's doctor profile specialty list is wider than the currently indexed guideline corpus. The current first implementation should prioritize the uploaded guideline bodies already present locally: ADA, KDIGO, EASL, GINA, and GOLD. The following app specialties still need dedicated guideline sources before the chat can be considered complete for them:

- General practice and family medicine
- General internal medicine
- Orthopedics
- Ophthalmology
- ENT
- Audiology and balance
- Dermatology and venereology
- Andrology and infertility
- Dentistry
- Neurology
- Neurosurgery
- Psychiatry and addiction
- Hematology
- General surgery
- Plastic surgery and burns
- Vascular surgery
- Cardiothoracic surgery
- Pediatric surgery
- Surgical oncology
- Medical oncology
- Obesity, nutrition, and clinical dietetics
- Physical medicine and rehabilitation
- Speech therapy and behavioral modification
- Pain medicine / anesthesia
- Geriatric medicine
- Sports medicine

## Official Guideline Download Hubs

## Egypt Practical Upload Priority

This is the recommended upload order for the Egyptian outpatient market. It is practical, not a claim of an official epidemiology ranking:

1. General internal medicine / family medicine / general practice: ACP, NICE, disease-specific society guidelines.
2. Diabetes and endocrinology: ADA, AACE, EASD, Endocrine Society.
3. Cardiology and hypertension: ESC, ACC/AHA.
4. Respiratory medicine: GINA, GOLD, ATS/ERS when available.
5. Gastroenterology and hepatology: EASL, ACG, AGA.
6. Pediatrics and neonatology: AAP, GINA pediatric sections, ADA children/adolescents, CDC/ACIP vaccine schedules.
7. Obstetrics and gynecology: ACOG, RCOG/NICE where available.
8. Nephrology: KDIGO plus ADA/KDIGO overlap.
9. Infectious diseases, antibiotics, and vaccines: IDSA, CDC/ACIP.
10. Dermatology and venereology: AAD.
11. Orthopedics and sports medicine: AAOS, ACR where inflammatory disease overlaps.
12. Rheumatology and immunology: ACR, EULAR.
13. Urology and andrology: AUA, EAU, ASRM for fertility overlap.
14. Neurology: AAN.
15. Psychiatry and addiction: APA plus VA/DoD where available.
16. Ophthalmology: AAO Preferred Practice Patterns.
17. ENT, audiology, balance, and speech: AAO-HNS, American Academy of Audiology, ASHA.
18. Hematology and oncology: ASH, ASCO, NCCN.
19. General surgery, vascular, cardiothoracic, pediatric surgery, plastic surgery, surgical oncology: surgical society guidelines plus disease-specific oncology/specialty guidance.
20. Pain medicine and anesthesia: ASA and ASRA.
21. Geriatrics, rehab, obesity, nutrition: AGS/NICE, AAPM&R, ESPEN, Endocrine Society/obesity guidance.
22. Dentistry: ADA dental evidence-based guidelines.

- ADA Standards of Care: https://professional.diabetes.org/standards-of-care/practice-guidelines-resources
- AACE Clinical Guidance: https://pro.aace.com/clinical-guidance
- EASD Guidelines: https://www.easd.org/home/guidelines/
- Endocrine Society Guidelines: https://www.endocrine.org/clinical-practice-guidelines
- KDIGO Guidelines: https://kdigo.org/guidelines/
- EASL Campus / CPGs: https://easlcampus.eu/
- GINA Reports: https://ginasthma.org/reports/
- GOLD 2026 Report: https://goldcopd.org/2026-gold-report-and-pocket-guide/
- ESC Guidelines: https://www.escardio.org/guidelines
- ACC Guidelines: https://www.acc.org/guidelines
- IDSA Guidelines: https://www.idsociety.org/practice-guideline/
- ACOG Clinical Guidance: https://www.acog.org/clinical/clinical-guidance
- AAP Clinical Practice Guidelines: https://www.aap.org/en/quality-improvement/clinical-practice-guidelines/
- AUA Guidelines: https://www.auanet.org/guidelines-and-quality/guidelines
- EAU Guidelines: https://uroweb.org/guidelines
- ACR Rheumatology Guidelines: https://rheumatology.org/clinical-practice-guidelines
- EULAR Recommendations: https://www.eular.org/recommendations-home
- ASCO Guidelines: https://ascopubs.org/guidelines
- NCCN Guidelines: https://www.nccn.org/guidelines
- AAO Preferred Practice Patterns: https://www.aao.org/education/preferred-practice-pattern
- AAD Clinical Guidelines: https://www.aad.org/practicecenter/quality/clinical-guidelines
- AAN Guidelines: https://www.aan.com/Guidelines/home
- ACR Appropriateness Criteria: https://www.acr.org/clinical-resources/acr-appropriateness-criteria

## Implementation Notes

1. Add a canonical `specialty` taxonomy file in the app.
2. Add a mapping file from guideline body/source path to specialty and secondary specialties.
3. Update extraction/indexing scripts to write specialty metadata into Firestore.
4. Update vector search to filter by selected or inferred specialty.
5. Add a router step before search:
   - Detect language.
   - Detect primary specialty.
   - Detect clinical intent.
   - Detect if the question is follow-up or cross-specialty.
6. Add UI chips above chat for specialty and scope.
7. Add an admin coverage dashboard:
   - specialty
   - guideline bodies
   - books count
   - pages count
   - chunk count
   - embeddings status
   - missing metadata
