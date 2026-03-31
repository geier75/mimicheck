import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Onboarding from '../Onboarding.jsx';

describe('OnboardingWizard (TDD)', () => {
  it('Step 1 disables Weiter bis Pflichtfelder gesetzt und zeigt Progress', async () => {
    render(
      <MemoryRouter>
        <Onboarding />
      </MemoryRouter>
    );

    const next = screen.getByTestId('btn-next');
    expect(next).toBeDisabled();

    await userEvent.type(screen.getByTestId('input-vorname'), 'Anna');
    await userEvent.type(screen.getByTestId('input-nachname'), 'Muster');
    await userEvent.type(screen.getByTestId('input-geburtsdatum'), '1990-01-01');

    expect(next).not.toBeDisabled();

    const fields = screen.getByTestId('progress-fields');
    expect(fields.textContent).toMatch(/3 von 3/i);
  });

  it('Navigiert zu Schritt 2, setzt Fokus und erfordert Wohnart', async () => {
    render(
      <MemoryRouter>
        <Onboarding />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByTestId('input-vorname'), 'Anna');
    await userEvent.type(screen.getByTestId('input-nachname'), 'Muster');
    await userEvent.type(screen.getByTestId('input-geburtsdatum'), '1990-01-01');
    await userEvent.click(screen.getByTestId('btn-next'));

    expect(await screen.findByText(/Lebenssituation/i)).toBeInTheDocument();
    const firstField = screen.getByTestId('select-wohnart');
    expect(document.activeElement).toBe(firstField);

    const next = screen.getByTestId('btn-next');
    expect(next).toBeDisabled();
    await userEvent.selectOptions(firstField, 'miete');
    expect(next).not.toBeDisabled();

    const stepText = screen.getByTestId('progress-steps');
    expect(stepText.textContent).toMatch(/Schritt 2 von 3/i);
  });

  it('Schritt 3 benötigt Zustimmung, dann Abschluss möglich', async () => {
    render(
      <MemoryRouter>
        <Onboarding />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByTestId('input-vorname'), 'Anna');
    await userEvent.type(screen.getByTestId('input-nachname'), 'Muster');
    await userEvent.type(screen.getByTestId('input-geburtsdatum'), '1990-01-01');
    await userEvent.click(screen.getByTestId('btn-next'));
    await userEvent.selectOptions(screen.getByTestId('select-wohnart'), 'miete');
    await userEvent.click(screen.getByTestId('btn-next'));

    expect(await screen.findByText(/Zustimmung/i)).toBeInTheDocument();
    const next = screen.getByTestId('btn-next');
    expect(next).toBeDisabled();
    await userEvent.click(screen.getByTestId('checkbox-datenschutz'));
    expect(next).not.toBeDisabled();
  });
});
