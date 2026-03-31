/**
 * Supabase Mock für Tests
 */
import { vi } from 'vitest';

export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
  },
};

export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  user: mockUser,
};

export const mockSupabaseClient = {
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
    getSession: vi.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    setSession: vi.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  }),
  storage: {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.url' } }),
    }),
  },
};

// Mock für vi.mock('@/api/supabaseClient')
export const supabase = mockSupabaseClient;

export default mockSupabaseClient;
