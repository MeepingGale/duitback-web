// What each relief does and does not cover, in plain words, for the "what counts" tooltips.
// Source: LHDN Form BE explanatory notes (YA2025, Part G items G1–G22) and the Budget 2026
// measures for YA2026. Amounts live in tax.ts (CATS, SUBLIMITS, OVERRIDES); this file is words.
export interface ReliefHelp {
  /** who the spending may be for */
  who: string;
  can: string[];
  cant: string[];
  /** what LHDN expects you to keep for seven years */
  proof: string;
  /** one-line Malay summary */
  bm: string;
}

export const RELIEF_HELP: Record<string, ReliefHelp> = {
  individual: {
    who: 'Every resident taxpayer',
    can: ['RM9,000 granted automatically for yourself and dependent relatives.'],
    cant: ['Nothing to claim or prove: it is already in your tax computation and in your monthly PCB.'],
    proof: 'None.',
    bm: 'RM9,000 diberi secara automatik kepada setiap pembayar cukai pemastautin.',
  },
  medical: {
    who: 'You, your spouse, your children',
    can: [
      'Treatment of a serious disease: cancer, kidney failure, leukaemia, AIDS, Parkinson\'s, heart attack, chronic liver disease, major organ transplant, major burns and the rest of LHDN\'s list.',
      'Fertility treatment for you or your spouse (IVF, IUI, consultations and medicines), married taxpayers only.',
      'Vaccination, within its RM1,000 sub-limit: any vaccine registered with the Ministry of Health from YA2026 (a fixed list before that).',
      'Dental examination and treatment by a Malaysian Dental Council dentist, within its RM1,000 sub-limit.',
      'Full medical check-up, screening tests such as blood tests, mammogram or pap smear, COVID-19 and influenza tests, self-test devices such as a blood-pressure monitor, pulse oximeter or thermometer, and mental-health consultations with a psychiatrist, registered clinical psychologist or registered counsellor, all within the RM1,000 check-up sub-limit.',
      'Assessment, early-intervention or rehabilitation for a child aged 18 or under with autism, ADHD, global developmental delay, intellectual disability, Down syndrome or a specific learning disability, within its own sub-limit.',
    ],
    cant: [
      'Ordinary clinic visits, medicines for everyday illness, supplements or vitamins.',
      'Chiropractic, physiotherapy, massage, traditional or alternative treatment: the provider must be registered with the Malaysian Medical Council, and these are not.',
      'Cosmetic dental work such as whitening or veneers, and spectacles or contact lenses.',
      'Medical insurance premiums: those go under Education and medical insurance.',
      'Treatment for parents: that is the separate Parents relief.',
    ],
    proof: 'Receipt plus the practitioner\'s certification. Self-test devices need a receipt and must not be for business use.',
    bm: 'Penyakit serius, rawatan kesuburan, vaksin (RM1,000), pergigian (RM1,000), pemeriksaan kesihatan atau kesihatan mental (RM1,000) dan masalah pembelajaran anak. Pengamal mesti berdaftar dengan MMC atau MDC.',
  },
  parents_med: {
    who: 'Your parents or grandparents, resident in Malaysia',
    can: [
      'Any medical treatment for their condition, in Malaysia, certified by a Malaysian Medical Council practitioner: clinic and hospital bills, prescribed medicines.',
      'Dental treatment certified by a Malaysian Dental Council dentist.',
      'Special needs and a carer, when a doctor certifies the condition requires them. The carer cannot be you, your spouse or your children; keep the receipt, the carer\'s written confirmation or a copy of their work permit.',
      'A full medical examination, including vaccination, within the RM1,000 sub-limit.',
      'Grandparents count from YA2025. Foster parents count if you are their adopted child.',
    ],
    cant: [
      'Treatment or care given outside Malaysia.',
      'Parents-in-law.',
      'Chiropractic, traditional or alternative treatment without MMC registration.',
      'The same receipt claimed by two siblings. Each of you claims only what you paid.',
    ],
    proof: 'Official receipt plus the doctor\'s certification that treatment, special needs or a carer is required. A receipt in the parent\'s name is fine if you can show you paid.',
    bm: 'Rawatan perubatan, pergigian, keperluan khas dan penjaga untuk ibu bapa atau datuk nenek di Malaysia, disahkan doktor berdaftar MMC. Pemeriksaan penuh termasuk vaksin RM1,000.',
  },
  lifestyle: {
    who: 'You, your spouse, your children',
    can: [
      'Books, journals, magazines and newspapers, printed or digital, including e-book subscriptions.',
      'A personal computer, laptop, smartphone or tablet, one purchase or several, as long as the total fits the cap.',
      'Your monthly internet bill, for a subscription registered in your own name.',
      'Courses taken for interest or self-improvement: hobbies, languages, religion. No approval or registration needed for the course.',
    ],
    cant: [
      'Extended warranty or protection plans bought with the device.',
      'A device used for your own business, or a broadband account in someone else\'s name.',
      'Banned or morally offensive publications.',
      'Gym fees and sports gear: those go under the separate Sports relief.',
      'Skills courses recognised by the Department of Skills Development: those go under Education fees (upskilling).',
    ],
    proof: 'Receipts and, for internet, bills showing your name.',
    bm: 'Bahan bacaan, komputer, telefon pintar atau tablet, bil internet atas nama sendiri, dan kursus minat atau peningkatan diri. Waranti dan peralatan perniagaan tidak termasuk.',
  },
  sports: {
    who: 'You, your spouse, your children, and parents resident in Malaysia',
    can: [
      'Sports equipment for any activity listed under the Sports Development Act: rackets, balls, bicycles, golf clubs, running shoes and the like.',
      'Rental or entrance fees for sports facilities: courts, pools, fields, climbing gyms.',
      'Registration fees for competitions whose organiser is licensed by the Commissioner of Sports.',
      'Gym membership and sports training or coaching from a registered club, association or company.',
    ],
    cant: [
      'Motorised two-wheel bicycles.',
      'Sportswear, athleisure and fitness trackers.',
      'Personal-trainer sessions or classes from an unregistered individual.',
    ],
    proof: 'Receipts. For competitions, keep the organiser\'s details.',
    bm: 'Peralatan sukan, sewa atau tiket masuk kemudahan sukan, yuran pertandingan berlesen, keahlian gim dan latihan sukan. Basikal bermotor dan pakaian sukan tidak termasuk.',
  },
  epf: {
    who: 'You',
    can: [
      'Your own EPF contributions deducted from salary, up to RM4,000.',
      'Voluntary EPF contributions if you are self-employed, or a pensionable civil servant who chose to contribute.',
      'Contributions under any written law to widows\', widowers\' and orphans\' schemes.',
    ],
    cant: [
      'The employer\'s share of EPF.',
      'PRS contributions: those have their own RM3,000 relief.',
      'Amounts above RM4,000. Extra voluntary contributions can only spill into the RM3,000 life-insurance slot.',
    ],
    proof: 'EA form or EPF annual statement.',
    bm: 'Caruman KWSP anda sendiri (bukan bahagian majikan) sehingga RM4,000. Caruman lebihan hanya boleh masuk ruang insurans nyawa RM3,000.',
  },
  socso: {
    who: 'You',
    can: ['Your own SOCSO and EIS contributions deducted from salary, up to RM350 combined.'],
    cant: ['The employer\'s share.', 'Private insurance of any kind.'],
    proof: 'EA form.',
    bm: 'Caruman PERKESO dan SIP anda sendiri, sehingga RM350.',
  },
  life_ins: {
    who: 'Policies on your life or your spouse\'s; children\'s policies from YA2026',
    can: [
      'Life insurance premiums or family takaful contributions on your own life or your spouse\'s.',
      'From YA2026, premiums on an eligible child\'s life policy.',
      'Additional voluntary EPF contributions beyond the RM4,000 EPF slot, up to this RM3,000.',
    ],
    cant: [
      'Medical, education or critical-illness riders: the medical part goes under Education and medical insurance.',
      'Personal accident, travel or motor insurance.',
      'A child\'s life policy before YA2026.',
      'Pensionable civil servants get this RM3,000 only; the RM4,000 EPF slot does not apply to them.',
    ],
    proof: 'Premium statement from the insurer or takaful operator.',
    bm: 'Premium insurans nyawa atau takaful keluarga atas nyawa anda atau pasangan (anak dari TT2026), sehingga RM3,000. Insurans kemalangan, perjalanan dan motor tidak termasuk.',
  },
  edu_med_ins: {
    who: 'You, your spouse, your children',
    can: [
      'Medical insurance or medical takaful premiums for treatment of disease, accident or disability, with cover of 12 months or more.',
      'The medical rider on a life policy, counting only the rider premium.',
      'A critical-illness rider on a basic policy in full; 60% of the premium when it is packaged with term life or personal accident cover.',
      'Group medical cover where you pay the premium yourself.',
      'Education policies where the child is the beneficiary, the payor is covered, and the policy matures when the child is between 13 and 25.',
    ],
    cant: [
      'Travel insurance and medical-expense travel cover.',
      'Waiver-of-premium riders.',
      'Employer-paid group medical cover.',
      'From YA2026, cover for a child who is married, or over 18 and not in tertiary study, unless the child is disabled.',
    ],
    proof: 'Premium statement showing the medical or education portion.',
    bm: 'Premium insurans perubatan atau pendidikan untuk anda, pasangan dan anak, sehingga RM4,000. Insurans perjalanan dan rider pengecualian premium tidak termasuk.',
  },
  prs: {
    who: 'You; a working spouse claims their own',
    can: [
      'Contributions to a Private Retirement Scheme approved by the Securities Commission.',
      'Premiums for a deferred annuity.',
    ],
    cant: [
      'EPF, including voluntary EPF: that is the EPF relief.',
      'Unit trusts, shares or savings plans that are not an approved PRS.',
      'More than RM3,000 combined across PRS and annuity, and RM3,000 total under joint assessment.',
    ],
    proof: 'Annual statement from the PRS provider or insurer.',
    bm: 'Caruman Skim Persaraan Swasta diluluskan SC atau premium anuiti tertunda, sehingga RM3,000. Dilanjutkan hingga TT2030.',
  },
  edu_self: {
    who: 'You only',
    can: [
      'Any masters or doctorate degree, in any field, at a recognised institution or professional body in Malaysia.',
      'Courses up to first degree in law, accounting, Islamic finance approved by Bank Negara or the Securities Commission, technical, vocational, industrial, scientific or technological skills, at a recognised institution.',
      'Upskilling or self-enhancement courses in a skill area recognised by the Department of Skills Development, within the RM2,000 sub-limit.',
    ],
    cant: [
      'Fees for your children or spouse: their fees are not claimable by you.',
      'Bachelor degrees in other fields such as business, arts or social sciences.',
      'Hobby, language or religious courses: those go under Lifestyle.',
      'Institutions not on the Ministry of Higher Education\'s recognised list.',
    ],
    proof: 'Official receipts from the institution; keep the course details.',
    bm: 'Yuran pengajian sendiri: sarjana atau PhD apa-apa bidang, atau kursus undang-undang, perakaunan, kewangan Islam, teknikal atau sains di institusi diiktiraf. Kursus kemahiran DSD sehingga RM2,000.',
  },
  sspn: {
    who: 'One parent per year',
    can: [
      'The net amount you deposited into SSPN this year: deposits minus any withdrawals, whatever the opening balance.',
      'Deposits for more than one child, still capped at RM8,000 in total.',
    ],
    cant: [
      'The account balance itself or earlier years\' savings.',
      'A withdrawal made in the same year: it reduces the net deposit, even for university fees.',
      'Both spouses claiming under separate assessment. Only the one who saved claims.',
    ],
    proof: 'SSPN annual statement showing deposits and withdrawals.',
    bm: 'Simpanan bersih SSPN tahun ini (deposit tolak pengeluaran), sehingga RM8,000, dituntut oleh seorang ibu atau bapa sahaja.',
  },
  childcare: {
    who: 'One parent per year; child aged 12 or under from YA2026 (6 before)',
    can: [
      'Fees to a childcare centre registered with the Department of Social Welfare.',
      'Fees to a kindergarten registered with the Ministry of Education.',
      'From YA2026, registered daycare centres and after-school transit centres.',
    ],
    cant: [
      'Unregistered babysitters, nannies or a domestic helper.',
      'Tuition, enrichment classes or school fees.',
      'More than RM3,000 in total, however many children.',
      'Both spouses claiming under separate assessment. Divorced parents may each claim for a different child.',
    ],
    proof: 'Monthly fee receipts plus the child\'s MyKid or birth certificate.',
    bm: 'Yuran taska atau tadika berdaftar (dari TT2026 juga pusat jagaan harian dan transit) untuk anak 12 tahun ke bawah, sehingga RM3,000, seorang ibu atau bapa sahaja.',
  },
  breastfeed: {
    who: 'Breastfeeding mothers only; child aged 2 or under',
    can: [
      'Breast pump kit and ice packs.',
      'Milk collection and storage equipment.',
      'Cooler set or cooler bag.',
    ],
    cant: [
      'A claim two years running: once every two years of assessment only.',
      'More than RM1,000 even with more than one child.',
      'A claim by the husband, or under joint assessment in the husband\'s name.',
      'Formula, bottles, sterilisers and nursing clothes.',
    ],
    proof: 'Receipts for the equipment.',
    bm: 'Pam susu, bekas simpanan susu dan beg penyejuk untuk ibu menyusu anak 2 tahun ke bawah, RM1,000, sekali setiap dua tahun taksiran.',
  },
  spouse: {
    who: 'A spouse with no income, or alimony to a former wife',
    can: [
      'RM4,000 when your husband or wife has no source of income, or has elected joint assessment in your name.',
      'Alimony paid to a former wife under a formal agreement, within the same RM4,000.',
    ],
    cant: [
      'A spouse who works or has any income under separate assessment.',
      'A spouse with more than RM4,000 of income from outside Malaysia, unless disabled.',
      'Voluntary support without a formal agreement.',
      'More than one wife: only one relief.',
    ],
    proof: 'Nothing to file; keep the divorce or maintenance order for alimony.',
    bm: 'RM4,000 untuk pasangan tanpa pendapatan atau taksiran bersama, atau nafkah kepada bekas isteri di bawah perjanjian rasmi.',
  },
  child: {
    who: 'Your unmarried children, one line per child',
    can: [
      'RM2,000 for each child under 18.',
      'RM2,000 for a child 18 or over in full-time A-Levels, matriculation or a pre-degree course.',
      'RM8,000 for a child 18 or over in a full-time diploma or higher in Malaysia, a degree or higher abroad, or serving articles to qualify in a profession.',
      'A disabled child: RM8,000, plus another RM8,000 if 18 or over and studying as above.',
    ],
    cant: [
      'A married child.',
      'A child whose own income exceeds the relief, scholarships excepted.',
      'Both parents claiming the same child in full under separate assessment: split 50/50 or let one parent take 100%.',
    ],
    proof: 'Nothing to file; keep birth certificates and, for 18 and over, the enrolment letter.',
    bm: 'Anak belum berkahwin: RM2,000 bawah 18 tahun, RM2,000 pra-universiti, RM8,000 diploma atau ijazah sepenuh masa, anak OKU RM8,000 (+RM8,000 jika belajar).',
  },
  disabled_self: {
    who: 'You',
    can: ['A further RM7,000 when you are certified disabled by the Department of Social Welfare (OKU card).'],
    cant: ['A medical condition without DSW registration.'],
    proof: 'OKU registration.',
    bm: 'RM7,000 tambahan untuk individu berdaftar OKU dengan JKM.',
  },
  disabled_spouse: {
    who: 'Your spouse',
    can: ['A further RM6,000 when your spouse is certified disabled by the Department of Social Welfare, on top of the spouse relief.'],
    cant: ['A spouse who is not DSW-registered.'],
    proof: 'Spouse\'s OKU registration.',
    bm: 'RM6,000 tambahan untuk pasangan berdaftar OKU dengan JKM.',
  },
  equip: {
    who: 'You, your spouse, a child or a parent who is DSW-registered disabled',
    can: [
      'Basic supporting equipment: wheelchair, haemodialysis machine, artificial limb, hearing aid and similar.',
    ],
    cant: [
      'Spectacles and optical lenses.',
      'Equipment for someone not registered with the Department of Social Welfare.',
      'Ordinary medical treatment: that is the medical relief.',
    ],
    proof: 'Receipts plus the OKU registration of the person using it.',
    bm: 'Peralatan sokongan asas seperti kerusi roda, mesin dialisis, kaki palsu atau alat bantu pendengaran untuk OKU berdaftar JKM, sehingga RM6,000. Cermin mata tidak termasuk.',
  },
  ev: {
    who: 'Your own home and vehicle, not for business',
    can: [
      'Installing, buying, hire-purchasing, renting or subscribing to an electric-vehicle charging facility, until YA2027.',
      'A food-waste composting machine for the household, once every three years.',
      'From YA2026, a food-waste grinder or a household CCTV system, once within two years.',
    ],
    cant: [
      'The electric vehicle itself, or public charging paid per session as fuel.',
      'A charger installed for business use.',
      'Repeating the composter, grinder or CCTV claim before its waiting period ends.',
    ],
    proof: 'Receipts or the hire-purchase or subscription agreement.',
    bm: 'Pemasangan, pembelian, sewa atau langganan pengecas EV; mesin kompos sisa makanan (sekali setiap 3 tahun); dari TT2026 pengisar sisa makanan atau CCTV rumah (sekali dalam 2 tahun). Sehingga RM2,500.',
  },
  tourism: {
    who: 'You, in Malaysia, YA2026 only',
    can: [
      'Entrance fees to tourist attractions in Malaysia.',
      'Tickets to cultural and arts programmes in Malaysia.',
    ],
    cant: [
      'Hotels, flights, meals and transport.',
      'Overseas attractions.',
      'Spending outside 2026.',
    ],
    proof: 'Receipts or e-tickets.',
    bm: 'Tiket masuk tarikan pelancongan dan program kebudayaan atau seni di Malaysia, sehingga RM1,000, TT2026 sahaja.',
  },
  housing: {
    who: 'First-time buyers of a home to live in',
    can: [
      'Interest paid on the loan for your first residential property, one unit, occupied as your home.',
      'Sale and purchase agreement signed between 1 January 2025 and 31 December 2027.',
      'RM7,000 a year when the price is RM500,000 or less; RM5,000 when it is RM500,001 to RM750,000; for three consecutive years from the first year interest is paid.',
    ],
    cant: [
      'A second property, a property you rent out, or one used for business.',
      'Loan principal, legal fees, stamp duty or renovation.',
      'A home bought under an agreement dated before 2025.',
      'The full amount when the loan is shared: joint owners split it in proportion.',
    ],
    proof: 'Bank\'s annual interest statement and the sale and purchase agreement.',
    bm: 'Faedah pinjaman rumah pertama yang diduduki, perjanjian jual beli 2025 hingga 2027: RM7,000 jika harga sehingga RM500,000, RM5,000 jika RM500,001 hingga RM750,000, untuk tiga tahun berturut-turut.',
  },
  donation: {
    who: 'You',
    can: [
      'Cash gifts to the government, a state government or a local authority, in full.',
      'Cash gifts to institutions and funds approved under section 44(6), up to 10% of your aggregate income.',
      'Gifts of artefacts, paintings or manuscripts to the government or approved bodies, at the value LHDN sets.',
    ],
    cant: [
      'Donations to unapproved charities, crowdfunding, mosques or temples without approval, or to individuals.',
      'Zakat: that is a tax rebate, entered on the Income screen, not a relief.',
      'Goods or services donated, other than the artefacts above.',
    ],
    proof: 'Official receipt bearing the approval reference.',
    bm: 'Derma tunai kepada kerajaan (penuh) atau institusi diluluskan seksyen 44(6) (sehingga 10% pendapatan agregat). Zakat adalah rebat, bukan pelepasan.',
  },
};
