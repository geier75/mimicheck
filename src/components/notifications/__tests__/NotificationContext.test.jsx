import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { NotificationProvider, useNotifications } from '../NotificationContext.jsx';

function UnreadCounter() {
  const { unreadCount } = useNotifications();
  return <div data-testid="unread">{unreadCount}</div>;
}

describe('NotificationContext', () => {
  it('adds a notification when telemetry upload.process.completed is dispatched', async () => {
    render(
      <NotificationProvider>
        <UnreadCounter />
      </NotificationProvider>
    );

    const payload = {
      event: 'upload.process.completed',
      area: 'Upload',
      meta: { totalSavings: 123 },
    };
    await act(async () => {
      window.dispatchEvent(new CustomEvent('telemetry', { detail: payload }));
    });

    await waitFor(() => {
      expect(screen.getByTestId('unread').textContent).toBe('1');
    });
  });
});
