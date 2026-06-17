'use client';

import React, { useState, useEffect, useRef } from 'react';
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
    // Promo Code additions
    tabArtists: 'Artistes',
    tabPromo: 'Codes Promo',
    btnCreatePromo: 'Créer un Code Promo',
    colPromoCode: 'Code',
    colPromoValue: 'Valeur / Type',
    colPromoUses: 'Utilisations',
    colPromoExpiry: "Date d'expiration",
    colPromoStatus: 'Statut',
    promoTypePercent: 'Pourcentage (%)',
    promoTypeFixed: 'Montant Fixe (FCFA)',
    promoFormCode: 'Code Promo (ex: REDUC20)',
    promoFormValue: 'Valeur de la réduction',
    promoFormLimit: "Limite d'utilisations (Optionnel)",
    promoFormExpiry: "Date d'expiration (Optionnel)",
    promoStatusActive: 'Actif',
    promoStatusInactive: 'Inactif',
    promoStatusExpired: 'Expiré',
    promoUsesUnlimited: 'Illimité',
    promoCreateSuccess: 'Code promo créé avec succès !',
    promoCreateError: 'Erreur lors de la création du code.',
    promoToggleSuccess: 'Statut du code mis à jour.',
    promoDeleteSuccess: 'Code promo supprimé.',
    promoDeleteConfirm: 'Voulez-vous supprimer ce code promo ?',
    // Support additions
    tabSupport: 'Support Clients',
    chatActive: 'Conversation avec',
    chatPlaceholder: 'Répondre à cet utilisateur...',
    noChats: 'Aucune conversation de support pour le moment.',
    online: 'En ligne',
    adminLabel: 'Support Admin',
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
    // Promo Code additions
    tabArtists: 'Artists',
    tabPromo: 'Promo Codes',
    btnCreatePromo: 'Create Promo Code',
    colPromoCode: 'Code',
    colPromoValue: 'Value / Type',
    colPromoUses: 'Uses',
    colPromoExpiry: 'Expiry Date',
    colPromoStatus: 'Status',
    promoTypePercent: 'Percentage (%)',
    promoTypeFixed: 'Fixed Amount (FCFA)',
    promoFormCode: 'Promo Code (e.g., REDUC20)',
    promoFormValue: 'Discount Value',
    promoFormLimit: 'Usage Limit (Optional)',
    promoFormExpiry: 'Expiry Date (Optional)',
    promoStatusActive: 'Active',
    promoStatusInactive: 'Inactive',
    promoStatusExpired: 'Expired',
    promoUsesUnlimited: 'Unlimited',
    promoCreateSuccess: 'Promo code created successfully!',
    promoCreateError: 'Error creating code.',
    promoToggleSuccess: 'Code status updated.',
    promoDeleteSuccess: 'Promo code deleted.',
    promoDeleteConfirm: 'Are you sure you want to delete this promo code?',
    // Support additions
    tabSupport: 'Client Support',
    chatActive: 'Chat with',
    chatPlaceholder: 'Reply to this user...',
    noChats: 'No support conversations yet.',
    online: 'Online',
    adminLabel: 'Admin Support',
  }
};

export default function AdminPage() {
  const router = useRouter();
  const lang = useLanguage();
  const t = translations[lang] || translations.fr;
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'artists' | 'promo' | 'support'>('artists');
  
  // Support Chat States
  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
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
  
  // Promo Code States
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [isCreatingPromo, setIsCreatingPromo] = useState(false);
  const [savingPromo, setSavingPromo] = useState(false);
  
  // New Promo Code Form States
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoType, setNewPromoType] = useState<'percent' | 'fixed'>('percent');
  const [newPromoValue, setNewPromoValue] = useState('');
  const [newPromoMaxUses, setNewPromoMaxUses] = useState('');
  const [newPromoExpiresAt, setNewPromoExpiresAt] = useState('');

  // UI Indicators
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        try {
          const { data: profile, error } = await supabase
            .from('pf_profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();

          if (error || !profile?.is_admin) {
            setIsAdmin(false);
            setLoading(false);
          } else {
            setIsAdmin(true);
            fetchPlatformMetrics();
            fetchPromoCodes();
            fetchSupportMessages();
          }
        } catch (err) {
          console.error('Error verifying admin status:', err);
          setIsAdmin(false);
          setLoading(false);
        }
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

  async function fetchPromoCodes() {
    try {
      const { data, error } = await supabase.rpc('admin_get_promo_codes');
      if (error) throw error;
      setPromoCodes(data || []);
    } catch (err) {
      console.error('Error fetching promo codes:', err);
    }
  }

  async function fetchSupportMessages() {
    try {
      const { data, error } = await supabase
        .from('pf_support_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSupportMessages(data || []);
    } catch (err) {
      console.error('Error fetching support messages:', err);
    }
  }

  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel('admin_support_chats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pf_support_messages',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSupportMessages((prev) => {
              if (prev.some((m) => m.id === payload.new.id)) return prev;
              return [payload.new, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            setSupportMessages((prev) =>
              prev.map((msg) => (msg.id === payload.new.id ? payload.new : msg))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [supportMessages, selectedUserId]);

  const markConversationAsRead = async (targetUserId: string) => {
    try {
      await supabase
        .from('pf_support_messages')
        .update({ is_read: true })
        .eq('user_id', targetUserId)
        .eq('sender_id', targetUserId)
        .eq('is_read', false);

      setSupportMessages((prev) =>
        prev.map((msg) =>
          msg.user_id === targetUserId && msg.sender_id === targetUserId
            ? { ...msg, is_read: true }
            : msg
        )
      );
    } catch (err) {
      console.error('Failed to mark conversation as read:', err);
    }
  };

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !selectedUserId) return;
    setSendingReply(true);

    const replyText = adminReplyText.trim();
    setAdminReplyText('');

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('No admin user');

      const { data, error } = await supabase
        .from('pf_support_messages')
        .insert({
          user_id: selectedUserId,
          sender_id: currentUser.id,
          content: replyText,
        })
        .select()
        .single();

      if (error) throw error;
      
      setSupportMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [data, ...prev];
      });
    } catch (err) {
      console.error('Failed to send admin reply:', err);
      showToast('error', lang === 'fr' ? 'Erreur lors de l’envoi de la réponse.' : 'Failed to send reply.');
      setAdminReplyText(replyText);
    } finally {
      setSendingReply(false);
    }
  };

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

  // Promo Code handlers
  const handleCreatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode || !newPromoValue) return;
    setSavingPromo(true);

    try {
      const { error } = await supabase.rpc('admin_create_promo_code', {
        code_val: newPromoCode.trim().toUpperCase(),
        type_val: newPromoType,
        value_val: parseInt(newPromoValue),
        max_uses_val: newPromoMaxUses ? parseInt(newPromoMaxUses) : null,
        expires_at_val: newPromoExpiresAt ? new Date(newPromoExpiresAt).toISOString() : null,
      });

      if (error) throw error;

      showToast('success', t.promoCreateSuccess);
      setNewPromoCode('');
      setNewPromoType('percent');
      setNewPromoValue('');
      setNewPromoMaxUses('');
      setNewPromoExpiresAt('');
      setIsCreatingPromo(false);
      fetchPromoCodes();
    } catch (err) {
      console.error('Error creating promo code:', err);
      showToast('error', t.promoCreateError);
    } finally {
      setSavingPromo(false);
    }
  };

  const handleTogglePromoCode = async (codeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.rpc('admin_toggle_promo_code', {
        code_uuid: codeId,
        new_status: !currentStatus,
      });
      if (error) throw error;
      showToast('success', t.promoToggleSuccess);
      fetchPromoCodes();
    } catch (err) {
      console.error('Error toggling code status:', err);
      showToast('error', t.saveError);
    }
  };

  const handleDeletePromoCode = async (codeId: string) => {
    if (!window.confirm(t.promoDeleteConfirm)) return;
    try {
      const { error } = await supabase.rpc('admin_delete_promo_code', {
        code_uuid: codeId,
      });
      if (error) throw error;
      showToast('success', t.promoDeleteSuccess);
      fetchPromoCodes();
    } catch (err) {
      console.error('Error deleting promo code:', err);
      showToast('error', t.saveError);
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
        <header className="mb-8 border-b border-outline-variant/30 pb-6 flex justify-between items-center">
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

        {/* Tabbed Navigation */}
        <div className="flex border-b border-outline-variant/30 mb-8 gap-6">
          <button
            onClick={() => setActiveTab('artists')}
            className={`pb-4 text-xs font-bold tracking-widest uppercase transition-all cursor-pointer ${
              activeTab === 'artists'
                ? 'text-primary border-b-2 border-primary'
                : 'text-on-surface-variant hover:text-white'
            }`}
          >
            {t.tabArtists}
          </button>
          <button
            onClick={() => setActiveTab('promo')}
            className={`pb-4 text-xs font-bold tracking-widest uppercase transition-all cursor-pointer ${
              activeTab === 'promo'
                ? 'text-primary border-b-2 border-primary'
                : 'text-on-surface-variant hover:text-white'
            }`}
          >
            {t.tabPromo}
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`pb-4 text-xs font-bold tracking-widest uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'support'
                ? 'text-primary border-b-2 border-primary'
                : 'text-on-surface-variant hover:text-white'
            }`}
          >
            {t.tabSupport}
            {(() => {
              const unreadCount = supportMessages.filter(m => m.sender_id === m.user_id && !m.is_read).length;
              if (unreadCount > 0) {
                return (
                  <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                    {unreadCount}
                  </span>
                );
              }
              return null;
            })()}
          </button>
        </div>

        {/* Artists Directory Tab */}
        {activeTab === 'artists' && (
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
        )}

        {/* Promo Codes Directory Tab */}
        {activeTab === 'promo' && (
          <div className="space-y-6">
            {/* Create Promo Code form */}
            <section className="glass-panel border border-outline-variant/30 rounded-2xl overflow-hidden">
              <button
                onClick={() => setIsCreatingPromo(!isCreatingPromo)}
                className="w-full p-4 bg-surface-container-high hover:bg-surface-container-highest flex justify-between items-center text-xs font-bold text-white uppercase tracking-wider cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">local_offer</span>
                  {t.btnCreatePromo}
                </span>
                <span className="material-symbols-outlined">
                  {isCreatingPromo ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                </span>
              </button>

              {isCreatingPromo && (
                <form onSubmit={handleCreatePromoCode} className="p-6 border-t border-outline-variant/30 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{t.promoFormCode}</label>
                      <input
                        type="text"
                        required
                        value={newPromoCode}
                        onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                        placeholder="Ex: SPECIAL50"
                        className="w-full bg-background border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-xs outline-none text-white font-mono uppercase"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Type de remise</label>
                      <select
                        value={newPromoType}
                        onChange={(e) => setNewPromoType(e.target.value as 'percent' | 'fixed')}
                        className="w-full bg-background border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-xs outline-none text-white cursor-pointer font-bold"
                      >
                        <option value="percent">{t.promoTypePercent}</option>
                        <option value="fixed">{t.promoTypeFixed}</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{t.promoFormValue}</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={newPromoValue}
                        onChange={(e) => setNewPromoValue(e.target.value)}
                        placeholder={newPromoType === 'percent' ? 'Ex: 20 (%)' : 'Ex: 5000 (FCFA)'}
                        className="w-full bg-background border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-xs outline-none text-white font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{t.promoFormLimit}</label>
                      <input
                        type="number"
                        min={1}
                        value={newPromoMaxUses}
                        onChange={(e) => setNewPromoMaxUses(e.target.value)}
                        placeholder="Ex: 100 (laissez vide pour illimité)"
                        className="w-full bg-background border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-xs outline-none text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{t.promoFormExpiry}</label>
                      <input
                        type="date"
                        value={newPromoExpiresAt}
                        onChange={(e) => setNewPromoExpiresAt(e.target.value)}
                        className="w-full bg-background border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-xs outline-none text-white cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={savingPromo}
                      className="px-6 py-2.5 bg-primary text-on-primary font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 active:scale-98 transition-all flex items-center gap-1.5 shadow-lg cursor-pointer"
                    >
                      {savingPromo ? (
                        <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></span>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-xs">add_circle</span>
                          {t.btnCreatePromo}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </section>

            {/* Promo codes table */}
            <section className="glass-panel border border-outline-variant/30 rounded-2xl overflow-hidden">
              <div className="p-4 bg-surface-container-high border-b border-outline-variant/50">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">{t.tabPromo}</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/30 text-on-surface-variant uppercase tracking-wider font-bold bg-surface-container-low/30">
                      <th className="p-4">{t.colPromoCode}</th>
                      <th className="p-4">{t.colPromoValue}</th>
                      <th className="p-4">{t.colPromoUses}</th>
                      <th className="p-4">{t.colPromoExpiry}</th>
                      <th className="p-4">{t.colPromoStatus}</th>
                      <th className="p-4 text-center">{t.colActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 font-medium text-on-surface-variant">
                    {promoCodes.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                          {lang === 'fr' ? 'Aucun code promo créé.' : 'No promo codes created.'}
                        </td>
                      </tr>
                    ) : (
                      promoCodes.map((item) => {
                        const isExpired = item.expires_at && new Date(item.expires_at) < new Date();
                        const isLimitReached = item.max_uses && item.uses_count >= item.max_uses;
                        const status = !item.is_active 
                          ? 'inactive' 
                          : (isExpired || isLimitReached) ? 'expired' : 'active';
                        
                        return (
                          <tr key={item.id} className="hover:bg-surface-container/20 transition-colors">
                            {/* Code */}
                            <td className="p-4 font-mono font-bold text-white text-sm">{item.code}</td>

                            {/* Discount Value */}
                            <td className="p-4">
                              <span className="font-bold text-zinc-200">
                                {item.discount_type === 'percent' 
                                  ? `${item.discount_value}%` 
                                  : `${item.discount_value.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} FCFA`
                                }
                              </span>
                            </td>

                            {/* Uses */}
                            <td className="p-4 font-semibold text-zinc-300">
                              {item.uses_count} <span className="text-zinc-500">/</span> {item.max_uses || t.promoUsesUnlimited}
                            </td>

                            {/* Expiry */}
                            <td className="p-4 text-zinc-400 font-semibold">
                              {item.expires_at 
                                ? new Date(item.expires_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US') 
                                : t.promoUsesUnlimited
                              }
                            </td>

                            {/* Status */}
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                status === 'active' 
                                  ? 'bg-green-600/10 text-green-400' 
                                  : status === 'expired' 
                                    ? 'bg-amber-600/10 text-amber-400' 
                                    : 'bg-zinc-800 text-zinc-500'
                              }`}>
                                {status === 'active' 
                                  ? t.promoStatusActive 
                                  : status === 'expired' 
                                    ? t.promoStatusExpired 
                                    : t.promoStatusInactive
                                }
                              </span>
                            </td>

                            {/* Actions (Toggle status, Delete) */}
                            <td className="p-4">
                              <div className="flex gap-3 justify-center items-center">
                                {/* Toggle Active Button */}
                                <button
                                  onClick={() => handleTogglePromoCode(item.id, item.is_active)}
                                  className={`px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer border transition-all ${
                                    item.is_active
                                      ? 'bg-zinc-850 hover:bg-zinc-800 border-zinc-700/60 text-zinc-400 hover:text-white'
                                      : 'bg-green-600/15 border-green-500/20 text-green-400 hover:brightness-110 shadow-sm shadow-green-500/5'
                                  }`}
                                  title={item.is_active ? 'Désactiver' : 'Activer'}
                                >
                                  {item.is_active ? 'Disable' : 'Enable'}
                                </button>

                                {/* Delete Button */}
                                <button
                                  onClick={() => handleDeletePromoCode(item.id)}
                                  className="p-1.5 bg-surface-container-highest rounded border border-outline-variant/30 hover:border-error text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                                  title="Supprimer"
                                >
                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* Support Chat Directory Tab */}
        {activeTab === 'support' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Conversations List */}
            <div className="lg:col-span-1 glass-panel border border-outline-variant/30 rounded-2xl flex flex-col overflow-hidden">
              <div className="p-4 bg-surface-container-high border-b border-outline-variant/50">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Conversations</h3>
              </div>
              
              <div className="flex-grow overflow-y-auto divide-y divide-outline-variant/10">
                {(() => {
                  const chatsMap = new Map<string, any>();
                  
                  supportMessages.forEach((msg) => {
                    if (!chatsMap.has(msg.user_id)) {
                      chatsMap.set(msg.user_id, {
                        userId: msg.user_id,
                        latestMessage: msg,
                        unreadCount: 0,
                      });
                    }
                    if (msg.sender_id === msg.user_id && !msg.is_read) {
                      const chat = chatsMap.get(msg.user_id);
                      chat.unreadCount += 1;
                    }
                  });

                  const chats = Array.from(chatsMap.values());

                  if (chats.length === 0) {
                    return (
                      <div className="p-8 text-center text-on-surface-variant text-xs font-medium">
                        {t.noChats}
                      </div>
                    );
                  }

                  return chats.map((chat) => {
                    const profile = users.find((u) => u.id === chat.userId) || {
                      full_name: 'Photographe',
                      email: 'N/A',
                    };
                    const isSelected = selectedUserId === chat.userId;
                    const latestText = chat.latestMessage.content;
                    const time = new Date(chat.latestMessage.created_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <button
                        key={chat.userId}
                        onClick={() => {
                          setSelectedUserId(chat.userId);
                          markConversationAsRead(chat.userId);
                        }}
                        className={`w-full text-left p-4 hover:bg-surface-container/20 transition-all flex justify-between items-start gap-3 border-l-4 ${
                          isSelected
                            ? 'bg-surface-container/30 border-primary'
                            : 'border-transparent'
                        }`}
                      >
                        <div className="flex-grow truncate flex flex-col">
                          <h4 className="font-semibold text-xs text-white truncate">{profile.full_name}</h4>
                          <span className="block text-[10px] text-zinc-500 font-mono mt-0.5 truncate">{profile.email}</span>
                          <p className="text-[11px] text-zinc-450 mt-2 truncate font-medium">{latestText}</p>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <span className="text-[9px] text-zinc-500 font-mono">{time}</span>
                          {chat.unreadCount > 0 && (
                            <span className="bg-primary text-on-primary text-[9px] font-bold px-2 py-0.5 rounded-full mt-2">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Chat Thread Panel */}
            <div className="lg:col-span-2 glass-panel border border-outline-variant/30 rounded-2xl flex flex-col overflow-hidden">
              {selectedUserId ? (
                (() => {
                  const targetUser = users.find((u) => u.id === selectedUserId) || {
                    full_name: 'Photographe',
                    email: 'N/A',
                  };
                  
                  const threadMessages = [...supportMessages]
                    .filter((m) => m.user_id === selectedUserId)
                    .reverse();

                  return (
                    <>
                      {/* Thread Header */}
                      <div className="p-4 bg-surface-container-high border-b border-outline-variant/50 flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                            {t.chatActive} {targetUser.full_name}
                          </h3>
                          <span className="text-[9px] text-zinc-400 font-mono mt-0.5 block">{targetUser.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">{t.online}</span>
                        </div>
                      </div>

                      {/* Messages list */}
                      <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-background/50 flex flex-col">
                        {threadMessages.map((msg) => {
                          const isOwn = msg.sender_id !== selectedUserId;
                          const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                          return (
                            <div
                              key={msg.id}
                              className={`flex gap-2 max-w-[85%] ${
                                isOwn ? 'self-end flex-row-reverse ml-auto' : 'self-start mr-auto'
                              }`}
                            >
                              {!isOwn && (
                                <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center border border-outline-variant/30 flex-shrink-0">
                                  <span className="material-symbols-outlined text-sm text-primary">person</span>
                                </div>
                              )}
                              <div>
                                <div
                                  className={`text-xs p-3 rounded-2xl shadow-sm leading-relaxed break-words whitespace-pre-wrap ${
                                    isOwn
                                      ? 'bg-gradient-to-br from-primary to-primary-container text-white rounded-tr-none'
                                      : 'bg-zinc-800 border border-outline-variant/20 text-on-surface rounded-tl-none'
                                  }`}
                                >
                                  {msg.content}
                                </div>
                                <span className={`block text-[9px] text-zinc-500 font-mono mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                                  {time} {isOwn && msg.is_read && <span className="text-primary ml-1 font-semibold">✓ Lu</span>}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Reply form */}
                      <form onSubmit={handleSendAdminReply} className="p-3 border-t border-outline-variant/30 bg-surface-container-low/50 flex gap-2 items-center">
                        <input
                          type="text"
                          value={adminReplyText}
                          onChange={(e) => setAdminReplyText(e.target.value)}
                          placeholder={t.chatPlaceholder}
                          className="flex-grow bg-background border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-xs outline-none text-white transition-all"
                        />
                        <button
                          type="submit"
                          disabled={!adminReplyText.trim() || sendingReply}
                          className={`p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                            adminReplyText.trim()
                              ? 'bg-primary text-white hover:brightness-110 active:scale-95 shadow-md shadow-primary/20'
                              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                          }`}
                        >
                          {sendingReply ? (
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          ) : (
                            <span className="material-symbols-outlined text-sm">send</span>
                          )}
                        </button>
                      </form>
                    </>
                  );
                })()
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-6 text-on-surface-variant my-auto">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-3 font-light animate-pulse">forum</span>
                  <p className="text-xs font-semibold">Sélectionnez une conversation pour commencer à échanger</p>
                </div>
              )}
            </div>
          </div>
        )}
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
