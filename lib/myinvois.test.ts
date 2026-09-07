import { describe, expect, it } from 'vitest';
import { parseMyInvoisUrl } from './myinvois';

describe('parseMyInvoisUrl', () => {
  it('reads the document id and long id from a validation link', () => {
    const r = parseMyInvoisUrl('https://myinvois.hasil.gov.my/F9D425P6DS7D8IU/share/7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b');
    expect(r).toEqual({ uuid: 'F9D425P6DS7D8IU', longId: '7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b', url: 'https://myinvois.hasil.gov.my/F9D425P6DS7D8IU/share/7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b' });
  });
  it('accepts the sandbox host, trailing slashes and surrounding whitespace', () => {
    expect(parseMyInvoisUrl('  https://preprod-myinvois.hasil.gov.my/01HR6Z7VV8HWM1AA8XVSHXJ3RS/share/ABCDEFGHIJKLMNOP/ \n')?.uuid).toBe('01HR6Z7VV8HWM1AA8XVSHXJ3RS');
  });
  it('rejects anything that is not an LHDN validation link', () => {
    for (const bad of ['https://example.com/F9D425P6DS7D8IU/share/abcdefghij', 'http://myinvois.hasil.gov.my/F9D425P6DS7D8IU/share/abcdefghij', 'https://myinvois.hasil.gov.my/', 'https://myinvois.hasil.gov.my/F9D425P6DS7D8IU', 'https://myinvois.hasil.gov.my.evil.com/F9D425P6DS7D8IU/share/abcdefghij', 'RM 120.00 thank you', ''])
      expect(parseMyInvoisUrl(bad)).toBeNull();
  });
});
