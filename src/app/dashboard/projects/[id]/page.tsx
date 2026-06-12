'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { compressAndConvert, applyAdjustments, DEFAULT_ADJUSTMENTS, loadImage } from '@/lib/image-processing';
import { analyzeImageTriage } from '@/lib/triage-analyzer';
import Navigation from '@/components/Navigation';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { useLanguage } from '@/hooks/useLanguage';

const translations = {
  fr: {
    backToProjects: 'Retour aux projets',
    client: 'Client',
    none: 'Aucun',
    shootDate: 'Shooting le',
    unplanned: 'Non planifié',
    privateGallery: 'Galerie Client Privée',
    copyTitle: 'Copier le lien de la galerie',
    importShots: 'Importer vos clichés',
    dragDropText: 'Glissez-déposez vos fichiers ici, ou cliquez pour parcourir. Prise en charge des formats JPG, PNG, WEBP et RAW.',
    compressionActive: 'Compression auto active • Format final : WebP HD',
    queueTitle: "File d'attente d'importation",
    importedShots: 'Clichés importés',
    bulkSelect: 'Sélection groupée',
    cancel: 'Annuler',
    selectAll: 'Tout sélectionner',
    deselectAll: 'Tout désélectionner',
    noPhotos: 'Aucune photo importée pour le moment.',
    noPhotosFilter: 'Aucune photo ne correspond à ce filtre.',
    topBadge: 'Top',
    blurryBadge: 'Floue',
    lightBadge: 'Lumière',
    contrastBadge: 'Contraste',
    aiEditor: 'Éditeur IA',
    smartSorting: 'Tri de Photos Intelligent',
    smartSortingDesc: 'Identifiez instantanément les photos floues et classez les meilleures.',
    analyzing: 'Analyse en cours...',
    rerunSort: "Relancer l'analyse automatique",
    runSort: 'Lancer le tri automatique',
    sortFilters: 'Filtres de Tri',
    all: 'Toutes',
    excellent: 'Excellentes',
    blurry: 'Floues',
    exposure: 'Exposition',
    quickActions: 'Actions Rapides',
    selectBlurry: 'Sélectionner Floues',
    selectTops: 'Sélectionner Tops',
    importAutomations: "Automations d'Importation",
    importAutomationsDesc: "Améliorez vos clichés automatiquement dès l'import.",
    autoRetouchLabel: 'Retouche IA Automatique',
    retouchNone: 'Aucune retouche (Brut)',
    retouchAuto: 'Correction Auto (Tons & Exposition)',
    retouchFace: 'Visage Sublime (Teint + Skin Glow)',
    retouchSkin: 'Peau Lisse (Adoucissement)',
    retouchHdr: 'HDR Intelligent (Détails Ombres)',
    deliverySettings: 'Paramètres de Livraison',
    deliverySettingsDesc: "Configurez les restrictions d'accès pour votre client.",
    password: 'Mot de passe',
    passcodeAccess: "Passcode d'accès",
    passwordPlaceholder: 'Entrez un mot de passe court',
    watermark: 'Filigraner',
    secureGallery: 'Sécuriser la galerie client',
    saveSettings: 'Enregistrer les paramètres',
    photosSelected: 'photos sélectionnées',
    photoSelected: 'photo sélectionnée',
    rotateLeft: 'Gauches',
    rotateRight: 'Droites',
    deselect: 'Désélectionner',
    delete: 'Supprimer',
    confirmDeleteTitle: 'Confirmer la suppression',
    confirmDeleteSingle: 'Êtes-vous sûr de vouloir supprimer définitivement cette photo ? Cette action est irréversible.',
    confirmDeleteMultiple: 'Êtes-vous sûr de vouloir supprimer définitivement ces {count} photos ? Cette action est irréversible.',
    galleryUpdated: 'Galerie Mise à Jour !',
    galleryUpdatedDesc: "Les paramètres de sécurité et d'affichage de votre galerie ont été enregistrés avec succès. Vos clients y ont accès immédiatement.",
    thanksBtn: 'Super, merci !',
    errorSave: "Erreur lors de l'enregistrement.",
    errorUpdateRetouch: "Erreur lors de la mise à jour de l'option de retouche automatique.",
    rotating: 'Rotation en cours',
  },
  en: {
    backToProjects: 'Back to projects',
    client: 'Client',
    none: 'None',
    shootDate: 'Shoot date',
    unplanned: 'Not planned',
    privateGallery: 'Private Client Gallery',
    copyTitle: 'Copy gallery link',
    importShots: 'Import your shots',
    dragDropText: 'Drag & drop your files here, or click to browse. Supports JPG, PNG, WEBP and RAW.',
    compressionActive: 'Auto-compression active • Final format: WebP HD',
    queueTitle: 'Import queue',
    importedShots: 'Imported shots',
    bulkSelect: 'Bulk selection',
    cancel: 'Cancel',
    selectAll: 'Select all',
    deselectAll: 'Deselect all',
    noPhotos: 'No photos imported yet.',
    noPhotosFilter: 'No photos match this filter.',
    topBadge: 'Top',
    blurryBadge: 'Blurry',
    lightBadge: 'Light',
    contrastBadge: 'Contrast',
    aiEditor: 'AI Editor',
    smartSorting: 'Smart Photo Sorting',
    smartSortingDesc: 'Instantly identify blurry photos and rank the best ones.',
    analyzing: 'Analyzing...',
    rerunSort: 'Rerun auto-sorting',
    runSort: 'Run auto-sorting',
    sortFilters: 'Sort Filters',
    all: 'All',
    excellent: 'Excellent',
    blurry: 'Blurry',
    exposure: 'Exposure',
    quickActions: 'Quick Actions',
    selectBlurry: 'Select Blurry',
    selectTops: 'Select Tops',
    importAutomations: 'Import Automations',
    importAutomationsDesc: 'Automatically improve your shots upon import.',
    autoRetouchLabel: 'Automatic AI Retouching',
    retouchNone: 'No retouching (Raw)',
    retouchAuto: 'Auto Correction (Tones & Exposure)',
    retouchFace: 'Sublime Face (Skin Tone + Skin Glow)',
    retouchSkin: 'Smooth Skin (Smoothing)',
    retouchHdr: 'Smart HDR (Shadow Details)',
    deliverySettings: 'Delivery Settings',
    deliverySettingsDesc: 'Configure access restrictions for your client.',
    password: 'Password',
    passcodeAccess: 'Access passcode',
    passwordPlaceholder: 'Enter a short password',
    watermark: 'Watermark',
    secureGallery: 'Secure the client gallery',
    saveSettings: 'Save settings',
    photosSelected: 'photos selected',
    photoSelected: 'photo selected',
    rotateLeft: 'Left',
    rotateRight: 'Right',
    deselect: 'Deselect',
    delete: 'Delete',
    confirmDeleteTitle: 'Confirm deletion',
    confirmDeleteSingle: 'Are you sure you want to permanently delete this photo? This action is irreversible.',
    confirmDeleteMultiple: 'Are you sure you want to permanently delete these {count} photos? This action is irreversible.',
    galleryUpdated: 'Gallery Updated!',
    galleryUpdatedDesc: 'Your gallery\'s security and display settings have been saved successfully. Your clients have access immediately.',
    thanksBtn: 'Great, thanks!',
    errorSave: 'Error saving settings.',
    errorUpdateRetouch: 'Error updating automatic retouching options.',
    rotating: 'Rotating',
  }
};

interface UploadQueueItem {
  id: string;
  name: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const routeParams = useParams();
  const id = routeParams.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lang = useLanguage();
  const t = translations[lang];
  
  // States
  const [projectId, setProjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  // Gallery security states
  const [isProtected, setIsProtected] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [applyWatermark, setApplyWatermark] = useState(true);
  const [autoRetouch, setAutoRetouch] = useState('none');
  const [savingSettings, setSavingSettings] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Upload states
  const [dragActive, setDragActive] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [uploading, setUploading] = useState(false);

  // AI Generation states
  const [aiGenPrompt, setAiGenPrompt] = useState('');
  const [selectedGenModel, setSelectedGenModel] = useState('black-forest-labs/flux-schnell');
  const [isGeneratingAiImage, setIsGeneratingAiImage] = useState(false);

  // Load project details when ID is available
  useEffect(() => {
    if (id) {
      setTimeout(() => setProjectId(id), 0);
      fetchProjectData(id);
    }
  }, [id]);

  async function fetchProjectData(id: string) {
    setLoading(true);
    try {
      // 1. Fetch Project info
      const { data: projData, error: projError } = await supabase
        .from('pf_projects')
        .select('*, pf_clients(*)')
        .eq('id', id)
        .single();
      
      if (projError) throw projError;
      setProject(projData);
      setAutoRetouch(projData.auto_retouch || 'none');

      // 2. Fetch Photos
      const { data: photosData } = await supabase
        .from('pf_photos')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false });
      setPhotos(photosData || []);

      // 3. Fetch Gallery settings
      const { data: galleryData } = await supabase
        .from('pf_galleries')
        .select('*')
        .eq('project_id', id)
        .single();
      
      if (galleryData) {
        setGallery(galleryData);
        setIsProtected(galleryData.is_protected);
        setPasscode(galleryData.password_hash || '');
        setApplyWatermark(galleryData.apply_watermark !== false);
      }

      // 4. Fetch Profile
      const { data: profileData } = await supabase
        .from('pf_profiles')
        .select('*')
        .eq('id', projData.user_id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
      }
    } catch (err) {
      console.error('Error fetching project details:', err);
    } finally {
      setLoading(false);
    }
  }

  const saveGallerySettings = async () => {
    if (!gallery) return;
    setSavingSettings(true);
    try {
      const { error } = await supabase
        .from('pf_galleries')
        .update({
          is_protected: isProtected,
          password_hash: passcode || null,
          apply_watermark: applyWatermark,
        })
        .eq('id', gallery.id);

      if (error) throw error;
      setShowSuccessModal(true);
      // Refresh local gallery data
      fetchProjectData(projectId);
    } catch (err) {
      console.error('Error saving gallery settings:', err);
      alert(t.errorSave);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAutoRetouchChange = async (newVal: string) => {
    setAutoRetouch(newVal);
    try {
      const { error } = await supabase
        .from('pf_projects')
        .update({ auto_retouch: newVal })
        .eq('id', projectId);
      if (error) throw error;
    } catch (err) {
      console.error('Failed to update auto_retouch setting:', err);
      alert(t.errorUpdateRetouch);
    }
  };

  const copyGalleryLink = () => {
    if (!gallery) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/gallery/${gallery.url_slug}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Drag & Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        resolve({ width: 2048, height: 1365 }); // fallback
      };
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (files: File[]) => {
    if (profile?.plan !== 'pro' && photos.length + files.length > 25) {
      setShowUpgradeModal(true);
      return;
    }
    setUploading(true);
    const newQueueItems = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      progress: 0,
      status: 'pending' as const,
    }));

    setUploadQueue((prev) => [...prev, ...newQueueItems]);

    const uploadSingleFile = async (file: File, queueItem: typeof newQueueItems[0]) => {
      updateQueueItem(queueItem.id, { status: 'uploading', progress: 10 });

      try {
        // 1. Process image client-side: bypass compression/scaling for standard browser files
        const isRaw = /\.(raw|cr2|nef|arw|dng|pef)$/i.test(file.name);
        let optimizedFile = file;

        if (isRaw) {
          updateQueueItem(queueItem.id, { progress: 30 });
          // Convert RAW using high definition settings (16384px limits, 99% quality JPEG)
          optimizedFile = await compressAndConvert(file, {
            maxWidth: 16384,
            maxHeight: 16384,
            quality: 1.0,
            format: 'image/png',
          });
        }

        // Generate the base thumbnail file from optimizedFile (original)
        const originalThumbFile = await compressAndConvert(optimizedFile, {
          maxWidth: 600,
          maxHeight: 600,
          quality: 0.75,
          format: 'image/jpeg',
        });
        let thumbnailUploadFile = originalThumbFile;

        // 1.5. Apply auto retouching if configured
        let appliedAdjustmentsObj = DEFAULT_ADJUSTMENTS;
        if (autoRetouch !== 'none') {
          updateQueueItem(queueItem.id, { progress: 45 });
          
          let adj = { ...DEFAULT_ADJUSTMENTS };
          if (autoRetouch === 'auto') {
            adj = { ...adj, exposure: 15, contrast: 10, saturation: 5, clarity: 10 };
          } else if (autoRetouch === 'face') {
            adj = { ...adj, exposure: 10, highlights: 5, hslOrangeSaturation: -5, hslOrangeLuminance: 12, skinSmoothing: true };
          } else if (autoRetouch === 'skin') {
            adj = { ...adj, skinSmoothing: true };
          } else if (autoRetouch === 'hdr') {
            adj = { ...adj, shadows: 30, contrast: 12, highlights: -15, clarity: 15 };
          }
          appliedAdjustmentsObj = adj;

          // Convert optimizedFile to data URL
          const fileDataUrl = await new Promise<string>((resolveData, rejectData) => {
            const reader = new FileReader();
            reader.onload = () => resolveData(reader.result as string);
            reader.onerror = rejectData;
            reader.readAsDataURL(optimizedFile);
          });

          // Apply adjustments
          const processedBase64 = await applyAdjustments(fileDataUrl, adj, undefined, false);
          const processedThumbBase64 = await applyAdjustments(fileDataUrl, adj, undefined, 600);

          // Convert processedBase64 back to File
          const res = await fetch(processedBase64);
          const blob = await res.blob();
          
          // Detect the format from processedBase64
          let formatType = 'image/jpeg';
          let extension = '.jpg';
          if (processedBase64.startsWith('data:image/webp')) {
            formatType = 'image/webp';
            extension = '.webp';
          } else if (processedBase64.startsWith('data:image/png')) {
            formatType = 'image/png';
            extension = '.png';
          }
          
          const newName = optimizedFile.name.replace(/\.[^/.]+$/, "") + extension;
          optimizedFile = new File([blob], newName, { type: formatType });

          // Convert processedThumbBase64 back to File
          const thumbRes = await fetch(processedThumbBase64);
          const thumbBlob = await thumbRes.blob();
          const newThumbName = optimizedFile.name.replace(/\.[^/.]+$/, "") + '-thumb.jpg';
          thumbnailUploadFile = new File([thumbBlob], newThumbName, { type: 'image/jpeg' });
        }

        // 2. Upload to Supabase Storage bucket 'photos'
        updateQueueItem(queueItem.id, { progress: 60 });
        const storagePath = `${projectId}/${Date.now()}-${Math.random().toString(36).substring(2, 6)}-${optimizedFile.name}`;
        
        let publicUrl = '';
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('photos')
          .upload(storagePath, optimizedFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          // If storage fails (e.g. bucket doesn't exist yet or config error), we fallback to persistent base64 Data URL so it is fully preserved across refreshes!
          console.warn('Supabase storage upload failed, falling back to base64 Data URL.');
          publicUrl = await new Promise<string>((resolveData, rejectData) => {
            const reader = new FileReader();
            reader.onloadend = () => resolveData(reader.result as string);
            reader.onerror = rejectData;
            reader.readAsDataURL(optimizedFile);
          });
        } else {
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('photos')
            .getPublicUrl(storagePath);
          publicUrl = urlData?.publicUrl || '';
        }

        // Upload thumbnail
        const thumbStoragePath = `${projectId}/${Date.now()}-${Math.random().toString(36).substring(2, 6)}-thumb.jpg`;
        const { error: thumbUploadError } = await supabase.storage
          .from('photos')
          .upload(thumbStoragePath, thumbnailUploadFile, {
            cacheControl: '3600',
            upsert: false,
          });

        let thumbnailUrl = '';
        if (thumbUploadError) {
          console.warn('Supabase thumbnail upload failed, falling back to base64.');
          thumbnailUrl = await new Promise<string>((resolveData, rejectData) => {
            const reader = new FileReader();
            reader.onloadend = () => resolveData(reader.result as string);
            reader.onerror = rejectData;
            reader.readAsDataURL(thumbnailUploadFile);
          });
        } else {
          const { data: thumbUrlData } = supabase.storage
            .from('photos')
            .getPublicUrl(thumbStoragePath);
          thumbnailUrl = thumbUrlData?.publicUrl || '';
        }

        // Get actual dimensions of the uploaded image
        const dimensions = await getImageDimensions(optimizedFile);

        // Mock camera metadata but with actual dimensions
        const mockMetadata = {
          iso: [100, 200, 400, 800][Math.floor(Math.random() * 4)],
          shutter: ['1/125', '1/250', '1/500', '1/1000'][Math.floor(Math.random() * 4)],
          aperture: ['f/1.4', 'f/1.8', 'f/2.8', 'f/4.0'][Math.floor(Math.random() * 4)],
          width: dimensions.width,
          height: dimensions.height,
          adjustments: appliedAdjustmentsObj,
          thumbnail_url: thumbnailUrl,
          processed_thumbnail_url: autoRetouch !== 'none' ? thumbnailUrl : undefined,
        };

        // 3. Write Photo details in pf_photos
        updateQueueItem(queueItem.id, { progress: 85 });
        const fileExt = optimizedFile.name.split('.').pop()?.toUpperCase() || 'JPG';
        const { error: dbError } = await supabase
          .from('pf_photos')
          .insert({
            project_id: projectId,
            filename: optimizedFile.name,
            original_url: publicUrl,
            size_bytes: optimizedFile.size,
            format: fileExt,
            metadata: mockMetadata,
          });

        if (dbError) throw dbError;

        updateQueueItem(queueItem.id, { status: 'completed', progress: 100 });
      } catch (err) {
        console.error('Upload failed for file:', file.name, err);
        updateQueueItem(queueItem.id, { status: 'error', progress: 0 });
      }
    };

    // Parallel Worker Pool (Concurrency = 3)
    const concurrencyLimit = 3;
    const filesQueue = Array.from({ length: files.length }, (_, i) => i);
    const worker = async () => {
      let index;
      while ((index = filesQueue.shift()) !== undefined) {
        await uploadSingleFile(files[index], newQueueItems[index]);
      }
    };

    const workers = Array.from(
      { length: Math.min(concurrencyLimit, files.length) },
      () => worker()
    );
    await Promise.all(workers);

    // Refresh photos grid
    fetchProjectData(projectId);
    setUploading(false);
  };

  const updateQueueItem = (id: string, updates: Partial<UploadQueueItem>) => {
    setUploadQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleGenerateAiImage = async () => {
    if (!aiGenPrompt.trim() || !projectId) return;
    setIsGeneratingAiImage(true);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiGenPrompt,
          model: selectedGenModel,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to generate image');
      }

      const base64Url = data.imageUrl;

      // Convert Base64 to Blob
      const base64ToBlob = (base64: string) => {
        const parts = base64.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);
        for (let i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
        }
        return new Blob([uInt8Array], { type: contentType });
      };

      const imageBlob = base64ToBlob(base64Url);
      const fileExt = imageBlob.type.split('/')[1] || 'png';
      const fileName = `ai-${Date.now()}.${fileExt}`;
      const imageFile = new File([imageBlob], fileName, { type: imageBlob.type });

      // Generate thumbnail using applyAdjustments (which accepts base64 URL strings)
      const thumbBase64 = await applyAdjustments(base64Url, DEFAULT_ADJUSTMENTS, undefined, 600);
      const thumbBlob = base64ToBlob(thumbBase64);
      const thumbFile = new File([thumbBlob], `thumb-${fileName}`, { type: 'image/jpeg' });

      // Upload original to storage
      const storagePath = `${projectId}/${Date.now()}-ai-generated.${fileExt}`;
      let publicUrl = '';
      
      const { data: uploadData, error: uploadError } = await supabase.storage
         .from('photos')
         .upload(storagePath, imageFile, {
           cacheControl: '3600',
           upsert: false,
         });

      if (uploadError) {
        console.warn('Supabase image upload failed, falling back to base64.');
        publicUrl = base64Url;
      } else {
        const { data: urlData } = supabase.storage
          .from('photos')
          .getPublicUrl(storagePath);
        publicUrl = urlData?.publicUrl || '';
      }

      // Upload thumbnail
      const thumbStoragePath = `${projectId}/${Date.now()}-ai-generated-thumb.jpg`;
      const { error: thumbUploadError } = await supabase.storage
         .from('photos')
         .upload(thumbStoragePath, thumbFile, {
           cacheControl: '3600',
           upsert: false,
         });

      let thumbnailUrl = '';
      if (thumbUploadError) {
        console.warn('Supabase thumbnail upload failed, falling back to base64.');
        thumbnailUrl = thumbBase64;
      } else {
        const { data: thumbUrlData } = supabase.storage
          .from('photos')
          .getPublicUrl(thumbStoragePath);
        thumbnailUrl = thumbUrlData?.publicUrl || '';
      }

      // Insert photo details in database
      const mockMetadata = {
        iso: 100,
        shutter: '1/250',
        aperture: 'f/2.8',
        width: 1024,
        height: 1024,
        adjustments: DEFAULT_ADJUSTMENTS,
        thumbnail_url: thumbnailUrl,
        processed_thumbnail_url: undefined,
        ai_generated: true,
        ai_prompt: aiGenPrompt,
        ai_model: selectedGenModel
      };

      const { error: dbError } = await supabase
        .from('pf_photos')
        .insert({
          project_id: projectId,
          filename: fileName,
          original_url: publicUrl,
          size_bytes: imageFile.size,
          format: fileExt.toUpperCase(),
          metadata: mockMetadata,
        });

      if (dbError) throw dbError;

      setAiGenPrompt('');
      alert(lang === 'fr' ? 'Image IA générée et importée avec succès !' : 'AI image successfully generated and imported!');
      
      // Refresh photos grid
      fetchProjectData(projectId);

    } catch (err: any) {
      console.error('AI Image generation failed:', err);
      if (err.message?.includes('API key is missing')) {
        alert(
          lang === 'fr' 
            ? "Erreur : Clé API manquante. Veuillez configurer OPENROUTER_API_KEY dans votre fichier .env.local pour utiliser le générateur d'images IA." 
            : "Error: API key is missing. Please configure OPENROUTER_API_KEY in your .env.local file to use the AI Image Generator."
        );
      } else {
        alert(lang === 'fr' ? `Erreur lors de la génération : ${err.message}` : `Generation failed: ${err.message}`);
      }
    } finally {
      setIsGeneratingAiImage(false);
    }
  };

  // Selection and Deletion States
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single' | 'bulk'; id?: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);

  // Triage States
  const [triageFilter, setTriageFilter] = useState<'all' | 'excellent' | 'blurry' | 'exposure' | 'flat'>('all');
  const [triageProgress, setTriageProgress] = useState(0);
  const [triageTotal, setTriageTotal] = useState(0);
  const [isAnalyzingTriage, setIsAnalyzingTriage] = useState(false);

  const handleBulkRotate = async (direction: 'left' | 'right') => {
    if (selectedPhotoIds.length === 0 || bulkProcessing) return;
    setBulkProcessing(true);
    setBulkProgress(0);
    
    try {
      let completed = 0;
      for (const photoId of selectedPhotoIds) {
        const photo = photos.find(p => p.id === photoId);
        if (!photo) continue;

        // 1. Load original image
        const img = await loadImage(photo.original_url);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalHeight;
        canvas.height = img.naturalWidth;
        const ctx = canvas.getContext('2d', { colorSpace: 'display-p3' }) || canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get 2D context');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(direction === 'right' ? Math.PI / 2 : -Math.PI / 2);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

        // 2. Detect format
        let format = 'image/jpeg';
        let extension = '.jpg';
        const lowerUrl = photo.original_url.toLowerCase();
        if (lowerUrl.includes('.webp') || lowerUrl.startsWith('data:image/webp')) {
          format = 'image/webp';
          extension = '.webp';
        } else if (lowerUrl.includes('.png') || lowerUrl.startsWith('data:image/png')) {
          format = 'image/png';
          extension = '.png';
        }

        const rotatedBase64 = canvas.toDataURL(format, format === 'image/png' ? undefined : 1.0);

        // 3. Apply adjustments if any exist in metadata
        let processedBase64 = rotatedBase64;
        const adjustments = photo.metadata?.adjustments;
        if (adjustments) {
          processedBase64 = await applyAdjustments(rotatedBase64, adjustments, undefined, false, format as 'image/jpeg' | 'image/webp' | 'image/png');
        }

        // Generate rotated thumbnails
        const rotatedThumbBase64 = await applyAdjustments(rotatedBase64, DEFAULT_ADJUSTMENTS, undefined, 600, 'image/jpeg');
        let rotatedProcessedThumbBase64 = rotatedThumbBase64;
        if (adjustments) {
          rotatedProcessedThumbBase64 = await applyAdjustments(rotatedBase64, adjustments, undefined, 600, 'image/jpeg');
        }

        // 4. Convert Base64 to Blob
        const base64ToBlob = (base64: string) => {
          const parts = base64.split(';base64,');
          const contentType = parts[0].split(':')[1];
          const raw = window.atob(parts[1]);
          const rawLength = raw.length;
          const uInt8Array = new Uint8Array(rawLength);
          for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
          }
          return new Blob([uInt8Array], { type: contentType });
        };

        const originalBlob = base64ToBlob(rotatedBase64);
        const processedBlob = base64ToBlob(processedBase64);
        const originalThumbBlob = base64ToBlob(rotatedThumbBase64);
        const processedThumbBlob = base64ToBlob(rotatedProcessedThumbBase64);

        // 5. Upload to storage
        const projectIdStr = id || 'general';
        const origStoragePath = `${projectIdStr}/${Date.now()}-${Math.random().toString(36).substring(2, 6)}-original${extension}`;
        const procStoragePath = `${projectIdStr}/${Date.now()}-${Math.random().toString(36).substring(2, 6)}-processed${extension}`;
        const origThumbStoragePath = `${projectIdStr}/${Date.now()}-${Math.random().toString(36).substring(2, 6)}-original-thumb.jpg`;
        const procThumbStoragePath = `${projectIdStr}/${Date.now()}-${Math.random().toString(36).substring(2, 6)}-processed-thumb.jpg`;

        const { error: origUploadErr } = await supabase.storage
          .from('photos')
          .upload(origStoragePath, originalBlob, { cacheControl: '3600', upsert: true });
        if (origUploadErr) throw origUploadErr;

        const { error: procUploadErr } = await supabase.storage
          .from('photos')
          .upload(procStoragePath, processedBlob, { cacheControl: '3600', upsert: true });
        if (procUploadErr) throw procUploadErr;

        await supabase.storage.from('photos').upload(origThumbStoragePath, originalThumbBlob, { cacheControl: '3600', upsert: true });
        await supabase.storage.from('photos').upload(procThumbStoragePath, processedThumbBlob, { cacheControl: '3600', upsert: true });

        const { data: origUrlData } = supabase.storage.from('photos').getPublicUrl(origStoragePath);
        const { data: procUrlData } = supabase.storage.from('photos').getPublicUrl(procStoragePath);
        const { data: origThumbUrlData } = supabase.storage.from('photos').getPublicUrl(origThumbStoragePath);
        const { data: procThumbUrlData } = supabase.storage.from('photos').getPublicUrl(procThumbStoragePath);

        const newOriginalUrl = origUrlData?.publicUrl || rotatedBase64;
        const newProcessedUrl = procUrlData?.publicUrl || processedBase64;
        const newOrigThumbUrl = origThumbUrlData?.publicUrl || rotatedThumbBase64;
        const newProcThumbUrl = procThumbUrlData?.publicUrl || rotatedProcessedThumbBase64;

        // 6. Update database record
        const newMetadata = {
          ...photo.metadata,
          width: canvas.width,
          height: canvas.height,
          thumbnail_url: newOrigThumbUrl,
          processed_thumbnail_url: newProcThumbUrl,
        };

        const { error: dbError } = await supabase
          .from('pf_photos')
          .update({
            original_url: newOriginalUrl,
            processed_url: newProcessedUrl,
            size_bytes: originalBlob.size,
            metadata: newMetadata
          })
          .eq('id', photo.id);

        if (dbError) throw dbError;

        completed++;
        setBulkProgress(completed);
      }

      setSelectedPhotoIds([]);
      setSelectionMode(false);
      fetchProjectData(id);
    } catch (err) {
      console.error('Error doing bulk rotation:', err);
      alert('Erreur lors de la rotation groupée.');
    } finally {
      setBulkProcessing(false);
    }
  };

  const triggerSingleDelete = (photoId: string) => {
    setDeleteTarget({ type: 'single', id: photoId });
    setShowDeleteModal(true);
  };

  const triggerBulkDelete = () => {
    if (selectedPhotoIds.length === 0) return;
    setDeleteTarget({ type: 'bulk' });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      if (deleteTarget.type === 'single' && deleteTarget.id) {
        const { error } = await supabase
          .from('pf_photos')
          .delete()
          .eq('id', deleteTarget.id);

        if (error) throw error;
        setPhotos((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setSelectedPhotoIds((prev) => prev.filter((id) => id !== deleteTarget.id));
      } else if (deleteTarget.type === 'bulk') {
        const { error } = await supabase
          .from('pf_photos')
          .delete()
          .in('id', selectedPhotoIds);

        if (error) throw error;
        setPhotos((prev) => prev.filter((p) => !selectedPhotoIds.includes(p.id)));
        setSelectedPhotoIds([]);
        setSelectionMode(false);
      }
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Erreur lors de la suppression.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleSelectPhoto = (photoId: string) => {
    setSelectedPhotoIds((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId]
    );
  };

  const handleSelectAllPhotos = () => {
    if (selectedPhotoIds.length === photos.length) {
      setSelectedPhotoIds([]);
    } else {
      setSelectedPhotoIds(photos.map((p) => p.id));
    }
  };

  // Keep compatibility for any other calls
  const handleDeletePhoto = async (photoId: string) => {
    triggerSingleDelete(photoId);
  };

  const handleToggleFavorite = async (photo: any) => {
    try {
      const { error } = await supabase
        .from('pf_photos')
        .update({ is_favorite: !photo.is_favorite })
        .eq('id', photo.id);

      if (error) throw error;
      setPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? { ...p, is_favorite: !p.is_favorite } : p))
      );
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const getOriginUrl = () => {
    if (typeof window !== 'undefined') return window.location.origin;
    return '';
  };

  const handleRunTriage = async () => {
    if (photos.length === 0 || isAnalyzingTriage) return;
    setIsAnalyzingTriage(true);
    setTriageProgress(0);
    setTriageTotal(photos.length);

    try {
      let completed = 0;
      for (const photo of photos) {
        const sourceUrl = photo.processed_url || photo.original_url;
        const triageData = await analyzeImageTriage(sourceUrl);

        const newMetadata = {
          ...photo.metadata,
          triage: triageData
        };

        const { error } = await supabase
          .from('pf_photos')
          .update({ metadata: newMetadata })
          .eq('id', photo.id);

        if (error) {
          console.error(`Triage update failed for photo ${photo.id}:`, error);
        } else {
          setPhotos(prev =>
            prev.map(p => (p.id === photo.id ? { ...p, metadata: newMetadata } : p))
          );
        }

        completed++;
        setTriageProgress(completed);
      }
    } catch (err) {
      console.error('Triage analysis run encountered errors:', err);
    } finally {
      setIsAnalyzingTriage(false);
    }
  };

  const handleSelectBlurryPhotos = () => {
    setSelectionMode(true);
    const blurryIds = photos
      .filter(p => p.metadata?.triage?.status === 'blurry')
      .map(p => p.id);
    setSelectedPhotoIds(blurryIds);
  };

  const handleSelectBestPhotos = () => {
    setSelectionMode(true);
    const bestIds = photos
      .filter(p => p.metadata?.triage?.status === 'excellent')
      .map(p => p.id);
    setSelectedPhotoIds(bestIds);
  };

  const filteredPhotos = photos.filter(photo => {
    if (triageFilter === 'all') return true;
    const triage = photo.metadata?.triage;
    if (!triage) return false;
    
    if (triageFilter === 'excellent') return triage.status === 'excellent';
    if (triageFilter === 'blurry') return triage.status === 'blurry';
    if (triageFilter === 'exposure') return triage.status === 'dark' || triage.status === 'bright';
    if (triageFilter === 'flat') return triage.status === 'flat';
    return true;
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
      
      <Sidebar activeProjectName={project?.name} />

      <main className="md:ml-[280px] pt-24 px-6 md:px-margin-desktop pb-24 bg-background min-h-screen">
        {/* Header Back button */}
        <Link href="/dashboard/projects" className="text-primary text-xs font-semibold flex items-center gap-1 mb-4 hover:underline">
          <span className="material-symbols-outlined text-[14px]">arrow_back</span>
          {t.backToProjects}
        </Link>

        {/* Project title header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10 border-b border-outline-variant/30 pb-6">
          <div>
            <div className="text-xs text-primary font-bold uppercase tracking-wider mb-1">
              {t[`type_${project?.project_type}` as keyof typeof t] || project?.project_type || 'Shoot'}
            </div>
            <h1 className="font-display-lg text-3xl font-bold text-white">{project?.name}</h1>
            <p className="text-on-surface-variant text-xs mt-1">
              {t.client} : {project?.pf_clients?.name || t.none} • {t.shootDate} {project?.date ? new Date(project.date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US') : t.unplanned}
            </p>
          </div>

          {/* Secure Client Gallery link card */}
          {gallery && (
            <div className="glass-panel p-4 rounded-xl flex items-center gap-4 max-w-md w-full border border-primary/20">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                <span className="material-symbols-outlined text-[20px]">ios_share</span>
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">{t.privateGallery}</p>
                <p className="text-xs font-semibold text-primary truncate hover:underline cursor-pointer" onClick={copyGalleryLink}>
                  {getOriginUrl()}/gallery/{gallery.url_slug}
                </p>
              </div>
              <button 
                onClick={copyGalleryLink}
                className="bg-surface-container-highest p-2 rounded-lg text-on-surface-variant hover:text-white cursor-pointer transition-colors"
                title={t.copyTitle}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {copiedLink ? 'check' : 'content_copy'}
                </span>
              </button>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Photos list and Drag & Drop uploader */}
          <div className="lg:col-span-2 space-y-8">
            {/* Uploader Drag Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`glass-panel p-10 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                dragActive ? 'border-primary bg-primary/5' : 'border-outline-variant/50 hover:border-primary/50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.raw,.cr2,.nef,.arw"
                onChange={handleFileInput}
                className="hidden"
              />
              <span className="material-symbols-outlined text-primary text-5xl mb-4 animate-pulse">cloud_upload</span>
              <h3 className="font-headline-md text-lg font-bold text-white mb-1">{t.importShots}</h3>
              <p className="text-on-surface-variant text-xs max-w-sm mb-4">
                {t.dragDropText}
              </p>
              <div className="text-[10px] bg-surface-container-highest px-3 py-1 rounded-full text-on-surface-variant font-bold border border-outline-variant/30">
                {t.compressionActive}
              </div>
            </div>

            {/* Uploading Queue Display */}
            {uploadQueue.length > 0 && (
              <div className="glass-panel p-4 rounded-xl border border-outline-variant/30 space-y-3">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t.queueTitle}</p>
                <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
                  {uploadQueue.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 text-xs">
                      <span className="truncate max-w-[200px] font-medium text-on-surface-variant">{item.name}</span>
                      <div className="flex-grow flex items-center gap-3">
                        <div className="flex-grow h-1 bg-surface-container-highest rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              item.status === 'error' ? 'bg-error' : item.status === 'completed' ? 'bg-primary' : 'bg-primary-container'
                            }`}
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                        <span className={`font-bold font-label-md shrink-0 ${
                          item.status === 'error' ? 'text-error' : item.status === 'completed' ? 'text-primary' : 'text-on-surface-variant'
                        }`}>
                          {item.status === 'completed' ? 'OK' : item.status === 'error' ? (lang === 'fr' ? 'Erreur' : 'Error') : `${Math.floor(item.progress)}%`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Photos Grid */}
            <div>
             {/* Photos Grid Header Controls */}
              <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className="font-headline-md text-xl font-bold flex flex-wrap items-center gap-2">
                  {t.importedShots}
                  <span className="text-xs bg-surface-container-highest border border-outline-variant text-on-surface-variant px-2.5 py-0.5 rounded-full font-bold">
                    {photos.length}{profile?.plan !== 'pro' ? ' / 25' : ''}
                  </span>
                  {profile?.plan !== 'pro' && (
                    <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {lang === 'fr' ? 'Limite Gratuite' : 'Free Limit'}
                    </span>
                  )}
                </h2>
                
                {photos.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectionMode(!selectionMode);
                        setSelectedPhotoIds([]);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        selectionMode 
                          ? 'bg-surface-container-highest border-outline text-on-surface' 
                          : 'bg-transparent border-outline-variant text-on-surface-variant hover:text-white'
                      }`}
                    >
                      {selectionMode ? t.cancel : t.bulkSelect}
                    </button>
                    {selectionMode && (
                      <button
                        onClick={handleSelectAllPhotos}
                        className="px-4 py-2 bg-transparent border border-outline-variant text-xs font-semibold text-on-surface-variant hover:text-white rounded-xl transition-colors cursor-pointer"
                      >
                        {selectedPhotoIds.length === photos.length ? t.deselectAll : t.selectAll}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {photos.length === 0 ? (
                <div className="glass-panel p-16 rounded-2xl text-center flex flex-col items-center justify-center border border-dashed border-outline-variant/30">
                  <span className="material-symbols-outlined text-outline text-5xl mb-4">image</span>
                  <p className="text-on-surface-variant text-sm">{t.noPhotos}</p>
                </div>
              ) : filteredPhotos.length === 0 ? (
                <div className="glass-panel p-16 rounded-2xl text-center flex flex-col items-center justify-center border border-dashed border-outline-variant/30">
                  <span className="material-symbols-outlined text-outline-variant text-5xl mb-4">filter_list_off</span>
                  <p className="text-on-surface-variant text-sm">{t.noPhotosFilter}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {filteredPhotos.map((photo) => {
                    const isSelected = selectedPhotoIds.includes(photo.id);
                    return (
                      <div
                        key={photo.id}
                        onClick={() => selectionMode ? handleToggleSelectPhoto(photo.id) : null}
                        className={`group relative aspect-square rounded-xl overflow-hidden bg-surface-container border transition-all cursor-pointer ${
                          selectionMode 
                            ? (isSelected ? 'border-primary ring-2 ring-primary/30 scale-98' : 'border-outline-variant/30 opacity-70 hover:opacity-100')
                            : 'border-outline-variant/30'
                        }`}
                      >
                        {/* Photo Thumbnail */}
                        <img
                          alt={photo.filename}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          src={photo.metadata?.processed_thumbnail_url || photo.metadata?.thumbnail_url || photo.processed_url || photo.original_url}
                          loading="lazy"
                        />

                        {/* Triage Status Badge */}
                        {photo.metadata?.triage && (
                          <div className="absolute top-3 right-3 z-20 flex gap-1 pointer-events-none select-none">
                            {photo.metadata.triage.status === 'excellent' && (
                              <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#25D366]/20 text-[#25D366] backdrop-blur-md border border-[#25D366]/30">
                                <span className="material-symbols-outlined text-[10px] font-bold">star</span>
                                {t.topBadge}
                              </span>
                            )}
                            {photo.metadata.triage.status === 'blurry' && (
                              <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-error/20 text-error backdrop-blur-md border border-error/30">
                                <span className="material-symbols-outlined text-[10px] font-bold">blur_on</span>
                                {t.blurryBadge}
                              </span>
                            )}
                            {(photo.metadata.triage.status === 'dark' || photo.metadata.triage.status === 'bright') && (
                              <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-warning/20 text-warning backdrop-blur-md border border-warning/30">
                                <span className="material-symbols-outlined text-[10px] font-bold">light_mode</span>
                                {t.lightBadge}
                              </span>
                            )}
                            {photo.metadata.triage.status === 'flat' && (
                              <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#FFD700]/20 text-[#FFD700] backdrop-blur-md border border-[#FFD700]/30">
                                <span className="material-symbols-outlined text-[10px] font-bold">contrast</span>
                                {t.contrastBadge}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Selection Checkbox Overlay */}
                        {selectionMode && (
                          <div className="absolute top-3 left-3 z-20 w-6 h-6 rounded-full border border-white/50 flex items-center justify-center backdrop-blur-md transition-colors"
                               style={{ backgroundColor: isSelected ? 'var(--color-primary, #0055FF)' : 'rgba(0,0,0,0.5)' }}>
                            {isSelected && (
                              <span className="material-symbols-outlined text-white text-sm font-bold">check</span>
                            )}
                          </div>
                        )}

                        {/* Hover Overlay Action Controls (disabled in selection mode) */}
                        {!selectionMode && (
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                            <div className="flex justify-between items-center">
                              {/* Favorite Tag */}
                              <button
                                onClick={() => handleToggleFavorite(photo)}
                                className="w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white hover:text-primary transition-colors cursor-pointer"
                              >
                                <span 
                                  className="material-symbols-outlined text-sm"
                                  style={{ fontVariationSettings: photo.is_favorite ? "'FILL' 1" : undefined }}
                                >
                                  favorite
                                </span>
                              </button>

                              {/* Delete Photo */}
                              <button
                                onClick={() => triggerSingleDelete(photo.id)}
                                className="w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-error hover:bg-error/20 transition-all cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </div>

                            {/* Middle Action: Open Editor */}
                            <div className="flex justify-center">
                              <Link
                                href={`/dashboard/editor/${photo.id}`}
                                className="bg-primary text-on-primary font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase flex items-center gap-1 shadow-lg hover:scale-105 transition-transform"
                              >
                                <span className="material-symbols-outlined text-xs">edit_note</span>
                                {t.aiEditor}
                              </Link>
                            </div>

                            {/* Bottom Metadata display */}
                            <div className="bg-black/60 px-2 py-1 rounded-lg text-[9px] text-white/80 font-mono flex justify-between">
                              <span>ISO {photo.metadata?.iso || 100}</span>
                              <span>{photo.metadata?.shutter || '1/250'}</span>
                              <span>{photo.metadata?.aperture || 'f/1.8'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Secure Gallery Settings panel */}
          <div className="space-y-8">
            {/* Assistant de Tri Intelligent */}
            {photos.length > 0 && (
              <section className="glass-panel p-6 rounded-2xl border border-outline-variant/30 space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-primary text-xl">auto_awesome_motion</span>
                    <h3 className="font-headline-md text-lg font-bold text-white">{t.smartSorting}</h3>
                  </div>
                  <p className="text-xs text-on-surface-variant">{t.smartSortingDesc}</p>
                </div>

                {/* Progress or Run button */}
                {isAnalyzingTriage ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-on-surface-variant">
                      <span>{t.analyzing}</span>
                      <span>{triageProgress} / {triageTotal}</span>
                    </div>
                    <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-primary h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${(triageProgress / triageTotal) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleRunTriage}
                    className="w-full py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    <span className="material-symbols-outlined text-sm">troubleshoot</span>
                    {photos.some(p => p.metadata?.triage) ? t.rerunSort : t.runSort}
                  </button>
                )}

                {/* Classification Summary & Filtering */}
                {photos.some(p => p.metadata?.triage) && (
                  <div className="space-y-4 pt-2 border-t border-outline-variant/20">
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{t.sortFilters}</h4>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => setTriageFilter('all')}
                          className={`px-3 py-2 text-left text-xs rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                            triageFilter === 'all' 
                              ? 'bg-primary text-on-primary font-semibold' 
                              : 'bg-surface-container border border-outline-variant/20 text-on-surface-variant hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">collections</span>{t.all}</span>
                          <span className="text-[10px] opacity-85">{photos.length}</span>
                        </button>
                        <button
                          onClick={() => setTriageFilter('excellent')}
                          className={`px-3 py-2 text-left text-xs rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                            triageFilter === 'excellent' 
                              ? 'bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 font-semibold' 
                              : 'bg-surface-container border border-outline-variant/20 text-on-surface-variant hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">star</span>{t.excellent}</span>
                          <span className="text-[10px] opacity-85">{photos.filter(p => p.metadata?.triage?.status === 'excellent').length}</span>
                        </button>
                        <button
                          onClick={() => setTriageFilter('blurry')}
                          className={`px-3 py-2 text-left text-xs rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                            triageFilter === 'blurry' 
                              ? 'bg-error/20 text-error border border-error/30 font-semibold' 
                              : 'bg-surface-container border border-outline-variant/20 text-on-surface-variant hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">blur_on</span>{t.blurry}</span>
                          <span className="text-[10px] opacity-85">{photos.filter(p => p.metadata?.triage?.status === 'blurry').length}</span>
                        </button>
                        <button
                          onClick={() => setTriageFilter('exposure')}
                          className={`px-3 py-2 text-left text-xs rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                            triageFilter === 'exposure' 
                              ? 'bg-warning/20 text-warning border border-warning/30 font-semibold' 
                              : 'bg-surface-container border border-outline-variant/20 text-on-surface-variant hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">light_mode</span>{t.exposure}</span>
                          <span className="text-[10px] opacity-85">{photos.filter(p => p.metadata?.triage?.status === 'dark' || p.metadata?.triage?.status === 'bright').length}</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Selection Actions */}
                    <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                      <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{t.quickActions}</h4>
                      <div className="flex gap-2">
                        {photos.some(p => p.metadata?.triage?.status === 'blurry') && (
                          <button
                            onClick={handleSelectBlurryPhotos}
                            className="flex-1 py-2 bg-error/10 hover:bg-error/20 border border-error/20 text-error font-bold text-[10px] uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <span className="material-symbols-outlined text-xs">select_all</span>
                            {t.selectBlurry}
                          </button>
                        )}
                        {photos.some(p => p.metadata?.triage?.status === 'excellent') && (
                          <button
                            onClick={handleSelectBestPhotos}
                            className="flex-1 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 text-[#25D366] font-bold text-[10px] uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <span className="material-symbols-outlined text-xs">grade</span>
                            {t.selectTops}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Import Automations Panel */}
            <section className="glass-panel p-6 rounded-2xl border border-outline-variant/30 space-y-4">
              <div>
                <h3 className="font-headline-md text-lg font-bold text-white mb-1">{t.importAutomations}</h3>
                <p className="text-xs text-on-surface-variant">{t.importAutomationsDesc}</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-xs text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  {t.autoRetouchLabel}
                </label>
                <select
                  value={autoRetouch}
                  onChange={(e) => handleAutoRetouchChange(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-3 py-2 text-xs outline-none transition-colors cursor-pointer text-white"
                >
                  <option value="none">{t.retouchNone}</option>
                  <option value="auto">{t.retouchAuto}</option>
                  <option value="face">{t.retouchFace}</option>
                  <option value="skin">{t.retouchSkin}</option>
                  <option value="hdr">{t.retouchHdr}</option>
                </select>
              </div>
            </section>

            {/* AI Image Generation Panel */}
            <section className="glass-panel p-6 rounded-2xl border border-outline-variant/30 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-primary text-xl">palette</span>
                  <h3 className="font-headline-md text-lg font-bold text-white">
                    {lang === 'fr' ? "Générateur d'Images IA" : "AI Image Generator"}
                  </h3>
                </div>
                <p className="text-xs text-on-surface-variant">
                  {lang === 'fr' 
                    ? "Générez un nouveau cliché unique pour ce projet à partir d'une description textuelle." 
                    : "Generate a new unique shot for this project from a text description."}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    {lang === 'fr' ? "Description (Prompt)" : "Description (Prompt)"}
                  </label>
                  <textarea
                    value={aiGenPrompt}
                    onChange={(e) => setAiGenPrompt(e.target.value)}
                    placeholder={lang === 'fr' 
                      ? "Ex: Un magnifique coucher de soleil sur les plages de Dakar, style cinématique, 8k..." 
                      : "e.g., A beautiful sunset over the beaches of Dakar, cinematic style, 8k..."}
                    rows={3}
                    className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-3 py-2 text-xs outline-none transition-colors text-white resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    {lang === 'fr' ? "Modèle d'Image" : "Image Model"}
                  </label>
                  <select
                    value={selectedGenModel}
                    onChange={(e) => setSelectedGenModel(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-3 py-2 text-xs outline-none transition-colors cursor-pointer text-white"
                  >
                    <option value="black-forest-labs/flux-schnell">FLUX Schnell (Rapide & Précis)</option>
                    <option value="stabilityai/stable-diffusion-xl">Stable Diffusion XL</option>
                    <option value="google/imagen-3.0-generate-002">Google Imagen 3</option>
                  </select>
                </div>

                <button
                  onClick={handleGenerateAiImage}
                  disabled={isGeneratingAiImage || !aiGenPrompt.trim()}
                  className="w-full py-2.5 bg-primary-container text-on-primary-container font-bold text-xs rounded-xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isGeneratingAiImage ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-on-primary-container/30 border-t-on-primary-container animate-spin"></span>
                      <span>{lang === 'fr' ? "Génération..." : "Generating..."}</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">palette</span>
                      <span>{lang === 'fr' ? "Générer et Importer" : "Generate & Import"}</span>
                    </>
                  )}
                </button>
              </div>
            </section>

            <section className="glass-panel p-6 rounded-2xl border border-outline-variant/30 space-y-6">
              <div>
                <h3 className="font-headline-md text-lg font-bold text-white mb-1">{t.deliverySettings}</h3>
                <p className="text-xs text-on-surface-variant">{t.deliverySettingsDesc}</p>
              </div>

              {/* Password Protection Toggle */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">security</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-on-surface">{t.password}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isProtected}
                      onChange={(e) => setIsProtected(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:height-4 after:width-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {isProtected && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{t.passcodeAccess}</label>
                    <input
                      type="text"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder={t.passwordPlaceholder}
                      className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl px-4 py-2 text-sm outline-none transition-colors"
                    />
                  </div>
                )}

                {/* Apply Watermark Toggle */}
                <div className="flex items-center justify-between border-t border-outline-variant/20 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">copyright</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-wider text-on-surface">{t.watermark}</span>
                      <span className="text-[9px] text-on-surface-variant">{t.secureGallery}</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyWatermark}
                      onChange={(e) => setApplyWatermark(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:height-4 after:width-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              {/* Save settings action button */}
              <button
                onClick={saveGallerySettings}
                disabled={savingSettings}
                className="w-full py-3 bg-primary text-on-primary font-semibold text-xs font-label-md rounded-xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                {savingSettings ? (
                  <span className="w-5 h-5 rounded-full border-2 border-on-primary/30 border-t-on-primary animate-spin"></span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    {t.saveSettings}
                  </>
                )}
              </button>
            </section>
          </div>
        </div>
       </main>

      {/* Bulk Actions Floating Bar */}
      {selectionMode && selectedPhotoIds.length > 0 && (
        <div className="fixed bottom-24 left-0 md:left-[280px] right-0 flex justify-center z-50 px-6 animate-in slide-in-from-bottom-6 duration-300">
          <div className="glass-panel px-6 py-4 rounded-2xl flex items-center gap-6 border border-primary/20 shadow-2xl bg-surface-container-high/90 max-w-xl w-full justify-between">
            {bulkProcessing ? (
              <div className="flex items-center gap-3 w-full justify-center text-xs text-white py-1">
                <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                <span>{t.rotating} : {bulkProgress} / {selectedPhotoIds.length} ...</span>
              </div>
            ) : (
              <>
                <div className="text-xs font-semibold text-white">
                  <span className="text-primary font-bold text-sm mr-1.5">{selectedPhotoIds.length}</span>
                  {selectedPhotoIds.length > 1 ? t.photosSelected : t.photoSelected}
                </div>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => handleBulkRotate('left')}
                    className="px-3 py-2 border border-outline-variant text-on-surface hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    title="Pivoter toutes les photos sélectionnées vers la gauche"
                  >
                    <span className="material-symbols-outlined text-sm">rotate_left</span>
                    {t.rotateLeft}
                  </button>
                  <button
                    onClick={() => handleBulkRotate('right')}
                    className="px-3 py-2 border border-outline-variant text-on-surface hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    title="Pivoter toutes les photos sélectionnées vers la droite"
                  >
                    <span className="material-symbols-outlined text-sm">rotate_right</span>
                    {t.rotateRight}
                  </button>
                  <button
                    onClick={() => setSelectedPhotoIds([])}
                    className="px-3 py-2 border border-outline-variant text-on-surface-variant hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    {t.deselect}
                  </button>
                  <button
                    onClick={triggerBulkDelete}
                    className="px-3 py-2 bg-error text-white hover:bg-error-container rounded-xl text-xs font-bold flex items-center gap-1 shadow-lg active:scale-95 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    {t.delete}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-panel rounded-2xl p-6 border border-error/20 shadow-2xl animate-in scale-in duration-300">
            <div className="flex items-center gap-3 mb-4 text-error">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h3 className="font-headline-md text-xl font-bold text-white">{t.confirmDeleteTitle}</h3>
            </div>
            <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
              {deleteTarget?.type === 'single'
                ? t.confirmDeleteSingle
                : t.confirmDeleteMultiple.replace('{count}', String(selectedPhotoIds.length))}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                }}
                className="flex-1 py-3 border border-outline-variant text-on-surface font-semibold rounded-xl hover:bg-surface-container-highest transition-colors cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3 bg-error text-white font-semibold rounded-xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                {isDeleting ? (
                  <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                ) : (
                  t.delete
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <MobileNav />

      {/* Gallery Settings Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm glass-panel p-6 rounded-2xl border border-green-500/30 shadow-2xl text-center flex flex-col items-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-4 text-green-400">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            
            <h3 className="font-display-lg text-lg font-bold text-white mb-2">
              {t.galleryUpdated}
            </h3>
            <p className="text-on-surface-variant text-xs mb-6 px-2">
              {t.galleryUpdatedDesc}
            </p>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-primary-container text-on-primary-container font-semibold py-2.5 rounded-xl hover:brightness-110 active:scale-98 transition-all cursor-pointer text-xs shadow-lg"
            >
              {t.thanksBtn}
            </button>
          </div>
        </div>
      )}

      {/* Premium Upgrade Modal */}
      {showUpgradeModal && (
        <div 
          onClick={() => setShowUpgradeModal(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-[300] flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-surface-container-high border border-primary/30 p-8 rounded-2xl shadow-2xl text-center flex flex-col items-center animate-in zoom-in-95 duration-200 cursor-default relative"
          >
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-on-surface-variant hover:text-white material-symbols-outlined text-xl cursor-pointer"
              >
                close
              </button>
            </div>
            
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 text-primary">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            </div>

            <h3 className="font-display-lg text-2xl font-bold text-white mb-2">
              {lang === 'fr' ? 'Passez à la Version PRO !' : 'Upgrade to PRO Version!'}
            </h3>
            <p className="text-on-surface-variant text-xs mb-6 px-4">
              {lang === 'fr' 
                ? 'Libérez toute la puissance de PhotoFlow AI. Obtenez 50 Go d\'espace de stockage, la retouche par prompt AI, et retirez/personnalisez les filigranes pour vos clients.'
                : 'Unlock the full power of PhotoFlow AI. Get 50 GB of storage space, AI prompt retouching, and remove or customize watermarks for your clients.'}
            </p>

            <div className="w-full space-y-3 mb-6 bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/20 text-left text-xs">
              <div className="flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-primary text-sm font-bold">check</span>
                <span>{lang === 'fr' ? 'Retouche de photos par Prompt AI' : 'AI Prompt photo retouching'}</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-primary text-sm font-bold">check</span>
                <span>{lang === 'fr' ? '50 Go de stockage cloud sécurisé' : '50 GB of secure cloud storage'}</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-primary text-sm font-bold">check</span>
                <span>{lang === 'fr' ? 'Filigrane personnalisé ou supprimé' : 'Custom or removed watermarks'}</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-primary text-sm font-bold">check</span>
                <span>{lang === 'fr' ? 'Support prioritaire 24/7' : 'Priority 24/7 support'}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard/settings?upgrade=true')}
              className="w-full bg-primary text-on-primary font-bold py-3 rounded-xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-base">workspace_premium</span>
              {lang === 'fr' ? 'Passer à la version PRO' : 'Upgrade to PRO version'}
            </button>
            <p className="text-[10px] text-on-surface-variant/70 mt-3 font-semibold">
              {lang === 'fr' ? 'Seulement 12 500 FCFA / mois • Annulable à tout moment' : 'Only 12,500 FCFA / month • Cancel anytime'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
