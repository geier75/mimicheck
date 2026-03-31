import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n, { resources } from '../../i18n';
import Abrechnungen from '../Abrechnungen.jsx';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

vi.mock('@/api/entities', () => ({
  Abrechnung: {
    list: vi.fn(async () => []),
    delete: vi.fn(async () => ({})),
  },
}));

test('zeigt Titel in DE und EN korrekt', async () => {
  const ui = (lng) => (
    <MemoryRouter>
      <I18nextProvider i18n={i18n.cloneInstance({ lng, resources })}>
        <Abrechnungen />
      </I18nextProvider>
    </MemoryRouter>
  );

  const { unmount } = render(ui('de'));
  expect(await screen.findByRole('heading', { name: /Abrechnungen/i })).toBeInTheDocument();
  unmount();

  render(ui('en'));
  expect(await screen.findByRole('heading', { name: /Statements/i })).toBeInTheDocument();
});
