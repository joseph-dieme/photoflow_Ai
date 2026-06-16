'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import { useLanguage } from '@/hooks/useLanguage';

const translations = {
  fr: {
    title: 'Choisissez votre forfait',
    subtitle: 'Propulsez votre studio photo avec les outils professionnels PhotoFlow AI.',
    freeTitle: 'Plan Gratuit',
    freeDesc: 'Pour les photographes qui débutent sur la plateforme.',
    freeStorage: '1 Go de stockage cloud',
    freeWatermark: 'Filigrane automatique PhotoFlow',
    freePrice: '0 FCFA',
    freePeriod: '/ mois',
    freeCTAActive: 'Votre forfait actuel',
    freeCTASelect: 'Sélectionner le Plan Gratuit',
    proTitle: 'Plan Professionnel',
    proDesc: 'Débloquez tout le potentiel de PhotoFlow pour vos clients.',
    proStorage: '50 Go de stockage cloud',
    proWatermark: 'Filigrane 100% personnalisé',
    proCameraRaw: 'Outils de retouche avancés Camera Raw',
    proSharing: 'Partage WhatsApp instantané',
    proPrice: '12 500 FCFA',
    proPeriod: '/ mois',
    proCTAActive: 'Votre forfait actuel',
    proCTASelect: 'Choisir le Plan Pro',
    paymentModalTitle: 'Mode de paiement',
    paymentModalDesc: 'Sélectionnez votre moyen de paiement pour activer PhotoFlow Pro.',
    payWave: 'Payer via Wave Mobile Money',
    payCard: 'Payer par Carte Bancaire',
    modalCancel: 'Annuler',
    downgradeConfirmTitle: 'Repasser au forfait gratuit ?',
    downgradeConfirmDesc: 'Votre limite de stockage sera ramenée à 1 Go. Êtes-vous sûr de vouloir continuer ?',
    confirmBtn: 'Confirmer',
    loading: 'Chargement des forfaits...',
    saving: 'Mise à jour en cours...'
  },
  en: {
    title: 'Choose Your Plan',
    subtitle: 'Power up your photography studio with PhotoFlow AI professional tools.',
    freeTitle: 'Free Plan',
    freeDesc: 'For photographers starting out on the platform.',
    freeStorage: '1 GB cloud storage',
    freeWatermark: 'PhotoFlow automatic watermark',
    freePrice: '0 FCFA',
    freePeriod: '/ month',
    freeCTAActive: 'Your current plan',
    freeCTASelect: 'Select Free Plan',
    proTitle: 'Professional Plan',
    proDesc: 'Unlock the full power of PhotoFlow for your clients.',
    proStorage: '50 GB cloud storage',
    proWatermark: '100% Custom watermark',
    proCameraRaw: 'Advanced Camera Raw editing tools',
    proSharing: 'Instant WhatsApp sharing',
    proPrice: '12,500 FCFA',
    proPeriod: '/ month',
    proCTAActive: 'Your current plan',
    proCTASelect: 'Choose Pro Plan',
    paymentModalTitle: 'Payment Method',
    paymentModalDesc: 'Select your preferred payment method to activate PhotoFlow Pro.',
    payWave: 'Pay via Wave Mobile Money',
    payCard: 'Pay with Credit Card',
    modalCancel: 'Cancel',
    downgradeConfirmTitle: 'Downgrade to Free Plan?',
    downgradeConfirmDesc: 'Your storage limit will be reduced to 1 GB. Are you sure you want to continue?',
    confirmBtn: 'Confirm',
    loading: 'Loading plans...',
    saving: 'Updating...'
  }
};

export default function SelectPlanPage() {
  const router = useRouter();
  const lang = useLanguage();
  const t = translations[lang] || translations.fr;
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });
  }, [router]);

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('pf_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectFree = () => {
    if (profile?.plan === 'free') return;
    setShowDowngradeModal(true);
  };

  const handleConfirmDowngrade = async () => {
    if (!user) return;
    setShowDowngradeModal(false);
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('pf_profiles')
        .update({ plan: 'free', storage_limit: 1073741824 }) // 1GB in bytes
        .eq('id', user.id);
      if (error) throw error;
      router.push('/dashboard');
    } catch (err) {
      console.error('Error downgrading:', err);
      alert('Error updating plan');
      setUpdating(false);
    }
  };

  const handleSelectPro = () => {
    if (profile?.plan === 'pro') return;
    setShowPaymentModal(true);
  };

  const triggerPaymentRoute = (method: 'wave' | 'card') => {
    if (!user) return;
    setShowPaymentModal(false);
    if (method === 'wave') {
      router.push(`/checkout/wave?amount=12500&email=${encodeURIComponent(user.email || '')}`);
    } else {
      router.push(`/checkout/card?amount=12500&email=${encodeURIComponent(user.email || '')}`);
    }
  };

  if (loading || updating) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto"></div>
          <p className="text-xs text-on-surface-variant">{updating ? t.saving : t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-body-md overflow-x-hidden hero-glow">
      <Navigation />

      <main className="max-w-4xl mx-auto pt-24 px-6 pb-24 w-full flex-grow flex flex-col justify-center">
        <div className="text-center mb-12">
          <h1 className="font-display-lg text-3xl md:text-4xl font-black text-white mb-3">{t.title}</h1>
          <p className="text-on-surface-variant text-xs md:text-sm max-w-lg mx-auto">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-3xl mx-auto w-full">
          {/* Free Plan Card */}
          <div className={`glass-card p-8 rounded-3xl border flex flex-col justify-between transition-all duration-300 relative ${
            profile?.plan === 'free' 
              ? 'border-primary/50 shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.1)]' 
              : 'border-outline-variant/30 hover:border-outline-variant/70'
          }`}>
            {profile?.plan === 'free' && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                Actif
              </span>
            )}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{t.freeTitle}</h3>
                <p className="text-on-surface-variant text-xs leading-relaxed">{t.freeDesc}</p>
              </div>

              <div className="flex items-baseline gap-1.5 py-4 border-y border-outline-variant/15">
                <span className="text-3xl font-black text-white">{t.freePrice}</span>
                <span className="text-xs text-on-surface-variant">{t.freePeriod}</span>
              </div>

              <ul className="space-y-3.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                  <span>{t.freeStorage}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                  <span>{t.freeWatermark}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleSelectFree}
              disabled={profile?.plan === 'free'}
              className={`w-full mt-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                profile?.plan === 'free'
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                  : 'bg-surface-container-high border border-outline-variant hover:bg-surface-container-highest text-white'
              }`}
            >
              {profile?.plan === 'free' ? t.freeCTAActive : t.freeCTASelect}
            </button>
          </div>

          {/* Pro Plan Card */}
          <div className={`glass-card p-8 rounded-3xl border flex flex-col justify-between transition-all duration-300 relative ${
            profile?.plan === 'pro' 
              ? 'border-primary/50 shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.1)]' 
              : 'border-outline-variant/30 hover:border-outline-variant/70 shadow-2xl'
          }`}>
            {profile?.plan === 'pro' && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                Actif
              </span>
            )}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold text-white">{t.proTitle}</h3>
                  <span className="text-[9px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Recommandé
                  </span>
                </div>
                <p className="text-on-surface-variant text-xs leading-relaxed">{t.proDesc}</p>
              </div>

              <div className="flex items-baseline gap-1.5 py-4 border-y border-outline-variant/15">
                <span className="text-3xl font-black text-primary">{t.proPrice}</span>
                <span className="text-xs text-on-surface-variant">{t.proPeriod}</span>
              </div>

              <ul className="space-y-3.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                  <span>{t.proStorage}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                  <span>{t.proWatermark}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                  <span>{t.proCameraRaw}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                  <span>{t.proSharing}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleSelectPro}
              disabled={profile?.plan === 'pro'}
              className={`w-full mt-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                profile?.plan === 'pro'
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                  : 'bg-primary text-on-primary hover:brightness-110 shadow-lg shadow-primary/20'
              }`}
            >
              {profile?.plan === 'pro' ? t.proCTAActive : t.proCTASelect}
            </button>
          </div>
        </div>
      </main>

      {/* Payment Selection Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline-variant p-6 rounded-2xl max-w-sm w-full shadow-2xl animate-in fade-in scale-in duration-200">
            <h3 className="text-lg font-bold text-white mb-2">{t.paymentModalTitle}</h3>
            <p className="text-xs text-on-surface-variant mb-6">{t.paymentModalDesc}</p>
            
            <div className="space-y-3.5 mb-6">
              <button
                onClick={() => triggerPaymentRoute('wave')}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">phone_iphone</span>
                {t.payWave}
              </button>
              <button
                onClick={() => triggerPaymentRoute('card')}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-750 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-zinc-700/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">credit_card</span>
                {t.payCard}
              </button>
            </div>

            <button
              onClick={() => setShowPaymentModal(false)}
              className="w-full py-2.5 border border-outline-variant text-on-surface font-semibold text-xs rounded-xl hover:bg-surface-container-highest transition-all cursor-pointer text-center"
            >
              {t.modalCancel}
            </button>
          </div>
        </div>
      )}

      {/* Downgrade Confirmation Modal */}
      {showDowngradeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline-variant p-6 rounded-2xl max-w-sm w-full shadow-2xl animate-in fade-in scale-in duration-200">
            <div className="w-12 h-12 rounded-full bg-error/15 border border-error/20 flex items-center justify-center mx-auto mb-4 text-error">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-2">{t.downgradeConfirmTitle}</h3>
            <p className="text-xs text-on-surface-variant text-center mb-6 leading-relaxed">
              {t.downgradeConfirmDesc}
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDowngradeModal(false)}
                className="flex-1 py-2.5 border border-outline-variant text-on-surface font-semibold text-xs rounded-xl hover:bg-surface-container-highest transition-all cursor-pointer text-center"
              >
                {t.modalCancel}
              </button>
              <button
                onClick={handleConfirmDowngrade}
                className="flex-1 py-2.5 bg-error text-on-error font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 active:scale-98 transition-all cursor-pointer text-center shadow-lg shadow-error/10"
              >
                {t.confirmBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
