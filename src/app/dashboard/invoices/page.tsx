'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { createWavePaymentSession } from '@/lib/payments/wave';
import Navigation from '@/components/Navigation';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { useLanguage } from '@/hooks/useLanguage';

const translations = {
  fr: {
    title: 'Facturation & Devis',
    subtitle: 'Émettez des factures professionnelles en FCFA et encaissez par Wave ou Mobile Money.',
    createBtn: 'Créer une facture / devis',
    paymentSuccess: 'Le paiement a été validé avec succès par Wave Mobile Money ! Votre facture est marquée comme payée.',
    paymentError: "Le paiement via Wave Mobile Money a échoué ou a été annulé par l'utilisateur.",
    docNumber: 'N° Document',
    type: 'Type',
    client: 'Client',
    project: 'Projet',
    amount: 'Montant (FCFA)',
    dueDate: 'Échéance',
    status: 'Statut',
    actions: 'Actions',
    noInvoices: 'Aucune facture ou devis émis pour le moment.',
    estimate: 'Devis',
    invoice: 'Facture',
    paid: 'Payé',
    sent: 'Envoyé',
    draft: 'Brouillon',
    unknown: 'Inconnu',
    notApplicable: 'N/A',
    newDocTitle: 'Nouveau document financier',
    docTypeLabel: 'Type de Document',
    docNumberLabel: 'Numéro de Document',
    amountLabel: 'Montant (FCFA)',
    selectClientLabel: 'Sélectionner un Client',
    chooseExistingClient: '-- Choisir un client existant --',
    orCreateClient: 'Ou créer un nouveau client',
    newClientPlaceholder: 'Nom du nouveau client',
    associatedProject: 'Projet Associé',
    selectProjectPlaceholder: 'Sélectionner le projet (Optionnel)',
    dueDateLabel: "Date d'échéance",
    cancel: 'Annuler',
    issueDoc: 'Émettre le Document',
    issuing: 'Émission...',
    errorCreate: 'Erreur lors de la création du document.',
    pdfTitle: 'Exporter en PDF',
    waveTitle: 'Payer via Wave Mobile Money',
    copyLinkTitle: 'Lien Copié',
    copyLinkMsg: 'Le lien de paiement Wave a été copié dans le presse-papier.',
  },
  en: {
    title: 'Invoices & Estimates',
    subtitle: 'Issue professional invoices in FCFA and collect payments via Wave or Mobile Money.',
    createBtn: 'Create invoice / estimate',
    paymentSuccess: 'Payment successfully validated by Wave Mobile Money! Your invoice is marked as paid.',
    paymentError: 'Payment via Wave Mobile Money failed or was cancelled by the user.',
    docNumber: 'Document No.',
    type: 'Type',
    client: 'Client',
    project: 'Project',
    amount: 'Amount (FCFA)',
    dueDate: 'Due Date',
    status: 'Status',
    actions: 'Actions',
    noInvoices: 'No invoices or estimates issued yet.',
    estimate: 'Estimate',
    invoice: 'Invoice',
    paid: 'Paid',
    sent: 'Sent',
    draft: 'Draft',
    unknown: 'Unknown',
    notApplicable: 'N/A',
    newDocTitle: 'New financial document',
    docTypeLabel: 'Document Type',
    docNumberLabel: 'Document Number',
    amountLabel: 'Amount (FCFA)',
    selectClientLabel: 'Select a Client',
    chooseExistingClient: '-- Choose an existing client --',
    orCreateClient: 'Or create a new client',
    newClientPlaceholder: 'New client name',
    associatedProject: 'Associated Project',
    selectProjectPlaceholder: 'Select project (Optional)',
    dueDateLabel: 'Due Date',
    cancel: 'Cancel',
    issueDoc: 'Issue Document',
    issuing: 'Issuing...',
    errorCreate: 'Error creating document.',
    pdfTitle: 'Export to PDF',
    waveTitle: 'Pay via Wave Mobile Money',
    copyLinkTitle: 'Link Copied',
    copyLinkMsg: 'The Wave payment link has been copied to your clipboard.',
  }
};

export default function InvoicesPage() {
  const router = useRouter();
  const lang = useLanguage();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Data States
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  
  // UI States
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'error' | null>(null);
  const [copySuccessToast, setCopySuccessToast] = useState(false);

  // Form States
  const [clientName, setClientName] = useState('');
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [amountFcfa, setAmountFcfa] = useState('');
  const [billType, setBillType] = useState('invoice'); // 'invoice' or 'estimate'
  const [dueDate, setDueDate] = useState('');

  const t = translations[lang];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        fetchBillingData(session.user.id);
      }
    });

    // Check payment status from Wave callback URL
    if (typeof window !== 'undefined') {
      const queryParams = new URLSearchParams(window.location.search);
      const status = queryParams.get('status');
      if (status === 'success') {
        setTimeout(() => setPaymentStatus('success'), 0);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        setTimeout(() => setPaymentStatus(null), 7000);
      } else if (status === 'error') {
        setTimeout(() => setPaymentStatus('error'), 0);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        setTimeout(() => setPaymentStatus(null), 7000);
      }
    }
  }, [router]);

  // Open the add invoice modal if '?new=true' is in the URL search query
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryParams = new URLSearchParams(window.location.search);
      const isNew = queryParams.get('new');
      if (isNew === 'true') {
        setTimeout(() => setShowModal(true), 0);
        // Clear query parameters without reloading the page
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  async function fetchBillingData(userId: string) {
    setLoading(true);
    try {
      // Fetch invoices, clients, and projects in parallel
      const [
        { data: billingData },
        { data: clientsData },
        { data: projectsData }
      ] = await Promise.all([
        supabase.from('pf_invoices').select('*, pf_clients(name), pf_projects(name)').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('pf_clients').select('*').eq('user_id', userId),
        supabase.from('pf_projects').select('*').eq('user_id', userId)
      ]);
      
      setInvoices(billingData || []);
      setClients(clientsData || []);
      setProjects(projectsData || []);

      // Auto-generate invoice number based on length
      const count = (billingData?.length || 0) + 1;
      setInvoiceNumber(`FAC-${new Date().getFullYear()}-${count.toString().padStart(3, '0')}`);
    } catch (err) {
      console.error('Error fetching billing data:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCreating(true);

    try {
      let finalClientId = clientId;

      // If they chose to type a client name instead of selecting an existing one, create that client first!
      if (!clientId && clientName) {
        const { data: newClient, error: clientErr } = await supabase
          .from('pf_clients')
          .insert({
            user_id: user.id,
            name: clientName,
          })
          .select()
          .single();

        if (clientErr) throw clientErr;
        finalClientId = newClient.id;
      }

      const { error } = await supabase
        .from('pf_invoices')
        .insert({
          user_id: user.id,
          client_id: finalClientId || null,
          project_id: projectId || null,
          invoice_number: invoiceNumber,
          amount_fcfa: parseInt(amountFcfa),
          type: billType,
          status: 'draft',
          due_date: dueDate || null,
        });

      if (error) throw error;

      setShowModal(false);
      setClientName('');
      setClientId('');
      setProjectId('');
      setAmountFcfa('');
      setDueDate('');
      fetchBillingData(user.id);
    } catch (err) {
      console.error('Error creating invoice:', err);
      alert(t.errorCreate);
    } finally {
      setCreating(false);
    }
  };

  const handleWavePayment = async (inv: any) => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      
      const session = await createWavePaymentSession({
        amountFcfa: inv.amount_fcfa,
        customerEmail: inv.pf_clients?.email || 'client@email.com',
        customerPhone: inv.pf_clients?.phone || '',
        projectName: inv.pf_projects?.name || 'Prestation Photo',
        invoiceId: inv.id,
        successUrl: `${origin}/dashboard/invoices?status=success&id=${inv.id}`,
        errorUrl: `${origin}/dashboard/invoices?status=error&id=${inv.id}`,
      });

      // Redirect to the Wave checkout panel
      router.push(session.checkoutUrl);
    } catch (err) {
      console.error('Failed to trigger Wave Checkout:', err);
    }
  };

  const handleCopyPaymentLink = (inv: any) => {
    if (typeof window === 'undefined') return;
    const origin = window.location.origin;
    const paymentUrl = `${origin}/checkout/wave?amount=${inv.amount_fcfa}&invoiceId=${inv.id}&email=${encodeURIComponent(inv.pf_clients?.email || '')}`;
    
    navigator.clipboard.writeText(paymentUrl).then(() => {
      setCopySuccessToast(true);
      setTimeout(() => setCopySuccessToast(false), 4000);
    }).catch(err => {
      console.error('Failed to copy text:', err);
    });
  };

  const simulatePdfExport = (inv: any) => {
    window.open(`/dashboard/invoices/${inv.id}/print`, '_blank');
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
      
      <Sidebar activeProjectName={projects[0]?.name} />

      <main className="md:ml-[280px] pt-24 px-6 md:px-margin-desktop pb-24 bg-background min-h-screen">
        {/* Header section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-outline-variant/30 pb-6">
          <div>
            <h1 className="font-display-lg text-3xl font-bold text-white">{t.title}</h1>
            <p className="text-on-surface-variant text-xs mt-1">{t.subtitle}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary-container text-on-primary-container font-semibold px-5 py-3 rounded-xl hover:brightness-110 active:scale-98 transition-all flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            {t.createBtn}
          </button>
        </header>

        {paymentStatus === 'success' && (
          <div className="mb-8 p-4 rounded-xl bg-green-600/10 border border-green-500/30 text-green-400 text-xs flex items-center gap-2 animate-in slide-in-from-top-2">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span>{t.paymentSuccess}</span>
          </div>
        )}

        {paymentStatus === 'error' && (
          <div className="mb-8 p-4 rounded-xl bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2 animate-in slide-in-from-top-2">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{t.paymentError}</span>
          </div>
        )}

        {/* Invoices List Grid */}
        <div className="glass-panel rounded-2xl border border-outline-variant/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-high border-b border-outline-variant/50 text-on-surface-variant uppercase tracking-wider font-bold">
                  <th className="p-4">{t.docNumber}</th>
                  <th className="p-4">{t.type}</th>
                  <th className="p-4">{t.client}</th>
                  <th className="p-4">{t.project}</th>
                  <th className="p-4">{t.amount}</th>
                  <th className="p-4">{t.dueDate}</th>
                  <th className="p-4">{t.status}</th>
                  <th className="p-4 text-center">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 font-medium">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-on-surface-variant">
                      {t.noInvoices}
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-surface-container/30 transition-colors">
                      <td className="p-4 font-bold text-white">{inv.invoice_number}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          inv.type === 'estimate' ? 'bg-orange-500/10 text-orange-400' : 'bg-primary-container/10 text-primary'
                        }`}>
                          {inv.type === 'estimate' ? t.estimate : t.invoice}
                        </span>
                      </td>
                      <td className="p-4">{inv.pf_clients?.name || t.unknown}</td>
                      <td className="p-4 truncate max-w-[150px]">{inv.pf_projects?.name || t.notApplicable}</td>
                      <td className="p-4 font-bold text-white">{inv.amount_fcfa.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} FCFA</td>
                      <td className="p-4">{inv.due_date ? new Date(inv.due_date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US') : t.notApplicable}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          inv.status === 'paid' ? 'bg-green-600/10 text-green-400' : inv.status === 'sent' ? 'bg-blue-600/10 text-blue-400' : 'bg-outline-variant/30 text-on-surface-variant'
                        }`}>
                          {inv.status === 'paid' ? t.paid : inv.status === 'sent' ? t.sent : t.draft}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-center">
                          {/* Simulate PDF download */}
                          <button
                            onClick={() => simulatePdfExport(inv)}
                            className="p-1.5 bg-surface-container-highest rounded border border-outline-variant/30 hover:border-primary text-on-surface-variant hover:text-white cursor-pointer"
                            title={t.pdfTitle}
                          >
                            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                          </button>

                          {/* Copy payment link for unpaid invoices */}
                          {inv.status !== 'paid' && (
                            <button
                              onClick={() => handleCopyPaymentLink(inv)}
                              className="p-1.5 bg-surface-container-highest rounded border border-outline-variant/30 hover:border-primary text-on-surface-variant hover:text-white cursor-pointer"
                              title={t.copyLinkTitle || "Copier le lien de paiement"}
                            >
                              <span className="material-symbols-outlined text-[16px]">link</span>
                            </button>
                          )}

                          {/* Trigger Wave Payment for unpaid invoices */}
                          {inv.status !== 'paid' && (
                            <button
                              onClick={() => handleWavePayment(inv)}
                              className="px-3 py-1.5 bg-primary-container text-on-primary-container rounded font-bold text-[10px] uppercase tracking-wider hover:brightness-110 cursor-pointer flex items-center gap-1 shadow"
                              title={t.waveTitle}
                            >
                              <span className="material-symbols-outlined text-xs">phone_iphone</span>
                              Wave
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <MobileNav />

      {/* Invoice Modal dialog */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg glass-panel rounded-2xl p-6 border border-outline-variant/40 shadow-2xl animate-in scale-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-xl font-bold text-white">{t.newDocTitle}</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="material-symbols-outlined text-on-surface-variant hover:text-white cursor-pointer"
              >
                close
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t.docTypeLabel}</label>
                  <select
                    value={billType}
                    onChange={(e) => setBillType(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors cursor-pointer"
                  >
                    <option value="invoice">{t.invoice}</option>
                    <option value="estimate">{t.estimate}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t.docNumberLabel}</label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t.amountLabel}</label>
                <input
                  type="number"
                  required
                  value={amountFcfa}
                  onChange={(e) => setAmountFcfa(e.target.value)}
                  placeholder="Ex: 50000"
                  className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                />
              </div>

              {/* Client selection or quick create */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t.selectClientLabel}</label>
                <select
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    if (e.target.value) setClientName('');
                  }}
                  className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors cursor-pointer"
                >
                  <option value="">{t.chooseExistingClient}</option>
                  {clients.map((cl) => (
                    <option key={cl.id} value={cl.id}>
                      {cl.name}
                    </option>
                  ))}
                </select>
              </div>

              {!clientId && (
                <div className="space-y-1 p-3 bg-surface-container/50 rounded-xl border border-outline-variant/20 animate-in slide-in-from-top-1">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-wider">{t.orCreateClient}</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder={t.newClientPlaceholder}
                    className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t.associatedProject}</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors cursor-pointer"
                  >
                    <option value="">{t.selectProjectPlaceholder}</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t.dueDateLabel}</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-outline-variant text-on-surface font-semibold rounded-xl hover:bg-surface-container-highest transition-colors cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-3 bg-primary-container text-on-primary-container font-semibold rounded-xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  {creating ? (
                    <span className="w-5 h-5 rounded-full border-2 border-on-primary-container/30 border-t-on-primary-container animate-spin"></span>
                  ) : (
                    t.issueDoc
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification for Link Copy Success */}
      {copySuccessToast && (
        <div className="fixed bottom-6 right-6 z-[200] bg-green-600 border border-green-500/30 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <div className="text-left">
            <p className="text-xs font-bold">{t.copyLinkTitle}</p>
            <p className="text-[10px] opacity-90 mt-0.5">{t.copyLinkMsg}</p>
          </div>
        </div>
      )}
    </div>
  );
}
