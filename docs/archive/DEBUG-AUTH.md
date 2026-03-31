# 🔍 AUTH DEBUG GUIDE - SCHRITT FÜR SCHRITT

## 🎯 **SOFORT-TEST IN DER BROWSER-KONSOLE**

### **1. Öffne http://localhost:3000/landing/#auth**
### **2. Öffne die Browser-Konsole (F12 → Console)**
### **3. Melde dich an mit deinen Daten**

## **WAS DU IN DER KONSOLE SEHEN SOLLTEST:**

```
🔐 AUTH START: {email: "oezdelie.h@gmail.com", isLogin: true}
🔑 Attempting login...
🔑 Login response: {data: {...}, error: null}
🔍 Getting session...
📦 Session: {sess: {session: {...}}, sessErr: null}
🎫 Tokens: {hasAccess: true, hasRefresh: true, accessLength: 1234, refreshLength: 45}
🚀 Redirect URL: http://localhost:8005
🔗 Full redirect URL: http://localhost:8005/auth-bridge?access_token=...
🏃 Redirecting NOW!
```

## **WENN DU AUF localhost:8005 LANDEST:**

In der Konsole solltest du sehen:
```
🌉 AuthBridge LOADED
📍 Current URL: http://localhost:8005/auth-bridge?...
🎫 Received tokens: {hasAccess: true, hasRefresh: true}
🔐 Setting session with Supabase...
📦 Session set result: {data: {...}, error: null}
👤 User info: {name: null, email: "oezdelie.h@gmail.com"}
💾 Saved login flag to localStorage
🚀 Redirecting to /onboarding...
```

## **🚨 HÄUFIGE FEHLER:**

### **FEHLER 1: "Invalid login credentials"**
```javascript
// In der Konsole auf localhost:3000
await supabase.auth.signInWithPassword({
  email: 'oezdelie.h@gmail.com',
  password: 'DEIN_PASSWORT'
})
```
**Lösung:** Passwort falsch oder User existiert nicht

### **FEHLER 2: "Kein Session-Token verfügbar"**
```javascript
// Teste in der Konsole
const { data } = await supabase.auth.getSession();
console.log('Session:', data.session);
```
**Lösung:** Email nicht bestätigt oder Session abgelaufen

### **FEHLER 3: Weiterleitung funktioniert nicht**
```javascript
// Prüfe Environment Variable
console.log('VITE_MAIN_APP_URL:', import.meta.env.VITE_MAIN_APP_URL);
// Sollte sein: http://localhost:8005
```

## **🔧 QUICK-FIX DIREKT IN DER KONSOLE:**

### **Test 1: Manuell einloggen**
```javascript
// Auf localhost:3000 in der Konsole
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'oezdelie.h@gmail.com',
  password: 'DEIN_PASSWORT_HIER'
});
console.log('Login result:', { data, error });
```

### **Test 2: Session prüfen**
```javascript
const { data: session } = await supabase.auth.getSession();
if (session.session) {
  console.log('✅ Session vorhanden!');
  console.log('Access Token:', session.session.access_token);
  console.log('Refresh Token:', session.session.refresh_token);
} else {
  console.log('❌ Keine Session!');
}
```

### **Test 3: Manuelle Weiterleitung**
```javascript
// Wenn Login erfolgreich war, aber Weiterleitung nicht funktioniert
const { data: sess } = await supabase.auth.getSession();
if (sess.session) {
  const url = `http://localhost:8005/auth-bridge?access_token=${sess.session.access_token}&refresh_token=${sess.session.refresh_token}&email=oezdelie.h@gmail.com`;
  console.log('Redirect URL:', url);
  window.location.href = url;
}
```

## **🎯 ULTIMATE FIX - DIREKTE WEITERLEITUNG:**

Wenn alles andere fehlschlägt, führe das in der Konsole aus:

```javascript
// Auf localhost:3000/landing/#auth
async function forceLogin() {
  // 1. Login
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'oezdelie.h@gmail.com',
    password: prompt('Passwort eingeben:')
  });
  
  if (error) {
    console.error('Login failed:', error);
    return;
  }
  
  // 2. Get Session
  const { data: sess } = await supabase.auth.getSession();
  
  if (!sess.session) {
    console.error('No session!');
    return;
  }
  
  // 3. Redirect
  const redirectUrl = `http://localhost:8005/auth-bridge?access_token=${encodeURIComponent(sess.session.access_token)}&refresh_token=${encodeURIComponent(sess.session.refresh_token)}&email=${encodeURIComponent('oezdelie.h@gmail.com')}`;
  
  console.log('✅ Login erfolgreich!');
  console.log('🚀 Weiterleitung zu:', redirectUrl);
  
  setTimeout(() => {
    window.location.href = redirectUrl;
  }, 1000);
}

forceLogin();
```

## **📝 CHECKLISTE:**

- [ ] Browser-Konsole ist offen
- [ ] localhost:3000 läuft
- [ ] localhost:8005 läuft
- [ ] Beide Server haben keine Fehler
- [ ] CORS ist aktiviert (haben wir gemacht)
- [ ] Supabase Keys sind identisch in beiden Apps

## **🆘 WENN NICHTS FUNKTIONIERT:**

1. **Stoppe beide Server**
2. **Lösche Browser-Cache und Cookies**
3. **Starte neu:**
```bash
# Terminal 1
cd /Users/gecko365/Desktop/nebenkosten-knacker-copy-47b5c70d-2
npm run dev

# Terminal 2
cd /Users/gecko365/Desktop/nebenkosten-knacker-copy-47b5c70d-2/mimicheck-landing
npm run dev
```
4. **Öffne http://localhost:3000/landing/#auth**
5. **Führe den forceLogin() Code aus**

---

**Die Debug-Logs sind jetzt in beiden Apps aktiviert. Du solltest genau sehen können, wo es hängt!**
