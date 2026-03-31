// QUICK REGISTER & LOGIN SCRIPT
// Führe das in der Browser-Konsole auf http://localhost:3000/landing/#auth aus

async function quickRegisterAndLogin() {
  console.log('🚀 Starting Quick Registration...\n');
  
  // Test-User mit sicherem Passwort
  const testUser = {
    email: 'test' + Date.now() + '@example.com',  // Unique email
    password: 'TestPassword123!',  // Merke dir das!
    name: 'Test User'
  };
  
  console.log('📧 Creating user:', testUser.email);
  console.log('🔑 Password:', testUser.password);
  console.log('👆 SAVE THIS PASSWORD!\n');
  
  try {
    // 1. Sign up
    console.log('1️⃣ Registering user...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: { 
        data: { name: testUser.name },
        emailRedirectTo: 'http://localhost:8005/auth-bridge'
      }
    });
    
    if (signUpError) {
      console.error('❌ Signup failed:', signUpError);
      return;
    }
    
    console.log('✅ User created successfully!');
    
    // 2. Auto-confirm (for testing)
    // Supabase erlaubt sofortiges Login nach Registrierung
    
    // 3. Sign in immediately
    console.log('\n2️⃣ Logging in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    });
    
    if (signInError) {
      console.error('❌ Login failed:', signInError);
      console.log('ℹ️  You may need to confirm your email first.');
      return;
    }
    
    console.log('✅ Login successful!');
    
    // 4. Get session
    console.log('\n3️⃣ Getting session...');
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session) {
      console.error('❌ No session found!');
      return;
    }
    
    console.log('✅ Session active!');
    
    // 5. Redirect to main app
    console.log('\n4️⃣ Redirecting to main app...');
    const redirectUrl = `http://localhost:8005/auth-bridge?` +
      `access_token=${encodeURIComponent(session.session.access_token)}` +
      `&refresh_token=${encodeURIComponent(session.session.refresh_token)}` +
      `&email=${encodeURIComponent(testUser.email)}` +
      `&name=${encodeURIComponent(testUser.name)}`;
    
    console.log('🎯 Redirecting in 2 seconds...');
    console.log('📋 URL:', redirectUrl.substring(0, 100) + '...');
    
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 2000);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Alternative: Mit eigenem Passwort
async function registerWithCustomPassword() {
  const email = prompt('Email eingeben (z.B. deine.email@gmail.com):');
  const password = prompt('Passwort wählen (min. 6 Zeichen):');
  
  if (!email || !password || password.length < 6) {
    console.error('❌ Email und Passwort (min. 6 Zeichen) erforderlich!');
    return;
  }
  
  console.log('📧 Registering:', email);
  
  // Sign up
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      emailRedirectTo: 'http://localhost:8005/auth-bridge'
    }
  });
  
  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }
  
  console.log('✅ Registration successful!');
  console.log('📧 Check your email for confirmation link!');
  console.log('');
  console.log('After confirming, login with:');
  console.log('Email:', email);
  console.log('Password:', password);
  
  // Try immediate login (works if email confirmation is disabled)
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  });
  
  if (!loginError) {
    console.log('✅ Auto-login successful!');
    const { data: session } = await supabase.auth.getSession();
    if (session.session) {
      const redirectUrl = `http://localhost:8005/auth-bridge?` +
        `access_token=${encodeURIComponent(session.session.access_token)}` +
        `&refresh_token=${encodeURIComponent(session.session.refresh_token)}` +
        `&email=${encodeURIComponent(email)}`;
      
      console.log('🚀 Redirecting...');
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 2000);
    }
  } else {
    console.log('ℹ️  Please confirm your email first, then login manually.');
  }
}

console.log('=====================================');
console.log('🔥 QUICK AUTH HELPER LOADED');
console.log('=====================================\n');
console.log('Choose an option:\n');
console.log('1️⃣  quickRegisterAndLogin()   - Creates test user & auto-login');
console.log('2️⃣  registerWithCustomPassword() - Register with your email\n');
console.log('Type the function name and press Enter!');
