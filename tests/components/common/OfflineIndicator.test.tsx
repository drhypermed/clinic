import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OfflineIndicator } from '../../../components/common/OfflineIndicator';
import type { SyncState } from '../../../hooks/useOnlineStatus';

const onlineStatusMock = vi.hoisted(() => ({
  state: 'online' as SyncState,
}));

vi.mock('../../../hooks/useOnlineStatus', () => ({
  useOnlineStatus: () => onlineStatusMock.state,
}));

describe('OfflineIndicator', () => {
  it('shows a stable red offline banner', async () => {
    onlineStatusMock.state = 'offline';

    const { rerender } = render(<OfflineIndicator />);

    const banner = await screen.findByRole('status');
    expect(screen.getByText(/غير متصل بالإنترنت/)).toBeInTheDocument();
    expect(banner).toHaveClass('bg-danger-700');
    expect(banner.className).not.toContain('animate-');

    rerender(<OfflineIndicator />);

    await waitFor(() => {
      expect(screen.getByRole('status')).toBe(banner);
    });
  });
});
