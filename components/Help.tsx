'use client';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { CATS, CHILDSUB, SUBLIMITS, capFor, fmt, subCap } from '@/lib/tax';
import { RELIEF_HELP } from '@/lib/reliefHelp';
import { Kick, Modal } from '@/components/tracker/bits';

/** An "i" button that opens its content in the shared Modal — one place for every "what counts"
 *  explanation, on the claims table, in the claim form and on the public reliefs page. */
export function Help({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="help" onClick={(e) => e.stopPropagation()}>
      <button type="button" className="help-btn" aria-label={label} title={label} onClick={() => setOpen(true)}><span aria-hidden="true">i</span></button>
      {open && (
        <Modal onClose={() => setOpen(false)} label={label} width="min(460px, calc(100vw - 32px))" z={40}>
          <div className="help-panel">{children}</div>
          <div style={{ marginTop: 14 }}><button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Close · Tutup</button></div>
        </Modal>
      )}
    </span>
  );
}

/** What one relief category covers this year: cap, sub-limits, can, cannot, proof. */
export function CatHelp({ id, ya }: { id: string; ya: number }) {
  const cat = CATS.find((c) => c.id === id);
  const h = RELIEF_HELP[id];
  if (!cat || !h) return null;
  const cap = cat.cap === null ? null : capFor(id, ya);
  const subs = SUBLIMITS[id];
  const capLine = id === 'donation' ? '10% of aggregate income (gifts to government unlimited)'
    : id === 'child' ? 'per child, no overall ceiling'
    : cap === 0 ? 'not available in YA' + ya
    : fmt(cap ?? 0) + ' for YA' + ya;
  return (
    <Help label={'What counts · ' + cat.en}>
      <div className="help-title">{cat.en} <span lang="ms">· {cat.bm}</span></div>
      <div className="help-cap">Cap · Had: {capLine}</div>
      {subs && (
        <>
          <Kick>Sub-limits · Had kecil</Kick>
          <ul className="subs">{subs.map((s) => { const sc = subCap(id, s.id, ya); return <li key={s.id}>{s.label}: <strong>{sc === null ? 'up to the cap' : fmt(sc)}</strong></li>; })}</ul>
        </>
      )}
      {id === 'child' && <ul className="subs">{CHILDSUB.map((s) => <li key={s.id}>{s.label}</li>)}</ul>}
      <div className="help-who">For · Untuk: {h.who}</div>
      <Kick>Can claim · Boleh tuntut</Kick>
      <ul className="can">{h.can.map((t, i) => <li key={i}>{t}</li>)}</ul>
      <Kick>Cannot · Tidak boleh</Kick>
      <ul className="cant">{h.cant.map((t, i) => <li key={i}>{t}</li>)}</ul>
      <p className="proof"><strong>Proof · Bukti:</strong> {h.proof}</p>
      <p lang="ms">{h.bm}</p>
    </Help>
  );
}
