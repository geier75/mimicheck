// Script zum Erstellen eines Test-Users in Supabase
// Führe aus mit: node CREATE-TEST-USER.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yjjauvmjyhlxcoumwqlj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqamF1dm1qeWhseGNvdW13cWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0Mzc4NzgsImV4cCI6MjA3ODAxMzg3OH0.A8e7YwJA6VJ0fTJJt8TBVRT4vktVxB1DFL8U5RLTzZg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestUser() {
  console.log('🔧 Erstelle Test-User...\n');
  
  const testEmail = 'test@example.com';
  const testPassword = 'Test123456!';
  
  console.log('📧 Email:', testEmail);
  console.log('🔑 Passwort:', testPassword);
  console.log('');
  
  try {
    // Versuche zuerst zu registrieren
    console.log('1️⃣ Versuche Registrierung...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: 'Test User'
        }
      }
    });
    
    if (signUpError) {
      // User existiert bereits oder anderer Fehler
      if (signUpError.message.includes('already registered')) {
        console.log('✅ User existiert bereits!');
        console.log('');
        
        // Versuche Login
        console.log('2️⃣ Versuche Login...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword
        });
        
        if (signInError) {
          console.error('❌ Login fehlgeschlagen:', signInError.message);
          console.log('');
          console.log('🔧 LÖSUNG: Passwort zurücksetzen');
          console.log('   Gehe zu Supabase Dashboard → Authentication → Users');
          console.log('   Finde User:', testEmail);
          console.log('   Klicke auf "..." → "Reset Password"');
        } else {
          console.log('✅ Login erfolgreich!');
          console.log('');
          console.log('👤 User Info:');
          console.log('   ID:', signInData.user.id);
          console.log('   Email:', signInData.user.email);
          console.log('   Email Confirmed:', signInData.user.email_confirmed_at ? '✅ Ja' : '❌ Nein');
        }
      } else {
        console.error('❌ Registrierung fehlgeschlagen:', signUpError.message);
      }
    } else {
      console.log('✅ User erfolgreich erstellt!');
      console.log('');
      console.log('👤 User Info:');
      console.log('   ID:', signUpData.user.id);
      console.log('   Email:', signUpData.user.email);
      console.log('   Email Confirmed:', signUpData.user.email_confirmed_at ? '✅ Ja' : '❌ Nein');
      console.log('');
      
      if (!signUpData.user.email_confirmed_at) {
        console.log('⚠️ Email ist NICHT bestätigt!');
        console.log('   Das kann Login verhindern wenn Email-Bestätigung erforderlich ist.');
        console.log('');
        console.log('🔧 LÖSUNG:');
        console.log('   1. Supabase Dashboard → Authentication → Users');
        console.log('   2. Finde User:', testEmail);
        console.log('   3. Klicke auf "..." → "Verify Email"');
      }
    }
    
  } catch (error) {
    console.error('❌ Fehler:', error.message);
  }
  
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('📋 TEST-CREDENTIALS:');
  console.log('   Email:    test@example.com');
  console.log('   Passwort: Test123456!');
  console.log('═══════════════════════════════════════════════════');
}

createTestUser();
