'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';

interface MobileNavProps {
  onNewShootClick?: () => void;
}

const translations = {
  fr: {
    home: 'Accueil',
    clients: 'Clients',
    projects: 'Projets',
    income: 'Revenus',
  },
  en: {
    home: 'Home',
    clients: 'Clients',
    projects: 'Projects',
    income: 'Invoices',
  }
};

export default function MobileNav({ onNewShootClick }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const lang = useLanguage();

  const t = translations[lang];

  const handleNewShootClick = () => {
    if (onNewShootClick) {
      onNewShootClick();
    } else {
      router.push('/dashboard?new=true');
    }
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  // Hide mobile navbar inside public galleries or checkout screen
  if (pathname?.startsWith('/gallery/') || pathname?.startsWith('/checkout/')) {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-high flex justify-around items-center z-50 border-t border-outline-variant backdrop-blur-md">
      <Link
        href="/dashboard"
        className={`flex flex-col items-center gap-1 transition-all ${
          isActive('/dashboard') ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
        }`}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive('/dashboard') ? "'FILL' 1" : undefined }}>
          dashboard
        </span>
        <span className="text-[10px] font-medium">{t.home}</span>
      </Link>

      <Link
        href="/dashboard/clients"
        className={`flex flex-col items-center gap-1 transition-all ${
          isActive('/dashboard/clients') ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
        }`}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive('/dashboard/clients') ? "'FILL' 1" : undefined }}>
          person
        </span>
        <span className="text-[10px] font-medium">{t.clients}</span>
      </Link>

      {/* Floating Center Action Button */}
      <button
        onClick={handleNewShootClick}
        className="w-12 h-12 -mt-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-lg hover:brightness-110 active:scale-95 transition-all electric-glow cursor-pointer"
      >
        <span className="material-symbols-outlined text-[24px]">add</span>
      </button>

      <Link
        href="/dashboard/projects"
        className={`flex flex-col items-center gap-1 transition-all ${
          isActive('/dashboard/projects') || pathname?.startsWith('/dashboard/projects/') ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
        }`}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive('/dashboard/projects') ? "'FILL' 1" : undefined }}>
          collections
        </span>
        <span className="text-[10px] font-medium">{t.projects}</span>
      </Link>

      <Link
        href="/dashboard/invoices"
        className={`flex flex-col items-center gap-1 transition-all ${
          isActive('/dashboard/invoices') ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
        }`}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive('/dashboard/invoices') ? "'FILL' 1" : undefined }}>
          payments
        </span>
        <span className="text-[10px] font-medium">{t.income}</span>
      </Link>
    </nav>
  );
}
