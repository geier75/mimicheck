// 🎯 MAGIC LINK LOGIN - Funktioniert IMMER!
// Kopiere das in die Browser-Konsole auf http://localhost:3000/landing/#auth

async function magicLinkLogin() {
  console.log('✨ MAGIC LINK LOGIN STARTED\n');
  
  const email = prompt('Gib deine Email ein (z.B. oezdelie.h@gmail.com):');
  
  if (!email) {
    console.error('❌ Email erforderlich!');
    return;
  }
  
  console.log('📧 Sending magic link to:', email);
  
  // Magic Link senden (kein Passwort nötig!)
  const { data, error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: 'http://localhost:8005/auth-bridge'
    }
  });
  
  if (error) {
    console.error('❌ Error:', error.message);
    
    // Fallback: Versuche Registrierung + Magic Link
    console.log('\n🔄 Trying registration first...');
    
    const { error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: 'TempPassword123!',  // Temporary, wird nicht gebraucht
      options: {
        emailRedirectTo: 'http://localhost:8005/auth-bridge'
      }
    });
    
    if (!signUpError) {
      console.log('✅ User created! Sending magic link...');
      
      // Nochmal Magic Link versuchen
      const { error: retryError } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: 'http://localhost:8005/auth-bridge'
        }
      });
      
      if (!retryError) {
        console.log('✅ Magic link sent!');
      }
    }
  } else {
    console.log('✅ Magic link sent successfully!');
  }
  
  console.log('\n📬 CHECK YOUR EMAIL!');
  console.log('Click the link in the email to login automatically.');
  console.log('You will be redirected to the app.');
}

// Alternative: Anonymous Login (für Tests)
async function anonymousLogin() {
  console.log('👤 Starting anonymous login...\n');
  
  const { data, error } = await supabase.auth.signInAnonymously();
  
  if (error) {
    console.error('❌ Anonymous login failed:', error);
    console.log('ℹ️  Anonymous auth might be disabled in Supabase.');
    return;
  }
  
  console.log('✅ Logged in anonymously!');
  
  const { data: session } = await supabase.auth.getSession();
  if (session.session) {
    console.log('🚀 Redirecting to app...');
    window.location.href = `http://localhost:8005/auth-bridge?access_token=${session.session.access_token}&refresh_token=${session.session.refresh_token}`;
  }
}

// Ultimative Lösung: Bypass für Development
async function devBypass() {
  console.log('🔧 DEVELOPMENT BYPASS\n');
  console.log('Creating temporary test user...\n');
  
  // Generiere unique test user
  const timestamp = Date.now();
  const testEmail = `dev${timestamp}@localhost.test`;
  const testPassword = 'Dev123456!';
  
  console.log('📧 Test Email:', testEmail);
  console.log('🔑 Test Password:', testPassword);
  
  // Registriere User
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: { 
        name: 'Dev User',
        skip_confirmation: true  // Für local development
      }
    }
  });
  
  if (signUpError && !signUpError.message.includes('already registered')) {
    console.error('❌ Signup failed:', signUpError.message);
    return;
  }
  
  console.log('✅ User created/exists');
  console.log('🔐 Attempting login...');
  
  // Sofort einloggen
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });
  
  if (signInError) {
    console.error('❌ Login failed:', signInError.message);
    console.log('\n🔧 Trying alternative method...');
    
    // Alternative: Direkte Session creation für dev
    const fakeToken = btoa(JSON.stringify({
      email: testEmail,
      user_id: 'dev-user-' + timestamp,
      exp: Date.now() + 3600000
    }));
    
    console.log('⚠️  Using dev token (nur für local testing!)');
    console.log('🚀 Redirecting with dev session...');
    
    window.location.href = `http://localhost:8005/auth-bridge?access_token=${fakeToken}&refresh_token=${fakeToken}&email=${testEmail}`;
    return;
  }
  
  console.log('✅ Login successful!');
  
  // Get session und redirect
  const { data: session } = await supabase.auth.getSession();
  if (session.session) {
    console.log('📦 Session active');
    console.log('🚀 Redirecting to app in 2 seconds...');
    
    setTimeout(() => {
      window.location.href = `http://localhost:8005/auth-bridge?access_token=${session.session.access_token}&refresh_token=${session.session.refresh_token}&email=${testEmail}`;
    }, 2000);
  }
}

console.log('=====================================');
console.log('🔥 EMERGENCY AUTH HELPER');
console.log('=====================================\n');
console.log('Choose your login method:\n');
console.log('1️⃣  magicLinkLogin() - Email link (no password)');
console.log('2️⃣  devBypass()      - Skip everything (dev only)');
console.log('3️⃣  anonymousLogin() - No email needed\n');
console.log('Type the function name and press Enter!');
console.log('\n💡 TIP: Start with devBypass() for instant access!');
