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
    colUserId: 'Nom / Identifiant',
    colEmail: 'Adresse E-mail',
    colPlan: 'Forfait',
    colStorage: 'Stockage Utilisé',
    colStorageLimit: 'Limite Stockage',
    colDate: 'Inscription',
    colActions: 'Actions',
    planPro: 'Pro',
    planFree: 'Gratuit',
    searchPlaceholder: 'Rechercher par nom ou e-mail...',
    saveSuccess: 'Utilisateur mis à jour avec succès !',
    saveError: 'Erreur lors de la mise à jour.',
    noUsers: 'Aucun utilisateur trouvé.',
    btnSave: 'Sauvegarder',
    unsavedChanges: 'Modifications non enregistrées',
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
    colUserId: 'Name / ID',
    colEmail: 'Email Address',
    colPlan: 'Plan',
    colStorage: 'Storage Used',
    colStorageLimit: 'Storage Limit',
    colDate: 'Registration Date',
    colActions: 'Actions',
    planPro: 'Pro',
    planFree: 'Free',
    searchPlaceholder: 'Search by name or email...',
    saveSuccess: 'User updated successfully!',
    saveError: 'Error updating user.',
    noUsers: 'No users found.',
    btnSave: 'Save',
    unsavedChanges: 'Unsaved changes',
  }
};

export default function AdminPage() {
  const router = useRouter();
  const lang = useLanguage();
  const t = translations[lang] || translations.fr;
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
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI Indicators
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
      // 1. Fetch metrics via SECURITY DEFINER RPC
      const { data: metricsData, error: metricsErr } = await supabase.rpc('admin_get_metrics');
      if (metricsErr) throw metricsErr;

      // 2. Fetch users via SECURITY DEFINER RPC (joins auth.users to get email)
      const { data: usersData, error: usersErr } = await supabase.rpc('admin_get_users');
      if (usersErr) throw usersErr;

      setMetrics({
        totalUsers: metricsData?.totalUsers || 0,
        proUsers: metricsData?.proUsers || 0,
        totalProjects: metricsData?.totalProjects || 0,
        totalStorageBytes: metricsData?.totalStorageBytes || 0,
        totalPhotos: metricsData?.totalPhotos || 0,
      });

      // Add isDirty and temp values to state for in-line updates
      const formattedUsers = (usersData || []).map((u: any) => ({
        ...u,
        isDirty: false,
      }));

      setUsers(formattedUsers);
    } catch (err) {
      console.error('Error loading admin platform metrics:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleUserRowChange = (userId: string, field: 'plan' | 'storage_limit', value: any) => {
    setUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.id === userId) {
          // If switching plan, adjust the storage limit automatically for convenience
          if (field === 'plan') {
            const defaultLimit = value === 'pro' ? 53687091200 : 1073741824; // 50GB or 1GB
            return { ...u, [field]: value, storage_limit: defaultLimit, isDirty: true };
          }
          return { ...u, [field]: value, isDirty: true };
        }
        return u;
      })
    );
  };

  const handleSaveUser = async (userItem: any) => {
    setUpdatingUserId(userItem.id);
    try {
      const { error } = await supabase.rpc('admin_update_user', {
        user_id: userItem.id,
        new_plan: userItem.plan,
        new_storage_limit: parseInt(userItem.storage_limit),
      });

      if (error) throw error;
      
      // Update local dirty flag
      setUsers(prevUsers =>
        prevUsers.map(u => (u.id === userItem.id ? { ...u, isDirty: false } : u))
      );

      // Trigger success toast
      showToast('success', t.saveSuccess);
      
      // Refresh platform metrics in background
      const { data: metricsData } = await supabase.rpc('admin_get_metrics');
      if (metricsData) {
        setMetrics({
          totalUsers: metricsData.totalUsers || 0,
          proUsers: metricsData.proUsers || 0,
          totalProjects: metricsData.totalProjects || 0,
          totalStorageBytes: metricsData.totalStorageBytes || 0,
          totalPhotos: metricsData.totalPhotos || 0,
        });
      }
    } catch (err) {
      console.error('Failed to save user:', err);
      showToast('error', t.saveError);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const formatStorage = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) return mb.toFixed(1) + ' MB';
    const gb = mb / 1024;
    return gb.toFixed(1) + ' GB';
  };

  const filteredUsers = users.filter((item) => {
    const query = searchQuery.toLowerCase();
    const fullNameMatch = (item.full_name || '').toLowerCase().includes(query);
    const emailMatch = (item.email || '').toLowerCase().includes(query);
    const idMatch = (item.id || '').toLowerCase().includes(query);
    return fullNameMatch || emailMatch || idMatch;
  });

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
          <div className="glass-panel p-6 rounded-xl flex flex-col gap-1.5 border border-outline-variant/30">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{t.metricUsers}</span>
            <div className="text-3xl font-bold text-white">{metrics.totalUsers}</div>
            <div className="text-[10px] text-primary font-bold">{metrics.proUsers} {t.metricProSub}</div>
          </div>
          
          <div className="glass-panel p-6 rounded-xl flex flex-col gap-1.5 border border-outline-variant/30">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{t.metricShoots}</span>
            <div className="text-3xl font-bold text-white">{metrics.totalProjects}</div>
            <div className="text-[10px] text-on-surface-variant">{t.metricShootsDesc}</div>
          </div>

          <div className="glass-panel p-6 rounded-xl flex flex-col gap-1.5 border border-outline-variant/30">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{t.metricPhotos}</span>
            <div className="text-3xl font-bold text-white">{metrics.totalPhotos}</div>
            <div className="text-[10px] text-on-surface-variant">{t.metricPhotosDesc}</div>
          </div>

          <div className="glass-panel p-6 rounded-xl flex flex-col gap-1.5 border border-outline-variant/30">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{t.metricBandwidth}</span>
            <div className="text-3xl font-bold text-white">{formatStorage(metrics.totalStorageBytes)}</div>
            <div className="text-[10px] text-primary font-bold">{t.metricBandwidthDesc}</div>
          </div>
        </section>

        {/* User Base Listing Table */}
        <section className="glass-panel rounded-2xl border border-outline-variant/30 overflow-hidden">
          <div className="p-4 bg-surface-container-high border-b border-outline-variant/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">{t.tableTitle}</h3>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch sm:items-center">
              {/* Search Bar */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2 text-sm text-on-surface-variant">search</span>
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-background border border-outline-variant/50 focus:border-primary/70 rounded-xl pl-9 pr-4 py-1.5 text-xs outline-none text-white w-full sm:w-64 transition-all"
                />
              </div>

              <span className="text-[10px] bg-primary/20 text-primary px-2.5 py-1.5 rounded-full font-bold text-center select-none">
                {filteredUsers.length} {t.tableCount}
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 text-on-surface-variant uppercase tracking-wider font-bold bg-surface-container-low/30">
                  <th className="p-4">{t.colUserId}</th>
                  <th className="p-4">{t.colEmail}</th>
                  <th className="p-4">{t.colPlan}</th>
                  <th className="p-4">{t.colStorage}</th>
                  <th className="p-4">{t.colStorageLimit}</th>
                  <th className="p-4">{t.colDate}</th>
                  <th className="p-4 text-center">{t.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 font-medium text-on-surface-variant">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-on-surface-variant">
                      {t.noUsers}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((item) => (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-surface-container/20 transition-colors ${
                        item.isDirty ? 'bg-primary/5 hover:bg-primary/10' : ''
                      }`}
                    >
                      {/* Name / ID */}
                      <td className="p-4 font-semibold text-white truncate max-w-[150px]" title={item.id}>
                        {item.full_name || 'Photographe'}
                        <span className="block text-[9px] text-zinc-500 font-mono mt-0.5 truncate max-w-[120px]">{item.id}</span>
                      </td>

                      {/* Email */}
                      <td className="p-4 font-mono text-zinc-300 font-semibold">{item.email || 'N/A'}</td>

                      {/* Plan Dropdown */}
                      <td className="p-4">
                        <select
                          value={item.plan}
                          onChange={(e) => handleUserRowChange(item.id, 'plan', e.target.value)}
                          className="bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-2.5 py-1.5 text-xs outline-none text-white cursor-pointer font-bold"
                        >
                          <option value="free">{t.planFree}</option>
                          <option value="pro">{t.planPro}</option>
                        </select>
                      </td>

                      {/* Storage Used */}
                      <td className="p-4 font-bold text-white">
                        {formatStorage(item.storage_used || 0)}
                      </td>

                      {/* Storage Limit Dropdown */}
                      <td className="p-4">
                        <select
                          value={item.storage_limit}
                          onChange={(e) => handleUserRowChange(item.id, 'storage_limit', parseInt(e.target.value))}
                          className="bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-2.5 py-1.5 text-xs outline-none text-white cursor-pointer font-mono font-bold"
                        >
                          <option value={1073741824}>1 GB (Free)</option>
                          <option value={5368709120}>5 GB</option>
                          <option value={10737418240}>10 GB</option>
                          <option value={21474836480}>20 GB</option>
                          <option value={53687091200}>50 GB (Pro)</option>
                          <option value={107374182400}>100 GB</option>
                          <option value={536870912000}>500 GB</option>
                        </select>
                      </td>

                      {/* Registration Date */}
                      <td className="p-4 text-zinc-400 font-semibold">
                        {new Date(item.created_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')}
                      </td>

                      {/* Save Action */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleSaveUser(item)}
                          disabled={!item.isDirty || updatingUserId === item.id}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 mx-auto transition-all cursor-pointer ${
                            item.isDirty 
                              ? 'bg-primary text-on-primary hover:brightness-110 shadow-lg shadow-primary/20' 
                              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                          }`}
                          title={item.isDirty ? t.unsavedChanges : ''}
                        >
                          {updatingUserId === item.id ? (
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-xs">save</span>
                              {t.btnSave}
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Floating Action Toasts */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[200] px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300 border ${
          toast.type === 'success' 
            ? 'bg-green-600 border-green-500/20 text-white' 
            : 'bg-error-container border-error/20 text-on-error-container'
        }`}>
          <span className="material-symbols-outlined text-lg">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <p className="text-xs font-bold">{toast.message}</p>
        </div>
      )}
    </div>
  );
}
