import { describe, expect, it } from 'vitest';
import { normalizeText } from '../../utils/textEncoding';

const makeMojibake = (value: string): string =>
  new TextDecoder('windows-1252').decode(new TextEncoder().encode(value));

describe('normalizeText', () => {
  it('repairs Windows-1252 mojibake Arabic text', () => {
    expect(normalizeText(makeMojibake('دليل الأطباء'))).toBe('دليل الأطباء');
  });

  it('repairs double-encoded legacy mojibake Arabic text', () => {
    expect(normalizeText(makeMojibake(makeMojibake('أهلا بك يا دكتور')))).toBe('أهلا بك يا دكتور');
  });

  it('keeps valid Arabic text unchanged except trimming', () => {
    expect(normalizeText('  دليل الأطباء  ')).toBe('دليل الأطباء');
  });
});
