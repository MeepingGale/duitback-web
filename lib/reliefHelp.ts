// What each relief does and does not cover, complete enough that nobody needs to search elsewhere,
// and short enough to read on a phone. Every line was fact-checked in September 2026 against LHDN's
// Form BE explanatory notes (YA2025, Part G), LHDN public rulings, the Finance Acts 2023–2025 and the
// Budget 2026 measures for YA2026. Amounts live in tax.ts; this file is words.
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
      'Dental examination and treatment by a Malaysian Dental Council dentist, up to RM1,000 (from YA2024).',
      'Check-up sub-limit, RM1,000 shared: full medical check-up at a hospital or by an MMC doctor; COVID-19 tests; mental-health consultation; from YA2025 also screening such as blood tests, ultrasound, mammogram, pap smear, flu tests and self-test devices.',
      'Learning-disability sub-limit for a child aged 18 or under: diagnosis by an MMC doctor, early intervention or rehabilitation by MAHPC-registered allied-health practitioners, in Malaysia.',
    ],
    lists: [
      { title: 'Serious diseases (LHDN list)', items: ['AIDS', 'Parkinson\'s', 'cancer', 'renal failure', 'leukaemia', 'heart attack', 'pulmonary hypertension', 'chronic liver disease', 'fulminant viral hepatitis', 'head trauma with neurological deficit', 'brain tumour or vascular malformation', 'major burns', 'major organ transplant', 'major amputation of limbs'] },
      { title: 'Vaccines, YA2026', items: ['any vaccine registered with the National Pharmaceutical Regulatory Agency (NPRA), Ministry of Health'] },
      { title: 'Vaccines, up to YA2025', items: ['pneumococcal', 'HPV', 'influenza', 'rotavirus', 'varicella', 'meningococcal', 'Tdap', 'COVID-19'] },
      { title: 'Self-test devices (from YA2025; COVID-19 kits earlier)', items: ['blood-pressure monitor', 'pulse oximeter', 'thermometer', 'glucometer', 'COVID-19 or flu test kit', 'other self-testing devices registered under the Medical Device Act 2012'] },
      { title: 'Mental health, receipts from', items: ['a psychiatrist', 'a registered clinical psychologist', 'a registered counsellor'] },
      { title: 'Learning disabilities covered', items: ['autism', 'ADHD', 'global developmental delay', 'intellectual disability', 'Down syndrome', 'specific learning disabilities'] },
    ],
    cant: [
      'GP visits, everyday medicines, supplements, vitamins.',
      'Chiropractic, TCM, massage or physiotherapy on its own: not a listed category, and the practitioner is not an MMC doctor (physiotherapy counts only inside a child\'s learning-disability programme by a MAHPC-registered practitioner).',
      'Spectacles, contact lenses.',
      'Dental before YA2024; screening tests and self-test devices other than COVID-19 kits before YA2025.',
      'Medical insurance premiums: see Education and medical insurance.',
      'Parents\' treatment: see the Parents relief.',
    ],
    proof: 'Receipts for everything, kept seven years. Add an MMC doctor\'s certification for serious-disease and fertility treatment, an MDC dentist\'s for dental, and an MMC diagnosis for a child\'s learning disability (MAHPC practitioner\'s receipt for the programme). Check-up and mental-health receipts must come from a hospital, MMC doctor or the listed providers; self-test devices must not be for business.',
    bm: 'Penyakit serius, rawatan kesuburan, vaksin (RM1,000), pergigian (RM1,000), pemeriksaan atau kesihatan mental (RM1,000), masalah pembelajaran anak. Pengamal mesti berdaftar MMC, MDC, MAHPC atau Lembaga Kaunselor.',
  },
  parents_med: {
    who: 'Your natural or foster (adoptive) parents, and from YA2025 your grandparents (your parents\' parents); they must be resident in Malaysia',
    can: [
      'Medical treatment and care, in Malaysia, for a condition an MMC-registered doctor certifies needs it: clinic, hospital, nursing home, home care or a care centre.',
      'Dental examination and treatment certified by a Malaysian Dental Council dentist.',
      'Special needs and a carer when an MMC doctor certifies the condition needs them.',
      'Full medical examination, up to RM1,000 (from YA2024; includes vaccination from YA2025).',
    ],
    lists: [
      { title: 'Dental counts', items: ['extraction', 'fillings', 'scaling', 'dentures', 'root canal', 'tooth replacement', 'repairs'] },
      { title: 'Carer proof, any one', items: ['receipt', 'the carer\'s written confirmation', 'copy of the carer\'s work permit'] },
    ],
    cant: [
      'Treatment or care outside Malaysia.',
      'Parents-in-law: LHDN defines parents as natural or foster parents only.',
      'A carer who is you, your spouse or your child.',
      'A carer\'s salary when the parent is physically and mentally healthy.',
      'Chiropractic or traditional treatment without MMC registration.',
      'One receipt claimed by two siblings; LHDN accepts co-payers only with separate receipts, each for the amount that person paid.',
    ],
    proof: 'Official receipts plus the MMC doctor\'s (or MDC dentist\'s) certification. The relief is for expenses you incurred, so keep proof that you paid.',
    bm: 'Rawatan perubatan, pergigian, keperluan khas dan penjaga untuk ibu bapa atau datuk nenek (mulai TT2025) yang bermastautin di Malaysia, disahkan doktor berdaftar MMC (pergigian: MDC). Pemeriksaan perubatan penuh termasuk vaksin terhad RM1,000.',
  },
  lifestyle: {
    who: 'You, your spouse, your children',
    can: [
      'Books, journals, magazines, newspapers and similar publications, printed or electronic, bought or subscribed, including e-books.',
      'Personal computer, laptop, smartphone or tablet.',
      'Monthly internet subscription bill registered in your own name.',
      'Courses in skills outside your job, such as hobbies, languages or religion. No registration or approval by any government body is needed.',
    ],
    cant: [
      'Any additional charge for warranty, such as an extended-warranty or protection plan.',
      'A computer, phone or tablet used for your own business, or an internet subscription in someone else\'s name.',
      'Banned reading material, such as morally offensive magazines.',
      'Sports equipment, gym and sports fees: see Sports. Upskilling courses in a skill recognised by the Director General of Skills Development (JPK), RM2,000 slot: see Education fees.',
    ],
    proof: 'Receipts for each purchase or payment; course receipts from the provider; internet bills in your name.',
    bm: 'Bahan bacaan (bercetak atau elektronik), komputer peribadi, telefon pintar atau tablet, bil bulanan internet atas nama sendiri, dan yuran kursus kemajuan diri seperti hobi, bahasa atau agama. Caj tambahan waranti, peranti yang digunakan untuk tujuan perniagaan sendiri dan bahan bacaan terlarang tidak termasuk.',
  },
  sports: {
    who: 'You, your spouse, your children, and from YA2025 your parents (resident in Malaysia)',
    can: [
      'Sports equipment for any of the 103 sports listed under the Sports Development Act 1997; motorised two-wheel bicycles excluded.',
      'Rental or entrance fees for any sports facility.',
      'Registration fees for a competition in a listed sport whose organiser is approved and licensed by the Commissioner of Sports (check on erosa.kbs.gov.my).',
      'Gym membership fees paid to a company incorporated under the Companies Act 2016 or a club registered with the Commissioner of Sports.',
      'Structured training for a listed sport: classes, clinics, courses or workshops run by a registered club, association or SSM-incorporated company.',
    ],
    lists: [
      { title: 'Equipment counts', items: ['badminton racket', 'shuttlecocks', 'golf set and balls', 'footballs', 'bicycle', 'dumbbells', 'treadmill', 'yoga mat'] },
      { title: 'On the list', items: ['yoga', 'aerobics', 'bodybuilding', 'fitness (kecergasan)', 'running', 'swimming', 'cycling', 'e-sports'] },
      { title: 'Facilities', items: ['courts', 'pools', 'fields', 'climbing gyms', 'driving ranges'] },
    ],
    cant: [
      'Sports clothing and shoes: running shoes, boots, jerseys, swimsuits, leggings. LHDN treats these as attire, not equipment.',
      'Motorised two-wheel bicycles; smartwatches and fitness trackers.',
      'Classes or training for an activity not named on the Sports Development Act list, such as pilates or zumba.',
      'Coaching from a freelance coach or trainer not attached to a registered club, association or company.',
    ],
    proof: 'Payment receipts, online-generated ones included (KBS: bank-in slips and bank statements are not proof), in your name or the family member\'s; for competitions, the organiser\'s licence details.',
    bm: 'Peralatan sukan, sewa atau fi masuk fasiliti sukan, fi pertandingan berlesen, yuran gim dan latihan berstruktur bagi 103 sukan di bawah Akta Pembangunan Sukan 1997, untuk diri, pasangan, anak dan (mulai TT2025) ibu bapa. Pakaian dan kasut sukan, basikal dua roda bermotor dan jurulatih bebas tidak termasuk.',
  },
  epf: {
    who: 'You',
    can: [
      'Your own EPF contributions deducted from salary, up to RM4,000.',
      'Voluntary EPF counts too, whether you are an employee topping up, self-employed, or a pensionable civil servant who chose to contribute.',
      'Contributions under written law to widows\', widowers\' and orphans\' schemes.',
    ],
    cant: [
      'The employer\'s share.',
      'PRS: it has its own RM3,000 relief.',
      'Above RM4,000: only extra voluntary contributions can fill the RM3,000 life-insurance slot, shared with premiums. Excess salary-deducted contributions are lost.',
    ],
    proof: 'EA form for salary deductions; EPF statement or payment receipts for voluntary contributions.',
    bm: 'Caruman KWSP sendiri (wajib atau sukarela, bukan bahagian majikan) sehingga RM4,000. Hanya caruman sukarela tambahan boleh masuk ruang insurans nyawa RM3,000; lebihan caruman wajib tidak dikira.',
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
      'Life insurance premiums or family takaful contributions on your life or your spouse\'s.',
      'From YA2026, premiums on the life of an eligible child: unmarried and under 18, or 18 and over in full-time education or serving articles, or disabled at any age. Step-children and legally adopted children count.',
      'Voluntary EPF contributions above the RM4,000 EPF slot; they share this RM3,000 with the premiums.',
    ],
    cant: [
      'Medical, education or critical-illness riders: see Education and medical insurance.',
      'Personal accident, travel or motor insurance.',
      'A child\'s policy before YA2026.',
      'Pensionable civil servants: premiums are capped at this RM3,000 (the old RM7,000 ended in YA2023); the RM4,000 EPF slot only holds voluntary EPF you actually contribute.',
    ],
    proof: 'Premium statement from the insurer or takaful operator.',
    bm: 'Premium insurans nyawa atau takaful keluarga atas nyawa anda atau pasangan (anak layak dari TT2026), sehingga RM3,000. Insurans kemalangan, perjalanan dan motor tidak termasuk.',
  },
  edu_med_ins: {
    who: 'You, your spouse, your children (child conditions apply from YA2026)',
    can: [
      'Medical insurance or takaful for disease, accident or disability, with cover of 12 months or more.',
      'Medical rider on a life or family takaful policy: the rider premium only.',
      'Critical-illness rider on a basic policy: in full. Packaged with term life or personal accident: 60% of the premium.',
      'Group medical cover where you pay the premium yourself.',
      'Education policy: the child is the beneficiary (nominee if a parent is the insured). If the child is the insured, the paying parent must hold a payor benefit rider for the same term as the policy. Maturity payable when the child is 13 to 25. Takaful: proceeds made hibah (gift) to the child.',
    ],
    cant: [
      'Travel insurance, including medical cover on travel policies.',
      'Waiver-of-premium riders.',
      'Employer-paid group medical.',
      'From YA2026, a married child of any age, or a child aged 18 or over who is neither in full-time education (university, college, school or similar) nor serving under articles or indentures for a trade or profession. An unmarried disabled child qualifies at any age.',
    ],
    proof: 'Premium statement showing the medical or education portion.',
    bm: 'Premium insurans perubatan atau pendidikan untuk anda, pasangan dan anak, sehingga RM4,000. Insurans perjalanan dan rider pengecualian premium tidak termasuk. Dari TT2026 anak mesti belum berkahwin: bawah 18 tahun, atau 18 tahun ke atas dan belajar sepenuh masa (atau dalam artikel/indentur), atau OKU tanpa had umur.',
  },
  prs: {
    who: 'You; a working spouse claims their own RM3,000. PRS or annuity payments by a spouse with no income count as yours.',
    can: [
      'Contributions to a Private Retirement Scheme approved by the Securities Commission.',
      'The annuity-premium part of a deferred annuity from a Malaysian-licensed insurer or takaful operator, actually paid this year.',
    ],
    cant: [
      'EPF, including voluntary EPF: see EPF.',
      'Unit trusts, shares or savings plans that are not an approved PRS.',
      'The non-annuity part of an annuity policy premium, or premiums not actually paid in the year.',
      'More than RM3,000 across PRS and annuity together; RM3,000 total under joint assessment.',
    ],
    proof: 'Annual statement from the PRS provider, or the insurer\'s statement showing the annuity-premium portion.',
    bm: 'Caruman Skim Persaraan Swasta diluluskan SC atau premium anuiti tertangguh (bahagian anuiti sahaja), sehingga RM3,000, hingga TT2030.',
  },
  edu_self: {
    who: 'You only',
    can: [
      'Masters or doctorate in any field at a recognised institution or professional body in Malaysia.',
      'Any course up to first-degree level in the listed fields, at a recognised Malaysian institution or professional body (Ministry of Higher Education list).',
      'Upskilling or self-enhancement course recognised by the Director General of Skills Development (JPK) under the National Skills Development Act 2006, up to RM2,000, YA2023 to YA2026; not extended by Budget 2026.',
    ],
    lists: [
      { title: 'Listed fields', items: ['law', 'accounting', 'Islamic finance approved by Bank Negara or the Securities Commission', 'technical', 'vocational', 'industrial', 'scientific', 'technological'] },
      { title: 'Scientific includes (LHDN ruling)', items: ['biology', 'physics', 'chemistry', 'mathematics', 'information technology', 'engineering', 'medicine'] },
    ],
    cant: [
      'Fees for your spouse or children.',
      'Below masters level, degrees in unlisted fields such as business, arts or social science.',
      'A masters or PhD you stop pursuing: LHDN\'s ruling example disallows that year\'s fees.',
      'Hobby, language or religious courses: see Lifestyle.',
      'Institutions outside Malaysia, or not on the recognised list.',
    ],
    proof: 'Official receipts from the institution; keep the course details.',
    bm: 'Yuran pengajian sendiri: sarjana atau PhD apa-apa bidang, atau sehingga ijazah pertama dalam bidang undang-undang, perakaunan, kewangan Islam, teknikal, vokasional, industri, saintifik atau teknologi di institusi atau badan profesional diiktiraf. Kursus peningkatan kemahiran diiktiraf JPK sehingga RM2,000, tahun taksiran 2023 hingga 2026.',
  },
  sspn: {
    who: 'A parent saving for their child; one spouse per year (either under separate assessment, both combined under joint). Divorced parents may each claim.',
    can: [
      'Net deposits this year: deposits minus withdrawals, whatever the opening balance.',
      'Withdrawals to pay the child\'s diploma, degree, master\'s or PhD fees are not netted off (from YA2025).',
      'Deposits for several children, still RM8,000 in total.',
      'Joint assessment: both spouses\' deposits count, still RM8,000 in total.',
    ],
    cant: [
      'The balance itself or earlier years\' savings.',
      'Any other withdrawal in the same year: it reduces the claim ringgit for ringgit.',
      'Both spouses under separate assessment; only the one who saved claims.',
      'Saving for yourself, SSPN dividends, PTPTN prize credits, or deposits from the year the child turns 29 (PTPTN rules).',
      'Deposits PTPTN receives after 31 December (online or bank deposits: send by 25 December).',
    ],
    proof: 'SSPN tax relief statement from myPTPTN showing deposits and withdrawals; keep the tuition receipts for any education withdrawal.',
    bm: 'Simpanan bersih SSPN tahun ini (deposit tolak pengeluaran; pengeluaran untuk yuran pengajian tinggi anak tidak dikira), sehingga RM8,000. Taksiran berasingan: seorang ibu atau bapa sahaja; taksiran bersama: simpanan kedua-dua dicampur, tetap RM8,000. Ibu bapa yang bercerai boleh menuntut masing-masing.',
  },
  childcare: {
    who: 'One spouse per year (divorced parents: one claimant per child); child aged 6 or under, or 12 or under at a DSW-registered care centre from YA2026',
    can: [
      'Childcare centre (taska) registered with the Department of Social Welfare, child aged 6 or under.',
      'Kindergarten (tadika) registered with the Ministry of Education, child aged 6 or under.',
      'From YA2026, a daycare or after-school transit centre registered with the Department of Social Welfare under the Care Centres Act 1993, child aged 12 or under.',
    ],
    cant: [
      'Unregistered babysitters, nannies, a domestic helper.',
      'Tuition, enrichment classes, school fees.',
      'More than RM3,000 in total, however many children.',
      'Both spouses under separate assessment; divorced parents may each claim for a different child.',
    ],
    proof: 'Monthly fee receipts issued by the centre plus the child\'s MyKid or birth certificate.',
    bm: 'Yuran taska atau tadika berdaftar untuk anak 6 tahun ke bawah; dari TT2026 juga pusat jagaan harian atau pusat transit selepas sekolah berdaftar dengan JKM untuk anak 12 tahun ke bawah. Sehingga RM3,000, suami atau isteri sahaja.',
  },
  breastfeed: {
    who: 'Breastfeeding mothers only, child aged 2 or under',
    can: ['Breast pump kit and ice pack.', 'Breast-milk collection and storage equipment (containers).', 'Cooler set or cooler bag.'],
    cant: [
      'Two years running: once every two years of assessment.',
      'More than RM1,000, even with more than one child.',
      'A claim by the husband, or joint assessment in his name.',
      'Anything outside those three groups: LHDN names no other equipment, so formula milk, feeding bottles, sterilisers or nursing wear are not covered.',
    ],
    proof: 'Receipts.',
    bm: 'Pam susu, bekas simpanan susu dan beg penyejuk untuk ibu menyusu anak 2 tahun ke bawah, RM1,000, sekali setiap dua tahun taksiran.',
  },
  spouse: {
    who: 'A spouse with no income, or alimony to a former wife',
    can: [
      'RM4,000 when your spouse has no source of income or no total income (tax-exempt income alone does not count), or elected joint assessment in your name. A wife must be living with you in the basis year.',
      'Alimony to a former wife under a court order or formal written agreement, within the same RM4,000.',
    ],
    cant: [
      'A spouse with any income that isn\'t tax-exempt who is assessed separately; elect joint assessment instead.',
      'A spouse with over RM4,000 of gross income from outside Malaysia, unless disabled.',
      'Voluntary support without a formal agreement.',
      'More than one wife: RM4,000 in total, and only one wife may claim the relief for a husband.',
    ],
    proof: 'Nothing to attach beyond your spouse\'s particulars in Part C; keep the court order or written alimony agreement and payment records for seven years.',
    bm: 'RM4,000 untuk pasangan tanpa punca atau jumlah pendapatan, atau taksiran bersama atas nama anda; atau alimoni / nafkah kepada bekas isteri di bawah perjanjian rasmi.',
  },
  child: {
    who: 'Your unmarried children, including step and legally adopted children, whose upkeep you pay for; one line per child',
    can: [
      'RM2,000: under 18 at any point in the year.',
      'RM2,000: 18 or over in other full-time study: A-Levels, certificate, matriculation or foundation (pre-degree).',
      'RM8,000: 18 or over, full-time at a government-recognised institution: diploma or higher in Malaysia, a degree or higher (including masters or PhD) abroad, or serving articles or indentures for a trade or profession in Malaysia.',
      'Disabled child: RM8,000 at any age, plus RM8,000 more if 18 or over and studying at the RM8,000 level above (RM16,000 in total).',
    ],
    cant: [
      'A married child.',
      'A child whose own income for the year exceeds the relief; scholarships, grants and pay under articles or indentures don\'t count.',
      'Spouses under separate assessment splitting one child: each claims 100% of different children (a separately assessed wife may elect in writing to take the whole relief).',
      'Claiming 100% when someone who is not your spouse living with you, such as an ex-spouse, also claims the same child: each of you gets 50%.',
    ],
    proof: 'Nothing to file (Working Sheet HK-17 is for your records); keep birth or adoption certificates and, for 18 and over, proof of full-time enrolment, for seven years.',
    bm: 'Anak belum berkahwin: RM2,000 bawah 18; RM2,000 jika 18+ dalam A-Level/sijil/matrikulasi/pra-ijazah; RM8,000 jika 18+ sepenuh masa diploma ke atas di Malaysia atau ijazah ke atas di luar negara; anak OKU RM8,000 (+RM8,000 jika 18+ dan belajar di peringkat itu). Pasangan taksiran berasingan pilih anak masing-masing; 50% hanya bagi penuntut bukan pasangan, contohnya bercerai.',
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
    cant: [
      'A spouse without DSW registration.',
      'A spouse with their own income under separate assessment: no spouse relief, so no further deduction. Joint assessment keeps both.',
    ],
    proof: 'Spouse\'s OKU registration.',
    bm: 'RM6,000 tambahan untuk pasangan berdaftar OKU dengan JKM; tidak layak jika pasangan berpendapatan dan ditaksir berasingan.',
  },
  equip: {
    who: 'You, your spouse, a child or a parent who is DSW-registered disabled',
    can: ['Basic supporting equipment the disability requires.'],
    lists: [
      { title: 'Equipment counts', items: ['wheelchair', 'haemodialysis machine', 'artificial limb', 'hearing aid', 'similar basic aids'] },
    ],
    cant: ['Spectacles and optical lenses.', 'Equipment for someone not DSW-registered.', 'Medical treatment: see Medical, or Parents — medical for a parent.'],
    proof: 'Receipts plus the user\'s OKU registration.',
    bm: 'Peralatan sokongan asas (kerusi roda, mesin hemodialisis, kaki palsu, alat pendengaran) untuk diri, pasangan, anak atau ibu bapa yang OKU berdaftar JKM, sehingga RM6,000. Cermin mata dan kanta lekap tidak termasuk.',
  },
  ev: {
    who: 'Your own home and vehicle, not for business',
    can: [
      'EV charging facility for your own vehicle: installation, purchase or hire-purchase, rental, or subscription, every year up to YA2027.',
      'A multi-year charging subscription paid upfront is spread evenly over the years it covers.',
      'Food-waste composting machine for the home, once only in YA2025, 2026 or 2027.',
      'From YA2026, purchase or installation of a food-waste grinder or household CCTV, once only in YA2026 or 2027.',
    ],
    cant: [
      'The electric vehicle itself. Pay-per-use public charging is not one of the listed heads (installation, purchase, rental, subscription).',
      'A charger, composter, grinder or CCTV used for your business.',
      'A second composter claim within YA2025 to 2027, or a second grinder or CCTV claim within YA2026 to 2027.',
      'More than RM2,500 in total across all four items in a year.',
    ],
    proof: 'Receipts issued in your name for each payment or purchase.',
    bm: 'Pemasangan, pembelian atau sewa beli, sewaan atau langganan pengecas EV untuk kenderaan sendiri (sehingga TT2027); mesin kompos sisa makanan (sekali sahaja dalam TT2025 hingga 2027); dari TT2026 pembelian atau pemasangan mesin rincih sisa makanan atau CCTV rumah (sekali sahaja dalam TT2026 atau 2027). Bukan untuk kegunaan perniagaan. Jumlah terhad RM2,500.',
  },
  tourism: {
    who: 'You, for domestic travel in Malaysia, YA2026 only',
    can: [
      'Entrance fees to tourist attractions: museums, theme parks, national parks, marine parks, wildlife parks, zoos, geoparks.',
      'Entrance or participation fees for cultural and arts programmes, e.g. batik, handicraft or traditional-dance workshops and Teater Rakyat.',
      'Under joint assessment, or if your spouse has no income, what your spouse paid counts as yours.',
    ],
    cant: ['Hotels or other accommodation, tour packages, flights, meals, transport: the 2020 to 2022 version covered stays and packages, this one does not.', 'Overseas attractions.', 'Spending outside 2026.'],
    proof: 'Receipts or e-tickets showing the amount paid.',
    bm: 'Fi kemasukan ke pusat pelancongan (muzium, taman tema, taman negara, taman laut, zoo, geopark) dan program kebudayaan atau kesenian (bengkel batik, kraftangan, tarian tradisional, Teater Rakyat) bagi pelancongan dalam negara, sehingga RM1,000, TT2026 sahaja. Penginapan dan pakej pelancongan tidak termasuk.',
  },
  housing: {
    who: 'Malaysian citizens, tax resident, buying a first home to live in',
    can: [
      'Interest on the loan for your first residential property (house, condominium, apartment or flat built as a dwelling), one unit, occupied as your home.',
      'Sale and purchase agreement executed 1 January 2025 to 31 December 2027.',
      'RM7,000 a year if the price is RM500,000 or less; RM5,000 if RM500,001 to RM750,000; three consecutive years starting the first year interest is paid, even if you skip claiming that year: you cannot pick the years.',
    ],
    cant: [
      'Anyone who is not a Malaysian citizen and tax resident.',
      'A second property, or one you earn any income from, such as rent.',
      'Principal, legal fees, stamp duty, renovation: interest only.',
      'Agreements executed before 2025 or after 2027.',
      'The full amount on a shared loan: co-owners share the cap in proportion to the interest each paid.',
    ],
    proof: 'Bank\'s annual interest statement and the sale and purchase agreement.',
    bm: 'Faedah pinjaman rumah kediaman pertama yang diduduki (warganegara dan pemastautin; rumah tidak menghasilkan pendapatan), perjanjian jual beli 1 Januari 2025 hingga 31 Disember 2027: RM7,000 jika harga sehingga RM500,000, RM5,000 jika RM500,001 hingga RM750,000, tiga tahun taksiran berturut-turut mulai tahun pertama faedah dibayar.',
  },
  donation: {
    who: 'You',
    can: [
      'Cash gifts to the federal or a state government or a local authority: no limit.',
      'Cash gifts to institutions, organisations or funds approved by LHDN under subsection 44(6), to sports activities or national-interest projects approved by the Minister of Finance, and wakaf or public-university endowments approved under 44(11D): one shared limit of 10% of aggregate income.',
      'Artefacts, manuscripts or paintings given to the federal or a state government, at the value set by the Department of Museums Malaysia or the National Archives; paintings given to the National Art Gallery or a state art gallery, at the gallery\'s valuation. Outside the 10% limit.',
      'Cash for public, school or university library facilities (up to RM20,000); cash or medical equipment for a Ministry of Health-approved healthcare facility (up to RM20,000, value certified by the ministry); cash or in-kind facilities for disabled people in public places (valued by the local authority). Outside the 10% limit.',
    ],
    cant: [
      'Charities, crowdfunding, individuals, and places of worship whose fund is not approved under 44(6) or 44(11D): check the recipient on LHDN\'s Donation Approval Status page.',
      'Zakat: a rebate entered on the Income screen, not a relief.',
      'Food, clothing, equipment or services given to an approved institution: only cash qualifies there, apart from the in-kind gifts listed above.',
    ],
    proof: 'Kew-38 receipt for a government gift; for an approved body, its official receipt printed with the LHDN approval reference; the valuation or Ministry of Health certificate for a gift in kind.',
    bm: 'Derma tunai kepada kerajaan (tiada had); institusi/organisasi/tabung diluluskan subseksyen 44(6), sukan atau projek kepentingan negara diluluskan Menteri Kewangan, wakaf dan endowmen 44(11D) berkongsi had 10% pendapatan agregat; artifak, manuskrip, lukisan, perpustakaan (RM20,000), peralatan perubatan (RM20,000) dan kemudahan OKU mengikut nilai disahkan. Zakat adalah rebat, bukan pelepasan.',
  },
};

/** Questions people actually search, answered from the same sources. Shown on the public reliefs page. */
export const RELIEF_FAQ: { cat: string; q: string; a: string }[] = [
  { cat: 'medical', q: 'Can I claim chiropractic, physiotherapy or TCM under the medical relief?', a: 'No. The relief covers only the listed categories: serious diseases, fertility treatment, vaccination, dental, check-ups and mental health, and a child\'s learning disability, and each needs receipts from the right registered provider: a Malaysian Medical Council doctor for treatment, a Malaysian Dental Council dentist for dental, a psychiatrist, registered clinical psychologist or registered counsellor for mental health, and MAHPC-registered allied-health practitioners for a child\'s learning-disability programme. Chiropractic, TCM, massage and standalone physiotherapy fit none of those, for you or for your parents.' },
  { cat: 'medical', q: 'Which vaccines qualify for the RM1,000 vaccination relief?', a: 'From YA2026, any vaccine registered with the National Pharmaceutical Regulatory Agency (NPRA) under the Ministry of Health. For YA2025 and earlier the list was fixed: pneumococcal, HPV, influenza, rotavirus, varicella, meningococcal, Tdap and COVID-19. The RM1,000 is shared across you, your spouse and your children.' },
  { cat: 'medical', q: 'How much of the RM10,000 medical relief can a healthy person actually use?', a: 'About RM3,000: RM1,000 for a full check-up, screening or mental-health consultation, RM1,000 for vaccinations and RM1,000 for dental. The rest only opens up with treatment of a listed serious disease, fertility treatment or a child\'s learning-disability programme.' },
  { cat: 'lifestyle', q: 'Does the extended warranty on a laptop or phone count under lifestyle relief?', a: 'No. LHDN excludes any additional charge for warranty. The device itself counts, up to the RM2,500 cap, as long as it is not used for your own business.' },
  { cat: 'sports', q: 'Are running shoes, sportswear or pilates classes claimable under the sports relief?', a: 'No to all three. LHDN treats running shoes, boots, jerseys and swimsuits as attire rather than equipment, and since YA2024 the lifestyle relief no longer covers sports items either. Pilates is not named among the 103 sports listed under the Sports Development Act 1997, so a pilates studio\'s fees are out; yoga and aerobics are on the list, so their classes qualify when run by a registered club or an SSM-incorporated company, and a gym membership qualifies on the same registration test. Rackets, shuttlecocks, golf sets, dumbbells, a yoga mat, facility entry fees and licensed competition fees do count.' },
  { cat: 'childcare', q: 'Can both husband and wife claim the RM3,000 childcare relief?', a: 'No. Under separate assessment only one of you claims, and only what that person actually paid; under joint assessment the spouse assessed claims both your payments. Either way RM3,000 is the total however many children you have. Divorced parents may each claim, for different children. From YA2026 a daycare or after-school transit centre registered with the Department of Social Welfare also qualifies, for a child up to 12; taska and kindergarten fees stay limited to a child up to 6.' },
  { cat: 'sspn', q: 'Does an SSPN withdrawal affect my relief?', a: 'Usually. The relief is on the net deposit for the year: deposits minus withdrawals, capped at RM8,000, and the opening balance is ignored. The exception is a withdrawal to pay the child\'s diploma, degree, master\'s or PhD fees: from YA2025 that is not netted off. LHDN\'s own example: RM8,500 saved, RM3,000 withdrawn for university registration and RM2,000 for medical bills gives a claim of RM6,500.' },
  { cat: 'equip', q: 'Are spectacles claimable as disabled supporting equipment?', a: 'No. LHDN names hearing aids, wheelchairs, haemodialysis machines and artificial limbs as basic supporting equipment and expressly excludes spectacles and optical lenses. The user must be registered with the Department of Social Welfare.' },
  { cat: 'parents_med', q: 'What can I claim for my parents\' medical expenses?', a: 'Up to RM8,000 for medical treatment and care in Malaysia that an MMC doctor certifies is needed (clinic, hospital, nursing home, home care or a care centre), dental treatment certified by a Malaysian Dental Council dentist, special needs and a carer when a doctor certifies the need, and a full medical examination up to RM1,000 (from YA2024, including vaccination from YA2025). Grandparents count from YA2025; parents-in-law do not.' },
  { cat: 'edu_self', q: 'Which courses qualify for the RM7,000 education fees relief?', a: 'Any masters or doctorate at a recognised Malaysian institution or professional body; courses up to first-degree level in law, accounting, Islamic finance, technical, vocational, industrial, scientific or technological fields; and upskilling courses recognised by the Department of Skills Development (JPK), up to RM2,000 until YA2026. Your own fees only, not your spouse\'s or children\'s.' },
  { cat: 'donation', q: 'Is every donation limited to 10% of my income?', a: 'No. Only cash gifts to LHDN-approved institutions, organisations and funds, approved sports activities and national-interest projects, and approved wakaf or endowments share the 10% pool. Cash gifts to the federal or a state government or a local authority have no limit, artefacts and paintings count at their certified value, and library facilities and medical equipment for approved facilities have their own RM20,000 limits. Zakat is a rebate, not a relief.' },
];
