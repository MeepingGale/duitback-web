import { CtaLink, FeatureCell, Kicker, Section, Step, Wordmark } from '@/components/ui';

const APP = 'app/';
const GITHUB = 'https://github.com/MeepingGale/duitback-web';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'DuitBack',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'MYR' },
  description:
    'Unofficial tracker for Malaysian personal income tax (Form BE/B): log relief claims against the LHDN cap schedule, keep receipts in one vault, and file from a cheat-sheet when MyTax e-Filing opens. All data stays in the browser.',
  url: 'https://meepinggale.github.io/duitback-web/',
};

const FEATURES = [
  {
    title: 'Real LHDN caps, per year',
    body: 'Every relief in the schedule for YA2023–YA2026 — medical sub-limits enforced, per-child fixed amounts, donations at 10% of aggregate income. Over-cap claims are saved but flagged.',
  },
  {
    title: 'Receipt vault · Peti resit',
    body: 'Drop receipts in, tag them to a relief, and the filing pack cites the evidence behind every number. LHDN can audit 7 years back — keep it all in one place.',
  },
  {
    title: 'Filing-pack cheat-sheet',
    body: 'When e-Filing opens, one page shows everything to type into MyTax — income, relief lines, and the computation down to your estimated refund. Print it or save as PDF.',
  },
  {
    title: 'Private by design',
    body: 'No backend, no account, no tracking. Your tax data lives in your browser only — export or import JSON to move devices. Free, forever.',
  },
];

const STEPS = [
  {
    title: 'Set up in a minute',
    body: 'Your name, tax file number and marital status — then a short tour shows you around. Prefer to poke first? One click loads a demo taxpayer.',
  },
  {
    title: 'Log claims as you spend',
    body: 'Books, clinic visits, PRS top-ups — add a claim, attach the receipt, and watch cap utilisation and the refund estimate update live.',
  },
  {
    title: 'File from the pack in March',
    body: 'Open the filing pack, type the numbers into MyTax e-Filing, print the pack for your records, and mark the return submitted.',
  },
];

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="wrap site-nav">
        <a href="./" aria-label="duıtback. — home" style={{ display: 'inline-flex' }}>
          <Wordmark />
        </a>
        <CtaLink href={APP} variant="secondary">
          Open the tracker →
        </CtaLink>
      </header>

      <main>
        <section className="wrap hero">
          <Kicker>Free · Percuma · Local-first</Kicker>
          <h1>
            <em style={{ fontStyle: 'normal', color: 'var(--color-accent)' }}>Duit</em> is Malay for money.
            <br />
            Get yours back.
          </h1>
          <p className="lead">
            DuitBack tracks your Malaysian income tax reliefs against the real LHDN caps all year — claims, receipts and a
            live refund estimate — then hands you a cheat-sheet with every number to type into MyTax when e-Filing opens.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 36 }}>
            <CtaLink href={APP}>Open the tracker · Mula →</CtaLink>
            <CtaLink href="#how" variant="secondary">
              How it works
            </CtaLink>
          </div>
          <img
            className="shot"
            src="shots-dashboard.png"
            alt="DuitBack dashboard — reliefs claimed against LHDN caps, refund estimate and returns by year of assessment"
            width={2880}
            height={1920}
          />
          <p style={{ fontSize: 11.5, color: 'var(--color-neutral-700)', marginTop: 8 }}>Shown with demo data.</p>
        </section>

        <section className="poster">
          <div className="wrap">
            <Kicker onRed>Why track all year · Kenapa jejak sepanjang tahun</Kicker>
            <p className="big">
              Every relief cap resets on 31 December — use it or lose it. Most people find out what they had left in March,
              over a shoebox of receipts.
            </p>
            <p style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.4, maxWidth: 680, margin: 0 }}>
              DuitBack flips the timing: see &ldquo;RM 1,812 left on Lifestyle&rdquo; in September, while you can still do
              something about it.
            </p>
          </div>
        </section>

        <Section id="features" kicker="What it does · Fungsi" title="The whole filing year, one tracker">
          <div className="grid">
            {FEATURES.map((f) => (
              <FeatureCell key={f.title} title={f.title}>
                {f.body}
              </FeatureCell>
            ))}
          </div>
        </Section>

        <Section id="how" kicker="How it works · Cara guna" title="Three habits, one refund">
          <div className="steps">
            {STEPS.map((s, i) => (
              <Step key={s.title} n={i + 1} title={s.title}>
                {s.body}
              </Step>
            ))}
          </div>
          <div style={{ marginTop: 28 }}>
            <CtaLink href={APP}>Start tracking · Mula menjejak →</CtaLink>
          </div>
        </Section>
      </main>

      <footer className="wrap site-footer">
        <span>
          DuitBack — unofficial tracker · estimates only · not affiliated with LHDN. Confirm every figure in MyTax before
          filing.
        </span>
        <span style={{ display: 'flex', gap: 16 }}>
          <a href="https://ko-fi.com/duitback" target="_blank" rel="noopener noreferrer">
            belanja teh tarik →
          </a>
          <a href={GITHUB} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </span>
      </footer>
    </>
  );
}
