'use client';

import React, { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import { useLanguage } from '@/hooks/useLanguage';

const translations = {
  fr: {
    successTitle: 'Compte créé avec succès !',
    successSubtitle: 'Un e-mail de confirmation vous a été envoyé. Vous devez valider votre adresse email pour vous connecter.',
    title: 'Rejoignez PhotoFlow AI',
    proSubtitle: 'Configurez votre compte pour activer votre Plan Pro.',
    freeSubtitle: "Scannez, éditez et livrez vos clichés dès aujourd'hui.",
    fullNameLabel: 'Nom Complet',
    fullNamePlaceholder: 'Ex: Amadou Diallo',
    emailLabel: 'Adresse Email',
    emailPlaceholder: 'nom@exemple.com',
    passwordLabel: 'Mot de passe',
    passwordPlaceholder: 'Mot de passe fort requis',
    proCTA: 'Activer le forfait Pro',
    freeCTA: "S'inscrire gratuitement",
    hasAccount: 'Vous possédez déjà un compte ?',
    loginLink: 'Se connecter',
    errorFallback: "Erreur lors de l'inscription. Veuillez réessayer.",
    passwordStrength: 'Force du mot de passe :',
    weak: 'Faible',
    medium: 'Moyen',
    strong: 'Fort',
    passwordMinLength: 'Au moins 8 caractères',
    passwordUppercase: 'Au moins une majuscule',
    passwordLowercase: 'Au moins une minuscule',
    passwordNumber: 'Au moins un chiffre',
    passwordSpecial: 'Au moins un caractère spécial',
    modalTitle: 'Vérifiez votre boîte mail !',
    modalSubtitle: 'Un lien de confirmation a été envoyé à',
    modalInstructions: 'Veuillez cliquer sur le lien contenu dans cet e-mail pour activer votre compte. Une fois fait, vous pourrez vous connecter.',
    modalCTA: 'Aller à la connexion',
  },
  en: {
    successTitle: 'Account created successfully!',
    successSubtitle: 'A confirmation email has been sent. You must verify your email address to log in.',
    title: 'Join PhotoFlow AI',
    proSubtitle: 'Configure your account to activate your Pro Plan.',
    freeSubtitle: 'Scan, edit, and deliver your photos today.',
    fullNameLabel: 'Full Name',
    fullNamePlaceholder: 'e.g., Amadou Diallo',
    emailLabel: 'Email Address',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Strong password required',
    proCTA: 'Activate Pro Plan',
    freeCTA: 'Sign Up for Free',
    hasAccount: 'Already have an account?',
    loginLink: 'Login',
    errorFallback: 'Error during registration. Please try again.',
    passwordStrength: 'Password strength:',
    weak: 'Weak',
    medium: 'Medium',
    strong: 'Strong',
    passwordMinLength: 'At least 8 characters',
    passwordUppercase: 'At least one uppercase letter',
    passwordLowercase: 'At least one lowercase letter',
    passwordNumber: 'At least one number',
    passwordSpecial: 'At least one special character',
    modalTitle: 'Verify your email address!',
    modalSubtitle: 'A confirmation link has been sent to',
    modalInstructions: 'Please click the link inside that email to activate your account. Once verified, you will be able to log in.',
    modalCTA: 'Go to login page',
  }
};

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan') || 'free';
  const lang = useLanguage();
  const t = translations[lang];

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/checkout/select-plan');
      }
    });
  }, [router]);

  // Password Strength Logic
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const strengthScore = 
    (hasMinLength ? 1 : 0) +
    (hasUppercase ? 1 : 0) +
    (hasLowercase ? 1 : 0) +
    (hasNumber ? 1 : 0) +
    (hasSpecial ? 1 : 0);

  const isPasswordStrong = strengthScore === 5;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordStrong) {
      setError(lang === 'fr' ? 'Votre mot de passe doit respecter toutes les exigences de sécurité.' : 'Your password must meet all security requirements.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Sign up with Supabase
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            plan: planParam,
          },
        },
      });

      if (authError) throw authError;

      if (data.user) {
        localStorage.setItem('pf_signup_pending_plan', 'true');
        if (planParam === 'pro') {
          localStorage.setItem('pf_signup_chosen_plan', 'pro');
        }
        if (data.session) {
          router.push(`/checkout/select-plan${planParam === 'pro' ? '?plan=pro' : ''}`);
        } else {
          setSuccess(true);
        }
      }
    } catch (err: any) {
      setError(err.message || t.errorFallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-outline-variant/30 shadow-2xl relative">
        <div className="text-center mb-8">
          <h1 className="font-display-lg text-2xl font-bold text-white mb-2">{t.title}</h1>
          <p className="text-on-surface-variant text-xs font-medium">
            {planParam === 'pro' 
              ? t.proSubtitle 
              : t.freeSubtitle}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              {t.fullNameLabel}
            </label>
            <input
              id="name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t.fullNamePlaceholder}
              className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-3 text-sm outline-none transition-colors text-white"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              {t.emailLabel}
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-3 text-sm outline-none transition-colors text-white"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              {t.passwordLabel}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl pl-4 pr-12 py-3 text-sm outline-none transition-colors text-white"
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

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <div className="mt-3 space-y-2 p-3 bg-surface-container-highest/40 rounded-xl border border-outline-variant/20">
                <div className="flex items-center justify-between text-[10px] font-bold text-on-surface-variant">
                  <span>{t.passwordStrength}</span>
                  <span className={
                    strengthScore === 5 ? 'text-primary' :
                    strengthScore >= 3 ? 'text-warning' : 'text-error'
                  }>
                    {strengthScore === 5 ? t.strong :
                     strengthScore >= 3 ? t.medium : t.weak}
                  </span>
                </div>
                
                {/* Strength Meter Bar */}
                <div className="flex gap-1 h-1 w-full bg-outline-variant/20 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${
                    strengthScore >= 1 ? (strengthScore === 5 ? 'bg-primary' : strengthScore >= 3 ? 'bg-warning' : 'bg-error') : 'bg-transparent'
                  }`} style={{ width: '20%' }} />
                  <div className={`h-full rounded-full transition-all duration-300 ${
                    strengthScore >= 2 ? (strengthScore === 5 ? 'bg-primary' : strengthScore >= 3 ? 'bg-warning' : 'bg-error') : 'bg-transparent'
                  }`} style={{ width: '20%' }} />
                  <div className={`h-full rounded-full transition-all duration-300 ${
                    strengthScore >= 3 ? (strengthScore === 5 ? 'bg-primary' : 'bg-warning') : 'bg-transparent'
                  }`} style={{ width: '20%' }} />
                  <div className={`h-full rounded-full transition-all duration-300 ${
                    strengthScore >= 4 ? (strengthScore === 5 ? 'bg-primary' : 'bg-warning') : 'bg-transparent'
                  }`} style={{ width: '20%' }} />
                  <div className={`h-full rounded-full transition-all duration-300 ${
                    strengthScore >= 5 ? 'bg-primary' : 'bg-transparent'
                  }`} style={{ width: '20%' }} />
                </div>

                {/* Requirement Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[9px] font-semibold text-on-surface-variant">
                  <div className="flex items-center gap-1">
                    <span className={`material-symbols-outlined text-[12px] ${hasMinLength ? 'text-primary font-bold' : 'text-on-surface-variant/40'}`}>
                      {hasMinLength ? 'check' : 'circle'}
                    </span>
                    <span>{t.passwordMinLength}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`material-symbols-outlined text-[12px] ${hasUppercase ? 'text-primary font-bold' : 'text-on-surface-variant/40'}`}>
                      {hasUppercase ? 'check' : 'circle'}
                    </span>
                    <span>{t.passwordUppercase}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`material-symbols-outlined text-[12px] ${hasLowercase ? 'text-primary font-bold' : 'text-on-surface-variant/40'}`}>
                      {hasLowercase ? 'check' : 'circle'}
                    </span>
                    <span>{t.passwordLowercase}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`material-symbols-outlined text-[12px] ${hasNumber ? 'text-primary font-bold' : 'text-on-surface-variant/40'}`}>
                      {hasNumber ? 'check' : 'circle'}
                    </span>
                    <span>{t.passwordNumber}</span>
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-1">
                    <span className={`material-symbols-outlined text-[12px] ${hasSpecial ? 'text-primary font-bold' : 'text-on-surface-variant/40'}`}>
                      {hasSpecial ? 'check' : 'circle'}
                    </span>
                    <span>{t.passwordSpecial}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !isPasswordStrong}
            className="w-full bg-primary-container text-on-primary-container font-semibold py-3.5 rounded-xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {loading ? (
              <span className="w-5 h-5 rounded-full border-2 border-on-primary-container/30 border-t-on-primary-container animate-spin"></span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                {planParam === 'pro' ? t.proCTA : t.freeCTA}
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-outline-variant/10">
          <p className="text-xs text-on-surface-variant">
            {t.hasAccount}{' '}
            <Link href="/login" className="text-primary font-bold hover:underline">
              {t.loginLink}
            </Link>
          </p>
        </div>
      </div>

      {/* Verification Email Sent Modal Overlay */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300">
          <div className="w-full max-w-md bg-surface-container border border-outline-variant/30 p-8 rounded-3xl shadow-2xl text-center relative max-h-[90vh] overflow-y-auto">
            {/* Top Close Icon */}
            <button
              onClick={() => router.push('/login')}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* Glowing Icon */}
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <span className="material-symbols-outlined text-primary text-4xl animate-pulse">
                mark_email_unread
              </span>
            </div>

            <h2 className="font-display-lg text-2xl font-bold text-white mb-2 leading-tight">
              {t.modalTitle}
            </h2>
            
            <p className="text-on-surface-variant text-xs mb-5 px-2">
              {t.modalSubtitle} <span className="text-primary font-bold">{email}</span>
            </p>

            <div className="p-4 bg-surface-container-highest/30 rounded-2xl border border-outline-variant/10 text-left space-y-3 mb-6">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                <p className="text-on-surface-variant text-[11px] leading-relaxed">
                  Ouvrez votre messagerie et cherchez l'email de <strong>PhotoFlow AI</strong>.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                <p className="text-on-surface-variant text-[11px] leading-relaxed">
                  Cliquez sur le bouton <strong>Confirm your email</strong> pour valider l'adresse.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                <p className="text-on-surface-variant text-[11px] leading-relaxed">
                  Revenez ici pour vous connecter et commencer à éditer.
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push('/login')}
              className="w-full bg-primary-container text-on-primary-container font-semibold py-3.5 rounded-xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              {t.modalCTA}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-body-md overflow-x-hidden hero-glow">
      <Navigation />
      
      <div className="flex-grow flex items-center justify-center px-4 py-24">
        <Suspense fallback={
          <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-outline-variant/30 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto"></div>
          </div>
        }>
          <SignupForm />
        </Suspense>
      </div>
    </div>
  );
}
