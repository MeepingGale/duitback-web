import { CATS, CalcResult, capFor, fmt } from '@/lib/tax';
import { Api } from './App';
import { Bar, Kick, YaTabs, pagepad, yaHead, right, heading800 } from './bits';
import { reliefRows, yearsOf } from './derive';

export function Claims({ api, c, selCat, setSelCat }: { api: Api; c: CalcResult; selCat: string; setSelCat: (s: string) => void }) {
  const { d, ya, mut, openAdd, openEdit } = api;
  const years = yearsOf(d);
  const yaNum = +ya.slice(2);
  const rows = reliefRows(c, ya);
  const selCt = CATS.find((x) => x.id === selCat) || CATS[0];
  const selCap = selCt.id === 'donation' ? c.donCap : capFor(selCt.id, yaNum);
  const selCatNote =
    (selCt.id === 'donation'
      ? 'Cap for you now: ' + fmt(c.donCap) + ' (10% of aggregate income). '
      : selCap === Infinity
        ? ''
        : selCap === 0
          ? 'Not available for ' + ya + '. '
          : 'Cap for ' + ya + ': ' + fmt(selCap) + '. ') + (selCt.note || '');
  const selClaims = c.claims.filter((x) => x.cat === selCat).sort((a, b) => (b.date < a.date ? -1 : 1));

  return (
    <div className="pagepad" data-screen-label="Claims" style={pagepad(1360)}>
      <div style={yaHead}>
        <div>
          <Kick>{ya} · Reliefs &amp; deductions · Pelepasan</Kick>
          <h2 style={{ margin: '6px 0 2px' }}>Claims against caps</h2>
          <p className="text-muted" style={{ fontSize: 12.5, margin: 0 }}>
            Caps follow the {ya} LHDN schedule · click a row to see its claim lines. Medical sub-limits are enforced; child relief has no overall cap (fixed amount per child).
          </p>
        </div>
        <YaTabs tabs={years.map((y) => ({ label: y, on: y === ya, pick: () => mut((x) => { x.ya = y; }) }))} />
      </div>

      <div className="claimsgrid" data-tour="caps-table" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: 0, marginTop: 18, border: '2px solid var(--color-divider)' }}>
        <div style={{ overflowX: 'auto', borderRight: '2px solid var(--color-divider)' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '32%' }}>Relief · Pelepasan</th>
                <th style={right}>Cap · Had</th>
                <th style={right}>Claimed</th>
                <th style={right}>Left · Baki</th>
                <th style={{ width: '16%' }}>Utilisation</th>
                <th style={right}>Lines</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={'rrow' + (selCat === r.id ? ' sel' : '')} onClick={() => setSelCat(r.id)}>
                  <td>{r.en} <span className="bm">· {r.bm}</span></td>
                  <td style={{ ...right, whiteSpace: 'nowrap' }} className="mono">{r.capL}</td>
                  <td style={right} className="mono">{r.claimedL}</td>
                  <td style={right} className="mono">{r.leftL}</td>
                  <td style={{ minWidth: 110 }}><Bar pct={r.pct} over={r.over} /></td>
                  <td style={right} className="mono">{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '14px 12px' }}>
            <span style={{ fontSize: 13 }} className="text-muted">Total allowed (caps applied) · Jumlah dibenarkan</span>
            <span style={{ ...heading800, fontSize: 22 }} className="mono">{fmt(c.totalAllowed)}</span>
          </div>
        </div>
        <div style={{ padding: 20, background: 'var(--color-surface)' }}>
          <Kick>{selCt.en + ' · ' + selCt.bm}</Kick>
          <div style={{ fontSize: 12, margin: '4px 0 10px' }} className="text-muted">{selCatNote}</div>
          {selClaims.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selClaims.map((x) => (
                <div key={x.id} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-divider)', padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <span style={{ fontSize: 13, ...heading800 }}>{x.desc || '(no description)'}</span>
                    <span className="mono" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{fmt(x.amount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <span style={{ fontSize: 11 }} className="text-muted mono">
                      {x.date}
                      {x.sub && x.sub !== 'general' ? ' · ' + x.sub : ''}
                    </span>
                    <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {x.receipt && <span className="tag tag-neutral" style={{ fontSize: 10 }}>{x.receipt}</span>}
                      <button className="navlink linkbtn" onClick={() => openEdit(x)} style={{ fontSize: 11 }}>Edit · Sunting</button>
                      <button className="navlink linkbtn" onClick={() => { if (window.confirm('Delete this claim? · Padam tuntutan ini?')) mut((dd) => { dd.claims = dd.claims.filter((q) => q.id !== x.id); }); }} style={{ fontSize: 11 }}>Delete</button>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ border: '2px dashed var(--color-divider)', padding: 18, fontSize: 12.5 }} className="text-muted">
              No claim lines yet · Tiada baris tuntutan. Add one below.
            </div>
          )}
          <button className="btn btn-primary btn-block" style={{ marginTop: 14 }} onClick={() => openAdd(selCat)}>
            Add claim here · Tambah
          </button>
        </div>
      </div>
    </div>
  );
}
