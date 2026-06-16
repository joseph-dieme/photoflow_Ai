'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { useLanguage } from '@/hooks/useLanguage';

const translations = {
  fr: {
    title: 'Paramètres Studio',
    subtitle: 'Gérez vos identifiants de facturation Wave et personnalisez vos filigranes.',
    studioNameLabel: 'Nom du Photographe / Studio',
    studioNamePlaceholder: 'Ex: Studio Lumière Dakar',
    billingEmailLabel: 'Adresse e-mail de facturation',
    waveIdLabel: 'Identifiant Marchand Wave (API Key)',
    waveIdPlaceholder: 'Ex: wave_merch_key_...',
    waveRequired: 'REQUIS POUR WAVE',
    watermarkLabel: 'Texte de filigrane personnalisé',
    proExclusive: 'PLAN PRO EXCLUSIF',
    watermarkPlaceholder: 'Ex: © Studio Lumière - Interdit à la reproduction',
    watermarkDescPro: "Ce filigrane sera appliqué sur les galeries clients si l'option est activée.",
    watermarkDescFree: "Votre forfait gratuit utilise le filigrane automatique par défaut 'PhotoFlow AI'.",
    saveButton: 'Enregistrer les paramètres',
    yourPlanTitle: 'Votre Forfait',
    yourPlanSubtitle: 'Statut de votre abonnement et quotas de stockage.',
    activePlanLabel: 'Forfait Actif',
    planPro: 'PROFESSIONNEL',
    planFree: 'GRATUIT',
    downgradeButton: 'Repasser en forfait gratuit',
    upgradeButton: 'Activer le forfait Pro (Simulation)',
    // Modals
    modalClose: 'Fermer',
    modalCancel: 'Annuler',
    modalConfirm: 'Confirmer',
    // Settings Saved Modal
    saveSuccessTitle: 'Paramètres Enregistrés !',
    saveSuccessMsg: 'Vos modifications ont été sauvegardées avec succès.',
    saveErrorTitle: 'Erreur',
    saveErrorMsg: 'Une erreur est survenue lors de la mise à jour des paramètres.',
    // Plan Modal
    upgradeConfirmTitle: 'Devenir Membre Pro ?',
    upgradeConfirmMsg: 'Voulez-vous activer la simulation de l\'abonnement immédiat à la formule Pro (12 500 FCFA/mois) ? Vous bénéficierez de 50 Go de stockage et de filigranes personnalisés.',
    upgradeSuccessTitle: 'Forfait Pro Activé !',
    upgradeSuccessMsg: 'Votre compte a été surclassé avec succès.',
    downgradeConfirmTitle: 'Repasser au Forfait Gratuit ?',
    downgradeConfirmMsg: 'Êtes-vous sûr de vouloir repasser à la formule gratuite ? Votre limite de stockage sera ramenée à 1 Go.',
    downgradeSuccessTitle: 'Retour au Gratuit',
    downgradeSuccessMsg: 'Votre abonnement a été réinitialisé au forfait gratuit.',
    // Profile Picture
    profilePictureLabel: 'Photo de profil',
    uploadPhotoBtn: 'Choisir une photo',
    uploadingPhoto: 'Importation en cours...',
    profilePictureDesc: 'Cette photo sera affichée dans la barre de navigation et sur vos documents.',
    // Mobile Money
    mobileMoneyLabel: 'Réseaux Mobile Money acceptés',
    mobileMoneyDesc: 'Sélectionnez un ou plusieurs moyens de paiement mobile que vous acceptez.',
    waveMoney: 'Wave',
    orangeMoney: 'Orange Money',
    freeMoney: 'Free Money',
  },
  en: {
    title: 'Studio Settings',
    subtitle: 'Manage your Wave billing credentials and customize your watermarks.',
    studioNameLabel: 'Photographer / Studio Name',
    studioNamePlaceholder: 'e.g., Studio Lumiere Dakar',
    billingEmailLabel: 'Billing Email Address',
    waveIdLabel: 'Wave Merchant ID (API Key)',
    waveIdPlaceholder: 'e.g., wave_merch_key_...',
    waveRequired: 'REQUIRED FOR WAVE',
    watermarkLabel: 'Custom Watermark Text',
    proExclusive: 'EXCLUSIVE PRO PLAN',
    watermarkPlaceholder: 'e.g., © Studio Lumiere - Reproduction Prohibited',
    watermarkDescPro: 'This watermark will be applied to client galleries if enabled.',
    watermarkDescFree: "Your free plan uses the default automatic watermark 'PhotoFlow AI'.",
    saveButton: 'Save Settings',
    yourPlanTitle: 'Your Plan',
    yourPlanSubtitle: 'Subscription status and storage quotas.',
    activePlanLabel: 'Active Plan',
    planPro: 'PROFESSIONAL',
    planFree: 'FREE',
    downgradeButton: 'Downgrade to Free Plan',
    upgradeButton: 'Activate Pro Plan (Simulation)',
    // Modals
    modalClose: 'Close',
    modalCancel: 'Cancel',
    modalConfirm: 'Confirm',
    // Settings Saved Modal
    saveSuccessTitle: 'Settings Saved!',
    saveSuccessMsg: 'Your changes have been saved successfully.',
    saveErrorTitle: 'Error',
    saveErrorMsg: 'An error occurred while updating the settings.',
    // Plan Modal
    upgradeConfirmTitle: 'Upgrade to Pro?',
    upgradeConfirmMsg: 'Would you like to simulate an immediate upgrade to the Pro plan (12,500 FCFA/month)? You will unlock 50 GB of storage and custom watermarks.',
    upgradeSuccessTitle: 'Pro Plan Activated!',
    upgradeSuccessMsg: 'Your account has been upgraded successfully.',
    downgradeConfirmTitle: 'Downgrade to Free?',
    downgradeConfirmMsg: 'Are you sure you want to downgrade to the Free plan? Your storage limit will be reduced to 1 GB.',
    downgradeSuccessTitle: 'Downgraded to Free',
    downgradeSuccessMsg: 'Your subscription has been reset to the free plan.',
    // Profile Picture
    profilePictureLabel: 'Profile Picture',
    uploadPhotoBtn: 'Choose a Photo',
    uploadingPhoto: 'Uploading...',
    profilePictureDesc: 'This photo will be displayed in the navigation bar and on your documents.',
    // Mobile Money
    mobileMoneyLabel: 'Accepted Mobile Money Networks',
    mobileMoneyDesc: 'Select one or more mobile payment methods that you accept.',
    waveMoney: 'Wave',
    orangeMoney: 'Orange Money',
    freeMoney: 'Free Money',
  }
};

export default function SettingsPage() {
  const router = useRouter();
  const lang = useLanguage();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Settings States
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [waveMerchantId, setWaveMerchantId] = useState('');
  const [customWatermarkUrl, setCustomWatermarkUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [mobileMoney, setMobileMoney] = useState<string[]>([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modal / Alert States
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showSaveError, setShowSaveError] = useState(false);
  const [planActionType, setPlanActionType] = useState<'none' | 'upgrade_confirm' | 'downgrade_confirm' | 'upgrade_success' | 'downgrade_success'>('none');

  const t = translations[lang];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        fetchSettingsData(session.user.id);

        // Check if redirected from a Pro checkout trigger
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          if (params.get('upgrade') === 'true') {
            setPlanActionType('upgrade_confirm');
          } else if (params.get('status') === 'subscribed') {
            setPlanActionType('upgrade_success');
            // Remove query parameter from URL so it doesn't reappear on reload
            router.replace('/dashboard/settings');
            fetchSettingsData(session.user.id);
          }
        }
      }
    });
  }, [router]);
  async function fetchSettingsData(userId: string) {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pf_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setFullName(data.full_name || '');
      setWaveMerchantId(data.wave_merchant_id || '');
      setCustomWatermarkUrl(data.custom_watermark_url || '');
      setAvatarUrl(data.avatar_url || '');
      setMobileMoney(data.mobile_money || []);
    } catch (err) {
      console.error('Error fetching settings details:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('pf_profiles')
        .update({
          full_name: fullName,
          wave_merchant_id: waveMerchantId,
          custom_watermark_url: customWatermarkUrl,
          avatar_url: avatarUrl,
          mobile_money: mobileMoney,
        })
        .eq('id', user.id);

      if (error) throw error;
      setShowSaveSuccess(true);
      fetchSettingsData(user.id);
    } catch (err) {
      console.error('Error updating settings:', err);
      setShowSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        setAvatarUrl(urlData.publicUrl);
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      alert(lang === 'fr' ? "Erreur lors de l'importation de la photo." : "Error uploading profile photo.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleMobileMoneyChange = (provider: string) => {
    setMobileMoney((prev) =>
      prev.includes(provider)
        ? prev.filter((p) => p !== provider)
        : [...prev, provider]
    );
  };

  const triggerUpgradeConfirm = () => {
    setPlanActionType('upgrade_confirm');
  };

  const handleUpgradeExecute = () => {
    if (!user) return;
    setPlanActionType('none');
    router.push(`/checkout/wave?amount=12500&email=${encodeURIComponent(user.email || '')}`);
  };

  const triggerDowngradeConfirm = () => {
    setPlanActionType('downgrade_confirm');
  };

  const handleDowngradeExecute = async () => {
    if (!user) return;
    setPlanActionType('none');
    setSaving(true);
    try {
      const { error } = await supabase
        .from('pf_profiles')
        .update({ plan: 'free', storage_limit: 1073741824 }) // 1GB
        .eq('id', user.id);

      if (error) throw error;
      setPlanActionType('downgrade_success');
      fetchSettingsData(user.id);
    } catch (err) {
      console.error('Error downgrading plan:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-body-md overflow-x-hidden selection:bg-primary-container">
      <Navigation />
      
      <Sidebar activeProjectName="PhotoFlow Settings" />

      <main className="md:ml-[280px] pt-24 px-6 md:px-margin-desktop pb-24 bg-background min-h-screen">
        {/* Header section */}
        <header className="mb-10 border-b border-outline-variant/30 pb-6">
          <h1 className="font-display-lg text-3xl font-bold text-white">{t.title}</h1>
          <p className="text-on-surface-variant text-xs mt-1">{t.subtitle}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main settings form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSaveSettings} className="glass-panel p-8 rounded-2xl border border-outline-variant/30 space-y-6">
              {/* Profile Photo Uploader */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-outline-variant/30">
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-surface-container-highest border border-outline-variant/50 flex items-center justify-center shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-on-surface-variant text-4xl">person</span>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
                    </div>
                  )}
                </div>
                <div className="flex-grow text-center sm:text-left space-y-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">{t.profilePictureLabel}</h3>
                  <p className="text-[11px] text-on-surface-variant max-w-sm leading-relaxed">{t.profilePictureDesc}</p>
                  <div className="flex justify-center sm:justify-start gap-2">
                    <label className="px-4 py-2 bg-surface-container-highest border border-outline-variant hover:border-primary text-xs font-semibold text-white rounded-xl cursor-pointer transition-all flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                      {uploadingAvatar ? t.uploadingPhoto : t.uploadPhotoBtn}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={uploadingAvatar}
                      />
                    </label>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="px-3 py-2 bg-transparent hover:bg-error/10 border border-outline-variant hover:border-error text-xs font-semibold text-on-surface-variant hover:text-error rounded-xl transition-all flex items-center justify-center cursor-pointer"
                        title="Remove Photo"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t.studioNameLabel}</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.studioNamePlaceholder}
                  className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t.billingEmailLabel}</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm outline-none text-on-surface-variant/70 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t.waveIdLabel}</label>
                  <span className="text-[10px] text-primary font-bold">{t.waveRequired}</span>
                </div>
                <input
                  type="text"
                  value={waveMerchantId}
                  onChange={(e) => setWaveMerchantId(e.target.value)}
                  placeholder={t.waveIdPlaceholder}
                  className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors font-mono"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t.watermarkLabel}</label>
                  <span className="text-[10px] text-on-surface-variant">{t.proExclusive}</span>
                </div>
                <input
                  type="text"
                  value={customWatermarkUrl}
                  onChange={(e) => setCustomWatermarkUrl(e.target.value)}
                  placeholder={t.watermarkPlaceholder}
                  disabled={profile?.plan !== 'pro'}
                  className={`w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${
                    profile?.plan !== 'pro' ? 'cursor-not-allowed bg-surface-container/40 border-outline-variant/20 text-on-surface-variant/50' : ''
                  }`}
                />
                <p className="text-[10px] text-on-surface-variant mt-1">
                  {profile?.plan === 'pro' 
                    ? t.watermarkDescPro
                    : t.watermarkDescFree}
                </p>
              </div>

              {/* Mobile Money Selection */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t.mobileMoneyLabel}</label>
                  <span className="text-[10px] text-on-surface-variant mt-0.5">{t.mobileMoneyDesc}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'wave', label: t.waveMoney, icon: 'tsunami', color: 'text-sky-400 bg-sky-400/10' },
                    { id: 'orange_money', label: t.orangeMoney, icon: 'payments', color: 'text-orange-500 bg-orange-500/10' },
                    { id: 'free_money', label: t.freeMoney, icon: 'wallet', color: 'text-red-500 bg-red-500/10' }
                  ].map((provider) => {
                    const isSelected = mobileMoney.includes(provider.id);
                    return (
                      <div
                        key={provider.id}
                        onClick={() => handleMobileMoneyChange(provider.id)}
                        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-primary/10 border-primary text-white font-semibold'
                            : 'bg-surface-container border-outline-variant/50 text-on-surface-variant hover:text-on-surface hover:border-outline-variant'
                        }`}
                      >
                        <span className={`material-symbols-outlined rounded-lg p-1.5 text-[20px] ${provider.color}`}>
                          {provider.icon}
                        </span>
                        <div className="flex-grow text-xs select-none">{provider.label}</div>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isSelected ? 'bg-primary border-primary text-on-primary' : 'border-outline-variant'
                        }`}>
                          {isSelected && <span className="material-symbols-outlined text-[14px] font-bold">check</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-primary text-on-primary font-semibold text-xs font-label-md rounded-xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                {saving ? (
                  <span className="w-5 h-5 rounded-full border-2 border-on-primary/30 border-t-on-primary animate-spin"></span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    {t.saveButton}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Account status info sidebar panel */}
          <div className="space-y-8">
            <section className="glass-panel p-6 rounded-2xl border border-outline-variant/30 space-y-6">
              <div>
                <h3 className="font-headline-md text-lg font-bold text-white mb-1">{t.yourPlanTitle}</h3>
                <p className="text-xs text-on-surface-variant">{t.yourPlanSubtitle}</p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{t.activePlanLabel}</p>
                  <p className="text-lg font-black text-primary uppercase mt-1">
                    {profile?.plan === 'pro' ? t.planPro : t.planFree}
                  </p>
                </div>
                <span className="material-symbols-outlined text-primary text-3xl">
                  {profile?.plan === 'pro' ? 'workspace_premium' : 'lock_open'}
                </span>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => router.push('/checkout/select-plan')}
                  className="w-full py-2.5 bg-primary-container text-on-primary-container hover:brightness-110 rounded-xl text-xs font-bold transition-all shadow cursor-pointer text-center"
                >
                  {lang === 'fr' ? 'Gérer mon forfait' : 'Manage my plan'}
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>

      <MobileNav />

      {/* Save Success Modal */}
      {showSaveSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline-variant p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl animate-in fade-in scale-in duration-200">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 border border-primary/30">
              <span className="material-symbols-outlined text-primary text-2xl">check_circle</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{t.saveSuccessTitle}</h3>
            <p className="text-xs text-on-surface-variant mb-6">{t.saveSuccessMsg}</p>
            <button
              onClick={() => setShowSaveSuccess(false)}
              className="w-full py-2.5 bg-primary text-on-primary font-semibold text-xs rounded-xl hover:brightness-110 active:scale-98 transition-all cursor-pointer"
            >
              {t.modalClose}
            </button>
          </div>
        </div>
      )}

      {/* Save Error Modal */}
      {showSaveError && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline-variant p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl animate-in fade-in scale-in duration-200">
            <div className="w-12 h-12 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-4 border border-error/30">
              <span className="material-symbols-outlined text-error text-2xl">error</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{t.saveErrorTitle}</h3>
            <p className="text-xs text-on-surface-variant mb-6">{t.saveErrorMsg}</p>
            <button
              onClick={() => setShowSaveError(false)}
              className="w-full py-2.5 bg-surface-container-highest border border-outline-variant text-on-surface font-semibold text-xs rounded-xl hover:bg-surface-container-high active:scale-98 transition-all cursor-pointer"
            >
              {t.modalClose}
            </button>
          </div>
        </div>
      )}

      {/* Plan Action Confirmation Modal */}
      {(planActionType === 'upgrade_confirm' || planActionType === 'downgrade_confirm') && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline-variant p-6 rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in scale-in duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/30">
                <span className="material-symbols-outlined text-primary">
                  {planActionType === 'upgrade_confirm' ? 'workspace_premium' : 'arrow_downward'}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {planActionType === 'upgrade_confirm' ? t.upgradeConfirmTitle : t.downgradeConfirmTitle}
                </h3>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  {planActionType === 'upgrade_confirm' ? t.upgradeConfirmMsg : t.downgradeConfirmMsg}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setPlanActionType('none')}
                className="flex-1 py-2.5 border border-outline-variant text-on-surface hover:bg-surface-container-highest rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                {t.modalCancel}
              </button>
              <button
                onClick={planActionType === 'upgrade_confirm' ? handleUpgradeExecute : handleDowngradeExecute}
                className="flex-1 py-2.5 bg-primary text-on-primary hover:brightness-110 rounded-xl text-xs font-bold transition-all shadow cursor-pointer"
              >
                {t.modalConfirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Success Toast/Modal */}
      {(planActionType === 'upgrade_success' || planActionType === 'downgrade_success') && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline-variant p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl animate-in fade-in scale-in duration-200">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 border border-primary/30">
              <span className="material-symbols-outlined text-primary text-2xl">celebration</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {planActionType === 'upgrade_success' ? t.upgradeSuccessTitle : t.downgradeSuccessTitle}
            </h3>
            <p className="text-xs text-on-surface-variant mb-6">
              {planActionType === 'upgrade_success' ? t.upgradeSuccessMsg : t.downgradeSuccessMsg}
            </p>
            <button
              onClick={() => setPlanActionType('none')}
              className="w-full py-2.5 bg-primary text-on-primary font-semibold text-xs rounded-xl hover:brightness-110 active:scale-98 transition-all cursor-pointer"
            >
              {t.modalClose}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
