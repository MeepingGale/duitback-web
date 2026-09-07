/** A validated MyInvois e-invoice carries a QR whose only payload is its validation link:
 *  https://myinvois.hasil.gov.my/{uuid}/share/{longId} (preprod-myinvois.hasil.gov.my on the sandbox).
 *  The link identifies the document; it never carries the amount, so amounts still come from OCR or the person. */
export interface EInvoiceRef { uuid: string; longId: string; url: string }

const HOST = /^(?:preprod-)?myinvois\.hasil\.gov\.my$/i;
const PATH = /^\/([A-Za-z0-9-]{8,64})\/share\/([A-Za-z0-9-]{8,128})\/?$/;

export function parseMyInvoisUrl(text: string): EInvoiceRef | null {
  let u: URL;
  try { u = new URL(text.trim()); } catch { return null; }
  if (u.protocol !== 'https:' || !HOST.test(u.hostname)) return null;
  const m = u.pathname.match(PATH);
  if (!m) return null;
  return { uuid: m[1], longId: m[2], url: `${u.origin}/${m[1]}/share/${m[2]}` };
}
