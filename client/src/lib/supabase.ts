import { createClient } from '@supabase/supabase-js';

// Environment Variables (Vercel setzt diese automatisch)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yjjauvmjyhlxcoumwqlj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqamF1dm1qeWhseGNvdW13cWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0Mzc4NzgsImV4cCI6MjA3ODAxMzg3OH0.A8e7YwJA6VJ0fTJJt8TBVRT4vktVxB1DFL8U5RLTzZg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
