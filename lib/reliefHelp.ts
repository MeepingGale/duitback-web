// What each relief does and does not cover, complete enough that nobody needs to search elsewhere,
// and short enough to read on a phone. Source: LHDN Form BE explanatory notes (YA2025, Part G items
// G1–G22) and the Budget 2026 measures for YA2026. Amounts live in tax.ts; this file is words.
export interface HelpList { title: string; items: string[] }
export interface ReliefHelp {
  /** who the spending may be for */
  who: string;
  /** what counts, one short line each */
  can: string[];
  /** enumerations shown as compact comma lists */
  lists?: HelpList[];
  /** what does not count */
  cant: string[];
  /** what to keep for seven years */
  proof: string;
  /** one-line Malay summary */
  bm: string;
}

export const RELIEF_HELP: Record<string, ReliefHelp> = {
  individual: {
    who: 'Every resident taxpayer',
    can: ['RM9,000 for yourself and dependent relatives, granted automatically.'],
    cant: ['Nothing to claim or prove; it is already in your tax and your monthly PCB.'],
    proof: 'None.',
    bm: 'RM9,000 diberi secara automatik kepada setiap pembayar cukai pemastautin.',
  },
  medical: {
    who: 'You, your spouse, your children',
    can: [
      'Treatment of a serious disease, no sub-limit inside the cap.',
      'Fertility treatment for you or your spouse: IVF, IUI, consultations, medicines. Married taxpayers only.',
      'Vaccination, up to RM1,000.',
      'Dental examination and treatment by a Malaysian Dental Council dentist, up to RM1,000.',
      'Check-up sub-limit, RM1,000 shared: full medical check-up; screening such as blood tests, ultrasound, mammogram, pap smear; COVID-19 or flu tests; self-test devices; mental-health consultation.',
      'Learning-disability sub-limit for a child aged 18 or under: diagnosis by an MMC doctor, early intervention or rehabilitation by allied-health practitioners, in Malaysia.',
    ],
    lists: [
      { title: 'Serious diseases (LHDN list)', items: ['AIDS', 'Parkinson\'s', 'cancer', 'renal failure', 'leukaemia', 'heart attack', 'pulmonary hypertension', 'chronic liver disease', 'fulminant viral hepatitis', 'head trauma with neurological deficit', 'brain tumour or vascular malformation', 'major burns', 'major organ transplant', 'major amputation'] },
      { title: 'Vaccines, YA2026', items: ['any vaccine registered with the Ministry of Health'] },
      { title: 'Vaccines, up to YA2025', items: ['pneumococcal', 'HPV', 'influenza', 'rotavirus', 'varicella', 'meningococcal', 'Tdap', 'COVID-19'] },
      { title: 'Self-test devices', items: ['blood-pressure monitor', 'pulse oximeter', 'thermometer', 'COVID-19 or flu test kit', 'any device registered under the Medical Device Act'] },
      { title: 'Mental health, receipts from', items: ['a psychiatrist', 'a registered clinical psychologist', 'a registered counsellor'] },
      { title: 'Learning disabilities covered', items: ['autism', 'ADHD', 'global developmental delay', 'intellectual disability', 'Down syndrome', 'specific learning disabilities'] },
    ],
    cant: [
      'GP visits, everyday medicines, supplements, vitamins.',
      'Chiropractic, physiotherapy, massage, TCM or other treatment not by an MMC-registered doctor.',
      'Cosmetic dentistry, spectacles, contact lenses.',
      'Medical insurance premiums: see Education and medical insurance.',
      'Parents\' treatment: see the Parents relief.',
    ],
    proof: 'Receipt plus the practitioner\'s certification; a receipt alone for vaccines and self-test devices, which must not be for business.',
    bm: 'Penyakit serius, rawatan kesuburan, vaksin (RM1,000), pergigian (RM1,000), pemeriksaan atau kesihatan mental (RM1,000), masalah pembelajaran anak. Pengamal mesti berdaftar MMC atau MDC.',
  },
  parents_med: {
    who: 'Your parents or grandparents, resident in Malaysia; foster parents if you are their adopted child',
    can: [
      'Any medical treatment for their condition, in Malaysia, certified by an MMC doctor: clinic, hospital, prescribed medicines.',
      'Dental treatment certified by a Malaysian Dental Council dentist.',
      'Special needs and a carer when a doctor certifies the condition needs them.',
      'Full medical examination including vaccination, up to RM1,000.',
    ],
    lists: [
      { title: 'Carer proof, any one', items: ['receipt', 'the carer\'s written confirmation', 'copy of the carer\'s work permit'] },
    ],
    cant: [
      'Treatment or care outside Malaysia.',
      'Parents-in-law.',
      'A carer who is you, your spouse or your child.',
      'Chiropractic or traditional treatment without MMC registration.',
      'One receipt claimed by two siblings; each claims what they paid.',
    ],
    proof: 'Official receipt plus the doctor\'s certification. A receipt in the parent\'s name is fine if you can show you paid.',
    bm: 'Rawatan perubatan, pergigian, keperluan khas dan penjaga untuk ibu bapa atau datuk nenek di Malaysia, disahkan doktor MMC. Pemeriksaan penuh termasuk vaksin RM1,000.',
  },
  lifestyle: {
    who: 'You, your spouse, your children',
    can: [
      'Books, journals, magazines, newspapers, printed or digital, including e-book subscriptions.',
      'Personal computer, laptop, smartphone or tablet.',
      'Monthly internet bill for a subscription in your own name.',
      'Courses for interest or self-improvement: hobbies, languages, religion. No approval needed.',
    ],
    cant: [
      'Extended warranty or protection plans.',
      'A device used for your business, or broadband in someone else\'s name.',
      'Banned or morally offensive publications.',
      'Gym and sports gear: see Sports. Skills-council courses: see Education fees.',
    ],
    proof: 'Receipts; internet bills showing your name.',
    bm: 'Bahan bacaan, komputer, telefon pintar atau tablet, bil internet atas nama sendiri, kursus minat. Waranti dan peralatan perniagaan tidak termasuk.',
  },
  sports: {
    who: 'You, your spouse, your children, parents resident in Malaysia',
    can: [
      'Sports equipment for any activity listed under the Sports Development Act.',
      'Rental or entrance fees for sports facilities.',
      'Registration for competitions whose organiser is licensed by the Commissioner of Sports.',
      'Gym membership, sports training or coaching from a registered club, association or company.',
    ],
    lists: [
      { title: 'Equipment examples', items: ['bicycle', 'racket', 'golf clubs', 'football boots', 'running shoes', 'balls', 'swimming gear', 'treadmill'] },
      { title: 'Facilities', items: ['courts', 'pools', 'fields', 'climbing gyms', 'driving ranges'] },
    ],
    cant: [
      'Motorised two-wheel bicycles.',
      'Sportswear, athleisure, fitness trackers, smartwatches.',
      'Classes from an unregistered individual trainer.',
    ],
    proof: 'Receipts; for competitions, the organiser\'s details.',
    bm: 'Peralatan sukan, sewa atau tiket masuk kemudahan sukan, yuran pertandingan berlesen, keahlian gim dan latihan sukan. Basikal bermotor dan pakaian sukan tidak termasuk.',
  },
  epf: {
    who: 'You',
    can: [
      'Your own EPF contributions deducted from salary, up to RM4,000.',
      'Voluntary EPF if self-employed, or a pensionable civil servant who chose to contribute.',
      'Contributions under written law to widows\', widowers\' and orphans\' schemes.',
    ],
    cant: [
      'The employer\'s share.',
      'PRS: it has its own RM3,000 relief.',
      'Above RM4,000: extra voluntary contributions can only fill the RM3,000 life-insurance slot.',
    ],
    proof: 'EA form or EPF annual statement.',
    bm: 'Caruman KWSP sendiri (bukan bahagian majikan) sehingga RM4,000. Lebihan hanya boleh masuk ruang insurans nyawa RM3,000.',
  },
  socso: {
    who: 'You',
    can: ['Your own SOCSO and EIS contributions deducted from salary, up to RM350 combined.'],
    cant: ['The employer\'s share.', 'Private insurance of any kind.'],
    proof: 'EA form.',
    bm: 'Caruman PERKESO dan SIP sendiri, sehingga RM350.',
  },
  life_ins: {
    who: 'Policies on your life or your spouse\'s; an eligible child\'s from YA2026',
    can: [
      'Life insurance premiums or family takaful contributions.',
      'From YA2026, premiums on an eligible child\'s life policy.',
      'Additional voluntary EPF beyond the RM4,000 EPF slot, up to this RM3,000.',
    ],
    cant: [
      'Medical, education or critical-illness riders: see Education and medical insurance.',
      'Personal accident, travel or motor insurance.',
      'A child\'s policy before YA2026.',
      'Pensionable civil servants: this RM3,000 only, no RM4,000 EPF slot.',
    ],
    proof: 'Premium statement from the insurer or takaful operator.',
    bm: 'Premium insurans nyawa atau takaful keluarga atas nyawa anda atau pasangan (anak dari TT2026), sehingga RM3,000. Insurans kemalangan, perjalanan dan motor tidak termasuk.',
  },
  edu_med_ins: {
    who: 'You, your spouse, your children',
    can: [
      'Medical insurance or takaful for disease, accident or disability, with cover of 12 months or more.',
      'Medical rider on a life policy: the rider premium only.',
      'Critical-illness rider on a basic policy: in full. Packaged with term life or personal accident: 60% of the premium.',
      'Group medical cover where you pay the premium yourself.',
      'Education policy: child is the beneficiary, the paying parent is covered by a payor rider, maturity when the child is 13 to 25. Takaful: proceeds gifted to the child.',
    ],
    cant: [
      'Travel insurance, including medical cover on travel policies.',
      'Waiver-of-premium riders.',
      'Employer-paid group medical.',
      'From YA2026, a child who is married, or over 18 and not in tertiary study, unless disabled.',
    ],
    proof: 'Premium statement showing the medical or education portion.',
    bm: 'Premium insurans perubatan atau pendidikan untuk anda, pasangan dan anak, sehingga RM4,000. Insurans perjalanan dan rider pengecualian premium tidak termasuk.',
  },
  prs: {
    who: 'You; a working spouse claims their own RM3,000',
    can: ['Contributions to a Private Retirement Scheme approved by the Securities Commission.', 'Deferred annuity premiums.'],
    cant: [
      'EPF, including voluntary EPF: see EPF.',
      'Unit trusts, shares or savings plans that are not an approved PRS.',
      'More than RM3,000 across PRS and annuity together; RM3,000 total under joint assessment.',
    ],
    proof: 'Annual statement from the PRS provider or insurer.',
    bm: 'Caruman PRS diluluskan SC atau premium anuiti tertunda, sehingga RM3,000, hingga TT2030.',
  },
  edu_self: {
    who: 'You only',
    can: [
      'Masters or doctorate in any field at a recognised institution or professional body in Malaysia.',
      'Up to first degree in the listed fields, at an institution on the Ministry of Higher Education\'s recognised list.',
      'Upskilling courses in a skill recognised by the Department of Skills Development, up to RM2,000, YA2024 to YA2026.',
    ],
    lists: [
      { title: 'Listed fields', items: ['law', 'accounting', 'Islamic finance approved by Bank Negara or the Securities Commission', 'technical', 'vocational', 'industrial', 'scientific', 'technological'] },
    ],
    cant: [
      'Fees for your spouse or children.',
      'First degrees in other fields such as business, arts or social science.',
      'Hobby, language or religious courses: see Lifestyle.',
      'Institutions not on the recognised list.',
    ],
    proof: 'Official receipts from the institution; keep the course details.',
    bm: 'Yuran pengajian sendiri: sarjana atau PhD apa-apa bidang, atau undang-undang, perakaunan, kewangan Islam, teknikal atau sains di institusi diiktiraf. Kursus kemahiran DSD sehingga RM2,000.',
  },
  sspn: {
    who: 'One parent per year',
    can: ['Net deposits this year: deposits minus withdrawals, whatever the opening balance.', 'Deposits for several children, still RM8,000 in total.'],
    cant: [
      'The balance itself or earlier years\' savings.',
      'A withdrawal in the same year reduces the claim, even for university fees.',
      'Both spouses under separate assessment; only the one who saved claims.',
    ],
    proof: 'SSPN annual statement showing deposits and withdrawals.',
    bm: 'Simpanan bersih SSPN tahun ini (deposit tolak pengeluaran), sehingga RM8,000, seorang ibu atau bapa sahaja.',
  },
  childcare: {
    who: 'One parent per year; child aged 12 or under from YA2026, 6 before',
    can: [
      'Childcare centre registered with the Department of Social Welfare.',
      'Kindergarten registered with the Ministry of Education.',
      'From YA2026, registered daycare and after-school transit centres.',
    ],
    cant: [
      'Unregistered babysitters, nannies, a domestic helper.',
      'Tuition, enrichment classes, school fees.',
      'More than RM3,000 in total, however many children.',
      'Both spouses under separate assessment; divorced parents may each claim for a different child.',
    ],
    proof: 'Monthly fee receipts plus the child\'s MyKid or birth certificate.',
    bm: 'Yuran taska atau tadika berdaftar (dari TT2026 juga pusat jagaan harian dan transit) untuk anak 12 tahun ke bawah, sehingga RM3,000, seorang ibu atau bapa sahaja.',
  },
  breastfeed: {
    who: 'Breastfeeding mothers only, child aged 2 or under',
    can: ['Breast pump kit and ice packs.', 'Milk collection and storage equipment.', 'Cooler set or cooler bag.'],
    cant: [
      'Two years running: once every two years of assessment.',
      'More than RM1,000, even with more than one child.',
      'A claim by the husband, or joint assessment in his name.',
      'Formula, bottles, sterilisers, nursing clothes.',
    ],
    proof: 'Receipts.',
    bm: 'Pam susu, bekas simpanan susu dan beg penyejuk untuk ibu menyusu anak 2 tahun ke bawah, RM1,000, sekali setiap dua tahun taksiran.',
  },
  spouse: {
    who: 'A spouse with no income, or alimony to a former wife',
    can: [
      'RM4,000 when your spouse has no source of income, or elected joint assessment in your name.',
      'Alimony to a former wife under a formal agreement, within the same RM4,000.',
    ],
    cant: [
      'A spouse with any income under separate assessment.',
      'A spouse with over RM4,000 of income from outside Malaysia, unless disabled.',
      'Voluntary support without a formal agreement.',
      'More than one wife: one relief.',
    ],
    proof: 'Nothing to file; keep the maintenance order for alimony.',
    bm: 'RM4,000 untuk pasangan tanpa pendapatan atau taksiran bersama, atau nafkah kepada bekas isteri di bawah perjanjian rasmi.',
  },
  child: {
    who: 'Your unmarried children, one line per child',
    can: [
      'RM2,000: under 18.',
      'RM2,000: 18 or over in full-time A-Levels, matriculation or pre-degree.',
      'RM8,000: 18 or over in a full-time diploma or higher in Malaysia, a degree or higher abroad, or serving articles for a profession.',
      'Disabled child: RM8,000, plus RM8,000 more if 18 or over and studying as above.',
    ],
    cant: [
      'A married child.',
      'A child whose own income exceeds the relief; scholarships don\'t count as income.',
      'Both parents claiming the same child in full under separate assessment: split 50/50 or one takes 100%.',
    ],
    proof: 'Nothing to file; keep birth certificates and, for 18 and over, the enrolment letter.',
    bm: 'Anak belum berkahwin: RM2,000 bawah 18, RM2,000 pra-universiti, RM8,000 diploma atau ijazah sepenuh masa, anak OKU RM8,000 (+RM8,000 jika belajar).',
  },
  disabled_self: {
    who: 'You',
    can: ['RM7,000 more when you are registered disabled with the Department of Social Welfare (OKU card).'],
    cant: ['A medical condition without DSW registration.'],
    proof: 'OKU registration.',
    bm: 'RM7,000 tambahan untuk individu berdaftar OKU dengan JKM.',
  },
  disabled_spouse: {
    who: 'Your spouse',
    can: ['RM6,000 more when your spouse is DSW-registered disabled, on top of the spouse relief.'],
    cant: ['A spouse without DSW registration.'],
    proof: 'Spouse\'s OKU registration.',
    bm: 'RM6,000 tambahan untuk pasangan berdaftar OKU dengan JKM.',
  },
  equip: {
    who: 'You, your spouse, a child or a parent who is DSW-registered disabled',
    can: ['Basic supporting equipment the disability requires.'],
    lists: [
      { title: 'Equipment counts', items: ['wheelchair', 'haemodialysis machine', 'artificial limb', 'hearing aid', 'similar basic aids'] },
    ],
    cant: ['Spectacles and optical lenses.', 'Equipment for someone not DSW-registered.', 'Medical treatment: see Medical.'],
    proof: 'Receipts plus the user\'s OKU registration.',
    bm: 'Kerusi roda, mesin dialisis, kaki palsu, alat bantu pendengaran untuk OKU berdaftar JKM, sehingga RM6,000. Cermin mata tidak termasuk.',
  },
  ev: {
    who: 'Your own home and vehicle, not for business',
    can: [
      'EV charging facility: installation, purchase, hire-purchase, rental or subscription, YA2024 to YA2027.',
      'Food-waste composting machine for the home, once every three years, YA2025 to YA2027.',
      'From YA2026, a food-waste grinder or household CCTV, once within two years.',
    ],
    cant: ['The electric vehicle itself, or pay-per-session public charging.', 'A charger for business use.', 'Repeating a composter, grinder or CCTV claim before its waiting period ends.'],
    proof: 'Receipts, or the hire-purchase or subscription agreement.',
    bm: 'Pemasangan, pembelian, sewa atau langganan pengecas EV; mesin kompos (sekali setiap 3 tahun); dari TT2026 pengisar sisa makanan atau CCTV rumah (sekali dalam 2 tahun). Sehingga RM2,500.',
  },
  tourism: {
    who: 'You, in Malaysia, YA2026 only',
    can: ['Entrance fees to tourist attractions in Malaysia.', 'Tickets to cultural and arts programmes in Malaysia.'],
    cant: ['Hotels, flights, meals, transport.', 'Overseas attractions.', 'Spending outside 2026.'],
    proof: 'Receipts or e-tickets.',
    bm: 'Tiket masuk tarikan pelancongan dan program kebudayaan atau seni di Malaysia, sehingga RM1,000, TT2026 sahaja.',
  },
  housing: {
    who: 'First-time buyers of a home to live in',
    can: [
      'Interest on the loan for your first residential property, one unit, occupied as your home.',
      'Sale and purchase agreement dated 1 January 2025 to 31 December 2027.',
      'RM7,000 a year if the price is RM500,000 or less; RM5,000 if RM500,001 to RM750,000; three consecutive years from the first year interest is paid.',
    ],
    cant: ['A second property, one rented out, or one used for business.', 'Principal, legal fees, stamp duty, renovation.', 'Agreements dated before 2025.', 'The full amount on a shared loan: joint owners split it.'],
    proof: 'Bank\'s annual interest statement and the sale and purchase agreement.',
    bm: 'Faedah pinjaman rumah pertama yang diduduki, perjanjian jual beli 2025 hingga 2027: RM7,000 jika harga sehingga RM500,000, RM5,000 jika RM500,001 hingga RM750,000, tiga tahun berturut-turut.',
  },
  donation: {
    who: 'You',
    can: [
      'Cash gifts to the federal or a state government or a local authority, in full.',
      'Cash gifts to institutions approved under section 44(6), up to 10% of aggregate income.',
      'Artefacts, paintings or manuscripts given to the government or approved bodies, at LHDN\'s valuation.',
    ],
    cant: ['Unapproved charities, crowdfunding, unapproved mosques or temples, individuals.', 'Zakat: a rebate entered on the Income screen, not a relief.', 'Goods or services other than the artefacts above.'],
    proof: 'Official receipt bearing the approval reference.',
    bm: 'Derma tunai kepada kerajaan (penuh) atau institusi diluluskan seksyen 44(6) (sehingga 10% pendapatan agregat). Zakat adalah rebat, bukan pelepasan.',
  },
};
