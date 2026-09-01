import { CalcResult, fmt, today, uid } from '@/lib/tax';
import { maskBank } from '@/lib/banks';
import { Api } from './App';
import { Kick, YaTabs, pagepad, yaHead, right, heading800 } from './bits';
import { deadlineInfo, yearsOf } from './derive';

export function StatusScreen({ api, c, demo }: { api: Api; c: CalcResult; demo: boolean }) {
  const { d, ya, mut, go, ask } = api;
  const years = yearsOf(d);
  const yaNum = +ya.slice(2);
  const dl = deadlineInfo(d, ya, c);
  const sd = d.status[ya] || { stage: 'tracking' as const };
  const stageIdx = { tracking: 0, submitted: 1, processing: 2, refund: 3 }[sd.stage];
  const nClaims = c.claims.length;

  const steps = [
    { title: 'Draft prepared', bm: 'Draf', date: sd.drafted || 'now · live totals', desc: c.formType + ' form pre-filled from your claims and income records. · Borang diisi awal daripada rekod anda.' },
    { title: 'Submitted', bm: 'Dihantar', date: sd.submitted || dl.filingWindow, desc: sd.ack ? 'Via e-Filing. Acknowledgement no. ' + sd.ack : sd.submitted ? 'Recorded — submitted via MyTax e-Filing. · Direkodkan sebagai dihantar.' : 'Submit through MyTax e-Filing, then record it here. · Hantar melalui MyTax, kemudian rekodkan di sini.' },
    { title: 'Processing', bm: 'Diproses', date: sd.processing || '—', desc: 'Assessment under review by LHDN. Queries would appear in MyTax. · Sedang disemak oleh LHDN.' },
    { title: 'Refund credited', bm: 'Dikreditkan', date: sd.refunded || '—', desc: c.balance < 0 ? fmt(-c.balance) + ' to ' + (maskBank(d.profile.bank) || 'your bank') + '.' : 'Applies when PCB paid exceeds final tax. · Bila PCB dibayar melebihi cukai akhir.' },
  ];

  const docsYa = d.docs.filter((x) => x.ya === ya);

  return (
    <div className="pagepad" data-screen-label="Status" style={pagepad(1200)}>
      <div style={yaHead}>
        <h2 style={{ margin: 0 }}>Filing status <span className="bm" style={{ fontSize: 15 }}>· Status pemfailan</span></h2>
        <YaTabs tabs={years.map((y) => ({ label: y, on: y === ya, pick: () => mut((x) => { x.ya = y; }) }))} />
      </div>
      <p className="text-muted" style={{ fontSize: 12.5, margin: '8px 0 0' }}>{dl.formLine}</p>
      <hr className="hr" style={{ margin: '16px 0 24px' }} />

      <div className="fsteps">
        {steps.map((s, i) => (
          <div key={s.title} className={'fstep' + (i === stageIdx ? ' on' : '')} style={{ ['--step-c' as string]: i <= stageIdx ? (i === stageIdx ? 'var(--color-accent-700)' : 'var(--color-accent)') : 'var(--color-neutral-300)' } as React.CSSProperties}>
            <div style={{ fontSize: 11 }} className="text-muted mono">{s.date}</div>
            <div style={{ ...heading800, marginTop: 2, color: i === stageIdx ? 'var(--color-accent-700)' : 'var(--color-text)' }}>
              {s.title} <span className="bm" style={{ fontWeight: 400 }}>· {s.bm}</span>
            </div>
            <div style={{ fontSize: 12, marginTop: 4 }} className="text-muted">{s.desc}</div>
          </div>
        ))}
      </div>

      <div className="btnrow" style={{ marginTop: 20 }}>
        {sd.stage === 'tracking' && (
          <button className="btn btn-primary" onClick={() => mut((x) => {
            const t = today();
            x.status[ya] = { stage: 'processing', drafted: t, submitted: t, processing: t };
            if (x.demo) x.status[ya].ack = 'EF-' + (yaNum + 1) + '-' + Math.floor(1000000 + Math.random() * 9000000);
          })}>
            {demo ? 'Simulate e-Filing submission · Hantar' : 'Mark as submitted in MyTax · Sudah dihantar'}
          </button>
        )}
        {(sd.stage === 'submitted' || sd.stage === 'processing') && (
          <button className="btn btn-primary" onClick={() => mut((x) => { x.status[ya] = { ...x.status[ya], stage: 'refund', refunded: today() }; })}>
            {demo ? 'Simulate refund credited · Kreditkan' : 'Mark refund received · Kredit diterima'}
          </button>
        )}
        {sd.stage !== 'tracking' && (
          <button className="btn btn-secondary" onClick={() => mut((x) => { x.status[ya] = { stage: 'tracking' }; })}>Reset to tracking</button>
        )}
        <button className="btn btn-ghost" onClick={() => go('pack')}>Open filing pack →</button>
      </div>

      {sd.stage === 'refund' && c.balance < 0 && (
        <div style={{ fontSize: 12.5, marginTop: 12 }}>
          <span className="text-muted">Got your refund? </span>
          <a href="https://ko-fi.com/duitback" target="_blank" rel="noopener noreferrer">Tip the app 0.1% lah →</a>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 2, background: 'var(--color-divider)', border: '2px solid var(--color-divider)', marginTop: 24 }}>
        <div style={{ background: 'var(--color-surface)', padding: 16 }}>
          <Kick style={{ color: 'var(--color-neutral-700)' }}>{c.balance < 0 ? 'Est. refund · Bayaran balik' : 'Est. balance payable · Baki'}</Kick>
          <div style={{ ...heading800, fontSize: 28, marginTop: 4 }} className="mono">{c.totalIncome ? fmt(Math.abs(c.balance)) : '—'}</div>
          <div style={{ fontSize: 12 }} className="text-muted">paid {fmt(c.paid)} (PCB + CP500) vs net tax {fmt(c.taxNet)}</div>
        </div>
        <div style={{ background: 'var(--color-surface)', padding: 16 }}>
          <Kick style={{ color: 'var(--color-neutral-700)' }}>Reliefs claimed</Kick>
          <div style={{ ...heading800, fontSize: 28, marginTop: 4 }} className="mono">{fmt(Math.max(0, c.totalAllowed - 9000))}</div>
          <div style={{ fontSize: 12 }} className="text-muted">{nClaims} claim lines across {Object.keys(c.sums).length} categories</div>
        </div>
        <div style={{ background: 'var(--color-surface)', padding: 16 }}>
          <Kick style={{ color: 'var(--color-neutral-700)' }}>Documents · Dokumen</Kick>
          <div style={{ ...heading800, fontSize: 28, marginTop: 4 }} className="mono">{docsYa.length}</div>
          <div style={{ fontSize: 12 }} className="text-muted">{docsYa.length ? docsYa.map((x) => x.kind).slice(0, 4).join(', ') : 'none yet — upload below'}</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 26 }}>
        <h6 style={{ margin: 0 }}>Documents · Dokumen ({ya})</h6>
        <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
          Upload document
          <input type="file" multiple style={{ display: 'none' }} onChange={(e) => {
            Array.from(e.target.files || []).forEach((f) => mut((dd) => { dd.docs.unshift({ id: uid(), ya: dd.ya, name: f.name, kind: 'Uploaded document', date: today() }); }));
            e.target.value = '';
          }} />
        </label>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="table" style={{ marginTop: 8 }}>
          <thead className="vh">
            <tr><th>Document</th><th>Kind</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {docsYa.map((x) => (
              <tr key={x.id}>
                <td style={{ width: '44%' }}><span style={{ ...heading800, fontSize: 13 }}>{x.name}</span></td>
                <td className="text-muted" style={{ fontSize: 12 }}>{x.kind}</td>
                <td className="mono text-muted" style={{ fontSize: 12 }}>{x.date}</td>
                <td style={right}><button className="navlink linkbtn" onClick={() => ask('Remove this document? · Buang dokumen ini?', () => mut((dd) => { dd.docs = dd.docs.filter((q) => q.id !== x.id); }))} style={{ fontSize: 11 }}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {docsYa.length === 0 && (
        <div style={{ border: '2px dashed var(--color-divider)', padding: 16, fontSize: 12.5, marginTop: 8 }} className="text-muted">
          No documents for {ya} yet — upload your EA form, premium statements or acknowledgements.
        </div>
      )}
    </div>
  );
}
