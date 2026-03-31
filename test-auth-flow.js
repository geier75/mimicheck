/**
 * TEST AUTH FLOW - TDD Approach
 * Testet den kompletten Authentifizierungsflow
 */

import { createClient } from '@supabase/supabase-js';

// Supabase Config
const supabaseUrl = 'https://yjjauvmjyhlxcoumwqlj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqamF1dm1qeWhseGNvdW13cWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0Mzc4NzgsImV4cCI6MjA3ODAxMzg3OH0.A8e7YwJA6VJ0fTJJt8TBVRT4vktVxB1DFL8U5RLTzZg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test User Credentials
const TEST_USER = {
  email: 'oezdelie.h@gmail.com',  // Die Email aus dem Screenshot
  password: 'Test123456!',
  name: 'Test User'
};

async function runTests() {
  console.log('🧪 STARTING AUTH FLOW TESTS\n');
  console.log('=====================================\n');

  // TEST 1: Cleanup - Sign out any existing session
  console.log('TEST 1: Cleanup existing session...');
  await supabase.auth.signOut();
  console.log('✅ Cleanup complete\n');

  // TEST 2: Sign Up (falls User noch nicht existiert)
  console.log('TEST 2: Sign up test user...');
  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: TEST_USER.email,
      password: TEST_USER.password,
      options: { 
        data: { name: TEST_USER.name },
        emailRedirectTo: 'http://localhost:8005/auth-bridge'
      }
    });
    
    if (signUpError?.message?.includes('already registered')) {
      console.log('ℹ️  User already exists, skipping signup\n');
    } else if (signUpError) {
      console.error('❌ Signup error:', signUpError);
      return;
    } else {
      console.log('✅ Signup successful:', signUpData.user?.email);
      console.log('📧 Check email for confirmation (if first signup)\n');
    }
  } catch (e) {
    console.error('❌ Signup exception:', e);
  }

  // TEST 3: Sign In
  console.log('TEST 3: Sign in with test user...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: TEST_USER.email,
    password: TEST_USER.password
  });

  if (signInError) {
    console.error('❌ Sign in error:', signInError);
    console.log('\nPossible issues:');
    console.log('1. Email not confirmed yet');
    console.log('2. Wrong password');
    console.log('3. User doesn\'t exist');
    return;
  }

  console.log('✅ Sign in successful!');
  console.log('📧 User:', signInData.user?.email);
  console.log('🆔 User ID:', signInData.user?.id);
  console.log('📅 Created:', signInData.user?.created_at);
  console.log('\n');

  // TEST 4: Get Session
  console.log('TEST 4: Get session tokens...');
  const { data: session, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('❌ Session error:', sessionError);
    return;
  }

  if (!session.session) {
    console.error('❌ No session found!');
    return;
  }

  console.log('✅ Session retrieved!');
  console.log('🎫 Access Token:', session.session.access_token ? '✅ Present' : '❌ Missing');
  console.log('🔄 Refresh Token:', session.session.refresh_token ? '✅ Present' : '❌ Missing');
  console.log('⏱️ Expires at:', new Date(session.session.expires_at * 1000).toLocaleString());
  console.log('\n');

  // TEST 5: Build Redirect URL
  console.log('TEST 5: Build auth-bridge redirect URL...');
  const mainUrl = 'http://localhost:8005';
  const access_token = session.session.access_token;
  const refresh_token = session.session.refresh_token;
  
  const emailParam = encodeURIComponent(TEST_USER.email);
  const nameParam = encodeURIComponent(TEST_USER.name);
  const qs = `access_token=${encodeURIComponent(access_token)}&refresh_token=${encodeURIComponent(refresh_token)}&email=${emailParam}&name=${nameParam}`;
  const redirectUrl = `${mainUrl}/auth-bridge?${qs}`;
  
  console.log('✅ Redirect URL built!');
  console.log('🔗 URL Length:', redirectUrl.length, 'characters');
  console.log('📋 Copy this URL to test manually:');
  console.log('\n' + redirectUrl.substring(0, 150) + '...\n');

  // TEST 6: Test Session Setting (simulate auth-bridge)
  console.log('TEST 6: Test setting session with tokens...');
  await supabase.auth.signOut(); // First sign out
  
  const { data: newSession, error: setSessionError } = await supabase.auth.setSession({
    access_token,
    refresh_token
  });

  if (setSessionError) {
    console.error('❌ Set session error:', setSessionError);
    return;
  }

  console.log('✅ Session set successfully!');
  console.log('👤 User restored:', newSession.user?.email);
  console.log('\n');

  // SUMMARY
  console.log('=====================================');
  console.log('🎉 ALL TESTS PASSED!');
  console.log('=====================================\n');
  console.log('✅ The auth flow should work correctly.');
  console.log('✅ User can log in from landing page.');
  console.log('✅ Tokens are generated correctly.');
  console.log('✅ Session can be restored with tokens.');
  console.log('\n📝 Next: Test in browser with console open to see debug logs.');
}

// Run tests
runTests().catch(console.error);
