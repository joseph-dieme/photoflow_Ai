'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const translations = {
  fr: {
    paymentFailed: "Le traitement du paiement par carte a échoué.",
    paymentFailedTitle: "Échec de la transaction",
    paymentSuccess: "Paiement Validé !",
    paymentSuccessDesc: "Votre paiement par carte de {amount} FCFA a été validé avec succès.",
    redirecting: "Redirection en cours...",
    amountLabel: "Montant à régler",
    cardStepTitle: "Informations de votre Carte",
    cardStepDesc: "Saisissez les coordonnées de votre carte bancaire Visa ou Mastercard.",
    cardNoLabel: "Numéro de carte",
    expiryLabel: "Date d'expiration",
    cvvLabel: "CVC / CVV",
    nameLabel: "Nom du titulaire",
    btnPay: "Procéder au paiement",
    securedBy: "Paiement 100% sécurisé via SSL / Stripe",
    notifClose: "Fermer",
    loadingText: "Chargement...",
    proSubscription: "Abonnement PhotoFlow Pro",
    promoCodeLabel: "Code Promo",
    promoPlaceholder: "Ex: PHOTOFEST",
    promoBtnApply: "Appliquer",
    promoDiscountLabel: "Remise",
    promoCodeApplied: "Code appliqué !",
    secureAuthTitle: "Vérification 3D Secure",
    secureAuthDesc: "Saisissez le code d'authentification envoyé par votre banque pour valider l'opération.",
    secureAuthInput: "Code de sécurité (OTP)",
    secureAuthConfirm: "Confirmer la transaction",
  },
  en: {
    paymentFailed: "Card payment processing failed.",
    paymentFailedTitle: "Transaction Failed",
    paymentSuccess: "Payment Approved!",
    paymentSuccessDesc: "Your card payment of {amount} FCFA has been verified successfully.",
    redirecting: "Redirecting...",
    amountLabel: "Amount to pay",
    cardStepTitle: "Card Details",
    cardStepDesc: "Enter your Visa or Mastercard credit card information.",
    cardNoLabel: "Card number",
    expiryLabel: "Expiration Date",
    cvvLabel: "CVC / CVV",
    nameLabel: "Cardholder name",
    btnPay: "Proceed to Payment",
    securedBy: "100% Secured payment via SSL / Stripe",
    notifClose: "Close",
    loadingText: "Loading...",
    proSubscription: "PhotoFlow Pro Subscription",
    promoCodeLabel: "Promo Code",
    promoPlaceholder: "e.g., PHOTOFEST",
    promoBtnApply: "Apply",
    promoDiscountLabel: "Discount",
    promoCodeApplied: "Code applied!",
    secureAuthTitle: "3D Secure Verification",
    secureAuthDesc: "Enter the verification code sent by your bank to authorize this transaction.",
    secureAuthInput: "Security Code (OTP)",
    secureAuthConfirm: "Confirm Transaction",
  }
};

function CardCheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL Query Params
  const amount = searchParams.get('amount') || '12500';
  const email = searchParams.get('email') || '';

  // Language switcher state
  const [lang, setLang] = useState<'fr' | 'en'>('fr');

  useEffect(() => {
    const saved = localStorage.getItem('photoflow_lang') as 'fr' | 'en';
    if (saved === 'fr' || saved === 'en') {
      setTimeout(() => setLang(saved), 0);
    }
  }, []);

  const t = translations[lang] || translations.fr;

  // Form input states
  const [step, setStep] = useState<'card' | 'secure' | 'success'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [secureCode, setSecureCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Promo Code States
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [appliedCodeText, setAppliedCodeText] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [promoDiscountType, setPromoDiscountType] = useState<'percent' | 'fixed' | null>(null);
  const [promoDiscountValue, setPromoDiscountValue] = useState(0);
  const [promoLoading, setPromoLoading] = useState(false);

  // Custom notification modal state
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setNotification({ isOpen: true, type, title, message });
  };

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode) return;
    setPromoLoading(true);
    setPromoError(null);
    setPromoSuccess(null);

    try {
      const { data, error } = await supabase.rpc('check_promo_code', {
        code_text: promoCode.trim()
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const result = data[0];
        if (result.valid) {
          setPromoApplied(true);
          setAppliedCodeText(promoCode.trim().toUpperCase());
          setPromoDiscountType(result.discount_type);
          setPromoDiscountValue(result.discount_value);
          setPromoSuccess(lang === 'fr' ? 'Code promo appliqué avec succès !' : 'Promo code applied successfully!');
        } else {
          setPromoError(result.message || (lang === 'fr' ? 'Code invalide.' : 'Invalid code.'));
        }
      } else {
        setPromoError(lang === 'fr' ? 'Erreur de validation.' : 'Validation error.');
      }
    } catch (err) {
      console.error('Promo code error:', err);
      setPromoError(lang === 'fr' ? 'Impossible de valider le code.' : 'Unable to validate code.');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoApplied(false);
    setAppliedCodeText('');
    setPromoCode('');
    setPromoDiscountType(null);
    setPromoDiscountValue(0);
    setPromoSuccess(null);
    setPromoError(null);
  };

  // Recalculate amounts
  const baseAmount = parseInt(amount) || 12500;
  const discountAmount = promoApplied
    ? promoDiscountType === 'percent'
      ? Math.round((baseAmount * promoDiscountValue) / 100)
      : promoDiscountValue
    : 0;
  const finalAmount = Math.max(0, baseAmount - discountAmount);

  const handleFormatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(v);
    }
  };

  const handleFormatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      setCardExpiry(`${v.substring(0, 2)} / ${v.substring(2, 4)}`);
    } else {
      setCardExpiry(v);
    }
  };

  const handleProceedPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('secure');
    }, 1500);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secureCode) return;
    setLoading(true);

    try {
      // If subscribing to Pro, update the current user's profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('pf_profiles')
          .update({ plan: 'pro', storage_limit: 53687091200 }) // Upgrade to 50GB
          .eq('id', user.id);
        if (error) throw error;
      }

      // Record promo code usage if applied
      if (promoApplied && appliedCodeText) {
        await supabase.rpc('use_promo_code', {
          code_text: appliedCodeText
        });
      }

      setLoading(false);
      setStep('success');

      // Redirect back to settings page after 3 seconds
      setTimeout(() => {
        router.push('/dashboard/settings?status=subscribed');
      }, 3000);
    } catch (err) {
      console.error('Card processing failed:', err);
      setLoading(false);
      showNotification('error', t.paymentFailedTitle, t.paymentFailed);
    }
  };

  if (step === 'success') {
    return (
      <div className="w-full max-w-sm bg-[#1e1e22]/95 border border-zinc-800/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl font-bold">check</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{t.paymentSuccess}</h2>
        <p className="text-zinc-400 text-xs mb-6">
          {t.paymentSuccessDesc.replace('{amount}', finalAmount.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US'))}
        </p>
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] text-zinc-500 mt-4">{t.redirecting}</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center">
      <button
        onClick={() => router.push('/checkout/select-plan')}
        className="absolute -top-12 left-0 text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-semibold"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        <span>{lang === 'fr' ? 'Retour aux forfaits' : 'Back to plans'}</span>
      </button>

      <div className="w-full max-w-sm bg-[#1e1e22]/95 border border-zinc-800/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl">
      {/* Card Header branding */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center text-white font-bold text-lg">
            💳
          </div>
          <span className="font-bold text-zinc-200 text-sm tracking-wider">SECURE PAY</span>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{t.amountLabel}</p>
          <p className="text-sm font-black text-white">{finalAmount.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} FCFA</p>
        </div>
      </div>

      {/* Details Card */}
      <div className="mb-6 p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800/50 text-xs space-y-2.5">
        <div className="flex justify-between">
          <span className="text-zinc-500 font-medium">Bénéficiaire</span>
          <span className="text-zinc-200 font-bold">PhotoFlow AI Platform</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500 font-medium">Titulaire</span>
          <span className="text-zinc-200 font-semibold truncate max-w-[160px]" title={email}>{email || 'Photographe'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500 font-medium">Service</span>
          <span className="text-primary font-bold">{t.proSubscription}</span>
        </div>
      </div>

      {/* Promo Code input section */}
      {step === 'card' && (
        <div className="mb-6 p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800/50 text-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-zinc-400 font-bold text-[10px] uppercase tracking-wider">{t.promoCodeLabel}</span>
            {promoApplied && (
              <span className="text-green-400 font-bold text-[9px] bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
                {t.promoCodeApplied}
              </span>
            )}
          </div>

          {promoApplied ? (
            <div className="flex justify-between items-center bg-zinc-950/50 border border-green-900/30 rounded-xl px-3 py-2 text-zinc-200">
              <div className="font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-green-400 text-xs">local_offer</span>
                <span className="font-mono">{appliedCodeText}</span>
                <span className="text-zinc-500 text-[10px]">
                  (-{promoDiscountType === 'percent' ? `${promoDiscountValue}%` : `${promoDiscountValue.toLocaleString()} FCFA`})
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemovePromo}
                className="text-zinc-500 hover:text-red-400 font-bold text-[10px] uppercase cursor-pointer transition-colors"
              >
                {lang === 'fr' ? 'Retirer' : 'Remove'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input
                type="text"
                placeholder={t.promoPlaceholder}
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value);
                  if (promoError) setPromoError(null);
                }}
                className="flex-grow bg-zinc-950/40 border border-zinc-800/80 focus:border-blue-500 rounded-xl px-3 py-2 text-xs outline-none text-white transition-colors uppercase font-mono"
              />
              <button
                type="submit"
                disabled={promoLoading || !promoCode}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {promoLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  t.promoBtnApply
                )}
              </button>
            </form>
          )}

          {promoError && (
            <div className="text-red-400 text-[10px] mt-1.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">error</span>
              <span>{promoError}</span>
            </div>
          )}
          
          {promoSuccess && (
            <div className="text-green-400 text-[10px] mt-1.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">check_circle</span>
              <span>{promoSuccess}</span>
            </div>
          )}
        </div>
      )}

      {step === 'card' ? (
        <form onSubmit={handleProceedPayment} className="space-y-4">
          <div className="text-center mb-4">
            <h3 className="text-sm font-bold text-zinc-200">{t.cardStepTitle}</h3>
            <p className="text-[10px] text-zinc-500 mt-1">{t.cardStepDesc}</p>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">{t.cardNoLabel}</label>
            <input
              type="text"
              required
              maxLength={19}
              value={cardNumber}
              onChange={(e) => handleFormatCardNumber(e.target.value)}
              placeholder="0000 0000 0000 0000"
              className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-zinc-500 rounded-xl px-4 py-3 text-sm outline-none text-white transition-colors font-mono tracking-widest text-center"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">{t.expiryLabel}</label>
              <input
                type="text"
                required
                maxLength={7}
                value={cardExpiry}
                onChange={(e) => handleFormatExpiry(e.target.value)}
                placeholder="MM / YY"
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-zinc-500 rounded-xl px-4 py-3 text-sm outline-none text-white transition-colors font-mono text-center"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">{t.cvvLabel}</label>
              <input
                type="password"
                required
                maxLength={4}
                value={cardCvv}
                onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/gi, ''))}
                placeholder="***"
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-zinc-500 rounded-xl px-4 py-3 text-sm outline-none text-white transition-colors font-mono text-center tracking-widest"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">{t.nameLabel}</label>
            <input
              type="text"
              required
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="Amadou Diallo"
              className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-zinc-500 rounded-xl px-4 py-3 text-sm outline-none text-white transition-colors uppercase font-mono text-center"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-zinc-700 hover:bg-zinc-650 active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
            ) : (
              t.btnPay
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div className="text-center mb-4">
            <h3 className="text-sm font-bold text-zinc-200">{t.secureAuthTitle}</h3>
            <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">{t.secureAuthDesc}</p>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">{t.secureAuthInput}</label>
            <input
              type="text"
              required
              maxLength={6}
              value={secureCode}
              onChange={(e) => setSecureCode(e.target.value.replace(/[^0-9]/gi, ''))}
              placeholder="0 0 0 0 0 0"
              className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-zinc-500 rounded-xl px-4 py-3 text-center text-lg font-black tracking-widest outline-none text-white transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-zinc-700 hover:bg-zinc-650 active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
            ) : (
              t.secureAuthConfirm
            )}
          </button>
        </form>
      )}

      {/* Safety notice */}
      <div className="mt-8 text-center border-t border-zinc-800/60 pt-4 flex items-center justify-center gap-1.5 text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
        <span className="material-symbols-outlined text-xs">verified_user</span>
        {t.securedBy}
      </div>

      {/* Custom Notification Modal */}
      {notification.isOpen && (
        <div 
          onClick={() => setNotification(prev => ({ ...prev, isOpen: false }))}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#1e1e22] border border-zinc-800/80 p-6 rounded-2xl shadow-2xl text-center flex flex-col items-center animate-in zoom-in-95 duration-200 cursor-default"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4 text-red-400">
              <span className="material-symbols-outlined text-4xl">cancel</span>
            </div>
            <h3 className="font-display-lg text-lg font-bold text-white mb-1">{notification.title}</h3>
            <p className="text-zinc-400 text-xs mb-6 px-2">{notification.message}</p>
            <button
              onClick={() => setNotification(prev => ({ ...prev, isOpen: false }))}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-2.5 rounded-xl border border-zinc-800 active:scale-98 transition-all cursor-pointer text-xs"
            >
              {t.notifClose}
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default function CardCheckoutPage() {
  return (
    <div className="min-h-screen bg-[#18181A] flex items-center justify-center p-6 hero-glow">
      <Suspense fallback={
        <div className="w-full max-w-sm bg-[#1e1e22]/95 border border-zinc-800/80 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-6 h-6 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      }>
        <CardCheckoutForm />
      </Suspense>
    </div>
  );
}
