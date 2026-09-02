// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { emptyData, exportJson, exportVault, getBackupMeta } from './data';

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const setUA = (ua: string) => Object.defineProperty(window.navigator, 'userAgent', { value: ua, configurable: true });
type Sharing = { share?: unknown; canShare?: unknown };

describe('handing exports to the person', () => {
  const origUA = Object.getOwnPropertyDescriptor(window.navigator, 'userAgent');
  afterEach(() => {
    if (origUA) Object.defineProperty(window.navigator, 'userAgent', origUA);
    delete (navigator as Sharing).share;
    delete (navigator as Sharing).canShare;
    localStorage.clear();
  });

  it('on iPhone it opens the share sheet with the file, and that counts as a backup', async () => {
    setUA(IPHONE);
    const share = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share, canShare: () => true });
    expect(await exportJson(emptyData())).toBe(true);
    expect(share).toHaveBeenCalledTimes(1);
    const file = (share.mock.calls[0][0] as { files: File[] }).files[0];
    expect(file.name).toBe('duitback-data.json');
    expect(file.type).toBe('application/json');
    expect(getBackupMeta().lastExport).toBeTruthy();
  });

  it('a dismissed share sheet is not a backup', async () => {
    setUA(IPHONE);
    Object.assign(navigator, { share: vi.fn().mockRejectedValue(Object.assign(new Error('cancelled'), { name: 'AbortError' })), canShare: () => true });
    expect(await exportVault(emptyData())).toBeNull();
    expect(getBackupMeta().lastExport).toBeNull();
  });

  it('elsewhere it downloads through a link', async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    Object.assign(URL, { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} });
    expect(await exportJson(emptyData())).toBe(true);
    expect(click).toHaveBeenCalledTimes(1);
    expect(getBackupMeta().lastExport).toBeTruthy();
    click.mockRestore();
  });
});
