import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { NotificationProvider } from '../NotificationContext.jsx';
import NotificationBell from '../NotificationBell.jsx';
import { EVENTS } from '../events.js';

test('zeigt Badge bei upload.process.completed', async () => {
  render(
    <NotificationProvider>
      <NotificationBell />
    </NotificationProvider>
  );

  const evt = new CustomEvent('telemetry', { detail: { type: EVENTS.UPLOAD_DONE, payload: { file: 'x.pdf' } }});
  await act(async () => {
    window.dispatchEvent(evt);
  });

  expect(await screen.findByTestId('notif-badge')).toBeInTheDocument();
});
