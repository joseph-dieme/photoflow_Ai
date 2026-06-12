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
    title: 'Répertoire Clients',
    subtitle: 'Gérez les contacts de vos clients et suivez leurs dossiers de shooting associés.',
    addClient: 'Ajouter un client',
    noClientTitle: 'Aucun client trouvé',
    noClientDesc: 'Enregistrez vos clients pour lier leurs dossiers de photos, émettre des factures et leur livrer des galeries privées.',
    addFirstClient: 'Ajouter mon premier client',
    shoots: 'Shoots',
    newClientTitle: 'Nouveau Client',
    fullNameLabel: 'Nom Complet',
    fullNamePlaceholder: 'Ex: Fatou Sylla',
    phoneLabel: 'Téléphone',
    phonePlaceholder: 'Ex: +221 77 000 00 00',
    emailLabel: 'Adresse Email',
    emailPlaceholder: 'nom@exemple.com',
    addressLabel: 'Adresse Physique',
    addressPlaceholder: 'Ex: Dakar Plateau',
    cancel: 'Annuler',
    submitAdd: 'Ajouter le Client',
    adding: 'Ajout...',
    clientFileTitle: 'Dossier Client',
    clientFileSubtitle: 'Gérez les détails et visualisez les dossiers associés.',
    profileInfo: 'Informations Profil',
    edit: 'Éditer',
    save: 'Enregistrer',
    saving: 'Enregistrement...',
    nameLabel: 'Nom',
    notProvided: 'Non renseigné',
    notProvidedFem: 'Non renseignée',
    shootsTitle: 'Dossiers Photos & Shoots',
    noAssociatedShoots: 'Aucun shoot associé à ce client.',
    undated: 'Non daté',
    closeFile: 'Fermer le dossier',
    successTitle: 'Création Réussie !',
    successDesc: 'Le dossier client a été créé avec succès dans votre répertoire. Vous pouvez maintenant y associer des projets photos et émettre des factures.',
    successBtn: 'Super, merci !',
    errorUpdate: 'Erreur lors de la mise à jour du client.',
    errorCreate: 'Erreur lors de la création du client.',
  },
  en: {
    title: 'Client Directory',
    subtitle: 'Manage client contacts and follow their associated photo shoots.',
    addClient: 'Add Client',
    noClientTitle: 'No clients found',
    noClientDesc: 'Save client contacts to link their photo folders, issue invoices, and deliver private galleries.',
    addFirstClient: 'Add my first client',
    shoots: 'Shoots',
    newClientTitle: 'New Client',
    fullNameLabel: 'Full Name',
    fullNamePlaceholder: 'e.g., Fatou Sylla',
    phoneLabel: 'Phone Number',
    phonePlaceholder: 'e.g., +221 77 000 00 00',
    emailLabel: 'Email Address',
    emailPlaceholder: 'name@example.com',
    addressLabel: 'Physical Address',
    addressPlaceholder: 'e.g., Dakar Plateau',
    cancel: 'Cancel',
    submitAdd: 'Add Client',
    adding: 'Adding...',
    clientFileTitle: 'Client File',
    clientFileSubtitle: 'Manage details and view associated shoots.',
    profileInfo: 'Profile Information',
    edit: 'Edit',
    save: 'Save',
    saving: 'Saving...',
    nameLabel: 'Name',
    notProvided: 'Not provided',
    notProvidedFem: 'Not provided',
    shootsTitle: 'Photo Folders & Shoots',
    noAssociatedShoots: 'No shoots associated with this client.',
    undated: 'Undated',
    closeFile: 'Close file',
    successTitle: 'Created Successfully!',
    successDesc: 'The client file has been successfully created in your directory. You can now link photo shoots and issue invoices.',
    successBtn: 'Great, thanks!',
    errorUpdate: 'Error updating client profile.',
    errorCreate: 'Error creating client profile.',
  }
};

export default function ClientsPage() {
  const router = useRouter();
  const lang = useLanguage();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Data States
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  
  // UI States
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // Client Detail States
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [savingClient, setSavingClient] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        fetchClientsAndProjects(session.user.id);
      }
    });
  }, [router]);

  // Open the add client modal if '?new=true' is in the URL search query
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryParams = new URLSearchParams(window.location.search);
      if (queryParams.get('new') === 'true') {
        setTimeout(() => setShowModal(true), 0);
        // Clear query parameters without reloading the page
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  const handleOpenClientDetails = (client: any) => {
    setSelectedClient(client);
    setIsEditing(false);
    setEditName(client.name);
    setEditPhone(client.phone || '');
    setEditEmail(client.email || '');
    setEditAddress(client.address || '');
  };

  const handleSaveClientChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !user) return;
    setSavingClient(true);
    try {
      const { error } = await supabase
        .from('pf_clients')
        .update({
          name: editName,
          phone: editPhone || null,
          email: editEmail || null,
          address: editAddress || null,
        })
        .eq('id', selectedClient.id);

      if (error) throw error;

      const updatedClient = {
        ...selectedClient,
        name: editName,
        phone: editPhone,
        email: editEmail,
        address: editAddress,
      };

      setClients((prev) => prev.map((c) => (c.id === selectedClient.id ? updatedClient : c)));
      setSelectedClient(updatedClient);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating client:', err);
      alert(t.errorUpdate);
    } finally {
      setSavingClient(false);
    }
  };

  async function fetchClientsAndProjects(userId: string) {
    setLoading(true);
    try {
      // Fetch clients and projects in parallel
      const [
        { data: clientsData },
        { data: projectsData }
      ] = await Promise.all([
        supabase.from('pf_clients').select('*').eq('user_id', userId).order('name', { ascending: true }),
        supabase.from('pf_projects').select('*').eq('user_id', userId)
      ]);
      
      setClients(clientsData || []);
      setProjects(projectsData || []);
    } catch (err) {
      console.error('Error fetching clients data:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCreating(true);

    try {
      const { error } = await supabase
        .from('pf_clients')
        .insert({
          user_id: user.id,
          name,
          phone,
          email,
          address,
        });

      if (error) throw error;

      setShowModal(false);
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      fetchClientsAndProjects(user.id);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error creating client:', err);
      alert(t.errorCreate);
    } finally {
      setCreating(false);
    }
  };

  const getClientProjectsCount = (clientId: string) => {
    return projects.filter((p) => p.client_id === clientId).length;
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
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            {t.addClient}
          </button>
        </header>

        {/* Clients Directory list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.length === 0 ? (
            <div className="col-span-full glass-panel p-16 rounded-2xl text-center flex flex-col items-center justify-center border border-dashed border-outline-variant/50">
              <span className="material-symbols-outlined text-outline text-6xl mb-4">group</span>
              <h3 className="font-headline-md text-lg font-bold text-white mb-2">{t.noClientTitle}</h3>
              <p className="text-on-surface-variant text-sm mb-6 max-w-sm">
                {t.noClientDesc}
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-primary-container text-on-primary-container px-4 py-2.5 rounded-lg text-xs font-semibold"
              >
                {t.addFirstClient}
              </button>
            </div>
          ) : (
            clients.map((client) => (
              <div 
                key={client.id}
                onClick={() => handleOpenClientDetails(client)}
                className="glass-panel p-6 rounded-2xl border border-outline-variant/30 flex flex-col justify-between hover:border-primary/20 hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-base uppercase shrink-0">
                    {client.name.substring(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-headline-md text-base text-white font-bold truncate group-hover:text-primary transition-colors" title={client.name}>
                      {client.name}
                    </h3>
                    {client.email && (
                      <p className="text-xs text-on-surface-variant truncate mt-0.5" title={client.email}>
                        {client.email}
                      </p>
                    )}
                    {client.phone && (
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {client.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-outline-variant/10 flex justify-between items-center text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1 text-primary-container font-semibold group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-sm">folder_open</span>
                    <span>{getClientProjectsCount(client.id)} {t.shoots}</span>
                  </span>
                  {client.address && (
                    <span className="truncate max-w-[120px]" title={client.address}>
                      {client.address}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <MobileNav />

      {/* Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-panel rounded-2xl p-6 border border-outline-variant/40 shadow-2xl animate-in scale-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-xl font-bold text-white">{t.newClientTitle}</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="material-symbols-outlined text-on-surface-variant hover:text-white cursor-pointer"
              >
                close
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t.fullNameLabel}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.fullNamePlaceholder}
                  className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t.phoneLabel}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.phonePlaceholder}
                  className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t.emailLabel}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t.addressLabel}</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t.addressPlaceholder}
                  className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                />
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
                    t.submitAdd
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl glass-panel rounded-2xl p-6 border border-outline-variant/40 shadow-2xl animate-in scale-in duration-300 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary text-sm uppercase">
                  {selectedClient.name.substring(0, 2)}
                </div>
                <div>
                  <h3 className="font-headline-md text-lg font-bold text-white leading-none">
                    {t.clientFileTitle} : {selectedClient.name}
                  </h3>
                  <p className="text-[10px] text-on-surface-variant mt-1">{t.clientFileSubtitle}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedClient(null)}
                className="material-symbols-outlined text-on-surface-variant hover:text-white cursor-pointer"
              >
                close
              </button>
            </div>

            {/* Split Content: Details & Projects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-1 custom-scrollbar flex-1">
              {/* Left Column: Client Details Form */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider">{t.profileInfo}</h4>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-primary hover:underline text-xs flex items-center gap-1 cursor-pointer font-semibold"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span> {t.edit}
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSaveClientChanges} className="space-y-4 bg-surface-container/30 p-4 rounded-xl border border-outline-variant/20">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{t.fullNameLabel}</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-3 py-2 text-xs outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{t.phoneLabel}</label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-3 py-2 text-xs outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{t.emailLabel}</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-3 py-2 text-xs outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{t.addressLabel}</label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-3 py-2 text-xs outline-none transition-colors"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 py-2 border border-outline-variant text-on-surface text-xs font-semibold rounded-lg hover:bg-surface-container-highest transition-colors cursor-pointer"
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="submit"
                        disabled={savingClient}
                        className="flex-1 py-2 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        {savingClient ? (
                          <span className="w-4 h-4 rounded-full border-2 border-on-primary/30 border-t-on-primary animate-spin"></span>
                        ) : (
                          t.save
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4 bg-surface-container/20 p-4 rounded-xl border border-outline-variant/20">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-on-surface-variant text-base mt-0.5">person</span>
                      <div>
                        <div className="text-[10px] text-on-surface-variant uppercase tracking-wider">{t.nameLabel}</div>
                        <div className="text-sm font-semibold text-white">{selectedClient.name}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-on-surface-variant text-base mt-0.5">phone</span>
                      <div>
                        <div className="text-[10px] text-on-surface-variant uppercase tracking-wider">{t.phoneLabel}</div>
                        <div className="text-sm font-semibold text-white">{selectedClient.phone || t.notProvided}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-on-surface-variant text-base mt-0.5">mail</span>
                      <div>
                        <div className="text-[10px] text-on-surface-variant uppercase tracking-wider">{t.emailLabel}</div>
                        <div className="text-sm font-semibold text-white break-all">{selectedClient.email || t.notProvided}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-on-surface-variant text-base mt-0.5">location_on</span>
                      <div>
                        <div className="text-[10px] text-on-surface-variant uppercase tracking-wider">{t.addressLabel}</div>
                        <div className="text-sm font-semibold text-white">{selectedClient.address || t.notProvidedFem}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Projects/Shoots folders */}
              <div className="space-y-4 flex flex-col h-full">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                  {t.shootsTitle} ({projects.filter(p => p.client_id === selectedClient.id).length})
                </h4>

                <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 max-h-[300px]">
                  {projects.filter(p => p.client_id === selectedClient.id).length === 0 ? (
                    <div className="p-8 text-center text-xs text-on-surface-variant bg-surface-container/10 rounded-xl border border-dashed border-outline-variant/30">
                      {t.noAssociatedShoots}
                    </div>
                  ) : (
                    projects.filter(p => p.client_id === selectedClient.id).map(proj => (
                      <div 
                        key={proj.id}
                        onClick={() => {
                          setSelectedClient(null);
                          router.push(`/dashboard/projects/${proj.id}`);
                        }}
                        className="p-3 bg-surface-container/40 hover:bg-surface-container/80 border border-outline-variant/20 hover:border-primary/30 rounded-xl flex items-center justify-between cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                           <span className="material-symbols-outlined text-primary text-xl">folder</span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate" title={proj.name}>{proj.name}</div>
                            <div className="text-[9px] text-on-surface-variant mt-0.5">
                              {proj.project_type || 'Shoot'} • {proj.date ? new Date(proj.date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US') : t.undated}
                            </div>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-on-surface-variant text-sm">chevron_right</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-outline-variant/30 flex justify-end">
              <button
                onClick={() => setSelectedClient(null)}
                className="px-5 py-2.5 bg-surface-container-highest text-white font-semibold rounded-xl text-xs hover:bg-surface-bright active:scale-98 transition-all cursor-pointer"
              >
                {t.closeFile}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm glass-panel p-6 rounded-2xl border border-green-500/30 shadow-2xl text-center flex flex-col items-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-4 text-green-400">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            
            <h3 className="font-display-lg text-lg font-bold text-white mb-2">
              {t.successTitle}
            </h3>
            <p className="text-on-surface-variant text-xs mb-6 px-2">
              {t.successDesc}
            </p>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-primary-container text-on-primary-container font-semibold py-2.5 rounded-xl hover:brightness-110 active:scale-98 transition-all cursor-pointer text-xs shadow-lg"
            >
              {t.successBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
