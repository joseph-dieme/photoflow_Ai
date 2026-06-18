'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const translations = {
  fr: {
    paymentFailed: "Le traitement du paiement a échoué.",
    paymentFailedTitle: "Échec du Paiement",
    paymentSuccess: "Paiement Réussi !",
    paymentSuccessDesc: "Votre paiement de {amount} FCFA a été validé par Wave Mobile Money.",
    redirecting: "Redirection en cours...",
    amountLabel: "Montant",
    phoneStepTitle: "Saisissez votre numéro Wave",
    phoneStepDesc: "Vous allez recevoir un code de confirmation par SMS.",
    phoneInputLabel: "Numéro de téléphone",
    sendOtpBtn: "Envoyer le code SMS",
    otpStepTitle: "Saisissez le code SMS",
    otpStepDesc: "Un code à 4 chiffres a été envoyé au {phone}.",
    otpInputLabel: "Code de vérification",
    confirmPaymentBtn: "Confirmer le paiement",
    securedBy: "Sécurisé par Wave Mobile Money",
    notifClose: "Fermer",
    loadingText: "Chargement...",
    alreadyPaidTitle: "Facture Déjà Payée",
    alreadyPaidDesc: "Cette facture a déjà été réglée avec succès.",
    invoiceDetails: "Prestation Photographiques",
    clientLabel: "Client",
    projectLabel: "Projet",
    studioLabel: "Studio / Photographe",
    proSubscription: "Abonnement PhotoFlow Pro",
    promoCodeLabel: "Code Promo",
    promoPlaceholder: "Ex: PHOTOFEST",
    promoBtnApply: "Appliquer",
    promoDiscountLabel: "Remise",
    promoCodeApplied: "Code appliqué !"
  },
  en: {
    paymentFailed: "Payment processing failed.",
    paymentFailedTitle: "Payment Failed",
    paymentSuccess: "Payment Successful!",
    paymentSuccessDesc: "Your payment of {amount} FCFA has been verified by Wave Mobile Money.",
    redirecting: "Redirecting...",
    amountLabel: "Amount",
    phoneStepTitle: "Enter your Wave number",
    phoneStepDesc: "You will receive a confirmation code by SMS.",
    phoneInputLabel: "Phone number",
    sendOtpBtn: "Send SMS Code",
    otpStepTitle: "Enter the SMS code",
    otpStepDesc: "A 4-digit code has been sent to {phone}.",
    otpInputLabel: "Verification Code",
    confirmPaymentBtn: "Confirm Payment",
    securedBy: "Secured by Wave Mobile Money",
    notifClose: "Close",
    loadingText: "Loading...",
    alreadyPaidTitle: "Invoice Already Paid",
    alreadyPaidDesc: "This invoice has already been successfully paid.",
    invoiceDetails: "Photographic Services",
    clientLabel: "Client",
    projectLabel: "Project",
    studioLabel: "Studio / Photographer",
    proSubscription: "PhotoFlow Pro Subscription",
    promoCodeLabel: "Promo Code",
    promoPlaceholder: "e.g., PHOTOFEST",
    promoBtnApply: "Apply",
    promoDiscountLabel: "Discount",
    promoCodeApplied: "Code applied!"
  }
};

function WaveCheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL Query Params
  const amount = searchParams.get('amount') || '6900';
  const invoiceId = searchParams.get('invoiceId') || '';
  const email = searchParams.get('email') || '';

  // Language switcher state
  const [lang, setLang] = useState<'fr' | 'en'>('fr');

  useEffect(() => {
    const saved = localStorage.getItem('photoflow_lang') as 'fr' | 'en';
    if (saved === 'fr' || saved === 'en') {
      setTimeout(() => setLang(saved), 0);
    }

    const handleLangChange = () => {
      const updated = localStorage.getItem('photoflow_lang') as 'fr' | 'en';
      if (updated === 'fr' || updated === 'en') {
        setLang(updated);
      }
    };

    window.addEventListener('photoflow_lang_change', handleLangChange);
    return () => {
      window.removeEventListener('photoflow_lang_change', handleLangChange);
    };
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === 'fr' ? 'en' : 'fr';
    setLang(nextLang);
    localStorage.setItem('photoflow_lang', nextLang);
    window.dispatchEvent(new Event('photoflow_lang_change'));
  };

  const t = translations[lang];

  // Checkout steps states
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+221');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<'wave' | 'orange' | 'free'>('wave');

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

  // Invoice details states
  const [invoiceDetails, setInvoiceDetails] = useState<{
    invoice_number: string;
    amount_fcfa: number;
    type: string;
    status: string;
    client_name: string;
    project_name: string;
    photographer_name: string;
  } | null>(null);
  const [fetchingInvoice, setFetchingInvoice] = useState(false);
  const [invoiceAlreadyPaid, setInvoiceAlreadyPaid] = useState(false);

  // Promo Code States
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [appliedCodeText, setAppliedCodeText] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [promoDiscountType, setPromoDiscountType] = useState<'percent' | 'fixed' | null>(null);
  const [promoDiscountValue, setPromoDiscountValue] = useState(0);
  const [promoLoading, setPromoLoading] = useState(false);

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

  // Load invoice details if present
  useEffect(() => {
    if (!invoiceId) return;

    async function loadInvoice() {
      setFetchingInvoice(true);
      try {
        const { data, error } = await supabase.rpc('get_invoice_details', {
          invoice_uuid: invoiceId
        });
        if (error) throw error;
        
        if (data && data.length > 0) {
          const details = data[0];
          setInvoiceDetails(details);
          if (details.status === 'paid') {
            setInvoiceAlreadyPaid(true);
            showNotification('info', lang === 'fr' ? 'Facture Déjà Payée' : 'Invoice Already Paid', lang === 'fr' ? 'Cette facture a déjà été réglée.' : 'This invoice has already been paid.');
          }
        }
      } catch (err) {
        console.error('Error fetching invoice details:', err);
      } finally {
        setFetchingInvoice(false);
      }
    }

    loadInvoice();
  }, [invoiceId, lang]);

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 1000);
  };

  const baseAmount = parseInt(amount) || 6900;
  const discountAmount = promoApplied
    ? promoDiscountType === 'percent'
      ? Math.round((baseAmount * promoDiscountValue) / 100)
      : promoDiscountValue
    : 0;
  const finalAmount = Math.max(0, baseAmount - discountAmount);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);

    try {
      // Perform database updates
      if (invoiceId) {
        // Update Invoice status to Paid via SECURITY DEFINER function to bypass RLS
        const { data: success, error } = await supabase.rpc('pay_invoice', {
          invoice_uuid: invoiceId
        });
        if (error) throw error;
        if (!success) throw new Error('Invoice not found or could not be updated');
      } else {
        // If subscribing to Pro, update the current user's profile
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from('pf_profiles')
            .update({ plan: 'pro', storage_limit: 53687091200 }) // Upgrade to 50GB
            .eq('id', user.id);
          if (error) throw error;
        }
      }

      // Record promo code usage if applied
      if (promoApplied && appliedCodeText) {
        await supabase.rpc('use_promo_code', {
          code_text: appliedCodeText
        });
      }

      setLoading(false);
      setStep('success');

      // Redirect back after 3 seconds
      setTimeout(() => {
        if (invoiceId) {
          router.push('/dashboard/invoices?status=success');
        } else {
          router.push('/dashboard/settings?status=subscribed');
        }
      }, 3000);
    } catch (err) {
      console.error('Mobile money processing failed:', err);
      setLoading(false);
      showNotification('error', t.paymentFailedTitle, t.paymentFailed);
    }
  };

  // Dynamic branding computations
  const providerLabel = provider === 'wave' ? 'Wave Mobile Money' : provider === 'orange' ? 'Orange Money' : 'Free Money';
  const logoLetter = provider === 'wave' ? 'W' : provider === 'orange' ? 'O' : 'F';
  const logoBg = provider === 'wave' ? 'bg-blue-500' : provider === 'orange' ? 'bg-orange-500' : 'bg-red-600';
  const headerTitle = provider === 'wave' ? 'WAVE PAY' : provider === 'orange' ? 'ORANGE MONEY' : 'FREE MONEY';
  const inputFocus = provider === 'wave' ? 'focus:border-blue-500' : provider === 'orange' ? 'focus:border-orange-500' : 'focus:border-red-500';
  const phonePlaceholder = provider === 'wave' ? '77 000 00 00' : provider === 'orange' ? '77 000 00 00' : '76 000 00 00';
  const btnBg = provider === 'wave'
    ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20'
    : provider === 'orange'
      ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'
      : 'bg-red-600 hover:bg-red-750 shadow-red-600/20';

  const securedByText = lang === 'fr'
    ? (provider === 'wave' ? 'Sécurisé par Wave Mobile Money' : provider === 'orange' ? 'Sécurisé par Orange Money' : 'Sécurisé par Free Money')
    : (provider === 'wave' ? 'Secured by Wave Mobile Money' : provider === 'orange' ? 'Secured by Orange Money' : 'Secured by Free Money');

  const successDesc = (lang === 'fr' ? 'Votre paiement de {amount} FCFA a été validé par {provider}.' : 'Your payment of {amount} FCFA has been verified by {provider}.')
    .replace('{amount}', finalAmount.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US'))
    .replace('{provider}', providerLabel);

  if (step === 'success') {
    return (
      <div className="w-full max-w-sm bg-[#1e1e22]/95 border border-zinc-800/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
        <div className={`w-16 h-16 rounded-full ${logoBg} text-white flex items-center justify-center mb-6 transition-colors duration-300`}>
          <span className="material-symbols-outlined text-4xl font-bold">check</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{t.paymentSuccess}</h2>
        <p className="text-zinc-400 text-xs mb-6">
          {successDesc}
        </p>
        <div className={`w-6 h-6 border-2 ${provider === 'wave' ? 'border-blue-500' : provider === 'orange' ? 'border-orange-500' : 'border-red-500'} border-t-transparent rounded-full animate-spin transition-colors duration-300`}></div>
        <p className="text-[10px] text-zinc-500 mt-4">{t.redirecting}</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center">
      {/* Back Button */}
      <button
        onClick={() => router.push('/checkout/select-plan')}
        className="absolute -top-12 left-0 text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-semibold"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        <span>{lang === 'fr' ? 'Retour aux forfaits' : 'Back to plans'}</span>
      </button>

      {/* Language Switcher Button */}
      <div className="absolute -top-12 right-0">
        <button
          onClick={toggleLanguage}
          className="px-2.5 py-1 text-[11px] font-bold border border-zinc-800 hover:border-zinc-500 rounded bg-[#1e1e22] text-zinc-400 hover:text-white transition-all uppercase cursor-pointer"
          title="Changer de langue / Switch Language"
        >
          {lang === 'fr' ? 'EN' : 'FR'}
        </button>
      </div>

      <div className="w-full max-w-sm bg-[#1e1e22]/95 border border-zinc-800/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl">
        {/* Mobile Money Header branding */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800/60">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${logoBg} flex items-center justify-center text-white font-bold text-lg transition-colors duration-300`}>
              {logoLetter}
            </div>
            <span className="font-bold text-zinc-200 text-sm tracking-wider transition-colors duration-300">{headerTitle}</span>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{t.amountLabel}</p>
            <p className="text-sm font-black text-white">{finalAmount.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} FCFA</p>
          </div>
        </div>

        {/* Dynamic details card (Photographer Studio / Client Info / Product) */}
        <div className="mb-6 p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800/50 text-xs space-y-2.5">
          {invoiceId ? (
            fetchingInvoice ? (
              <div className="text-zinc-500 text-[10px] text-center py-2 animate-pulse">{t.loadingText}</div>
            ) : invoiceDetails ? (
              <>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">{t.studioLabel}</span>
                  <span className="text-zinc-200 font-bold">{invoiceDetails.photographer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">{t.clientLabel}</span>
                  <span className="text-zinc-200 font-semibold">{invoiceDetails.client_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">{t.projectLabel}</span>
                  <span className="text-zinc-200 font-semibold">{invoiceDetails.project_name}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-zinc-800/50 text-[10px]">
                  <span className="text-zinc-500 font-medium">N° Document</span>
                  <span className="text-zinc-400 font-mono">{invoiceDetails.invoice_number}</span>
                </div>
              </>
            ) : (
              <div className="text-zinc-500 text-[10px] text-center py-2">FAC-{invoiceId.substring(0, 8).toUpperCase()}</div>
            )
          ) : (
            <>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-medium">Bénéficiaire</span>
                <span className="text-zinc-200 font-bold">PhotoFlow AI Platform</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-medium">{t.clientLabel}</span>
                <span className="text-zinc-200 font-semibold truncate max-w-[160px]" title={email}>{email || 'Photographe'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-medium">Mode</span>
                <span className="text-primary font-bold">{providerLabel}</span>
              </div>
            </>
          )}
        </div>

        {/* Promo Code input section */}
        {!invoiceAlreadyPaid && (
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
                  className={`flex-grow bg-zinc-950/40 border border-zinc-800/80 focus:border-zinc-500 rounded-xl px-3 py-2 text-xs outline-none text-white transition-colors uppercase font-mono`}
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

        {invoiceAlreadyPaid ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <div>
              <h4 className="text-zinc-200 font-bold text-sm">{t.alreadyPaidTitle}</h4>
              <p className="text-[10px] text-zinc-500 mt-1">{t.alreadyPaidDesc}</p>
            </div>
            <button
              onClick={() => {
                if (invoiceId) {
                  router.push('/dashboard/invoices?status=success');
                } else {
                  router.push('/dashboard/settings');
                }
              }}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-750 active:scale-98 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-2xl border border-zinc-800 transition-all cursor-pointer"
            >
              Retour
            </button>
          </div>
        ) : step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="text-center mb-4">
              <h3 className="text-sm font-bold text-zinc-200">{lang === 'fr' ? 'Choisissez votre opérateur' : 'Choose your provider'}</h3>
            </div>

            {/* Operator Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-zinc-950/40 rounded-xl border border-zinc-800/50">
              <button
                type="button"
                onClick={() => setProvider('wave')}
                className={`py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  provider === 'wave'
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/10'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Wave
              </button>
              <button
                type="button"
                onClick={() => setProvider('orange')}
                className={`py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  provider === 'orange'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Orange
              </button>
              <button
                type="button"
                onClick={() => setProvider('free')}
                className={`py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  provider === 'free'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/10'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Free
              </button>
            </div>

            <div className="text-center">
              <h4 className="text-xs font-bold text-zinc-300">{t.phoneStepTitle}</h4>
              <p className="text-[9px] text-zinc-500 mt-1">{t.phoneStepDesc}</p>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">{t.phoneInputLabel}</label>
              <div className="relative flex items-center">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="absolute left-4 z-10 text-sm font-bold text-zinc-400 bg-transparent border-none outline-none cursor-pointer appearance-none"
                >
                  <option value="+221" className="bg-zinc-950 text-white">+221</option>
                  <option value="+225" className="bg-zinc-950 text-white">+225</option>
                  <option value="+223" className="bg-zinc-950 text-white">+223</option>
                  <option value="+224" className="bg-zinc-950 text-white">+224</option>
                  <option value="+226" className="bg-zinc-950 text-white">+226</option>
                  <option value="+227" className="bg-zinc-950 text-white">+227</option>
                  <option value="+228" className="bg-zinc-950 text-white">+228</option>
                  <option value="+229" className="bg-zinc-950 text-white">+229</option>
                  <option value="+237" className="bg-zinc-950 text-white">+237</option>
                  <option value="+241" className="bg-zinc-950 text-white">+241</option>
                  <option value="+243" className="bg-zinc-950 text-white">+243</option>
                  <option value="+33" className="bg-zinc-950 text-white">+33</option>
                  <option value="+1" className="bg-zinc-950 text-white">+1</option>
                </select>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={phonePlaceholder}
                  className={`w-full bg-zinc-900/50 border border-zinc-800 ${inputFocus} rounded-2xl pl-20 pr-4 py-3.5 text-sm font-bold outline-none text-white transition-colors`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 ${btnBg} active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none`}
            >
              {loading ? (
                <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
              ) : (
                t.sendOtpBtn
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="text-center mb-4">
              <h3 className="text-sm font-bold text-zinc-200">{t.otpStepTitle}</h3>
              <p className="text-[10px] text-zinc-500 mt-1">{t.otpStepDesc.replace('{phone}', `${countryCode} ${phone}`)}</p>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">{t.otpInputLabel}</label>
              <input
                type="text"
                required
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="0 0 0 0"
                className={`w-full bg-zinc-900/50 border border-zinc-800 ${inputFocus} rounded-2xl px-4 py-3.5 text-center text-lg font-black tracking-widest outline-none text-white transition-colors`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 ${btnBg} active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none`}
            >
              {loading ? (
                <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
              ) : (
                t.confirmPaymentBtn
              )}
            </button>
          </form>
        )}

        {/* Safety notice */}
        <div className="mt-8 text-center border-t border-zinc-800/60 pt-4 flex items-center justify-center gap-1.5 text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
          <span className="material-symbols-outlined text-xs">verified_user</span>
          {securedByText}
        </div>
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
            {notification.type === 'success' && (
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-4 text-green-400">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
              </div>
            )}
            {notification.type === 'error' && (
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4 text-red-400">
                <span className="material-symbols-outlined text-4xl">cancel</span>
              </div>
            )}
            {notification.type === 'warning' && (
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400">
                <span className="material-symbols-outlined text-4xl">warning</span>
              </div>
            )}
            {notification.type === 'info' && (
              <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4 text-blue-400">
                <span className="material-symbols-outlined text-4xl">info</span>
              </div>
            )}

            <h3 className="font-display-lg text-lg font-bold text-white mb-1">
              {notification.title}
            </h3>
            <p className="text-zinc-400 text-xs mb-6 px-2">
              {notification.message}
            </p>

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
  );
}

export default function WaveCheckoutPage() {
  return (
    <div className="min-h-screen bg-[#18181A] flex items-center justify-center p-6">
      <Suspense fallback={
        <div className="w-full max-w-sm bg-[#1e1e22]/95 border border-zinc-800/80 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      }>
        <WaveCheckoutForm />
      </Suspense>
    </div>
  );
}
