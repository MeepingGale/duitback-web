// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { installEnv } from './data';

const UA = {
  iphoneSafari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  iphoneSafari26: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1',
  iphoneChrome: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/125.0.0.0 Mobile/15E148 Safari/604.1',
  ipadSafari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  macSafari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  macChrome: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  instagram: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 320.0.0.0',
  android: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36',
};
const stub = (ua: string, platform = '', touch = 0) => {
  Object.defineProperty(navigator, 'userAgent', { value: ua, configurable: true });
  Object.defineProperty(navigator, 'platform', { value: platform, configurable: true });
  Object.defineProperty(navigator, 'maxTouchPoints', { value: touch, configurable: true });
};
afterEach(() => stub('jsdom', '', 0));

describe('installEnv', () => {
  it('tells iPhone Safari, iPhone Chrome, iPad, Mac Safari, Mac Chrome, in-app browsers and Android apart', () => {
    stub(UA.iphoneSafari, 'iPhone', 5); expect(installEnv()).toMatchObject({ device: 'iphone', browser: 'safari', webkit: true, iosMajor: 17 });
    stub(UA.iphoneSafari26, 'iPhone', 5); expect(installEnv()).toMatchObject({ device: 'iphone', browser: 'safari', webkit: true, iosMajor: 26 });
    stub(UA.iphoneChrome, 'iPhone', 5); expect(installEnv()).toMatchObject({ device: 'iphone', browser: 'chrome', webkit: true });
    stub(UA.ipadSafari, 'MacIntel', 5); expect(installEnv()).toMatchObject({ device: 'ipad', browser: 'safari', webkit: true });
    stub(UA.macSafari, 'MacIntel', 0); expect(installEnv()).toMatchObject({ device: 'mac', browser: 'safari', webkit: true });
    stub(UA.macChrome, 'MacIntel', 0); expect(installEnv()).toMatchObject({ device: 'mac', browser: 'chrome', webkit: false });
    stub(UA.instagram, 'iPhone', 5); expect(installEnv()).toMatchObject({ device: 'iphone', browser: 'inapp', webkit: true });
    stub(UA.android, 'Linux armv8l', 5); expect(installEnv()).toMatchObject({ device: 'other', browser: 'chrome', webkit: false });
  });
});
