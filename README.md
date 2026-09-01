# DuitBack — Malaysian Tax Relief Tracker

*Duit* is Malay for money; DuitBack is about getting yours back. It tracks a Malaysian personal income tax return (Form BE) through the year — relief claims against the real LHDN caps, receipts in one vault, a live refund/balance estimate — then hands you a cheat-sheet with every number to type into MyTax when e-Filing opens. All data stays in your browser: no backend, no account, no tracking.

**[Live site →](https://meepinggale.github.io/duitback-web/)** · **[Open the tracker →](https://meepinggale.github.io/duitback-web/app/)** · [![deploy](https://github.com/MeepingGale/duitback-web/actions/workflows/deploy.yml/badge.svg)](https://github.com/MeepingGale/duitback-web/actions/workflows/deploy.yml)

![Dashboard — reliefs counted against caps, with the returns table below](docs/screenshots/dashboard.png)

Malaysian reliefs are use-it-or-lose-it: whatever cap you haven't spent to by 31 December is gone. But most people only find out what they had left in March, staring at e-Filing over a shoebox of receipts. DuitBack flips the timing — log claims as you spend, see "RM 1,812 left on Lifestyle" in September while you can still do something about it, and file in March from a one-page pack instead of a reconstruction. Tax records are exactly the kind of data that shouldn't sit in someone else's database, so nothing ever leaves the device.

## Features

**Through the year**
- The full LHDN relief schedule per year of assessment (YA2023–YA2026), each year against its own caps — medical sub-limits enforced, child relief as fixed per-child amounts, donations capped at 10% of aggregate income
- Claim lines per relief category: click a row, see the lines behind it, add the next one in place
- Receipt vault — attach receipts and tag them to claim lines, so every number in the filing pack can point at its evidence
- Dashboard with cap utilisation, top claims, estimated refund or balance payable, and the countdown to e-Filing day; per-YA filing status from "tracking claims" to "refund credited"

**At filing time**
- The filing pack: a per-YA cheat-sheet of everything to type into MyTax — income to declare, each relief line with its receipts total, and the computation down to estimated refund or balance payable (real progressive brackets, rebates and zakat, PCB/CP500 already paid)
- Separate vs joint assessment comparison for married filers, from the spouse's income on the Income screen
- Print / save as PDF

**Data & portability**
- Everything persists in `localStorage`; receipts are stored as data URLs inside the same blob — and a failed write warns you instead of silently dropping data
- JSON export and import for backup or moving devices
- First run is a minute of setup — name, tax number, marital status — followed by a guided tour that walks the actual screens, spotlighting the claim button, the caps table, the receipt vault and the filing pack in place (replayable from Settings); or one click loads a demo taxpayer ("Amirah") to explore. Demo mode wears an unmissable banner with a one-click exit, and Settings → Clear everything always returns you to setup
- Bilingual throughout — English · Bahasa Melayu

## Screenshots

<table>
  <tr>
    <td valign="top"><img src="docs/screenshots/filing-pack.png" alt="Filing pack — BE form cheat-sheet with income, relief lines and computation" width="620"></td>
    <td valign="top"><img src="docs/screenshots/mobile-dashboard.png" alt="Dashboard on mobile" width="180"></td>
  </tr>
</table>

<sub>All screenshots show the built-in demo data — not a real taxpayer.</sub>

## How it's built

The site is a Next.js static export: a server-rendered landing page (full SEO metadata, Open Graph, JSON-LD, sitemap) at `/`, with the tracker served at `/app/` and its header logo linking back home:

| File | What it is |
| --- | --- |
| `app/` + `components/ui.tsx` | The Next.js landing — App Router, shared UI components, Archivo self-hosted via `next/font`, styled by the Modernist token sheet |
| `components/tracker/` | The tracker — typed React screens (dashboard, claims, receipts, status, income, filing pack, settings) plus dialogs, tour and passcode lock |
| `lib/tax.ts` + `lib/data.ts` | The engine — pure, unit-tested tax math (brackets, per-YA caps, sub-limits, rebates, joint assessment) and the storage layer (same keys as every earlier build, so nobody loses data) |
| [`duitback-mockup`](https://github.com/MeepingGale/duitback-mockup) | The whole design process, in its own repo — the app's working canvas, the "CukaiKu"-era explorations, seventeen logo directions and the Modernist design system |

![Logo exploration — line-flower variations with rationale](docs/screenshots/logo-exploration.png)

The name went through "CukaiKu" (*my tax*) before landing on DuitBack — the `localStorage` key still says `cukaiku_v3`. The mark is the bunga raya drawn as a line flower dotting the "i", because the brand story is small amounts of duit coming back.

## Accuracy & limits

DuitBack is an unofficial tracker, not tax advice — every screen's footer says so. The YA2023–YA2026 cap schedules, the progressive bracket table, rebates and zakat handling follow the LHDN schedule, but everything it shows is an estimate; MyTax is the authority on filing day.

## Tradeoffs

Choices I'd defend, and where their ceilings are:

- **Born as a single-file prototype, productionized on purpose.** The tracker shipped for its first stretch as one self-contained HTML file built in a design canvas (preserved in [duitback-mockup](https://github.com/MeepingGale/duitback-mockup)), then was ported to typed React with a tested engine once it proved worth maintaining — the same arc [expense-web](https://github.com/MeepingGale/expense-web) took.
- **`localStorage` + data-URL receipts.** Tax documents never touch a server. Receipt volume is the pressure point; IndexedDB is the upgrade path.
- **Hand-maintained schedule data.** Caps and brackets live as plain data at the top of the file, one override set per YA. Someone has to update them every Budget — that someone is me, once a year.

## Run locally

```bash
npm install && npm run dev     # full site at http://localhost:3000/duitback-web/
npm test                       # the tax-engine suite (Vitest)
```

`npm run build` exports the static site to `out/` — the same thing CI deploys.

## Tests & CI

Vitest concentrates where breakage is expensive — the money math: the YA2025 bracket scale checked against LHDN's cumulative figures, per-YA cap overrides, medical sub-limits, the 10%-of-aggregate donation cap, rebates and zakat, joint-vs-separate assessment, and the demo dataset's exact shipped numbers. Every push runs the suite before the build; a red test blocks the deploy.

## Roadmap

- YA2027 schedule once the Budget is gazetted

## License

**All rights reserved.** The source is public to read, not to use — no permission is granted to copy, modify, or redistribute it in any form.
