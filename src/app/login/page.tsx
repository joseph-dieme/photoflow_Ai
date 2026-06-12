'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import { useLanguage } from '@/hooks/useLanguage';

const translations = {
  fr: {
    welcome: 'Bienvenue sur PhotoFlow AI',
    subtitle: "Accédez à votre espace créateur et commencez l'editing.",
    emailLabel: 'Adresse Email',
    passwordLabel: 'Mot de passe',
    forgotPassword: 'Mot de passe oublié ?',
    loginButton: 'Se connecter',
    newUser: 'Nouveau sur PhotoFlow AI ?',
    createAccount: 'Créer un compte',
    invalidCredentials: 'Identifiants invalides. Veuillez réessayer.'
  },
  en: {
    welcome: 'Welcome to PhotoFlow AI',
    subtitle: 'Access your creator workspace and start editing.',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    forgotPassword: 'Forgot password?',
    loginButton: 'Sign In',
    newUser: 'New to PhotoFlow AI?',
    createAccount: 'Create an account',
    invalidCredentials: 'Invalid credentials. Please try again.'
  }
};

export default function LoginPage() {
  const router = useRouter();
  const lang = useLanguage();
  const t = translations[lang];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Successful login
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('invalid login credentials')) {
        setError(t.invalidCredentials);
      } else {
        setError(msg || t.invalidCredentials);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-body-md overflow-x-hidden hero-glow">
      <Navigation />
      
      <div className="flex-grow flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-outline-variant/30 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="font-display-lg text-2xl font-bold text-white mb-2">{t.welcome}</h1>
            <p className="text-on-surface-variant text-xs">{t.subtitle}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                {t.emailLabel}
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  {t.passwordLabel}
                </label>
                <a href="#" className="text-xs text-primary hover:underline">{t.forgotPassword}</a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl pl-4 pr-12 py-3 text-sm outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white transition-colors cursor-pointer flex items-center justify-center p-1"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-container text-on-primary-container font-semibold py-3.5 rounded-xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {loading ? (
                <span className="w-5 h-5 rounded-full border-2 border-on-primary-container/30 border-t-on-primary-container animate-spin"></span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  {t.loginButton}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-outline-variant/10">
            <p className="text-xs text-on-surface-variant">
              {t.newUser}{' '}
              <Link href="/signup" className="text-primary font-bold hover:underline">
                {t.createAccount}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
