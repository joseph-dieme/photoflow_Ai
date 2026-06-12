'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';

interface SidebarProps {
  onNewShootClick?: () => void;
  activeProjectName?: string;
  isAiProcessing?: boolean;
}

const translations = {
  fr: {
    noProject: 'Aucun projet',
    aiActive: 'IA Active',
    aiInactive: 'IA Inactive',
    newShoot: 'Nouveau Shoot',
    overview: "Vue d'ensemble",
    clients: 'Clients Répertoire',
    projects: 'Dossiers Projets',
    invoices: 'Factures & Devis',
    settings: 'Paramètres',
    support: 'Support WhatsApp',
  },
  en: {
    noProject: 'No active project',
    aiActive: 'AI Active',
    aiInactive: 'AI Inactive',
    newShoot: 'New Shoot',
    overview: 'Overview',
    clients: 'Clients Directory',
    projects: 'Project Folders',
    invoices: 'Invoices & Estimates',
    settings: 'Settings',
    support: 'WhatsApp Support',
  }
};

export default function Sidebar({
  onNewShootClick,
  activeProjectName = 'Aucun projet',
  isAiProcessing = false,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const lang = useLanguage();

  const t = translations[lang];

  const displayProjectName = activeProjectName === 'Aucun projet' ? t.noProject : activeProjectName;

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

  return (
    <aside className="fixed left-0 top-16 bottom-0 flex flex-col p-panel-padding bg-surface-container-low border-r border-outline-variant w-[280px] hidden md:flex z-35">
      {/* Project Status Panel */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center border border-outline-variant">
          <span className="material-symbols-outlined text-primary">architecture</span>
        </div>
        <div>
          <div className="font-label-md text-label-md text-on-surface font-bold truncate max-w-[170px]" title={displayProjectName}>
            {displayProjectName}
          </div>
          {isAiProcessing ? (
            <div className="text-[10px] text-primary flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              {t.aiActive}
            </div>
          ) : (
            <div className="text-[10px] text-on-surface-variant flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
              {t.aiInactive}
            </div>
          )}
        </div>
      </div>

      {/* New Shoot Button */}
      <button
        onClick={handleNewShootClick}
        className="mb-8 w-full bg-primary-container text-on-primary-container font-semibold font-label-md text-label-md py-3 rounded-lg flex items-center justify-center gap-2 hover:brightness-115 active:scale-98 transition-all shadow-lg cursor-pointer"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        {t.newShoot}
      </button>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col gap-2">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 p-3 rounded-lg font-label-md text-label-md transition-all ${
            isActive('/dashboard')
              ? 'bg-primary-container/10 text-primary border border-primary/20'
              : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined">dashboard</span> {t.overview}
        </Link>

        <Link
          href="/dashboard/clients"
          className={`flex items-center gap-3 p-3 rounded-lg font-label-md text-label-md transition-all ${
            isActive('/dashboard/clients')
              ? 'bg-primary-container/10 text-primary border border-primary/20'
              : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined">person</span> {t.clients}
        </Link>

        <Link
          href="/dashboard/projects"
          className={`flex items-center gap-3 p-3 rounded-lg font-label-md text-label-md transition-all ${
            isActive('/dashboard/projects') || pathname?.startsWith('/dashboard/projects/')
              ? 'bg-primary-container text-on-primary-container font-semibold'
              : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined">folder</span> {t.projects}
        </Link>

        <Link
          href="/dashboard/invoices"
          className={`flex items-center gap-3 p-3 rounded-lg font-label-md text-label-md transition-all ${
            isActive('/dashboard/invoices')
              ? 'bg-primary-container/10 text-primary border border-primary/20'
              : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined">receipt_long</span> {t.invoices}
        </Link>
      </nav>

      {/* Bottom Settings & Support */}
      <div className="mt-auto pt-6 border-t border-outline-variant flex flex-col gap-2">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 p-3 text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors"
        >
          <span className="material-symbols-outlined">settings</span> {t.settings}
        </Link>
        <a
          href="https://wa.me/221770000000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 text-primary font-bold font-label-md text-label-md hover:brightness-110 transition-all"
        >
          <span className="material-symbols-outlined">help</span> {t.support}
        </a>
      </div>
    </aside>
  );
}
