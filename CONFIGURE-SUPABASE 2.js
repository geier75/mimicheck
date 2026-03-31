/**
 * SUPABASE KONFIGURATION FÜR AUTO-CONFIRM
 * 
 * Führe das in der Browser-Konsole auf http://localhost:3000 oder http://localhost:8005 aus
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yjjauvmjyhlxcoumwqlj.supabase.co';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY'; // Ersetze mit deinem Service Role Key

// Service Client mit Admin-Rechten
const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function configureAutoConfirm() {
  console.log('🔧 KONFIGURIERE SUPABASE FÜR AUTO-CONFIRM\n');
  
  try {
    // 1. Alle existierenden User bestätigen
    console.log('1️⃣ Bestätige alle existierenden User...');
    
    const { data: users, error: listError } = await adminClient.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Fehler beim Abrufen der User:', listError);
      return;
    }
    
    console.log(`📊 ${users.users.length} User gefunden`);
    
    for (const user of users.users) {
      if (!user.email_confirmed_at) {
        console.log(`✉️ Bestätige ${user.email}...`);
        
        const { error: updateError } = await adminClient.auth.admin.updateUserById(
          user.id,
          { 
            email_confirmed_at: new Date().toISOString(),
            user_metadata: { ...user.user_metadata, email_verified: true }
          }
        );
        
        if (updateError) {
          console.error(`❌ Fehler bei ${user.email}:`, updateError);
        } else {
          console.log(`✅ ${user.email} bestätigt`);
        }
      }
    }
    
    // 2. Test-User erstellen
    console.log('\n2️⃣ Erstelle Test-User...');
    
    const testEmail = 'test@mimicheck.de';
    const testPassword = 'Test123456!';
    
    const { data: testUser, error: createError } = await adminClient.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { name: 'Test User' }
    });
    
    if (createError) {
      if (createError.message?.includes('already exists')) {
        console.log('ℹ️ Test-User existiert bereits');
      } else {
        console.error('❌ Fehler beim Erstellen:', createError);
      }
    } else {
      console.log('✅ Test-User erstellt:', testEmail);
      console.log('🔑 Password:', testPassword);
    }
    
    console.log('\n✅ KONFIGURATION ABGESCHLOSSEN!');
    console.log('\n📝 Nächste Schritte:');
    console.log('1. Gehe zu http://localhost:3000/landing/#auth');
    console.log('2. Registriere dich mit einer beliebigen Email');
    console.log('3. Du wirst automatisch eingeloggt (keine Bestätigung nötig)');
    console.log('\nODER nutze den Test-User:');
    console.log('Email: test@mimicheck.de');
    console.log('Password: Test123456!');
    
  } catch (error) {
    console.error('❌ Unerwarteter Fehler:', error);
  }
}

// Alternative: Ohne Service Key - Nutze normale Auth
async function quickUserSetup() {
  console.log('🚀 QUICK USER SETUP (ohne Admin-Rechte)\n');
  
  const supabase = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqamF1dm1qeWhseGNvdW13cWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0Mzc4NzgsImV4cCI6MjA3ODAxMzg3OH0.A8e7YwJA6VJ0fTJJt8TBVRT4vktVxB1DFL8U5RLTzZg');
  
  // Erstelle mehrere Test-User
  const testUsers = [
    { email: 'test1@test.com', password: 'Test123!' },
    { email: 'test2@test.com', password: 'Test123!' },
    { email: 'demo@demo.com', password: 'Demo123!' }
  ];
  
  for (const user of testUsers) {
    console.log(`📧 Erstelle ${user.email}...`);
    
    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        emailRedirectTo: 'http://localhost:8005/auth-bridge',
        data: { 
          skip_confirmation: true,
          email_confirmed: true
        }
      }
    });
    
    if (error) {
      if (error.message?.includes('already registered')) {
        console.log(`ℹ️ ${user.email} existiert bereits`);
      } else {
        console.error(`❌ Fehler bei ${user.email}:`, error.message);
      }
    } else {
      console.log(`✅ ${user.email} erstellt`);
    }
  }
  
  console.log('\n✅ Test-User erstellt!');
  console.log('\nVerwende einen dieser User:');
  testUsers.forEach(u => {
    console.log(`📧 ${u.email} / 🔑 ${u.password}`);
  });
}

// Export für Browser-Konsole
if (typeof window !== 'undefined') {
  window.configureAutoConfirm = configureAutoConfirm;
  window.quickUserSetup = quickUserSetup;
  
  console.log('=====================================');
  console.log('🔧 SUPABASE CONFIGURATION HELPER');
  console.log('=====================================\n');
  console.log('Verfügbare Funktionen:\n');
  console.log('1️⃣ quickUserSetup() - Erstelle Test-User (empfohlen)');
  console.log('2️⃣ configureAutoConfirm() - Benötigt Service Key\n');
  console.log('Starte mit: quickUserSetup()');
}

// Auto-run für Node.js
if (typeof window === 'undefined') {
  quickUserSetup().catch(console.error);
}
