import { useState } from 'react';
import { CATS, CalcResult, calc, fmt } from '@/lib/tax';
import { dismissFamilyHint, dismissInstallHint, exportVault, familyHintDismissed, familySetUp, getBackupMeta, installHintDismissed, isDemo, isIOS, isStandalone } from '@/lib/data';
import { Api } from './App';
import { Bar, Kick, YaTabs, pagepad, yaHead, right, heading800 } from './bits';
import { STATUS_TAG, deadlineInfo, reliefRows, yearsOf } from './derive';
import { blankInc } from '@/lib/tax';

export function Dashboard({ api, c }: { api: Api; c: CalcResult }) {
  const [hintGone, setHintGone] = useState(installHintDismissed);
  const [familyHintGone, setFamilyHintGone] = useState(familyHintDismissed);
  const { d, ya, mut, go, openAdd } = api;
  const years = yearsOf(d);
  const dl = deadlineInfo(d, ya, c);
  const rows = reliefRows(c, ya);
  const topRows = rows.filter((r) => r.claimed > 0 && r.id !== 'individual').sort((a, b) => b.pct - a.pct).slice(0, 4);
  const nClaims = c.claims.length;
  const nRec = d.receipts.filter((r) => r.ya === ya).length;
  const claimedByYou = Math.max(0, c.totalAllowed - 9000);
  const capClaimable = CATS.reduce((a, ct) => a + (ct.cap || 0), 0) + c.donCap - 9000;
  const usedPct = capClaimable ? Math.min(100, Math.round((claimedByYou / capClaimable) * 100)) : 0;

  // years can be added only up to the current calendar year — a YA can't
  // exist before anyone has lived it
  const nextYaNum = Math.max(...years.map((y) => +y.slice(2))) + 1;
  const canAddYear = nextYaNum <= new Date().getFullYear();
  const addYear = () =>
    mut((x) => {
      const next = 'YA' + nextYaNum;
      if (nextYaNum <= new Date().getFullYear() && !x.income[next]) {
        x.income[next] = blankInc();
        x.status[next] = { stage: 'tracking' };
        x.ya = next;
      }
    });

  return (
    <div className="pagepad" data-screen-label="Dashboard" style={pagepad(1200)}>
      <div style={yaHead}>
        <div>
          <Kick>Year of assessment · Tahun taksiran</Kick>
          <h1 style={{ margin: '6px 0 2px', fontSize: 34 }}>Hello, {d.profile.name || 'there'}</h1>
          <p className="text-muted" style={{ fontSize: 13, margin: 0 }}>{dl.dline}</p>
        </div>
        <YaTabs tabs={years.map((y) => ({ label: y, on: y === ya, pick: () => mut((x) => { x.ya = y; }) }))} onAddYear={canAddYear ? addYear : undefined} />
      </div>

      <div data-tour="poster" style={{ background: 'var(--color-accent-700)', color: 'var(--color-bg)', padding: '26px 28px', marginTop: 20 }}>
        <div style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', ...heading800 }}>
          {ya} · reliefs you&apos;ve claimed · pelepasan dituntut
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, flexWrap: 'wrap' }}>
          <div className="mono postnum" style={{ ...heading800, fontSize: 64, letterSpacing: '-.02em', lineHeight: 1.05 }}>{fmt(claimedByYou)}</div>
          <div style={{ fontSize: 13, maxWidth: 340, opacity: 0.92 }}>
            {nClaims} claim lines · {nRec} receipts in the vault. Est. {c.balance < 0 ? 'refund ' + fmt(-c.balance) : 'balance payable ' + fmt(c.balance)}.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 2, marginTop: 16, height: 10 }}>
          <div style={{ background: 'var(--color-bg)', width: usedPct + '%' }} />
          <div style={{ background: 'color-mix(in srgb, var(--color-bg) 25%, transparent)', flex: 1 }} />
        </div>
        <div style={{ fontSize: 11, marginTop: 6, opacity: 0.88 }}>
          {usedPct}% of {fmt(capClaimable)} claimable caps used · RM 9,000 automatic individual relief applies on top
        </div>
      </div>

      {nClaims > 0 ? (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 28 }}>
            <Kick>Top claims · Tuntutan utama</Kick>
            <button className="navlink linkbtn" onClick={() => go('claims')} style={{ fontSize: 12 }}>All reliefs →</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ marginTop: 8 }}>
              <thead className="vh">
                <tr><th>Relief</th><th>Utilisation</th><th>Claimed against cap</th><th>Status</th></tr>
              </thead>
              <tbody>
                {topRows.map((r) => (
                  <tr key={r.id}>
                    <td style={{ minWidth: 220 }}>{r.en} <span className="bm">· {r.bm}</span></td>
                    <td style={{ width: '30%', minWidth: 160 }}><Bar pct={r.pct} over={r.over} /></td>
                    <td style={{ ...right, whiteSpace: 'nowrap' }} className="mono">{r.claimedL} / {r.capL}</td>
                    <td style={right}><span className={'tag ' + r.tagCls}>{r.tagLabel}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div style={{ border: '2px dashed var(--color-divider)', padding: 36, marginTop: 28, maxWidth: 560 }}>
          <div style={{ ...heading800, fontSize: 20 }}>No claims yet for {ya} · Tiada tuntutan lagi</div>
          <p className="text-muted" style={{ fontSize: 13, margin: '8px 0 16px' }}>
            Add your first relief claim or drop a receipt into the vault — totals, caps and the refund estimate update live.{' '}
            <span lang="ms">Tambah tuntutan pertama anda — semua dikemas kini serta-merta.</span>
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => openAdd()}>Add a claim · Tambah tuntutan</button>
            <button className="btn btn-secondary" onClick={() => go('receipts')}>Upload receipts</button>
          </div>
        </div>
      )}

      {!isDemo(d) && !familySetUp(d) && !familyHintGone && (
        <div className="no-print" style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap', border: '2px solid var(--color-accent-700)', padding: '10px 14px', marginTop: 20, fontSize: 12.5 }}>
          <span>
            <strong>Tell DuitBack who you are</strong> — married, children, OKU — and the fixed reliefs are counted automatically every year, no receipts.{' '}
            <span lang="ms">Tetapkan status keluarga supaya pelepasan tetap dikira automatik.</span>
          </span>
          <button className="navlink linkbtn" style={{ fontSize: 12.5, fontWeight: 800 }} onClick={() => { api.go('settings'); requestAnimationFrame(() => requestAnimationFrame(() => document.querySelector('[data-tour="family"]')?.scrollIntoView({ block: 'start' }))); }}>Set up in Settings →</button>
          <button className="navlink linkbtn" style={{ fontSize: 12.5 }} onClick={() => { dismissFamilyHint(); setFamilyHintGone(true); }}>Not now · Nanti</button>
        </div>
      )}

      {!isDemo(d) && isIOS() && !isStandalone() && !hintGone && (
        <div className="no-print" style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap', border: '2px solid var(--color-accent-700)', padding: '10px 14px', marginTop: 20, fontSize: 12.5 }}>
          <span>
            <strong>On iPhone, Safari can clear this app&apos;s data after 7 days unused.</strong> Install it to your Home Screen to keep it safe.{' '}
            <span lang="ms">Pasang ke Skrin Utama supaya data anda kekal.</span>
          </span>
          <button className="navlink linkbtn" style={{ fontSize: 12.5, fontWeight: 800 }} onClick={api.showInstallGuide}>Show me how →</button>
          <button className="navlink linkbtn" style={{ fontSize: 12.5 }} onClick={() => { dismissInstallHint(); setHintGone(true); }}>Got it · Faham</button>
        </div>
      )}

      {(() => {
        const meta = getBackupMeta();
        if (isDemo(d) || meta.changesSince < 20) return null;
        return (
          <div className="no-print" style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap', border: '1px solid var(--color-divider)', padding: '10px 14px', marginTop: 20, fontSize: 12.5 }}>
            <span className="text-muted">
              {meta.changesSince} changes since your last backup{meta.lastExport ? ' (' + meta.lastExport + ')' : ' — you have never exported'}.{' '}
              <span lang="ms">Banyak perubahan sejak sandaran terakhir.</span>
            </span>
            <button className="navlink linkbtn" style={{ fontSize: 12.5, fontWeight: 800 }} onClick={() => { exportVault(d).then(() => api.setDataMsg('Vault exported. · Peti dieksport.')); }}>Export vault now →</button>
          </div>
        );
      })()}

      <hr className="hr" style={{ margin: '28px 0 20px' }} />
      <Kick style={{ marginBottom: 10 }}>Your returns · Penyata anda</Kick>
      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>YA</th><th>Form</th><th>Status</th>
              <th style={right}>Reliefs claimed</th><th style={right}>Est. tax</th><th style={right}>Refund / balance</th><th><span className="vh">Open</span></th>
            </tr>
          </thead>
          <tbody>
            {years.map((y) => {
              const cy = calc(d, y);
              const s2 = (d.status[y] || {}).stage || 'tracking';
              const [label, tagCls] = STATUS_TAG[s2];
              return (
                <tr key={y}>
                  <td style={heading800}>{y}</td>
                  <td className="text-muted">{cy.formType}</td>
                  <td><span className={'tag ' + tagCls}>{label}</span></td>
                  <td style={right} className="mono">{fmt(Math.max(0, cy.totalAllowed - 9000))}</td>
                  <td style={right} className="mono">{cy.totalIncome ? fmt(cy.taxNet) : '—'}</td>
                  <td style={{ ...right, fontWeight: 700 }} className={'mono ' + (cy.balance < 0 ? 'amt-refund' : 'amt-due')}>{cy.totalIncome ? (cy.balance < 0 ? fmt(-cy.balance) + ' refund' : fmt(cy.balance) + ' due') : '—'}</td>
                  <td style={right}>
                    <button className="navlink linkbtn" onClick={() => { mut((x) => { x.ya = y; }); go('claims'); }} style={heading800}>Open →</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
