import { describe, expect, it } from 'vitest';

import {
  isDataUrl,
  sanitizeBannerItems,
} from '../../../../components/admin/homepage-banner-management/securityUtils';

describe('homepage banner security utils', () => {
  it('preserves image data URLs so local uploads are not corrupted before storage upload', () => {
    const dataUrl = `data:image/jpeg;base64,${'A'.repeat(5000)}`;

    const [item] = sanitizeBannerItems([{ imageUrl: dataUrl }]);

    expect(isDataUrl(dataUrl)).toBe(true);
    expect(item.imageUrl).toBe(dataUrl);
  });

  it('drops non-image URL schemes from banner images', () => {
    expect(sanitizeBannerItems([{ imageUrl: 'javascript:alert(1)' }])).toEqual([]);
    expect(isDataUrl('data:text/html;base64,PGgxPk5vdCBhbiBpbWFnZTwvaDE+')).toBe(false);
    expect(isDataUrl('data:image/svg+xml;base64,PHN2Zy8+')).toBe(false);
  });
});
