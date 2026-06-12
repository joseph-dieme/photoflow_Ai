'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Simple translation object
const translations = {
  fr: {
    dashboard: 'Tableau de bord',
    projects: 'Projets',
    clients: 'Clients',
    aiTools: 'Outils IA',
    proBadge: 'Plan Pro Actif',
    freeBadge: 'Plan Gratuit',
    upgrade: 'Devenir Pro',
    logout: 'Déconnexion',
    login: 'Connexion',
    signup: 'Inscription',
  },
  en: {
    dashboard: 'Dashboard',
    projects: 'Projects',
    clients: 'Clients',
    aiTools: 'AI Tools',
    proBadge: 'Pro Plan Active',
    freeBadge: 'Free Plan',
    upgrade: 'Upgrade to Pro',
    logout: 'Logout',
    login: 'Login',
    signup: 'Sign Up',
  }
};

export default function Navigation() {
  const pathname = usePathname();
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Read language preference from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('photoflow_lang') as 'fr' | 'en';
    if (savedLang) {
      setTimeout(() => setLang(savedLang), 0);
    }

    // Get current auth user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        // Fetch profile
        supabase
          .from('pf_profiles')
          .select('*')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            if (data) setProfile(data);
          });
      }
    });

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from('pf_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setProfile(data);
          });
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === 'fr' ? 'en' : 'fr';
    setLang(nextLang);
    localStorage.setItem('photoflow_lang', nextLang);
    // Dispatch a global event so other components can listen to language changes
    window.dispatchEvent(new Event('photoflow_lang_change'));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const t = translations[lang];

  // Helper to determine if link is active
  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true;
    if (path !== '/dashboard' && pathname?.startsWith(path)) return true;
    return false;
  };

  // Skip rendering navbar inside public galleries or checkout screen to maintain clean display
  if (pathname?.startsWith('/gallery/') || pathname?.startsWith('/checkout/')) {
    return null;
  }

  return (
    <nav className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 w-full fixed top-0 z-50 bg-surface-container border-b border-outline-variant backdrop-blur-md">
      <div className="flex items-center gap-8">
        <Link href="/" className="font-headline-md text-headline-md font-bold text-primary tracking-wide">
          PhotoFlow AI
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* Language selector */}
        <button
          onClick={toggleLanguage}
          className="px-2.5 py-1 text-[11px] font-bold border border-outline-variant hover:border-primary rounded bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all uppercase"
          title="Switch Language"
        >
          {lang === 'fr' ? 'EN' : 'FR'}
        </button>

        {user ? (
          <>
            {/* Pro Plan badge */}
            <span className="hidden md:inline-block font-label-md text-label-md text-primary bg-primary-container/20 px-3 py-1 rounded-full border border-primary/30">
              {profile?.plan === 'pro' ? t.proBadge : t.freeBadge}
            </span>

            {/* Profile Avatar & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-highest border border-outline-variant hover:border-primary transition-all flex items-center justify-center cursor-pointer"
              >
                <img
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAK_xNNCG-ubyXabhyXKI7GWOzIdUJQmbpG05HTrh0bpVSma4ZHmt_um5LGsiHpKaUnNBTjxSbHgdi8YXiSGyovGS3MTlKMtFPNrV9O74xbqlm5_gQrhtbQvPFcVmbLfJfU8sJsALh9fsAGObSTbXCMQvSaa_56CcXqEmmoKUFzrDErerDo_na3ZuVnMRXSpBJq_JZ5jjSVqxlbTuf4GZWrBO8_lvwqgsdeb74OlY6rRO_C60-ZV5SDyBw9ssSMYc_ZoUK1s8GFNH1v"
                />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 glass-panel rounded-xl shadow-2xl overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-outline-variant">
                    <p className="text-xs text-on-surface-variant">Connecté en tant que</p>
                    <p className="text-sm font-semibold truncate text-on-surface">
                      {profile?.full_name || user.email}
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setShowDropdown(false)}
                    className="block px-4 py-2.5 text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
                  >
                    {t.dashboard}
                  </Link>
                  {profile?.plan !== 'pro' && (
                    <Link
                      href="/#pricing"
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2.5 text-xs text-primary font-bold hover:bg-surface-container-highest transition-colors"
                    >
                      {t.upgrade}
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2.5 text-xs text-error hover:bg-surface-container-highest transition-colors"
                  >
                    {t.logout}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex gap-4">
            <Link
              href="/login"
              className="text-on-surface-variant hover:text-on-surface font-body-md text-body-md transition-colors"
            >
              {t.login}
            </Link>
            <Link
              href="/signup"
              className="bg-primary-container text-on-primary-container px-4 py-1.5 rounded-lg font-body-md text-body-md hover:brightness-110 transition-all"
            >
              {t.signup}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
