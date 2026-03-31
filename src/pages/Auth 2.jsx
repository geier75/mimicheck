import React, { useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Mail, Lock, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// DEV MODE - Bypass Auth für lokale Tests
const DEV_MODE = window.location.hostname === 'localhost';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // DEV BYPASS - Schneller Login für Tests
  async function devBypass() {
    setIsLoading(true);
    console.log('🔧 DEV BYPASS ACTIVATED');
    
    // Erstelle Test-Session
    const testEmail = 'dev@localhost.test';
    const testPassword = 'Dev123456!';
    
    // Versuche Login oder erstelle User
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      // User existiert nicht, erstelle ihn
      const { error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
      });
      
      if (!signUpError) {
        // Nochmal login
        await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword
        });
      }
    }
    
    // Direkt weiterleiten
    setTimeout(() => {
      navigate('/profilseite');
    }, 500);
    
    setIsLoading(false);
  }

  async function handleAuth(e) {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;
      if (activeTab === 'signin') {
        result = await supabase.auth.signInWithPassword({ email, password });
      } else {
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/onboarding`
          }
        });
      }

      if (result.error) throw result.error;

      if (activeTab === 'signup') {
        toast.success('Registrierung erfolgreich!', {
          description: 'Bitte überprüfen Sie Ihre E-Mails zur Bestätigung.'
        });
      } else {
        toast.success('Willkommen zurück!', {
          description: 'Sie werden weitergeleitet...'
        });
        localStorage.setItem('justLoggedIn', '1');
        setTimeout(() => window.location.assign('/profilseite'), 800);
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Fehler bei der Anmeldung', {
        description: error.message === 'Invalid login credentials'
          ? 'E-Mail oder Passwort falsch.'
          : error.message
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              MiMiCheck Portal
            </CardTitle>
            <CardDescription className="text-slate-400">
              Ihr Zugang zu fairen Nebenkosten
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="signin" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-800/50">
                <TabsTrigger value="signin" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">Anmelden</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">Registrieren</TabsTrigger>
              </TabsList>

              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">E-Mail Adresse</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@beispiel.de"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300">Passwort</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium py-6 shadow-lg shadow-blue-500/25 transition-all duration-300"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <span className="flex items-center">
                      {activeTab === 'signin' ? 'Einloggen' : 'Konto erstellen'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </Button>
                
                {/* DEV MODE BYPASS */}
                {DEV_MODE && (
                  <Button
                    type="button"
                    onClick={devBypass}
                    disabled={isLoading}
                    className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-medium py-6"
                  >
                    🔧 DEV: Quick Login (Localhost Only)
                  </Button>
                )}
              </form>
            </Tabs>
          </CardContent>

          <CardFooter className="justify-center border-t border-slate-800/50 pt-6">
            <p className="text-xs text-slate-500 text-center">
              Durch die Anmeldung stimmen Sie unseren <a href="/agb" className="text-blue-400 hover:text-blue-300 hover:underline">AGB</a> und <a href="/datenschutz" className="text-blue-400 hover:text-blue-300 hover:underline">Datenschutzbestimmungen</a> zu.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
