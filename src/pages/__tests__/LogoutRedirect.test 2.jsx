import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

let signOutMock;
let logoutMock;

vi.mock('@/api/supabaseClient', () => {
  signOutMock = vi.fn(async () => {});
  return { supabase: { auth: { signOut: signOutMock } } };
});

vi.mock('@/api/entities', () => {
  logoutMock = vi.fn(async (_dest) => {});
  return {
    User: {
      me: vi.fn(async () => ({ full_name: 'Test User', email: 't@example.com', profile_completeness: 100 })),
      logout: logoutMock,
    },
  };
});

beforeEach(() => {
  window.localStorage.clear();
  window.history.pushState({}, '', '/Dashboard');
});

describe('Logout flow', () => {
  it('signs out and requests redirect to / landing page', async () => {
    const { default: Pages } = await import('../index.jsx');
    render(<Pages />);

    // Open user dropdown
    const nameEl = await screen.findByText('Test User');
    const triggerBtn = nameEl.closest('button');
    expect(triggerBtn).toBeTruthy();
    triggerBtn && triggerBtn.click();

    // Click "Abmelden"
    const logoutItem = await screen.findByText(/Abmelden/i);
    logoutItem.click();

    await waitFor(() => {
      expect(signOutMock).toHaveBeenCalledTimes(1);
      expect(logoutMock).toHaveBeenCalledWith('/');
    });
  });
});
