'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const translations = {
  fr: {
    loading: 'Chargement de la facture...',
    notFoundTitle: 'Document Introuvable',
    notFoundDesc: "La facture demandée n'existe pas ou vous n'y avez pas accès.",
    previewTitle: 'Aperçu avant impression',
    previewDesc: "La boîte de dialogue d'impression s'ouvre automatiquement. Enregistrez au format PDF ou imprimez.",
    printBtn: 'Imprimer / PDF',
    closeBtn: "Fermer l'onglet",
    servicesSubtitle: 'Prestations de Services Photographiques',
    estimateTitle: 'DEVIS PROFORMA',
    invoiceTitle: 'FACTURE',
    senderLabel: 'Émetteur',
    recipientLabel: 'Destinataire',
    individualClient: 'Client Individuel',
    photographerDefault: 'Votre Photographe',
    issueDateLabel: "Date d'Émission",
    dueDateLabel: "Date d'Échéance",
    immediate: 'Immédiate',
    paymentMethodLabel: 'Mode de Paiement',
    paymentMethodValue: 'Wave / Mobile Money',
    tableHeaderDescription: 'Prestation / Description',
    tableHeaderQuantity: 'Quantité',
    tableHeaderUnitPrice: 'Tarif Unitaire',
    tableHeaderTotal: 'Total (FCFA)',
    defaultServiceDescription: 'Prestation Photographique Professionnelle',
    eventTypeLabel: "Type d'événement",
    subTotal: 'Sous-Total',
    taxes: 'Taxes / TVA (0%)',
    totalNet: 'TOTAL NET',
    paidStatusFooter: '✅ FACTURE ACQUITTEE - MERCI POUR VOTRE PAIEMENT',
    unpaidStatusFooter: 'Pour régler cette facture, scannez le code marchand ou utilisez Wave Pay. Numéro Wave :',
    financeLabel: 'PhotoFlow AI Finance',
    certifiedDocument: 'Document certifié conforme',
  },
  en: {
    loading: 'Loading invoice...',
    notFoundTitle: 'Document Not Found',
    notFoundDesc: 'The requested invoice does not exist or you do not have access to it.',
    previewTitle: 'Print Preview',
    previewDesc: 'The print dialog opens automatically. Save as PDF or print.',
    printBtn: 'Print / PDF',
    closeBtn: 'Close Tab',
    servicesSubtitle: 'Photographic Services',
    estimateTitle: 'PROFORMA ESTIMATE',
    invoiceTitle: 'INVOICE',
    senderLabel: 'Sender',
    recipientLabel: 'Recipient',
    individualClient: 'Individual Client',
    photographerDefault: 'Your Photographer',
    issueDateLabel: 'Issue Date',
    dueDateLabel: 'Due Date',
    immediate: 'Immediate',
    paymentMethodLabel: 'Payment Method',
    paymentMethodValue: 'Wave / Mobile Money',
    tableHeaderDescription: 'Service / Description',
    tableHeaderQuantity: 'Quantity',
    tableHeaderUnitPrice: 'Unit Price',
    tableHeaderTotal: 'Total (FCFA)',
    defaultServiceDescription: 'Professional Photographic Service',
    eventTypeLabel: 'Event Type',
    subTotal: 'Subtotal',
    taxes: 'Taxes / VAT (0%)',
    totalNet: 'TOTAL NET',
    paidStatusFooter: '✅ INVOICE PAID - THANK YOU FOR YOUR PAYMENT',
    unpaidStatusFooter: 'To settle this invoice, scan the merchant code or use Wave Pay. Wave number:',
    financeLabel: 'PhotoFlow AI Finance',
    certifiedDocument: 'Certified Document',
  }
};

export default function InvoicePrintPage() {
  const routeParams = useParams();
  const router = useRouter();
  const id = routeParams.id as string;

  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('photoflow_lang') as 'fr' | 'en';
    if (saved === 'fr' || saved === 'en') {
      setTimeout(() => setLang(saved), 0);
    }
  }, []);

  const t = translations[lang];

  useEffect(() => {
    if (!id) return;

    const fetchInvoiceData = async () => {
      setLoading(true);
      try {
        const { data: invData, error: invError } = await supabase
          .from('pf_invoices')
          .select('*, pf_clients(*), pf_projects(*)')
          .eq('id', id)
          .single();

        if (invError) throw invError;
        setInvoice(invData);

        if (invData.user_id) {
          const { data: profData } = await supabase
            .from('pf_profiles')
            .select('*')
            .eq('id', invData.user_id)
            .single();
          setProfile(profData);
        }

        // Trigger native print dialog shortly after rendering
        setTimeout(() => {
          window.print();
        }, 800);
      } catch (err) {
        console.error('Error loading printable invoice:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center font-sans">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-gray-500">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center font-sans p-6">
        <div className="text-center max-w-sm border p-6 rounded-2xl shadow-sm">
          <span className="material-symbols-outlined text-red-500 text-5xl mb-4">warning</span>
          <h1 className="text-lg font-bold">{t.notFoundTitle}</h1>
          <p className="text-sm text-gray-500 mt-2">{t.notFoundDesc}</p>
        </div>
      </div>
    );
  }

  const isEstimate = invoice.type === 'estimate';

  return (
    <div className="min-h-screen bg-white text-gray-950 font-sans p-8 sm:p-16 print:p-0 print:bg-white max-w-[850px] mx-auto">
      {/* Print Instructions Overlay - hidden during print */}
      <div className="mb-8 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide">{t.previewTitle}</h4>
          <p className="text-[11px] text-blue-700 mt-0.5">{t.previewDesc}</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          <button 
            onClick={() => window.print()}
            className="flex-1 sm:flex-initial px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            {t.printBtn}
          </button>
          <button 
            onClick={() => window.close()}
            className="flex-1 sm:flex-initial px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>

      {/* Invoice Document Canvas */}
      <div className="print-canvas border border-gray-100 p-8 sm:p-12 rounded-3xl print:border-0 print:p-0">
        
        {/* Header Branding */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-8 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
              {profile?.full_name || 'PhotoFlow Studio'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">{t.servicesSubtitle}</p>
          </div>
          <div className="text-right sm:text-right">
            <h2 className="text-xl font-bold text-gray-900 uppercase">
              {isEstimate ? t.estimateTitle : t.invoiceTitle}
            </h2>
            <p className="text-xs font-bold text-blue-600 mt-1">{invoice.invoice_number}</p>
          </div>
        </header>

        {/* Info Grid */}
        <section className="grid grid-cols-2 gap-8 py-8 border-b border-gray-100 text-xs">
          {/* Photographer details */}
          <div className="space-y-1">
            <p className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">{t.senderLabel}</p>
            <p className="font-bold text-gray-900">{profile?.full_name || t.photographerDefault}</p>
            {profile?.custom_watermark_url && <p className="text-gray-600">{profile.custom_watermark_url.replace('© ', '')}</p>}
            <p className="text-gray-500">Afrique de l'Ouest</p>
          </div>

          {/* Client details */}
          <div className="space-y-1">
            <p className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">{t.recipientLabel}</p>
            <p className="font-bold text-gray-900">{invoice.pf_clients?.name || t.individualClient}</p>
            {invoice.pf_clients?.phone && <p className="text-gray-600">{invoice.pf_clients.phone}</p>}
            {invoice.pf_clients?.email && <p className="text-gray-500">{invoice.pf_clients.email}</p>}
            {invoice.pf_clients?.address && <p className="text-gray-500">{invoice.pf_clients.address}</p>}
          </div>
        </section>

        {/* Dates Grid */}
        <section className="grid grid-cols-3 gap-4 py-6 text-xs bg-gray-50/50 rounded-2xl px-6 my-8">
          <div>
            <p className="font-bold text-gray-400 uppercase tracking-wider text-[9px]">{t.issueDateLabel}</p>
            <p className="font-bold text-gray-800 mt-1">
              {new Date(invoice.created_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')}
            </p>
          </div>
          <div>
            <p className="font-bold text-gray-400 uppercase tracking-wider text-[9px]">{t.dueDateLabel}</p>
            <p className="font-bold text-gray-800 mt-1">
              {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US') : t.immediate}
            </p>
          </div>
          <div>
            <p className="font-bold text-gray-400 uppercase tracking-wider text-[9px]">{t.paymentMethodLabel}</p>
            <p className="font-bold text-blue-600 mt-1">{t.paymentMethodValue}</p>
          </div>
        </section>

        {/* Services Table */}
        <table className="w-full text-left text-xs border-collapse my-8">
          <thead>
            <tr className="border-b-2 border-gray-200 text-gray-400 uppercase tracking-wider font-bold text-[9px]">
              <th className="py-3">{t.tableHeaderDescription}</th>
              <th className="py-3 text-right">{t.tableHeaderQuantity}</th>
              <th className="py-3 text-right">{t.tableHeaderUnitPrice}</th>
              <th className="py-3 text-right">{t.tableHeaderTotal}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            <tr className="text-gray-900">
              <td className="py-4 font-bold">
                {invoice.pf_projects?.name || t.defaultServiceDescription}
                {invoice.pf_projects?.project_type && (
                  <span className="block text-[10px] text-gray-500 font-normal mt-0.5">
                    {t.eventTypeLabel} : {invoice.pf_projects.project_type}
                  </span>
                )}
              </td>
              <td className="py-4 text-right">1</td>
              <td className="py-4 text-right">{invoice.amount_fcfa.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} FCFA</td>
              <td className="py-4 text-right font-bold">{invoice.amount_fcfa.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} FCFA</td>
            </tr>
          </tbody>
        </table>

        {/* Summary Block */}
        <section className="flex justify-end my-8">
          <div className="w-64 space-y-3 text-xs border-t-2 border-gray-200 pt-4">
            <div className="flex justify-between font-medium text-gray-500">
              <span>{t.subTotal}</span>
              <span>{invoice.amount_fcfa.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} FCFA</span>
            </div>
            <div className="flex justify-between font-medium text-gray-500">
              <span>{t.taxes}</span>
              <span>0 FCFA</span>
            </div>
            <div className="flex justify-between text-sm font-black text-gray-900 border-t border-gray-100 pt-3">
              <span>{t.totalNet}</span>
              <span className="text-blue-600">{invoice.amount_fcfa.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} FCFA</span>
            </div>
          </div>
        </section>

        {/* Payment and Terms Details */}
        <footer className="mt-16 pt-8 border-t border-gray-100 text-center space-y-4 text-[10px] text-gray-400 font-medium">
          <p className="text-gray-500">
            {invoice.status === 'paid' 
              ? t.paidStatusFooter 
              : `${t.unpaidStatusFooter} ${invoice.pf_clients?.phone || ''}`
            }
          </p>
          <div className="flex justify-center gap-6 border-t border-gray-50 pt-4 uppercase tracking-widest text-[8px]">
            <span>{t.financeLabel}</span>
            <span>•</span>
            <span>{t.certifiedDocument}</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
