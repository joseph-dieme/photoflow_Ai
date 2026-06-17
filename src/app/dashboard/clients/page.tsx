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
    searchPlaceholder: 'Rechercher un client...',
    noResults: 'Aucun client trouvé pour cette recherche.',
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
    searchPlaceholder: 'Search clients...',
    noResults: 'No clients found matching your search.',
  }
};

// Helper function to generate a consistent, beautiful gradient based on the client name
const getAvatarGradient = (name: string) => {
  const hash = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradients = [
    'from-pink-500 to-rose-500',
    'from-purple-600 to-indigo-600',
    'from-blue-500 to-cyan-500',
    'from-teal-500 to-emerald-500',
    'from-orange-500 to-amber-500',
    'from-violet-500 to-fuchsia-500',
  ];
  return gradients[hash % gradients.length];
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
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredClients = clients.filter((client) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      client.name.toLowerCase().includes(query) ||
      (client.email && client.email.toLowerCase().includes(query)) ||
      (client.phone && client.phone.toLowerCase().includes(query)) ||
      (client.address && client.address.toLowerCase().includes(query))
    );
  });

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
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display-lg text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-3xl">people</span>
              {t.title}
            </h1>
            <p className="text-on-surface-variant text-sm mt-1">{t.subtitle}</p>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-primary to-primary-container hover:from-primary/90 hover:to-primary-container/90 text-white font-semibold px-5 py-3 rounded-xl active:scale-98 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 cursor-pointer self-start md:self-auto shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            {t.addClient}
          </button>
        </header>

        {/* Search & Actions Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-outline-variant/30 mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between backdrop-blur-md bg-surface-container/10">
          <div className="relative w-full sm:max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-background/50 border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl pl-12 pr-10 py-2.5 text-sm outline-none transition-all placeholder:text-on-surface-variant/50 text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white text-lg transition-colors cursor-pointer"
              >
                close
              </button>
            )}
          </div>
          <div className="text-xs text-on-surface-variant font-medium shrink-0 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
              {filteredClients.length} {filteredClients.length > 1 ? 'clients' : 'client'}
            </span>
            {searchQuery && (
              <span className="text-on-surface-variant/70">
                ({lang === 'fr' ? 'filtré' : 'filtered'})
              </span>
            )}
          </div>
        </div>

        {/* Clients Directory list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.length === 0 ? (
            <div className="col-span-full glass-panel p-16 rounded-3xl text-center flex flex-col items-center justify-center border border-dashed border-outline-variant/40 bg-surface-container/5 backdrop-blur-md">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 text-primary">
                <span className="material-symbols-outlined text-3xl">group</span>
              </div>
              <h3 className="font-headline-md text-xl font-bold text-white mb-2">{t.noClientTitle}</h3>
              <p className="text-on-surface-variant text-sm mb-6 max-w-sm">
                {t.noClientDesc}
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-primary text-on-primary hover:bg-primary/90 font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-primary/20 active:scale-98 cursor-pointer"
              >
                {t.addFirstClient}
              </button>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="col-span-full glass-panel p-16 rounded-3xl text-center flex flex-col items-center justify-center border border-outline-variant/20 bg-surface-container/5 backdrop-blur-md">
              <div className="w-16 h-16 rounded-full bg-on-surface-variant/10 border border-on-surface-variant/20 flex items-center justify-center mb-5 text-on-surface-variant">
                <span className="material-symbols-outlined text-3xl">search_off</span>
              </div>
              <h3 className="font-headline-md text-xl font-bold text-white mb-2">{t.noResults}</h3>
              <p className="text-on-surface-variant text-sm mb-6 max-w-xs">
                {lang === 'fr' ? 'Essayez de modifier vos mots-clés ou filtres.' : 'Try adjusting your search terms or filters.'}
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="border border-outline-variant hover:bg-surface-container-highest text-white font-semibold px-4 py-2 rounded-xl transition-all duration-300 active:scale-98 cursor-pointer text-xs"
              >
                {lang === 'fr' ? 'Effacer la recherche' : 'Clear search'}
              </button>
            </div>
          ) : (
            filteredClients.map((client) => {
              const initials = client.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
              const gradient = getAvatarGradient(client.name);
              
              return (
                <div 
                  key={client.id}
                  onClick={() => handleOpenClientDetails(client)}
                  className="glass-panel p-6 rounded-2xl border border-outline-variant/20 bg-surface-container/5 flex flex-col justify-between hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                >
                  {/* Subtle top glow on card hover */}
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary/50 to-primary-container/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      {/* Modern Avatar with dynamic gradient */}
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white text-lg shadow-inner shrink-0 tracking-wider relative`}>
                        {initials}
                        <div className="absolute inset-0 rounded-2xl border border-white/10" />
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <h3 className="font-headline-md text-base text-white font-bold truncate group-hover:text-primary transition-colors flex items-center gap-1.5" title={client.name}>
                          {client.name}
                        </h3>
                        
                        {/* Interactive contact items */}
                        <div className="space-y-1.5 mt-2">
                          {client.email ? (
                            <a 
                              href={`mailto:${client.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary transition-colors w-fit max-w-full"
                              title={client.email}
                            >
                              <span className="material-symbols-outlined text-sm text-primary/70">mail</span>
                              <span className="truncate">{client.email}</span>
                            </a>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-on-surface-variant/40">
                              <span className="material-symbols-outlined text-sm">mail</span>
                              <span className="italic">{t.notProvided}</span>
                            </div>
                          )}
                          
                          {client.phone ? (
                            <a 
                              href={`tel:${client.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary transition-colors w-fit"
                            >
                              <span className="material-symbols-outlined text-sm text-primary/70">phone</span>
                              <span>{client.phone}</span>
                            </a>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-on-surface-variant/40">
                              <span className="material-symbols-outlined text-sm">phone</span>
                              <span className="italic">{t.notProvided}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-outline-variant/15 flex justify-between items-center text-xs text-on-surface-variant mt-2">
                    <span className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full font-semibold group-hover:bg-primary/20 group-hover:border-primary/30 transition-all">
                      <span className="material-symbols-outlined text-[14px]">folder_open</span>
                      <span>{getClientProjectsCount(client.id)} {t.shoots}</span>
                    </span>
                    {client.address ? (
                      <span className="flex items-center gap-1 text-[11px] text-on-surface-variant/80 max-w-[140px] truncate" title={client.address}>
                        <span className="material-symbols-outlined text-[13px] text-on-surface-variant/50">location_on</span>
                        <span className="truncate">{client.address}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-on-surface-variant/30 italic">
                        {t.notProvidedFem}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <MobileNav />

      {/* Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-panel rounded-2xl p-6 border border-outline-variant/30 bg-surface-container/15 shadow-2xl animate-in scale-in duration-300 relative overflow-hidden">
            {/* Subtle glow border effect */}
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-primary to-primary-container" />
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-xl">person_add</span>
                <h3 className="font-headline-md text-xl font-bold text-white">{t.newClientTitle}</h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container/50 hover:bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-white transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant/90 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">person</span>
                  {t.fullNameLabel} <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.fullNamePlaceholder}
                  className="w-full bg-background/50 border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-2.5 text-sm outline-none transition-all placeholder:text-on-surface-variant/40 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant/90 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">phone</span>
                  {t.phoneLabel}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.phonePlaceholder}
                  className="w-full bg-background/50 border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-2.5 text-sm outline-none transition-all placeholder:text-on-surface-variant/40 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant/90 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">mail</span>
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full bg-background/50 border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-2.5 text-sm outline-none transition-all placeholder:text-on-surface-variant/40 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant/90 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">location_on</span>
                  {t.addressLabel}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t.addressPlaceholder}
                  className="w-full bg-background/50 border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-2.5 text-sm outline-none transition-all placeholder:text-on-surface-variant/40 text-white"
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-outline-variant hover:bg-surface-container-highest text-white font-semibold rounded-xl transition-all active:scale-98 cursor-pointer text-sm"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-container text-white font-semibold rounded-xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 cursor-pointer text-sm"
                >
                  {creating ? (
                    <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-3xl glass-panel rounded-2xl p-6 border border-outline-variant/30 bg-surface-container/15 shadow-2xl animate-in scale-in duration-300 flex flex-col max-h-[90vh] relative overflow-hidden">
            {/* Subtle glow border effect */}
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-primary to-primary-container" />

            {/* Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/15">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getAvatarGradient(selectedClient.name)} flex items-center justify-center font-bold text-white text-base shadow-inner`}>
                  {selectedClient.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-headline-md text-xl font-bold text-white leading-tight">
                    {selectedClient.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant/80 mt-0.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">contact_page</span>
                    {t.clientFileTitle}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedClient(null)}
                className="w-8 h-8 rounded-full bg-surface-container/50 hover:bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-white transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Split Content: Details & Projects */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 overflow-y-auto pr-1 custom-scrollbar flex-1 pb-4">
              
              {/* Left Column: Client Details Form / Card (Col span 3) */}
              <div className="md:col-span-3 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-xs">badge</span>
                    {t.profileInfo}
                  </h4>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-primary hover:text-primary/80 text-xs flex items-center gap-1 cursor-pointer font-semibold bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary/15 transition-all"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span> {t.edit}
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSaveClientChanges} className="space-y-4 bg-background/30 p-5 rounded-2xl border border-outline-variant/20">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-on-surface-variant/90 uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">person</span>
                        {t.fullNameLabel}
                      </label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-background/50 border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-on-surface-variant/90 uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">phone</span>
                        {t.phoneLabel}
                      </label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full bg-background/50 border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-on-surface-variant/90 uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">mail</span>
                        {t.emailLabel}
                      </label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full bg-background/50 border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-on-surface-variant/90 uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">location_on</span>
                        {t.addressLabel}
                      </label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="w-full bg-background/50 border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all text-white"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 py-2.5 border border-outline-variant text-on-surface text-xs font-semibold rounded-xl hover:bg-surface-container-highest transition-colors cursor-pointer"
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="submit"
                        disabled={savingClient}
                        className="flex-1 py-2.5 bg-primary text-on-primary text-xs font-semibold rounded-xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-lg shadow-primary/20"
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
                  <div className="space-y-4 bg-background/30 p-5 rounded-2xl border border-outline-variant/20">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-lg">person</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-on-surface-variant/80 uppercase tracking-wider font-bold">{t.nameLabel}</div>
                        <div className="text-sm font-semibold text-white mt-0.5">{selectedClient.name}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-lg">phone</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-on-surface-variant/80 uppercase tracking-wider font-bold">{t.phoneLabel}</div>
                        {selectedClient.phone ? (
                          <a href={`tel:${selectedClient.phone}`} className="text-sm font-semibold text-white hover:text-primary transition-colors inline-block mt-0.5">
                            {selectedClient.phone}
                          </a>
                        ) : (
                          <div className="text-sm font-semibold text-on-surface-variant/40 italic mt-0.5">{t.notProvided}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-lg">mail</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-on-surface-variant/80 uppercase tracking-wider font-bold">{t.emailLabel}</div>
                        {selectedClient.email ? (
                          <a href={`mailto:${selectedClient.email}`} className="text-sm font-semibold text-white hover:text-primary transition-colors break-all inline-block mt-0.5">
                            {selectedClient.email}
                          </a>
                        ) : (
                          <div className="text-sm font-semibold text-on-surface-variant/40 italic mt-0.5">{t.notProvided}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-lg">location_on</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-on-surface-variant/80 uppercase tracking-wider font-bold">{t.addressLabel}</div>
                        {selectedClient.address ? (
                          <div className="text-sm font-semibold text-white mt-0.5">{selectedClient.address}</div>
                        ) : (
                          <div className="text-sm font-semibold text-on-surface-variant/40 italic mt-0.5">{t.notProvidedFem}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Projects/Shoots folders (Col span 2) */}
              <div className="md:col-span-2 space-y-4 flex flex-col h-full">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-xs">folder</span>
                  {t.shootsTitle}
                  <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full ml-1">
                    {projects.filter(p => p.client_id === selectedClient.id).length}
                  </span>
                </h4>

                <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 max-h-[300px] md:max-h-[350px]">
                  {projects.filter(p => p.client_id === selectedClient.id).length === 0 ? (
                    <div className="p-8 text-center text-xs text-on-surface-variant/50 bg-background/20 rounded-2xl border border-dashed border-outline-variant/30 flex flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-on-surface-variant/30 mb-2">folder_open</span>
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
                        className="p-3 bg-background/40 hover:bg-background/80 border border-outline-variant/20 hover:border-primary/30 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-300 group/item hover:shadow-lg shadow-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover/item:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-lg">folder</span>
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate group-hover/item:text-primary transition-colors" title={proj.name}>{proj.name}</div>
                            <div className="text-[9px] text-on-surface-variant/80 mt-0.5">
                              {proj.project_type || 'Shoot'} • {proj.date ? new Date(proj.date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US') : t.undated}
                            </div>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-on-surface-variant group-hover/item:text-white text-sm transition-colors transform group-hover/item:translate-x-0.5 duration-300">chevron_right</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-outline-variant/15 flex justify-end">
              <button
                onClick={() => setSelectedClient(null)}
                className="px-5 py-2.5 bg-surface-container-highest hover:bg-surface-bright text-white font-semibold rounded-xl text-xs active:scale-98 transition-all cursor-pointer shadow-md"
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
          <div className="w-full max-w-sm glass-panel p-6 rounded-2xl border border-green-500/20 bg-surface-container/15 shadow-2xl text-center flex flex-col items-center animate-in zoom-in-95 duration-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-green-500" />
            
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-5 text-green-400 shadow-inner">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            
            <h3 className="font-display-lg text-lg font-bold text-white mb-2">
              {t.successTitle}
            </h3>
            <p className="text-on-surface-variant text-xs mb-6 px-2 leading-relaxed">
              {t.successDesc}
            </p>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 rounded-xl hover:brightness-110 active:scale-98 transition-all cursor-pointer text-xs shadow-lg shadow-green-900/20"
            >
              {t.successBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
