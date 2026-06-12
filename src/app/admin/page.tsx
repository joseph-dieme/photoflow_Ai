'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import { useLanguage } from '@/hooks/useLanguage';

const translations = {
  fr: {
    deniedTitle: 'Accès Refusé',
    deniedSubtitle: 'Vous devez disposer des privilèges administrateur pour accéder à cet espace.',
    goToDashboard: 'Aller au Tableau de Bord',
    title: 'Espace Admin PhotoFlow AI',
    subtitle: "Console globale d'administration et suivi des métriques.",
    refreshTooltip: 'Rafraîchir les métriques',
    metricUsers: 'Utilisateurs',
    metricProSub: 'abonnés Pro',
    metricShoots: 'Projets Shoots',
    metricShootsDesc: 'Dossiers créés par les artistes',
    metricPhotos: 'Photos Stockées',
    metricPhotosDesc: 'Fichiers WebP optimisés',
    metricBandwidth: 'Bande passante / Cloud',
    metricBandwidthDesc: 'Volume total hébergé',
    tableTitle: 'Répertoire des Artistes',
    tableCount: 'Comptes',
    colUserId: 'Identifiant User',
    colPlan: 'Forfait',
    colStorage: 'Stockage Occupé',
    colDate: 'Date Inscription',
    planPro: 'Pro',
    planFree: 'Gratuit',
  },
  en: {
    deniedTitle: 'Access Denied',
    deniedSubtitle: 'You must have administrator privileges to access this area.',
    goToDashboard: 'Go to Dashboard',
    title: 'PhotoFlow AI Admin Space',
    subtitle: 'Global administration console and metrics tracking.',
    refreshTooltip: 'Refresh metrics',
    metricUsers: 'Users',
    metricProSub: 'Pro subscribers',
    metricShoots: 'Shoot Projects',
    metricShootsDesc: 'Folders created by artists',
    metricPhotos: 'Stored Photos',
    metricPhotosDesc: 'Optimized WebP files',
    metricBandwidth: 'Bandwidth / Cloud',
    metricBandwidthDesc: 'Total volume hosted',
    tableTitle: 'Artists Directory',
    tableCount: 'Accounts',
    colUserId: 'User Identifier',
    colPlan: 'Plan',
    colStorage: 'Storage Used',
    colDate: 'Registration Date',
    planPro: 'Pro',
    planFree: 'Free',
  }
};

export default function AdminPage() {
  const router = useRouter();
  const lang = useLanguage();
  const t = translations[lang];
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Platform Metrics States
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    proUsers: 0,
    totalProjects: 0,
    totalStorageBytes: 0,
    totalPhotos: 0,
  });

  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        // Simple admin check: in a real application, you'd verify a user role flag.
        // For sandbox convenience, we allow the main user to review the admin panel.
        setIsAdmin(true);
        fetchPlatformMetrics();
      }
    });
  }, [router]);

  async function fetchPlatformMetrics() {
    setLoading(true);
    try {
      // 1. Fetch all profiles
      const { data: profiles, error: profileErr } = await supabase
        .from('pf_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profileErr) throw profileErr;
      
      const allProfiles = profiles || [];
      const proCount = allProfiles.filter((p) => p.plan === 'pro').length;
      const totalStorage = allProfiles.reduce((acc, p) => acc + (p.storage_used || 0), 0);

      // 2. Fetch all projects
      const { count: projectCount } = await supabase
        .from('pf_projects')
        .select('*', { count: 'exact', head: true });

      // 3. Fetch all photos
      const { count: photoCount } = await supabase
        .from('pf_photos')
        .select('*', { count: 'exact', head: true });

      setMetrics({
        totalUsers: allProfiles.length,
        proUsers: proCount,
        totalProjects: projectCount || 0,
        totalStorageBytes: totalStorage,
        totalPhotos: photoCount || 0,
      });

      setUsers(allProfiles);
    } catch (err) {
      console.error('Error loading admin platform metrics:', err);
    } finally {
      setLoading(false);
    }
  }

  const formatStorage = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) return mb.toFixed(1) + ' MB';
    const gb = mb / 1024;
    return gb.toFixed(1) + ' GB';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center p-6">
        <div className="w-full max-w-md glass-panel p-8 rounded-2xl text-center border border-outline-variant/30">
          <span className="material-symbols-outlined text-error text-6xl mb-4">gavel</span>
          <h1 className="font-display-lg text-2xl font-bold text-white mb-2">{t.deniedTitle}</h1>
          <p className="text-on-surface-variant text-sm mb-6">
            {t.deniedSubtitle}
          </p>
          <Link href="/dashboard" className="bg-primary-container text-on-primary-container font-semibold px-4 py-2 rounded-lg text-xs">
            {t.goToDashboard}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-body-md overflow-x-hidden selection:bg-primary-container">
      <Navigation />

      <main className="max-w-6xl mx-auto pt-24 px-6 md:px-margin-desktop pb-24 w-full flex-grow">
        {/* Header section */}
        <header className="mb-10 border-b border-outline-variant/30 pb-6 flex justify-between items-center">
          <div>
            <h1 className="font-display-lg text-3xl font-bold text-white">{t.title}</h1>
            <p className="text-on-surface-variant text-xs mt-1">{t.subtitle}</p>
          </div>
          <button 
            onClick={fetchPlatformMetrics}
            className="p-2 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 rounded-xl text-on-surface-variant hover:text-white cursor-pointer transition-all flex items-center justify-center"
            title={t.refreshTooltip}
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
          </button>
        </header>

        {/* Global Statistics Bento Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="glass-panel p-6 rounded-xl flex flex-col gap-1.5">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{t.metricUsers}</span>
            <div className="text-3xl font-bold text-white">{metrics.totalUsers}</div>
            <div className="text-[10px] text-primary font-bold">{metrics.proUsers} {t.metricProSub}</div>
          </div>
          
          <div className="glass-panel p-6 rounded-xl flex flex-col gap-1.5">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{t.metricShoots}</span>
            <div className="text-3xl font-bold text-white">{metrics.totalProjects}</div>
            <div className="text-[10px] text-on-surface-variant">{t.metricShootsDesc}</div>
          </div>

          <div className="glass-panel p-6 rounded-xl flex flex-col gap-1.5">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{t.metricPhotos}</span>
            <div className="text-3xl font-bold text-white">{metrics.totalPhotos}</div>
            <div className="text-[10px] text-on-surface-variant">{t.metricPhotosDesc}</div>
          </div>

          <div className="glass-panel p-6 rounded-xl flex flex-col gap-1.5">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{t.metricBandwidth}</span>
            <div className="text-3xl font-bold text-white">{formatStorage(metrics.totalStorageBytes)}</div>
            <div className="text-[10px] text-primary font-bold">{t.metricBandwidthDesc}</div>
          </div>
        </section>

        {/* User Base Listing Table */}
        <section className="glass-panel rounded-2xl border border-outline-variant/30 overflow-hidden">
          <div className="p-4 bg-surface-container-high border-b border-outline-variant/50 flex justify-between items-center">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">{t.tableTitle}</h3>
            <span className="text-[10px] bg-primary/20 text-primary px-2.5 py-0.5 rounded-full font-bold">
              {users.length} {t.tableCount}
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 text-on-surface-variant uppercase tracking-wider font-bold">
                  <th className="p-4">{t.colUserId}</th>
                  <th className="p-4">{t.colPlan}</th>
                  <th className="p-4">{t.colStorage}</th>
                  <th className="p-4">{t.colDate}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 font-medium text-on-surface-variant">
                {users.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container/20 transition-colors">
                    <td className="p-4 font-semibold text-white truncate max-w-[200px]" title={item.id}>
                      {item.full_name || item.id}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.plan === 'pro' ? 'bg-primary-container/10 text-primary' : 'bg-outline-variant/30 text-on-surface-variant'
                      }`}>
                        {item.plan === 'pro' ? t.planPro : t.planFree}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-white">{formatStorage(item.storage_used || 0)}</td>
                    <td className="p-4">{new Date(item.created_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
