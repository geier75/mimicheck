// ════════════════════════════════════════════════════════
// 🧪 SUPABASE AUTH TEST - FÜHR MICH IM BROWSER AUS!
// ════════════════════════════════════════════════════════
//
// WIE VERWENDEN:
// 1. Öffne: http://localhost:3000/landing#auth
// 2. Öffne Browser DevTools (F12)
// 3. Gehe zu Tab "Console"
// 4. Kopiere diesen GANZEN Code
// 5. Füge ihn in die Console ein
// 6. Drücke Enter
// 7. Beobachte die Ausgabe!
//
// ════════════════════════════════════════════════════════

(async () => {
  console.clear();
  console.log('🧪 SUPABASE AUTH TEST GESTARTET');
  console.log('════════════════════════════════════════════════════════\n');

  // Check if supabase is available
  if (typeof supabase === 'undefined') {
    console.error('❌ FEHLER: supabase ist nicht definiert!');
    console.log('→ Stelle sicher dass du auf http://localhost:3000/landing bist');
    return;
  }

  console.log('✅ Supabase Client gefunden\n');

  // Test 1: Check current session
  console.log('TEST 1: Aktuelle Session prüfen');
  console.log('────────────────────────────────────────────────────────');
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session Error:', sessionError.message);
    } else if (sessionData.session) {
      console.log('✅ Session vorhanden!');
      console.log('   User:', sessionData.session.user.email);
      console.log('   Access Token:', sessionData.session.access_token.substring(0, 20) + '...');
    } else {
      console.log('ℹ️  Keine aktive Session (normal wenn nicht eingeloggt)');
    }
  } catch (err) {
    console.error('❌ Fehler beim Session-Check:', err);
  }
  console.log('');

  // Test 2: Test signup with unique email
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'Test123456!';

  console.log('TEST 2: Signup testen');
  console.log('────────────────────────────────────────────────────────');
  console.log('Email:', testEmail);
  console.log('Passwort:', testPassword);
  console.log('');
  console.log('Versuche Registrierung...');

  try {
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: 'Test User'
        }
      }
    });

    if (signupError) {
      console.error('❌ SIGNUP FEHLER:', signupError.message);
      console.log('');
      console.log('📋 MÖGLICHE URSACHEN:');
      
      if (signupError.message.includes('Email')) {
        console.log('→ Email Format nicht akzeptiert');
        console.log('→ Oder: Email schon registriert');
      }
      
      if (signupError.message.includes('password')) {
        console.log('→ Passwort zu schwach');
        console.log('→ Mindestens 8 Zeichen erforderlich');
      }
      
      if (signupError.message.includes('confirm')) {
        console.log('→ Email-Bestätigung ist aktiviert!');
        console.log('→ Gehe zu Supabase Dashboard:');
        console.log('   Authentication → Providers → Email');
        console.log('   → "Confirm email" AUS schalten');
      }
      
      console.log('');
      console.log('🔧 WEITERE SCHRITTE:');
      console.log('1. Öffne: https://supabase.com/dashboard');
      console.log('2. Gehe zu: Authentication → Providers → Email');
      console.log('3. Stelle sicher: "Confirm email" ist AUS');
      console.log('4. Speichere Änderungen');
      console.log('5. Versuche es erneut');
      
    } else if (signupData.user) {
      console.log('✅ SIGNUP ERFOLGREICH!');
      console.log('');
      console.log('User ID:', signupData.user.id);
      console.log('Email:', signupData.user.email);
      console.log('Created:', signupData.user.created_at);
      console.log('');

      // Check if session was created
      console.log('TEST 3: Session nach Signup');
      console.log('────────────────────────────────────────────────────────');
      
      const { data: newSession } = await supabase.auth.getSession();
      
      if (newSession.session) {
        console.log('✅ SESSION ERSTELLT!');
        console.log('');
        console.log('Access Token:', newSession.session.access_token.substring(0, 30) + '...');
        console.log('Refresh Token:', newSession.session.refresh_token.substring(0, 30) + '...');
        console.log('');
        
        // Test redirect URL construction
        console.log('TEST 4: Redirect URL Konstruktion');
        console.log('────────────────────────────────────────────────────────');
        
        const mainUrl = 'http://localhost:8005';
        const access_token = newSession.session.access_token;
        const refresh_token = newSession.session.refresh_token;
        const emailParam = encodeURIComponent(testEmail);
        const nameParam = encodeURIComponent('Test User');
        
        const qs = `access_token=${encodeURIComponent(access_token)}&refresh_token=${encodeURIComponent(refresh_token)}&email=${emailParam}&name=${nameParam}`;
        const redirectUrl = `${mainUrl}/auth-bridge?${qs}`;
        
        console.log('✅ Redirect URL erstellt!');
        console.log('');
        console.log('URL:', redirectUrl.substring(0, 100) + '...');
        console.log('');
        console.log('🎯 DER FLOW SOLLTE FUNKTIONIEREN!');
        console.log('');
        console.log('NÄCHSTER SCHRITT:');
        console.log('1. Verwende das Auth-Formular auf der Seite');
        console.log('2. Email: irgendwas@example.com');
        console.log('3. Passwort: Test123456!');
        console.log('4. Klicke "Sign Up"');
        console.log('5. Du solltest automatisch zu Port 8005 weitergeleitet werden!');
        
      } else {
        console.warn('⚠️  KEIN SESSION NACH SIGNUP!');
        console.log('');
        console.log('Das bedeutet wahrscheinlich:');
        console.log('→ Email-Bestätigung ist aktiviert');
        console.log('→ User muss Email bestätigen bevor Session erstellt wird');
        console.log('');
        console.log('🔧 LÖSUNG:');
        console.log('1. Öffne Supabase Dashboard');
        console.log('2. Authentication → Providers → Email');
        console.log('3. "Confirm email" → AUS schalten');
        console.log('4. "Save"');
        console.log('5. Teste erneut');
      }
      
    } else {
      console.log('⚠️  Unerwartete Response:', signupData);
    }

  } catch (err) {
    console.error('❌ UNERWARTETER FEHLER:', err);
    console.log('');
    console.log('Stack:', err.stack);
  }

  console.log('');
  console.log('════════════════════════════════════════════════════════');
  console.log('🏁 TEST ABGESCHLOSSEN');
  console.log('════════════════════════════════════════════════════════');
})();
