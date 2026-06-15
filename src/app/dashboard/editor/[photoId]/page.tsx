/* eslint-disable */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { applyAdjustments, PhotoAdjustments, DEFAULT_ADJUSTMENTS, loadImage, compressAndConvert } from '@/lib/image-processing';
import Navigation from '@/components/Navigation';
import { useLanguage } from '@/hooks/useLanguage';

const FONTS_LIST = [
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Bodoni Moda', value: '"Bodoni Moda", serif' },
  { name: 'Cormorant', value: '"Cormorant Garamond", serif' },
  { name: 'Syncopate', value: 'Syncopate, sans-serif' },
  { name: 'Oswald', value: 'Oswald, sans-serif' },
  { name: 'Italiana', value: 'Italiana, serif' },
  { name: 'Syne', value: 'Syne, sans-serif' },
  { name: 'Playfair', value: '"Playfair Display", serif' },
  { name: 'Cinzel', value: 'Cinzel, serif' },
  { name: 'Pacifico', value: 'Pacifico, cursive' },
  { name: 'Great Vibes', value: '"Great Vibes", cursive' },
  { name: 'Lobster', value: 'Lobster, display' },
  { name: 'Caveat', value: 'Caveat, cursive' },
  { name: 'Anton', value: 'Anton, sans-serif' },
  { name: 'Bangers', value: 'Bangers, display' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Times', value: '"Times New Roman", serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Impact', value: 'Impact, sans-serif' },
];

const FILTERS = [
  { id: 'none', name: 'Original', gradient: 'from-neutral-700 to-neutral-500', desc: 'Sans effet' },
  { id: 'clarendon', name: 'Clarendon', gradient: 'from-blue-600 via-indigo-500 to-yellow-100', desc: 'Tons froids' },
  { id: 'juno', name: 'Juno', gradient: 'from-orange-500 via-red-500 to-yellow-100', desc: 'Chaud & Éclatant' },
  { id: 'lark', name: 'Lark', gradient: 'from-teal-600 via-blue-500 to-yellow-200', desc: 'Lumineux' },
  { id: 'valencia', name: 'Valencia', gradient: 'from-amber-600 via-yellow-600 to-orange-400', desc: 'Chaud Vintage' },
  { id: 'gingham', name: 'Gingham', gradient: 'from-pink-500 via-amber-300 to-rose-400', desc: 'Fading Rétro' },
  { id: 'lofi', name: 'Lo-Fi', gradient: 'from-blue-900 via-red-700 to-yellow-400', desc: 'Haute Saturation' },
  { id: 'inkwell', name: 'Inkwell', gradient: 'from-black via-zinc-500 to-white', desc: 'Noir & Blanc' },
];

const TOOL_ORDER = ['select', 'crop', 'brush', 'heal', 'color', 'text'];

const translations = {
  fr: {
    before: "Avant",
    after: "Après",
    toolSelect: "Sélectionner / Déplacer",
    toolCrop: "Recadrer",
    toolBrush: "Pinceau",
    toolHeal: "Gomme correctrice",
    toolColor: "Balance des blancs",
    toolText: "Ajouter du texte",
    exifHeader: "Métadonnées EXIF",
    exifMissing: "Métadonnées EXIF non disponibles pour cette photo.",
    cropHeader: "Recadrage & Format",
    cropAspectRatio: "Ratio d'aspect",
    cropFree: "Libre",
    cropGridStyle: "Grille d'alignement",
    cropThirds: "Règle des tiers",
    cropFine: "Grille fine",
    cropNone: "Aucune",
    cropApply: "Appliquer le recadrage",
    textHeader: "Ajouter du Texte",
    textDesc: "Saisissez votre texte, modifiez son style, puis cliquez ou faites glisser sur l'image pour le positionner.",
    textInputLabel: "Texte",
    textPlaceholder: "Texte à afficher...",
    textSizeLabel: "Taille de police",
    textFontLabel: "Police",
    textRotationLabel: "Rotation",
    textFinish: "Appliquer sur l'image",
    textDelete: "Supprimer le texte",
    textCancel: "Annuler",
    brushHeader: "Dessin au Pinceau",
    brushDesc: "Dessinez directement sur la photo. Ajustez l'épaisseur, la couleur et l'opacité avant de dessiner.",
    brushSizeLabel: "Épaisseur du pinceau",
    brushOpacityLabel: "Opacité",
    brushColorLabel: "Couleur du pinceau",
    brushFinish: "Terminer le dessin",
    healHeader: "Gomme Correctrice",
    healDesc: "Éliminez les imperfections ou poussières. Cliquez sur une imperfection pour la corriger en clonant une zone saine adjacente.",
    healSizeLabel: "Taille du correcteur",
    healFinish: "Terminer les corrections",
    colorHeader: "Balance des Blancs",
    colorDesc: "Sélectionnez la pipette puis cliquez sur une zone neutre (blanche, grise ou noire) de l'image pour équilibrer les couleurs automatiquement.",
    colorSelectedInfo: "Couleur sélectionnée",
    colorRgbValues: "Valeurs RGB :",
    colorAppliedCorrection: "Correction appliquée :",
    colorReset: "Réinitialiser",
    colorFinish: "Appliquer la balance",
    aiHeader: "Automations IA",
    aiAuto: "Correction Auto",
    aiFace: "Visage Sublime",
    aiSkin: "Peau Lisse",
    aiHdr: "HDR Intelligent",
    filtersHeader: "Filtres Instagram",
    filtersReset: "Réinitialiser",
    manualHeader: "Réglages Professionnels",
    manualReset: "Reset",
    accordionLight: "Lumière & Tons",
    adjustExposure: "Exposition (Stops)",
    adjustContrast: "Contraste",
    adjustHighlights: "Hautes Lumières",
    adjustShadows: "Ombres",
    adjustWhites: "Blancs",
    adjustBlacks: "Noirs",
    accordionColor: "Couleur & Balances",
    adjustTemp: "Température (K)",
    adjustTint: "Teinte (Tint)",
    adjustVibrance: "Vibrance",
    adjustSaturation: "Saturation",
    accordionEffects: "Présence & Effets",
    adjustClarity: "Clarté",
    adjustVignette: "Vignettage",
    vignetteColorLabel: "Couleur de Vignette",
    adjustSharpening: "Netteté (Sharpen)",
    accordionHsl: "HSL Color Grading",
    adjustHslRed: "Rouge Saturation",
    adjustHslOrange: "Orange Saturation (Peau)",
    adjustHslOrangeLum: "Luminance Orange (Skin Glow)",
    adjustHslBlue: "Bleu Saturation (Ciel)",
    fileInfoHeader: "Info Fichier",
    actionSave: "Enregistrer",
    actionSaveTooltip: "Sauvegarder les retouches sur cette photo",
    actionApplyTo: "Appliquer à...",
    actionApplyToTooltip: "Appliquer ces réglages à plusieurs photos",
    actionJpeg: "JPEG HD",
    actionJpegTooltip: "Exporter au format JPEG Haute Définition",
    actionWebp: "WebP HD",
    actionWebpTooltip: "Convertir et télécharger au format WebP optimisé",
    actionShareWhatsApp: "Partager sur WhatsApp",
    actionShareWhatsAppTooltip: "Partager la photo via WhatsApp",
    zoomFit: "Fit",
    zoomCompare: "Comparer Avant/Après",
    zoomAiQuality: "Qualité AI :",
    zoomAiQualityVal: "Ultra Précision",
    syncTitle: "Synchroniser les réglages de retouche",
    syncSubtitle: "Sélectionnez les photos du projet sur lesquelles appliquer les réglages professionnels actuels.",
    syncSelectAll: "Tout sélectionner",
    syncDeselectAll: "Tout désélectionner",
    syncLoading: "Chargement des photos du projet...",
    syncNoPhotos: "Aucune autre photo disponible dans ce projet.",
    syncCancel: "Annuler",
    syncApplyCTA: "Appliquer aux {count} photo(s)",
    syncingText: "Synchronisation...",
    notifSavedTitle: "Retouches sauvegardées !",
    notifSavedMsg: "La photo a été mise à jour avec succès dans le cloud.",
    notifSaveErrTitle: "Erreur de sauvegarde",
    notifSaveErrMsg: "Impossible d'enregistrer les modifications sur la photo.",
    notifExportTitle: "Exportation commencée",
    notifExportMsg: "Votre image est en cours de traitement et va être téléchargée.",
    notifSyncSuccessTitle: "Synchronisation réussie !",
    notifSyncSuccessMsg: "Les réglages de retouche ont été appliqués à {count} photo(s).",
    notifSyncErrTitle: "Erreur de synchronisation",
    notifSyncErrMsg: "Impossible de propager les réglages sur les photos sélectionnées.",
    notifLoading: "Chargement de l'éditeur photo...",
    notifNotFoundTitle: "Photo Introuvable",
    notifNotFoundMsg: "La photo demandée n'existe pas ou a été supprimée.",
    notifBackToProject: "Retour au Projet",
    notifExportErrTitle: "Exportation Échouée",
    notifExportErrMsg: "Erreur lors de l'exportation haute définition.",
    notifRotationErrTitle: "Erreur de Rotation",
    notifRotationErrMsg: "La rotation a échoué.",
    notifSelectionReqTitle: "Sélection Requise",
    notifSelectionReqMsg: "Veuillez sélectionner au moins une photo à synchroniser.",
    notifClientNotFoundTitle: "Client Introuvable",
    notifClientNotFoundMsg: "Aucun client n'est associé à ce projet.",
    notifGalleryNotActiveTitle: "Galerie Non Activée",
    notifGalleryNotActiveMsg: "La galerie photo n'est pas encore configurée ou activée pour ce projet. Veuillez l'activer depuis la page du projet.",
    notifClose: "Fermer",
    phonePrompt: "Le client n'a pas de numéro de téléphone enregistré. Veuillez saisir son numéro de téléphone (au format international, ex: +221 77 123 45 67) :"
  },
  en: {
    before: "Before",
    after: "After",
    toolSelect: "Select / Move",
    toolCrop: "Crop",
    toolBrush: "Brush",
    toolHeal: "Healing Brush",
    toolColor: "White Balance",
    toolText: "Add Text",
    exifHeader: "EXIF Metadata",
    exifMissing: "EXIF metadata not available for this photo.",
    cropHeader: "Cropping & Ratio",
    cropAspectRatio: "Aspect Ratio",
    cropFree: "Free",
    cropGridStyle: "Alignment Grid",
    cropThirds: "Rule of Thirds",
    cropFine: "Fine Grid",
    cropNone: "None",
    cropApply: "Apply Crop",
    textHeader: "Add Text",
    textDesc: "Type your text, modify its style, then click or drag on the image to position it.",
    textInputLabel: "Text",
    textPlaceholder: "Text to display...",
    textSizeLabel: "Font size",
    textFontLabel: "Font",
    textRotationLabel: "Rotation",
    textFinish: "Apply to image",
    textDelete: "Delete text",
    textCancel: "Cancel",
    brushHeader: "Brush Drawing",
    brushDesc: "Draw directly on the photo. Adjust size, color, and opacity before drawing.",
    brushSizeLabel: "Brush Size",
    brushOpacityLabel: "Opacity",
    brushColorLabel: "Brush Color",
    brushFinish: "Finish Drawing",
    healHeader: "Healing Brush",
    healDesc: "Remove imperfections or dust. Click on an imperfection to fix it by cloning an adjacent healthy area.",
    healSizeLabel: "Correction Size",
    healFinish: "Finish Corrections",
    colorHeader: "White Balance",
    colorDesc: "Select the eyedropper, then click on a neutral zone (white, gray, or black) of the image to balance colors automatically.",
    colorSelectedInfo: "Selected Color",
    colorRgbValues: "RGB Values:",
    colorAppliedCorrection: "Correction Applied:",
    colorReset: "Reset",
    colorFinish: "Apply Balance",
    aiHeader: "AI Automations",
    aiAuto: "Auto Fix",
    aiFace: "Sublime Face",
    aiSkin: "Smooth Skin",
    aiHdr: "Smart HDR",
    filtersHeader: "Instagram Filters",
    filtersReset: "Reset",
    manualHeader: "Professional Settings",
    manualReset: "Reset",
    accordionLight: "Light & Tone",
    adjustExposure: "Exposure (Stops)",
    adjustContrast: "Contrast",
    adjustHighlights: "Highlights",
    adjustShadows: "Shadows",
    adjustWhites: "Whites",
    adjustBlacks: "Blacks",
    accordionColor: "Color & Balances",
    adjustTemp: "Temperature (K)",
    adjustTint: "Tint",
    adjustVibrance: "Vibrance",
    adjustSaturation: "Saturation",
    accordionEffects: "Presence & Effects",
    adjustClarity: "Clarity",
    adjustVignette: "Vignette",
    vignetteColorLabel: "Vignette Color",
    adjustSharpening: "Sharpening",
    accordionHsl: "HSL Color Grading",
    adjustHslRed: "Red Saturation",
    adjustHslOrange: "Orange Saturation (Skin)",
    adjustHslOrangeLum: "Orange Luminance (Skin Glow)",
    adjustHslBlue: "Blue Saturation (Sky)",
    fileInfoHeader: "File Info",
    actionSave: "Save",
    actionSaveTooltip: "Save retouches on this photo",
    actionApplyTo: "Apply to...",
    actionApplyToTooltip: "Apply these settings to multiple photos",
    actionJpeg: "JPEG HD",
    actionJpegTooltip: "Export in High Definition JPEG format",
    actionWebp: "WebP HD",
    actionWebpTooltip: "Convert and download in optimized WebP format",
    actionShareWhatsApp: "Share on WhatsApp",
    actionShareWhatsAppTooltip: "Share photo via WhatsApp",
    zoomFit: "Fit",
    zoomCompare: "Compare Before/After",
    zoomAiQuality: "AI Quality:",
    zoomAiQualityVal: "Ultra Precision",
    syncTitle: "Sync Retouch Settings",
    syncSubtitle: "Select the project photos on which to apply the current professional settings.",
    syncSelectAll: "Select All",
    syncDeselectAll: "Deselect All",
    syncLoading: "Loading project photos...",
    syncNoPhotos: "No other photos available in this project.",
    syncCancel: "Cancel",
    syncApplyCTA: "Apply to {count} photo(s)",
    syncingText: "Syncing...",
    notifSavedTitle: "Retouches saved!",
    notifSavedMsg: "The photo has been successfully updated in the cloud.",
    notifSaveErrTitle: "Save Error",
    notifSaveErrMsg: "Unable to save modifications on the photo.",
    notifExportTitle: "Export Started",
    notifExportMsg: "Your image is being processed and will be downloaded.",
    notifSyncSuccessTitle: "Sync Successful!",
    notifSyncSuccessMsg: "Retouch settings have been applied to {count} photo(s).",
    notifSyncErrTitle: "Sync Error",
    notifSyncErrMsg: "Unable to apply settings to the selected photos.",
    notifLoading: "Loading photo editor...",
    notifNotFoundTitle: "Photo Not Found",
    notifNotFoundMsg: "The requested photo does not exist or has been deleted.",
    notifBackToProject: "Back to Project",
    notifExportErrTitle: "Export Failed",
    notifExportErrMsg: "Error during high definition export.",
    notifRotationErrTitle: "Rotation Error",
    notifRotationErrMsg: "Rotation failed.",
    notifSelectionReqTitle: "Selection Required",
    notifSelectionReqMsg: "Please select at least one photo to sync.",
    notifClientNotFoundTitle: "Client Not Found",
    notifClientNotFoundMsg: "No client is associated with this project.",
    notifGalleryNotActiveTitle: "Gallery Not Active",
    notifGalleryNotActiveMsg: "The photo gallery is not yet configured or active for this project. Please activate it from the project page.",
    notifClose: "Close",
    phonePrompt: "The client does not have a registered phone number. Please enter their phone number (in international format, e.g.: +221 77 123 45 67):"
  }
};

export default function EditorPage() {
  const router = useRouter();
  const routeParams = useParams();
  const photoIdFromRoute = routeParams.photoId as string;
  const lang = useLanguage();
  const t = translations[lang];
  const [photoId, setPhotoId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [photo, setPhoto] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [aiPromptText, setAiPromptText] = useState('');
  const [isAiPromptGenerating, setIsAiPromptGenerating] = useState(false);
  const [selectedAiModel, setSelectedAiModel] = useState('google/gemini-2.5-flash');
  // Image editing states
  const [adjustments, setAdjustments] = useState<PhotoAdjustments>(DEFAULT_ADJUSTMENTS);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [processedUrl, setProcessedUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Before/after compare slider states
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isComparing, setIsComparing] = useState(true);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const compareContainerRef = useRef<HTMLDivElement>(null);

  // Zoom state
  const [zoomLevel, setZoomLevel] = useState<'fit' | '100' | '200'>('fit');

  // Active Tool selection
  const [activeTool, setActiveTool] = useState<string>('select');

  // Editor tools state & refs
  const [imgNaturalSize, setImgNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isBrushDrawing, setIsBrushDrawing] = useState(false);
  const [brushStroke, setBrushStroke] = useState<{ x: number; y: number }[]>([]);
  const [cropBox, setCropBox] = useState<{ startX: number; startY: number; width: number; height: number } | null>(null);
  const [isCroppingDrag, setIsCroppingDrag] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  
  // Text Tool states
  const [textAnnotationText, setTextAnnotationText] = useState<string>('PhotoFlow');
  const [textAnnotationSize, setTextAnnotationSize] = useState<number>(48);
  const [textAnnotationColor, setTextAnnotationColor] = useState<string>('#FFFFFF');
  const [textAnnotationFont, setTextAnnotationFont] = useState<string>('Arial');
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);
  const [hoveredFont, setHoveredFont] = useState<string | null>(null);
  const [textAnnotationRotation, setTextAnnotationRotation] = useState<number>(0);

  // Brush Tool settings
  const [brushSize, setBrushSize] = useState<number>(30);
  const [brushColor, setBrushColor] = useState<string>('#0055FF');
  const [brushOpacity, setBrushOpacity] = useState<number>(100);

  // Healing Brush settings
  const [healSize, setHealSize] = useState<number>(30);

  // Pipette settings
  const [pipetteColor, setPipetteColor] = useState<{ r: number; g: number; b: number; hex: string } | null>(null);

  // Crop states
  const [cropAspectRatio, setCropAspectRatio] = useState<string>('free');
  const [cropGridStyle, setCropGridStyle] = useState<'thirds' | 'fine' | 'none'>('thirds');
  
  const imageRef = useRef<HTMLImageElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [colorMixerTab, setColorMixerTab] = useState<'saturation' | 'luminance'>('saturation');

  const handleWBPresetChange = (preset: string) => {
    pushToHistory();
    switch (preset) {
      case 'as-shot':
        setAdjustments(prev => ({ ...prev, temperature: 0, tint: 0 }));
        break;
      case 'auto':
        setAdjustments(prev => ({ ...prev, temperature: 6, tint: -3 }));
        break;
      case 'daylight':
        setAdjustments(prev => ({ ...prev, temperature: 10, tint: 2 }));
        break;
      case 'cloudy':
        setAdjustments(prev => ({ ...prev, temperature: 18, tint: 4 }));
        break;
      case 'shade':
        setAdjustments(prev => ({ ...prev, temperature: 25, tint: 5 }));
        break;
      case 'tungsten':
        setAdjustments(prev => ({ ...prev, temperature: -28, tint: -10 }));
        break;
      case 'fluorescent':
        setAdjustments(prev => ({ ...prev, temperature: -12, tint: -4 }));
        break;
      case 'flash':
        setAdjustments(prev => ({ ...prev, temperature: 14, tint: 3 }));
        break;
    }
  };

  const handleRawImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsProcessing(true);
    showNotification('info', lang === 'fr' ? 'Développement RAW...' : 'Developing RAW...', lang === 'fr' ? 'Extraction de l\'image haute fidélité en cours...' : 'Extracting high fidelity image...');
    
    try {
      const developedFile = await compressAndConvert(file, {
        quality: 1.0,
        format: 'image/webp'
      });

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        setOriginalUrl(base64Url);
        setProcessedUrl(base64Url);
        setAdjustments(DEFAULT_ADJUSTMENTS);
        setPhoto((prev: any) => ({
          ...prev,
          filename: file.name,
          size_bytes: file.size,
          format: file.name.split('.').pop()?.toUpperCase() || 'RAW'
        }));
        showNotification(
          'success', 
          lang === 'fr' ? 'RAW Développé !' : 'RAW Developed!', 
          lang === 'fr' ? `Le fichier ${file.name} a été importé avec succès.` : `Successfully imported ${file.name}.`
        );
      };
      reader.readAsDataURL(developedFile);
    } catch (err) {
      console.error('RAW import failed:', err);
      showNotification(
        'error', 
        lang === 'fr' ? 'Échec de l\'importation' : 'Import Failed', 
        lang === 'fr' ? 'Impossible de décoder ce fichier RAW.' : 'Could not decode this RAW file.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Sync Modal states
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [projectPhotos, setProjectPhotos] = useState<any[]>([]);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [fetchingProjectPhotos, setFetchingProjectPhotos] = useState(false);

  // History Undo states
  const [historyStack, setHistoryStack] = useState<{ originalUrl: string; adjustments: PhotoAdjustments }[]>([]);

  // Client and Gallery states for sharing
  const [client, setClient] = useState<any>(null);
  const [gallery, setGallery] = useState<any>(null);

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
    setNotification({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const base64ToBlob = (base64: string) => {
    if (!base64.startsWith('data:')) return null;
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

  const uploadImageToStorage = async (base64Data: string, isOriginal: boolean) => {
    if (!base64Data || !base64Data.startsWith('data:')) {
      return base64Data;
    }
    
    try {
      const blob = base64ToBlob(base64Data);
      if (!blob) return base64Data;
      const ext = blob.type.split('/')[1] || 'jpg';
      const suffix = isOriginal ? 'original' : 'processed';
      const projectId = project?.id || 'general';
      const storagePath = `${projectId}/${Date.now()}-${Math.random().toString(36).substring(2, 6)}-${suffix}.${ext}`;
      
      const { error } = await supabase.storage
        .from('photos')
        .upload(storagePath, blob, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(storagePath);
        
      return urlData?.publicUrl || base64Data;
    } catch (err) {
      console.error('Storage upload failed, using fallback base64:', err);
      return base64Data;
    }
  };

  useEffect(() => {
    if (photoIdFromRoute) {
      setPhotoId(photoIdFromRoute);
      fetchPhotoData(photoIdFromRoute);
    }
  }, [photoIdFromRoute]);

  const fetchPhotoData = async (id: string) => {
    setLoading(true);
    try {
      const { data: photoData, error: photoError } = await supabase
        .from('pf_photos')
        .select('*, pf_projects(*, pf_clients(*))')
        .eq('id', id)
        .single();

      if (photoError) throw photoError;

      const { data: profileData } = await supabase
        .from('pf_profiles')
        .select('*')
        .eq('id', photoData.pf_projects?.user_id)
        .single();

      setPhoto(photoData);
      setProject(photoData.pf_projects);
      setClient(photoData.pf_projects?.pf_clients || null);
      if (profileData) setProfile(profileData);
      setOriginalUrl(photoData.original_url);
      setProcessedUrl(photoData.processed_url || photoData.original_url); // initial state
      if (photoData.metadata?.adjustments) {
        const loadedAdjustments = {
          ...DEFAULT_ADJUSTMENTS,
          ...photoData.metadata.adjustments
        };
        setAdjustments(loadedAdjustments);
        
        // Populate text tool states if adjustments contain text
        if (loadedAdjustments.textText) {
          setTextAnnotationText(loadedAdjustments.textText);
          setTextAnnotationSize(loadedAdjustments.textSize ?? 48);
          setTextAnnotationColor(loadedAdjustments.textColor ?? '#FFFFFF');
          setTextAnnotationFont(loadedAdjustments.textFont ?? 'Arial');
          setTextAnnotationRotation(loadedAdjustments.textRotation ?? 0);
          if (loadedAdjustments.textX !== undefined && loadedAdjustments.textY !== undefined) {
            setTextPosition({ x: loadedAdjustments.textX, y: loadedAdjustments.textY });
          }
        }
      }

      // Fetch the gallery for this project
      const { data: galleryData } = await supabase
        .from('pf_galleries')
        .select('*')
        .eq('project_id', photoData.pf_projects?.id)
        .maybeSingle();
      
      setGallery(galleryData || null);
    } catch (err) {
      console.error('Error fetching photo:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sync image dimensions when original URL changes
  useEffect(() => {
    if (!originalUrl) return;
    loadImage(originalUrl).then((img) => {
      setImgNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    }).catch(err => console.error("Error loading original image for dimensions:", err));
  }, [originalUrl]);

  // Sync text local states when adjustments.textText changes (e.g. when AI updates text overlay)
  useEffect(() => {
    if (adjustments.textText !== undefined && adjustments.textText !== null) {
      setTextAnnotationText(adjustments.textText);
      setTextAnnotationSize(adjustments.textSize ?? 48);
      setTextAnnotationColor(adjustments.textColor ?? '#FFFFFF');
      setTextAnnotationFont(adjustments.textFont ?? 'Arial');
      setTextAnnotationRotation(adjustments.textRotation ?? 0);
      if (adjustments.textX !== undefined && adjustments.textY !== undefined && adjustments.textX !== null && adjustments.textY !== null) {
        setTextPosition({ x: adjustments.textX, y: adjustments.textY });
      }
    }
  }, [
    adjustments.textText,
    adjustments.textSize,
    adjustments.textColor,
    adjustments.textFont,
    adjustments.textRotation,
    adjustments.textX,
    adjustments.textY
  ]);

  // Clean & synchronize text/crop local states when entering tools
  useEffect(() => {
    setCropBox(null);
    setBrushStroke([]);
    setIsBrushDrawing(false);
    setIsCroppingDrag(false);
    setCropAspectRatio('free');
    
    if (activeTool === 'text') {
      if (adjustments.textText) {
        setTextAnnotationText(adjustments.textText);
        setTextAnnotationSize(adjustments.textSize ?? 48);
        setTextAnnotationColor(adjustments.textColor ?? '#FFFFFF');
        setTextAnnotationFont(adjustments.textFont ?? 'Arial');
        setTextAnnotationRotation(adjustments.textRotation ?? 0);
        if (adjustments.textX !== undefined && adjustments.textY !== undefined) {
          setTextPosition({ x: adjustments.textX, y: adjustments.textY });
        }
      } else if (imgNaturalSize.width > 0) {
        setTextPosition({ x: imgNaturalSize.width / 2, y: imgNaturalSize.height / 2 });
      }
    } else {
      setTextPosition(null);
      setHoveredFont(null);
    }

    const canvas = overlayCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    ctx?.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
  }, [activeTool, adjustments, imgNaturalSize]);

  // Coordinate converter: Screen client space -> Image natural space
  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(canvas.width, (clientX - rect.left) * (canvas.width / rect.width))),
      y: Math.max(0, Math.min(canvas.height, (clientY - rect.top) * (canvas.height / rect.height))),
    };
  };

  const pushToHistory = (customOriginal?: string, customAdjustments?: PhotoAdjustments) => {
    setHistoryStack(prev => {
      const newStack = [...prev, {
        originalUrl: customOriginal || originalUrl,
        adjustments: customAdjustments || adjustments
      }];
      if (newStack.length > 15) {
        newStack.shift();
      }
      return newStack;
    });
  };

  const handleUndo = () => {
    setHistoryStack(prev => {
      if (prev.length === 0) return prev;
      const newStack = [...prev];
      const lastState = newStack.pop();
      if (lastState) {
        setOriginalUrl(lastState.originalUrl);
        setAdjustments(lastState.adjustments);
      }
      return newStack;
    });
  };

  // Keyboard shortcuts for undo and tool switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering shortcuts if typing in any text inputs or textareas
      const target = e.target as HTMLElement;
      if (
        target?.tagName === 'INPUT' || 
        target?.tagName === 'TEXTAREA' || 
        target?.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Undo shortcut (Ctrl+Z / Cmd+Z)
      if ((e.ctrlKey || e.metaKey) && key === 'z') {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Arrow keys to cycle tools (WAI-ARIA toolbar navigation)
      if (key === 'arrowdown' || key === 'arrowright') {
        e.preventDefault();
        const currentIndex = TOOL_ORDER.indexOf(activeTool);
        if (currentIndex !== -1) {
          const nextIndex = (currentIndex + 1) % TOOL_ORDER.length;
          const nextTool = TOOL_ORDER[nextIndex];
          setActiveTool(nextTool);
          
          // Move keyboard focus to the corresponding button
          const buttons = document.querySelectorAll('#left-tool-palette button');
          if (buttons && buttons[nextIndex]) {
            (buttons[nextIndex] as HTMLElement).focus();
          }
        }
        return;
      }
      if (key === 'arrowup' || key === 'arrowleft') {
        e.preventDefault();
        const currentIndex = TOOL_ORDER.indexOf(activeTool);
        if (currentIndex !== -1) {
          const prevIndex = (currentIndex - 1 + TOOL_ORDER.length) % TOOL_ORDER.length;
          const prevTool = TOOL_ORDER[prevIndex];
          setActiveTool(prevTool);
          
          // Move keyboard focus to the corresponding button
          const buttons = document.querySelectorAll('#left-tool-palette button');
          if (buttons && buttons[prevIndex]) {
            (buttons[prevIndex] as HTMLElement).focus();
          }
        }
        return;
      }

      // Single-key shortcuts for tool selection
      switch (key) {
        case 's':
        case 'v':
          e.preventDefault();
          setActiveTool('select');
          const btnSelect = document.querySelectorAll('#left-tool-palette button')[0] as HTMLElement;
          btnSelect?.focus();
          break;
        case 'c':
          e.preventDefault();
          setActiveTool('crop');
          const btnCrop = document.querySelectorAll('#left-tool-palette button')[1] as HTMLElement;
          btnCrop?.focus();
          break;
        case 'b':
          e.preventDefault();
          setActiveTool('brush');
          const btnBrush = document.querySelectorAll('#left-tool-palette button')[2] as HTMLElement;
          btnBrush?.focus();
          break;
        case 'h':
          e.preventDefault();
          setActiveTool('heal');
          const btnHeal = document.querySelectorAll('#left-tool-palette button')[3] as HTMLElement;
          btnHeal?.focus();
          break;
        case 'i':
          e.preventDefault();
          setActiveTool('color');
          const btnColor = document.querySelectorAll('#left-tool-palette button')[4] as HTMLElement;
          btnColor?.focus();
          break;
        case 't':
          e.preventDefault();
          setActiveTool('text');
          const btnText = document.querySelectorAll('#left-tool-palette button')[5] as HTMLElement;
          btnText?.focus();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeTool]);

  const handleSlidersMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'range') {
      pushToHistory();
    }
  };

  // Set crop aspect ratio and generate a centered crop box
  const handleSetCropAspectRatio = (ratio: string) => {
    setCropAspectRatio(ratio);
    const canvas = overlayCanvasRef.current;
    if (canvas) {
      if (ratio === 'free') {
        // Reset or keep it
        return;
      }
      const [aspectW, aspectH] = ratio.split(':').map(Number);
      const targetRatio = aspectW / aspectH;
      
      let boxW = canvas.width * 0.8;
      let boxH = boxW / targetRatio;
      
      if (boxH > canvas.height * 0.8) {
        boxH = canvas.height * 0.8;
        boxW = boxH * targetRatio;
      }
      
      const startX = (canvas.width - boxW) / 2;
      const startY = (canvas.height - boxH) / 2;
      
      const newBox = { startX, startY, width: boxW, height: boxH };
      setCropBox(newBox);
      
      setTimeout(() => {
        drawCropOverlay(newBox);
      }, 0);
    }
  };

  // Helper to calculate constrained crop box coordinates on drag
  const calculateCropBox = (coords: { x: number; y: number }) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas || !cropStart) return null;
    
    const dx = coords.x - cropStart.x;
    const dy = coords.y - cropStart.y;
    
    let width = Math.abs(dx);
    let height = Math.abs(dy);
    
    if (cropAspectRatio && cropAspectRatio !== 'free') {
      const [aspectW, aspectH] = cropAspectRatio.split(':').map(Number);
      const ratio = aspectW / aspectH;
      
      if (width / ratio > height) {
        height = width / ratio;
      } else {
        width = height * ratio;
      }
      
      const isDragRight = dx >= 0;
      const isDragDown = dy >= 0;
      
      let startX = isDragRight ? cropStart.x : cropStart.x - width;
      let startY = isDragDown ? cropStart.y : cropStart.y - height;
      
      if (startX < 0) {
        width = cropStart.x;
        height = width / ratio;
        startX = 0;
        startY = isDragDown ? cropStart.y : cropStart.y - height;
      }
      if (startX + width > canvas.width) {
        width = canvas.width - cropStart.x;
        height = width / ratio;
        startX = cropStart.x;
        startY = isDragDown ? cropStart.y : cropStart.y - height;
      }
      if (startY < 0) {
        height = cropStart.y;
        width = height * ratio;
        startY = 0;
        startX = isDragRight ? cropStart.x : cropStart.x - width;
      }
      if (startY + height > canvas.height) {
        height = canvas.height - cropStart.y;
        width = height * ratio;
        startY = cropStart.y;
        startX = isDragRight ? cropStart.x : cropStart.x - width;
      }
      
      if (startX < 0) {
        width = cropStart.x;
        height = width / ratio;
        startX = 0;
      }
      if (startY < 0) {
        height = cropStart.y;
        width = height * ratio;
        startY = 0;
      }
      
      return { startX, startY, width, height };
    } else {
      const startX = Math.min(cropStart.x, coords.x);
      const startY = Math.min(cropStart.y, coords.y);
      return { startX, startY, width, height };
    }
  };

  // Draw crop box overlay with rule-of-thirds or alignment grid
  const drawCropOverlay = (box: typeof cropBox) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!box) return;

    // 1. Semi-transparent darkened background outside selection
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.width, box.startY);
    ctx.fillRect(0, box.startY + box.height, canvas.width, canvas.height - (box.startY + box.height));
    ctx.fillRect(0, box.startY, box.startX, box.height);
    ctx.fillRect(box.startX + box.width, box.startY, canvas.width - (box.startX + box.width), box.height);

    // 2. White outer border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = Math.max(2, Math.round(canvas.width / 800));
    ctx.strokeRect(box.startX, box.startY, box.width, box.height);

    // 3. Thin grid lines (composition/alignment thirds or fine grid)
    if (cropGridStyle !== 'none') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = Math.max(1, Math.round(canvas.width / 1800));
      
      const divisions = cropGridStyle === 'thirds' ? 3 : 6;
      ctx.beginPath();
      
      for (let d = 1; d < divisions; d++) {
        const xCoord = box.startX + (box.width / divisions) * d;
        ctx.moveTo(xCoord, box.startY);
        ctx.lineTo(xCoord, box.startY + box.height);
        
        const yCoord = box.startY + (box.height / divisions) * d;
        ctx.moveTo(box.startX, yCoord);
        ctx.lineTo(box.startX + box.width, yCoord);
      }
      ctx.stroke();
    }
  };

  // Draw real-time brush path
  const drawBrushStroke = (stroke: typeof brushStroke) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (stroke.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const scaleFactor = rect.width > 0 ? (canvas.width / rect.width) : 1;

    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize * scaleFactor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = brushOpacity / 100;

    ctx.beginPath();
    ctx.moveTo(stroke[0].x, stroke[0].y);
    for (let i = 1; i < stroke.length; i++) {
      ctx.lineTo(stroke[i].x, stroke[i].y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  };

  // Draw healing circle indicator
  const drawHealingPreview = (x: number, y: number) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const rect = canvas.getBoundingClientRect();
    const scaleFactor = rect.width > 0 ? (canvas.width / rect.width) : 1;
    const radius = healSize * scaleFactor;

    // Target circle
    ctx.strokeStyle = '#0055FF';
    ctx.lineWidth = 2 * scaleFactor;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Source circle (dashed)
    const sourceX = x + radius * 1.8;
    const sourceY = y + radius * 1.8;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5 * scaleFactor;
    ctx.setLineDash([4 * scaleFactor, 4 * scaleFactor]);
    ctx.beginPath();
    ctx.arc(sourceX, sourceY, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  // Draw text preview with border/outline on the overlay canvas
  const drawTextPreview = (coords: { x: number; y: number }) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!textAnnotationText) return;

    ctx.save();
    ctx.translate(coords.x, coords.y);
    ctx.rotate((textAnnotationRotation * Math.PI) / 180);

    ctx.fillStyle = textAnnotationColor;
    const activeFont = hoveredFont || textAnnotationFont;
    ctx.font = `bold ${textAnnotationSize}px ${activeFont}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Outer stroke for readability
    const isDarkText = textAnnotationColor === '#000000' || textAnnotationColor === '#000';
    ctx.strokeStyle = isDarkText ? '#FFFFFF' : '#000000';
    ctx.lineWidth = Math.max(2, Math.round(textAnnotationSize / 15));
    ctx.strokeText(textAnnotationText, 0, 0);
    ctx.fillText(textAnnotationText, 0, 0);

    ctx.restore();
  };

  // Re-draw text preview overlay when text configuration or layout changes
  useEffect(() => {
    if (activeTool === 'text' && textPosition) {
      const timer = setTimeout(() => {
        drawTextPreview(textPosition);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [
    activeTool,
    textAnnotationText,
    textAnnotationColor,
    textAnnotationSize,
    textAnnotationFont,
    textAnnotationRotation,
    hoveredFont,
    textPosition,
    processedUrl,
    isProcessing,
    zoomLevel,
    imgNaturalSize
  ]);

  // Mouse handlers for overlay canvas
  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'select') return;
    e.stopPropagation();
    e.preventDefault();

    const coords = getCanvasCoords(e.clientX, e.clientY);

    if (activeTool === 'brush') {
      setIsBrushDrawing(true);
      setBrushStroke([coords]);
      drawBrushStroke([coords]);
    } else if (activeTool === 'crop') {
      setIsCroppingDrag(true);
      setCropStart(coords);
      setCropBox({
        startX: coords.x,
        startY: coords.y,
        width: 0,
        height: 0
      });
    } else if (activeTool === 'text') {
      setTextPosition(coords);
    }
  };

  const handleOverlayMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'select') return;
    e.stopPropagation();
    
    const coords = getCanvasCoords(e.clientX, e.clientY);

    if (activeTool === 'brush' && isBrushDrawing) {
      const newStroke = [...brushStroke, coords];
      setBrushStroke(newStroke);
      drawBrushStroke(newStroke);
    } else if (activeTool === 'crop' && isCroppingDrag && cropStart) {
      const calculatedBox = calculateCropBox(coords);
      if (calculatedBox) {
        setCropBox(calculatedBox);
        drawCropOverlay(calculatedBox);
      }
    } else if (activeTool === 'heal') {
      drawHealingPreview(coords.x, coords.y);
    } else if (activeTool === 'text' && e.buttons === 1) {
      setTextPosition(coords);
    }
  };

  const handleOverlayMouseUp = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'select') return;
    e.stopPropagation();

    if (activeTool === 'brush' && isBrushDrawing) {
      setIsBrushDrawing(false);
      await handleExecuteBrush(brushStroke);
      setBrushStroke([]);
      const canvas = overlayCanvasRef.current;
      const ctx = canvas?.getContext('2d');
      ctx?.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
    } else if (activeTool === 'crop' && isCroppingDrag) {
      setIsCroppingDrag(false);
      if (cropBox && (cropBox.width < 15 || cropBox.height < 15)) {
        setCropBox(null);
        const canvas = overlayCanvasRef.current;
        const ctx = canvas?.getContext('2d');
        ctx?.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
      }
    } else if (activeTool === 'heal') {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      await handleExecuteHeal(coords.x, coords.y);
      const canvas = overlayCanvasRef.current;
      const ctx = canvas?.getContext('2d');
      ctx?.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
    } else if (activeTool === 'color') {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      await handleExecuteColor(coords.x, coords.y);
    } else if (activeTool === 'text') {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      setTextPosition(coords);
    }
  };

  const handleOverlayMouseLeave = async () => {
    if (activeTool === 'select') return;
    if (activeTool === 'brush' && isBrushDrawing) {
      setIsBrushDrawing(false);
      await handleExecuteBrush(brushStroke);
      setBrushStroke([]);
    }
    setIsCroppingDrag(false);
    
    // Only clear the canvas preview if we are not adjusting text or crop boxes
    if (activeTool !== 'text' && activeTool !== 'crop') {
      const canvas = overlayCanvasRef.current;
      const ctx = canvas?.getContext('2d');
      ctx?.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
    }
  };

  // Execution triggers
  const handleExecuteBrush = async (stroke: { x: number; y: number }[]) => {
    if (stroke.length === 0) return;
    pushToHistory();
    setIsProcessing(true);
    try {
      const img = await loadImage(originalUrl);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d', { colorSpace: 'display-p3' }) || canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get 2D context');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(img, 0, 0);

      // Find scale factor from display to natural space to match preview thickness
      const displayRect = imageRef.current?.getBoundingClientRect();
      const scaleFactor = displayRect && displayRect.width > 0 ? (canvas.width / displayRect.width) : 1;

      // Draw path onto baseline image
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize * scaleFactor;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = brushOpacity / 100;

      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      // Store lossless PNG in-memory during editing to prevent progressive compression loss
      const newOriginalUrl = canvas.toDataURL('image/png');
      setOriginalUrl(newOriginalUrl);
    } catch (err) {
      console.error('Failed to apply brush stroke:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteHeal = async (targetX: number, targetY: number) => {
    pushToHistory();
    setIsProcessing(true);
    try {
      const img = await loadImage(originalUrl);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d', { colorSpace: 'display-p3', willReadFrequently: true }) || canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get 2D context');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(img, 0, 0);

      // Find scale factor from display to natural space
      const displayRect = imageRef.current?.getBoundingClientRect();
      const scaleFactor = displayRect && displayRect.width > 0 ? (canvas.width / displayRect.width) : 1;
      const radius = healSize * scaleFactor;
      
      // Target bounds check
      const tX = Math.min(canvas.width - radius, Math.max(radius, targetX));
      const tY = Math.min(canvas.height - radius, Math.max(radius, targetY));

      // Source location offset (feather clone nearby)
      const sourceX = Math.min(canvas.width - radius, Math.max(radius, tX + radius * 1.8));
      const sourceY = Math.min(canvas.height - radius, Math.max(radius, tY + radius * 1.8));

      // Create offscreen feather patch
      const patchCanvas = document.createElement('canvas');
      patchCanvas.width = radius * 2;
      patchCanvas.height = radius * 2;
      const patchCtx = patchCanvas.getContext('2d', { colorSpace: 'display-p3', willReadFrequently: true }) || patchCanvas.getContext('2d');
      if (!patchCtx) throw new Error('Could not get patch context');
      patchCtx.imageSmoothingEnabled = true;
      patchCtx.imageSmoothingQuality = 'high';

      // 1. Draw source patch
      patchCtx.drawImage(
        img,
        sourceX - radius, sourceY - radius, radius * 2, radius * 2,
        0, 0, radius * 2, radius * 2
      );

      // 2. Match source patch average color to target patch average color
      try {
        const targetImgData = ctx.getImageData(Math.floor(tX - radius), Math.floor(tY - radius), Math.floor(radius * 2), Math.floor(radius * 2));
        const sourceImgData = patchCtx.getImageData(0, 0, Math.floor(radius * 2), Math.floor(radius * 2));
        
        let targetR = 0, targetG = 0, targetB = 0, targetCount = 0;
        let sourceR = 0, sourceG = 0, sourceB = 0, sourceCount = 0;
        
        const wLimit = Math.floor(radius * 2);
        const radSq = radius * radius;
        
        for (let y = 0; y < wLimit; y++) {
          for (let x = 0; x < wLimit; x++) {
            const dx = x - radius;
            const dy = y - radius;
            if (dx * dx + dy * dy < radSq) {
              const idx = (y * wLimit + x) * 4;
              if (idx < targetImgData.data.length - 4) {
                targetR += targetImgData.data[idx];
                targetG += targetImgData.data[idx + 1];
                targetB += targetImgData.data[idx + 2];
                targetCount++;
              }
              if (idx < sourceImgData.data.length - 4) {
                sourceR += sourceImgData.data[idx];
                sourceG += sourceImgData.data[idx + 1];
                sourceB += sourceImgData.data[idx + 2];
                sourceCount++;
              }
            }
          }
        }
        
        if (targetCount > 0 && sourceCount > 0) {
          const avgTargetR = targetR / targetCount;
          const avgTargetG = targetG / targetCount;
          const avgTargetB = targetB / targetCount;
          
          const avgSourceR = sourceR / sourceCount;
          const avgSourceG = sourceG / sourceCount;
          const avgSourceB = sourceB / sourceCount;
          
          const diffR = avgTargetR - avgSourceR;
          const diffG = avgTargetG - avgSourceG;
          const diffB = avgTargetB - avgSourceB;
          
          for (let i = 0; i < sourceImgData.data.length; i += 4) {
            sourceImgData.data[i] = Math.max(0, Math.min(255, sourceImgData.data[i] + diffR));
            sourceImgData.data[i + 1] = Math.max(0, Math.min(255, sourceImgData.data[i + 1] + diffG));
            sourceImgData.data[i + 2] = Math.max(0, Math.min(255, sourceImgData.data[i + 2] + diffB));
          }
          patchCtx.putImageData(sourceImgData, 0, 0);
        }
      } catch (colorMatchErr) {
        console.error("Color matching blending failed, falling back to direct stamp:", colorMatchErr);
      }

      // 3. Apply feathering mask
      patchCtx.globalCompositeOperation = 'destination-in';
      const grad = patchCtx.createRadialGradient(radius, radius, radius * 0.4, radius, radius, radius);
      grad.addColorStop(0, 'rgba(0,0,0,1)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      patchCtx.fillStyle = grad;
      patchCtx.fillRect(0, 0, radius * 2, radius * 2);

      // 4. Draw onto target
      ctx.drawImage(patchCanvas, tX - radius, tY - radius);

      // Store lossless PNG in-memory during editing to prevent progressive compression loss
      const newOriginalUrl = canvas.toDataURL('image/png');
      setOriginalUrl(newOriginalUrl);
    } catch (err) {
      console.error('Healing brush failure:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteColor = async (x: number, y: number) => {
    pushToHistory();
    setIsProcessing(true);
    try {
      const img = await loadImage(originalUrl);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get 2D context');

      ctx.drawImage(img, 0, 0);

      // Extract clicked pixel rgb
      const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
      const r = pixel[0];
      const g = pixel[1];
      const b = pixel[2];

      const componentToHex = (c: number) => {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' : '' + hex;
      };
      const hexColor = '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);

      setPipetteColor({ r, g, b, hex: hexColor.toUpperCase() });

      // White balance math: adjust temp/tint to neutralise selected pixel color
      const tempAdjust = Math.max(-100, Math.min(100, Math.round((b - r) * 0.8)));
      const tintAdjust = Math.max(-100, Math.min(100, Math.round((g - (r + b) / 2) * 0.8)));

      setAdjustments(prev => ({
        ...prev,
        temperature: tempAdjust,
        tint: tintAdjust
      }));
    } catch (err) {
      console.error('White balance selector failure:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteCrop = async () => {
    if (!cropBox) return;
    pushToHistory();
    setIsProcessing(true);
    try {
      const img = await loadImage(originalUrl);
      const canvas = document.createElement('canvas');
      canvas.width = cropBox.width;
      canvas.height = cropBox.height;
      const ctx = canvas.getContext('2d', { colorSpace: 'display-p3' }) || canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get 2D context');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        img,
        cropBox.startX, cropBox.startY, cropBox.width, cropBox.height,
        0, 0, cropBox.width, cropBox.height
      );

      // Store lossless PNG in-memory during editing to prevent progressive compression loss
      const newOriginalUrl = canvas.toDataURL('image/png');
      setOriginalUrl(newOriginalUrl);
      setCropBox(null);
    } catch (err) {
      console.error('Crop failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteText = () => {
    if (!textPosition || !textAnnotationText) return;
    pushToHistory();
    setAdjustments(prev => ({
      ...prev,
      textText: textAnnotationText,
      textSize: textAnnotationSize,
      textColor: textAnnotationColor,
      textFont: textAnnotationFont,
      textX: textPosition.x,
      textY: textPosition.y,
      textRotation: textAnnotationRotation
    }));

    // Clear overlay preview canvas
    const canvas = overlayCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    ctx?.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);

    // Reset back to select tool
    setActiveTool('select');
    setTextPosition(null);
  };

  const handleRemoveText = () => {
    pushToHistory();
    setAdjustments(prev => ({
      ...prev,
      textText: '',
      textX: undefined,
      textY: undefined,
      textRotation: 0
    }));
    setTextAnnotationText('PhotoFlow');
    setTextAnnotationSize(48);
    setTextAnnotationColor('#FFFFFF');
    setTextAnnotationFont('Arial');
    setTextAnnotationRotation(0);
    setTextPosition(null);
    const canvas = overlayCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    ctx?.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
    setActiveTool('select');
  };

  // Re-run image adjustments filter whenever adjustments change
  useEffect(() => {
    if (!originalUrl) return;

    let active = true;
    let loadingTimeout: NodeJS.Timeout;

    const updatePreview = async () => {
      // Defer loader by 150ms to make fast slider movements look smooth and flicker-free
      loadingTimeout = setTimeout(() => {
        if (active) setIsProcessing(true);
      }, 150);

      // Add a tiny debounce to prevent freezing on fast slider moves
      await new Promise(resolve => setTimeout(resolve, 40));
      if (!active) {
        clearTimeout(loadingTimeout);
        return;
      }

      // Determine preview dimension limit based on zoom level: 1200 for fit, 3200 for 100%/200% zoom
      const previewLimit = zoomLevel === 'fit' ? 1200 : 3200;
      
      // Temporarily hide text from the background preview adjustments if the text tool is currently active
      const adjustedSettings = activeTool === 'text'
        ? { ...adjustments, textText: '' }
        : adjustments;
        
      const output = await applyAdjustments(originalUrl, adjustedSettings, undefined, previewLimit);
      
      clearTimeout(loadingTimeout);
      if (active) {
        setProcessedUrl(output);
        setIsProcessing(false);
      }
    };

    updatePreview();

    return () => {
      active = false;
      clearTimeout(loadingTimeout);
    };
  }, [adjustments, originalUrl, zoomLevel, activeTool]);

  // Handle manual adjustments slider change
  const handleSliderChange = (key: keyof PhotoAdjustments, value: number | boolean | string) => {
    setAdjustments((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetAdjustments = () => {
    pushToHistory();
    setAdjustments(DEFAULT_ADJUSTMENTS);
  };

  // AI automation presets
  const triggerAiAutomation = (type: 'auto' | 'face' | 'skin' | 'hdr') => {
    pushToHistory();
    setIsProcessing(true);
    setTimeout(() => {
      switch (type) {
        case 'auto':
          setAdjustments({
            ...DEFAULT_ADJUSTMENTS,
            exposure: 15,
            contrast: 10,
            saturation: 5,
            clarity: 10,
          });
          break;
        case 'face':
          setAdjustments({
            ...DEFAULT_ADJUSTMENTS,
            exposure: 10,
            highlights: 5,
            hslOrangeSaturation: -5,
            hslOrangeLuminance: 12, // Skin glow
            skinSmoothing: true,
          });
          break;
        case 'skin':
          setAdjustments({
            ...DEFAULT_ADJUSTMENTS,
            skinSmoothing: true,
          });
          break;
        case 'hdr':
          setAdjustments({
            ...DEFAULT_ADJUSTMENTS,
            shadows: 30,
            contrast: 12,
            highlights: -15,
            clarity: 15,
          });
          break;
      }
    }, 400); // simulated processing delay
  };

  const handleApplyAiPrompt = async () => {
    if (!aiPromptText.trim()) return;
    setIsAiPromptGenerating(true);
    pushToHistory();

    try {
      // Downscale originalUrl to 400px for AI vision analysis
      let base64Image = '';
      try {
        base64Image = await applyAdjustments(originalUrl, DEFAULT_ADJUSTMENTS, undefined, 400);
      } catch (imgErr) {
        console.warn('Failed to downscale image for vision analysis:', imgErr);
      }

      const response = await fetch('/api/ai/retouch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPromptText,
          currentAdjustments: adjustments,
          image: base64Image,
          model: selectedAiModel,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to apply AI retouch');
      }

      if (data.adjustments) {
        setAdjustments((prev) => ({
          ...prev,
          ...data.adjustments,
        }));
        showNotification(
          'success',
          lang === 'fr' ? 'Retouche Appliquée' : 'Retouch Applied',
          lang === 'fr' 
            ? "L'IA OpenRouter a analysé votre prompt et adapté les réglages avec succès." 
            : "OpenRouter AI successfully analyzed your prompt and adjusted settings."
        );
      }
    } catch (err: any) {
      console.error('AI retouch failed, falling back to local keywords:', err);
      
      const prompt = aiPromptText.toLowerCase();
      let updatedAdj = { ...adjustments };
      const keywords = [
        { keys: ['warm', 'chaud', 'soleil', 'sun', 'été', 'summer'], action: () => { updatedAdj.temperature = Math.min(100, updatedAdj.temperature + 25); } },
        { keys: ['cold', 'cool', 'frais', 'bleu', 'blue', 'hiver', 'winter'], action: () => { updatedAdj.temperature = Math.max(-100, updatedAdj.temperature - 25); } },
        { keys: ['vintage', 'retro', 'rétro', 'ancien', 'film', 'nostalgique'], action: () => { updatedAdj.filter = 'valencia'; updatedAdj.contrast = Math.max(-100, updatedAdj.contrast - 10); updatedAdj.vignette = Math.max(-100, updatedAdj.vignette - 15); } },
        { keys: ['bright', 'lumineux', 'clair', 'exposer', 'light', 'exposition', 'exposure', 'soleil'], action: () => { updatedAdj.exposure = Math.min(100, updatedAdj.exposure + 20); } },
        { keys: ['dark', 'sombre', 'nuit', 'night', 'crépuscule', 'obscur', 'créativité'], action: () => { updatedAdj.exposure = Math.max(-100, updatedAdj.exposure - 20); } },
        { keys: ['contrast', 'contraste', 'pétant', 'vif', 'dynamique'], action: () => { updatedAdj.contrast = Math.min(100, updatedAdj.contrast + 20); } },
        { keys: ['soft', 'doux', 'flat', 'plat', 'mat'], action: () => { updatedAdj.contrast = Math.max(-100, updatedAdj.contrast - 15); updatedAdj.clarity = Math.max(-100, updatedAdj.clarity - 15); } },
        { keys: ['black and white', 'black & white', 'noir et blanc', 'n&b', 'nb', 'monochrome', 'grayscale', 'gris'], action: () => { updatedAdj.filter = 'inkwell'; updatedAdj.saturation = -100; } },
        { keys: ['skin', 'peau', 'lisse', 'visage', 'face', 'beauté', 'portrait', 'imperfection'], action: () => { updatedAdj.skinSmoothing = true; updatedAdj.hslOrangeLuminance = Math.min(100, (updatedAdj.hslOrangeLuminance || 0) + 12); updatedAdj.hslOrangeSaturation = Math.max(-100, (updatedAdj.hslOrangeSaturation || 0) - 5); } },
        { keys: ['hdr', 'détail', 'detail', 'détails', 'vif', 'texture', 'presence', 'clarté'], action: () => { updatedAdj.shadows = Math.min(100, updatedAdj.shadows + 30); updatedAdj.highlights = Math.max(-100, updatedAdj.highlights - 20); updatedAdj.clarity = Math.min(100, updatedAdj.clarity + 15); updatedAdj.hdrEnabled = true; } },
        { keys: ['saturated', 'coloré', 'colore', 'vif', 'couleur', 'saturation'], action: () => { updatedAdj.saturation = Math.min(100, updatedAdj.saturation + 25); updatedAdj.vibrance = Math.min(100, updatedAdj.vibrance + 15); } },
        { keys: ['desaturated', 'terne', 'pastel', 'fade', 'décoloré'], action: () => { updatedAdj.saturation = Math.max(-100, updatedAdj.saturation - 30); } },
        { keys: ['sharp', 'net', 'netteté', 'clarity', 'clarté'], action: () => { updatedAdj.sharpening = Math.min(100, updatedAdj.sharpening + 40); } },
        { keys: ['vignette', 'sombre aux bords', 'cadre sombre', 'vignettage'], action: () => { updatedAdj.vignette = Math.max(-100, updatedAdj.vignette - 30); } },
        { keys: ['studio', 'portrait', 'wadens', 'professionnel', 'douce', 'smooth'], action: () => { updatedAdj.skinSmoothing = true; updatedAdj.hslOrangeLuminance = 25; updatedAdj.hslOrangeSaturation = -10; updatedAdj.vignette = -35; updatedAdj.vignetteColor = '#c2a68c'; updatedAdj.shadows = 15; updatedAdj.highlights = -15; } }
      ];

      let matched = false;
      for (const kw of keywords) {
        if (kw.keys.some(k => prompt.includes(k))) {
          kw.action();
          matched = true;
        }
      }

      if (matched) {
        setAdjustments(updatedAdj);
      } else {
        updatedAdj.exposure = Math.min(100, updatedAdj.exposure + 10);
        updatedAdj.contrast = Math.min(100, updatedAdj.contrast + 5);
        updatedAdj.clarity = Math.min(100, updatedAdj.clarity + 10);
        setAdjustments(updatedAdj);
      }

      if (err.message?.includes('API key is missing')) {
        showNotification(
          'warning', 
          lang === 'fr' ? 'Clé API manquante' : 'API Key Missing', 
          lang === 'fr' 
            ? "Veuillez configurer OPENROUTER_API_KEY dans votre fichier .env.local pour utiliser l'IA en ligne. (Mode local activé)" 
            : "Please configure OPENROUTER_API_KEY in your .env.local file to use online AI. (Fallback to local mode)"
        );
      } else {
        showNotification(
          'warning',
          lang === 'fr' ? 'Retouche locale' : 'Local Retouch',
          lang === 'fr' ? "Erreur de connexion à l'IA. Retouche par mots-clés appliquée." : "AI connection error. Keyword-based adjustments applied."
        );
      }
    } finally {
      setIsAiPromptGenerating(false);
    }
  };

  // Before/after compare slider drag handler
  const handleCompareMove = (clientX: number) => {
    if (!compareContainerRef.current) return;
    const rect = compareContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleCompareMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingSlider && e.buttons !== 1) return;
    handleCompareMove(e.clientX);
  };

  const handleCompareTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleCompareMove(e.touches[0].clientX);
    }
  };

  // Export current edited image file in full HD
  const handleExport = async (format: 'webp' | 'jpeg') => {
    setIsProcessing(true);
    try {
      const formatMime = format === 'webp' ? 'image/webp' : 'image/jpeg';
      // Apply adjustments on original full size image
      const hdUrl = await applyAdjustments(originalUrl, adjustments, undefined, false, formatMime);
      const link = document.createElement('a');
      link.href = hdUrl;
      link.download = `edited_${photo?.filename || 'photo'}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('HD Export failed:', err);
      showNotification('error', t.notifExportErrTitle, t.notifExportErrMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSavePhoto = async () => {
    setIsSaving(true);
    try {
      // Determine final output format mime type from the original file
      let formatMime: 'image/jpeg' | 'image/webp' | 'image/png' = 'image/jpeg';
      if (photo?.format) {
        const fmt = photo.format.toLowerCase();
        if (fmt === 'png') formatMime = 'image/png';
        else if (fmt === 'webp') formatMime = 'image/webp';
      } else if (photo?.filename) {
        const lowerName = photo.filename.toLowerCase();
        if (lowerName.endsWith('.png')) formatMime = 'image/png';
        else if (lowerName.endsWith('.webp')) formatMime = 'image/webp';
      }

      // Convert originalUrl (which might be in-memory lossless PNG) back to original format at high quality
      let finalOriginalBase64 = originalUrl;
      if (originalUrl.startsWith('data:')) {
        const img = await loadImage(originalUrl);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d', { colorSpace: 'display-p3' }) || canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0);
          finalOriginalBase64 = canvas.toDataURL(formatMime, formatMime === 'image/png' ? undefined : 1.0);
        }
      }

      // Apply adjustments on original image (generating high quality base64 in the target format)
      const processedBase64 = await applyAdjustments(originalUrl, adjustments, undefined, false, formatMime);
      
      // Generate and upload processed thumbnail
      const processedThumbBase64 = await applyAdjustments(originalUrl, adjustments, undefined, 600, formatMime);

      // Upload to storage if they are base64 strings
      const uploadedOriginalUrl = await uploadImageToStorage(finalOriginalBase64, true);
      const uploadedProcessedUrl = await uploadImageToStorage(processedBase64, false);
      const uploadedProcessedThumbUrl = await uploadImageToStorage(processedThumbBase64, false);

      const newMetadata = {
        ...photo.metadata,
        adjustments,
        processed_thumbnail_url: uploadedProcessedThumbUrl,
      };

      const { error } = await supabase
        .from('pf_photos')
        .update({
          original_url: uploadedOriginalUrl,
          processed_url: uploadedProcessedUrl,
          metadata: newMetadata
        })
        .eq('id', photoId);

      if (error) throw error;
      
      // Update local state URLs and photo details
      setOriginalUrl(uploadedOriginalUrl);
      setProcessedUrl(uploadedProcessedUrl);
      setPhoto((prev: any) => ({
        ...prev,
        original_url: uploadedOriginalUrl,
        processed_url: uploadedProcessedUrl,
        metadata: newMetadata
      }));
      
      showNotification('success', t.notifSavedTitle, t.notifSavedMsg);
    } catch (err) {
      console.error('Save failed:', err);
      showNotification('error', t.notifSaveErrTitle, t.notifSaveErrMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Rotate baseline photo 90 degrees clockwise or counter-clockwise
  const handleRotateImage = async (direction: 'left' | 'right') => {
    pushToHistory();
    setIsProcessing(true);
    try {
      const img = await loadImage(originalUrl);
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

      // Detect and preserve original format from photo database record or filename
      let formatMime: 'image/jpeg' | 'image/webp' | 'image/png' = 'image/jpeg';
      if (photo?.format) {
        const fmt = photo.format.toLowerCase();
        if (fmt === 'png') formatMime = 'image/png';
        else if (fmt === 'webp') formatMime = 'image/webp';
      } else if (photo?.filename) {
        const lowerName = photo.filename.toLowerCase();
        if (lowerName.endsWith('.png')) formatMime = 'image/png';
        else if (lowerName.endsWith('.webp')) formatMime = 'image/webp';
      }

      const newOriginalUrl = canvas.toDataURL(formatMime, formatMime === 'image/png' ? undefined : 1.0);

      // Calculate new text position and rotation
      let updatedAdjustments = { ...adjustments };
      if (adjustments.textX !== undefined && adjustments.textY !== undefined) {
        const oldW = img.naturalWidth;
        const oldH = img.naturalHeight;
        if (direction === 'right') {
          updatedAdjustments.textX = oldH - adjustments.textY;
          updatedAdjustments.textY = adjustments.textX;
        } else {
          updatedAdjustments.textX = adjustments.textY;
          updatedAdjustments.textY = oldW - adjustments.textX;
        }

        // Also rotate the text orientation
        let newRot = (adjustments.textRotation || 0) + (direction === 'right' ? 90 : -90);
        if (newRot > 180) newRot -= 360;
        if (newRot < -180) newRot += 360;
        updatedAdjustments.textRotation = newRot;

        // Also update text rotation state so UI is in sync
        setTextAnnotationRotation(newRot);
      }

      // Generate the new processed URL with adjustments applied
      const processedBase64 = await applyAdjustments(newOriginalUrl, updatedAdjustments, undefined, false, formatMime);

      // Immediately show the rotated image in the UI instantly
      setOriginalUrl(newOriginalUrl);
      setProcessedUrl(processedBase64);
      setAdjustments(updatedAdjustments);
      if (updatedAdjustments.textX !== undefined && updatedAdjustments.textY !== undefined) {
        setTextPosition({ x: updatedAdjustments.textX, y: updatedAdjustments.textY });
      }

      setPhoto((prev: any) => ({
        ...prev,
        original_url: newOriginalUrl,
        processed_url: processedBase64
      }));

      // Asynchronously upload to storage and update database in the background
      const saveRotationAsync = async () => {
        try {
          const uploadedOriginalUrl = await uploadImageToStorage(newOriginalUrl, true);
          const uploadedProcessedUrl = await uploadImageToStorage(processedBase64, false);

          // Generate and upload rotated original thumbnail
          const originalThumbBase64 = await applyAdjustments(newOriginalUrl, DEFAULT_ADJUSTMENTS, undefined, 600, formatMime);
          const uploadedOriginalThumbUrl = await uploadImageToStorage(originalThumbBase64, false);

          // Generate and upload rotated processed thumbnail
          const processedThumbBase64 = await applyAdjustments(newOriginalUrl, updatedAdjustments, undefined, 600, formatMime);
          const uploadedProcessedThumbUrl = await uploadImageToStorage(processedThumbBase64, false);

          setOriginalUrl(uploadedOriginalUrl);
          setProcessedUrl(uploadedProcessedUrl);

          const { error } = await supabase
            .from('pf_photos')
            .update({
              original_url: uploadedOriginalUrl,
              processed_url: uploadedProcessedUrl,
              metadata: {
                ...photo?.metadata,
                adjustments: updatedAdjustments,
                thumbnail_url: uploadedOriginalThumbUrl,
                processed_thumbnail_url: uploadedProcessedThumbUrl,
              }
            })
            .eq('id', photoId);

          if (error) throw error;

          setPhoto((prev: any) => ({
            ...prev,
            original_url: uploadedOriginalUrl,
            processed_url: uploadedProcessedUrl,
            metadata: {
              ...prev?.metadata,
              adjustments: updatedAdjustments,
              thumbnail_url: uploadedOriginalThumbUrl,
              processed_thumbnail_url: uploadedProcessedThumbUrl,
            }
          }));
        } catch (err) {
          console.error('Background rotation saving failed:', err);
        }
      };

      saveRotationAsync();
    } catch (err) {
      console.error('Rotation failed:', err);
      showNotification('error', t.notifRotationErrTitle, t.notifRotationErrMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchOtherProjectPhotos = async () => {
    if (!project?.id || !photoId) return;
    setFetchingProjectPhotos(true);
    try {
      const { data, error } = await supabase
        .from('pf_photos')
        .select('*')
        .eq('project_id', project.id)
        .neq('id', photoId);

      if (error) throw error;
      setProjectPhotos(data || []);
      // Pre-select all photos by default
      setSelectedPhotoIds((data || []).map((p: any) => p.id));
    } catch (err) {
      console.error('Failed to fetch project photos:', err);
    } finally {
      setFetchingProjectPhotos(false);
    }
  };

  const handleOpenSyncModal = async () => {
    setIsSyncModalOpen(true);
    await fetchOtherProjectPhotos();
  };

  const handleSyncSelectedPhotos = async () => {
    if (selectedPhotoIds.length === 0) {
      showNotification('warning', t.notifSelectionReqTitle, t.notifSelectionReqMsg);
      return;
    }

    setIsSyncing(true);
    try {
      for (const id of selectedPhotoIds) {
        const targetPhoto = projectPhotos.find(p => p.id === id);
        if (!targetPhoto) continue;

        let formatMime: 'image/jpeg' | 'image/webp' | 'image/png' = 'image/jpeg';
        if (targetPhoto.format) {
          const fmt = targetPhoto.format.toLowerCase();
          if (fmt === 'png') formatMime = 'image/png';
          else if (fmt === 'webp') formatMime = 'image/webp';
        } else if (targetPhoto.filename) {
          const lowerName = targetPhoto.filename.toLowerCase();
          if (lowerName.endsWith('.png')) formatMime = 'image/png';
          else if (lowerName.endsWith('.webp')) formatMime = 'image/webp';
        }

        const processed = await applyAdjustments(targetPhoto.original_url, adjustments, undefined, false, formatMime);
        const uploadedProcessedUrl = await uploadImageToStorage(processed, false);

        // Generate and upload processed thumbnail
        const processedThumb = await applyAdjustments(targetPhoto.original_url, adjustments, undefined, 600, formatMime);
        const uploadedProcessedThumbUrl = await uploadImageToStorage(processedThumb, false);

        const newMetadata = {
          ...targetPhoto.metadata,
          adjustments,
          processed_thumbnail_url: uploadedProcessedThumbUrl,
        };

        const { error } = await supabase
          .from('pf_photos')
          .update({
            processed_url: uploadedProcessedUrl,
            metadata: newMetadata
          })
          .eq('id', id);

        if (error) console.error(`Failed to sync adjustments for photo ${id}:`, error);
      }

      showNotification('success', t.notifSyncSuccessTitle, t.notifSyncSuccessMsg.replace('{count}', selectedPhotoIds.length.toString()));
      setIsSyncModalOpen(false);
    } catch (err) {
      console.error('Selective sync failed:', err);
      showNotification('error', t.notifSyncErrTitle, t.notifSyncErrMsg);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!client) {
      showNotification('warning', t.notifClientNotFoundTitle, t.notifClientNotFoundMsg);
      return;
    }

    const gallerySlug = gallery?.url_slug;
    if (!gallerySlug) {
      showNotification('warning', t.notifGalleryNotActiveTitle, t.notifGalleryNotActiveMsg);
      return;
    }

    const galleryUrl = `${window.location.origin}/gallery/${gallerySlug}`;

    let phone = client.phone ? client.phone.trim() : '';
    if (!phone) {
      const enteredPhone = prompt(t.phonePrompt);
      if (!enteredPhone) return;
      phone = enteredPhone.trim();
    }

    // Sanitize phone for WhatsApp
    let formattedPhone = phone;
    if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.replace(/\D/g, '');
    } else {
      formattedPhone = formattedPhone.replace(/\D/g, '');
      if (formattedPhone.length === 9) {
        formattedPhone = '221' + formattedPhone;
      } else if (formattedPhone.length === 10 && formattedPhone.startsWith('0')) {
        formattedPhone = '33' + formattedPhone.substring(1);
      }
    }

    const message = `Bonjour ${client.name}, voici le lien pour accéder à vos photos retouchées : ${galleryUrl}`;
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
  };

  const renderSlider = (
    label: string, 
    key: keyof PhotoAdjustments, 
    min: number, 
    max: number, 
    customTrackClass?: string
  ) => {
    const val = (adjustments as any)[key] ?? 0;
    return (
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
          <span>{label}</span>
          <input
            type="number"
            min={min}
            max={max}
            value={val}
            onFocus={() => pushToHistory()}
            onChange={(e) => {
              const parsedVal = parseInt(e.target.value);
              const clampedVal = isNaN(parsedVal) ? 0 : Math.max(min, Math.min(max, parsedVal));
              handleSliderChange(key, clampedVal);
            }}
            className="w-10 bg-surface-container border border-outline-variant/30 rounded text-center text-white text-[9px] font-mono p-0.5 outline-none focus:border-primary"
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={val}
          onMouseDown={() => pushToHistory()}
          onTouchStart={() => pushToHistory()}
          onChange={(e) => handleSliderChange(key, parseInt(e.target.value))}
          className={`w-full h-1 bg-outline-variant rounded-lg appearance-none cursor-pointer slider-thumb ${customTrackClass || 'accent-primary'}`}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-body-md overflow-hidden selection:bg-primary-container">
      <Navigation />

      {/* Left Tool Palette (Adobe style) */}
      <aside 
        id="left-tool-palette"
        className="fixed left-0 top-16 bottom-0 w-[80px] flex flex-col items-center py-6 bg-surface-container-low border-r border-outline-variant z-40 overflow-y-auto"
        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
      >
        <div className="flex flex-col gap-6 pb-12">
          <button 
            onClick={() => setActiveTool('select')}
            onFocus={() => setActiveTool('select')}
            className={`p-3 rounded-xl transition-all hover:scale-105 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
              activeTool === 'select' ? 'text-on-primary-container bg-primary-container' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`} 
            title={t.toolSelect}
          >
            <span className="material-symbols-outlined">near_me</span>
          </button>
          <button 
            onClick={() => setActiveTool('crop')}
            onFocus={() => setActiveTool('crop')}
            className={`p-3 rounded-xl transition-all hover:scale-105 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
              activeTool === 'crop' ? 'text-on-primary-container bg-primary-container' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`} 
            title={t.toolCrop}
          >
            <span className="material-symbols-outlined">crop_free</span>
          </button>
          <button 
            onClick={() => setActiveTool('brush')}
            onFocus={() => setActiveTool('brush')}
            className={`p-3 rounded-xl transition-all hover:scale-105 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
              activeTool === 'brush' ? 'text-on-primary-container bg-primary-container' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`} 
            title={t.toolBrush}
          >
            <span className="material-symbols-outlined">brush</span>
          </button>
          <button 
            onClick={() => setActiveTool('heal')}
            onFocus={() => setActiveTool('heal')}
            className={`p-3 rounded-xl transition-all hover:scale-105 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
              activeTool === 'heal' ? 'text-on-primary-container bg-primary-container' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`} 
            title={t.toolHeal}
          >
            <span className="material-symbols-outlined">healing</span>
          </button>
          <div className="h-[1px] w-8 bg-outline-variant my-2"></div>
          <button 
            onClick={() => setActiveTool('color')}
            onFocus={() => setActiveTool('color')}
            className={`p-3 rounded-xl transition-all hover:scale-105 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
              activeTool === 'color' ? 'text-on-primary-container bg-primary-container' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`} 
            title={t.toolColor}
          >
            <span className="material-symbols-outlined">colorize</span>
          </button>
          <button 
            onClick={() => setActiveTool('text')}
            onFocus={() => setActiveTool('text')}
            className={`p-3 rounded-xl transition-all hover:scale-105 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
              activeTool === 'text' ? 'text-on-primary-container bg-primary-container' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`} 
            title={t.toolText}
          >
            <span className="material-symbols-outlined">title</span>
          </button>
          <button 
            onClick={() => handleRotateImage('left')}
            className="p-3 rounded-xl transition-all hover:scale-105 cursor-pointer text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            title={lang === 'fr' ? "Pivoter à gauche (-90°)" : "Rotate Left (-90°)"}
          >
            <span className="material-symbols-outlined">rotate_left</span>
          </button>
          <button 
            onClick={() => handleRotateImage('right')}
            className="p-3 rounded-xl transition-all hover:scale-105 cursor-pointer text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            title={lang === 'fr' ? "Pivoter à droite (90°)" : "Rotate Right (90°)"}
          >
            <span className="material-symbols-outlined">rotate_right</span>
          </button>
          <div className="h-[1px] w-8 bg-outline-variant my-2"></div>
          <button 
            onClick={handleUndo}
            disabled={historyStack.length === 0}
            className={`p-3 rounded-xl transition-all hover:scale-105 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
              historyStack.length === 0 
                ? 'opacity-40 cursor-not-allowed text-on-surface-variant' 
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`} 
            title={lang === 'fr' ? "Annuler l'action (Ctrl+Z)" : "Undo Action (Ctrl+Z)"}
          >
            <span className="material-symbols-outlined">undo</span>
          </button>
        </div>
      </aside>

      {/* Main Studio Viewport (The Stage) */}
      <main className="fixed inset-0 pt-16 pb-16 pl-[80px] pr-[320px] bg-background flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center p-8 bg-surface-container-lowest">
          {/* AI Loader Progress Line */}
          {isProcessing && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-3/4 h-[2px] flow-progress z-30 opacity-80" id="ai-loader"></div>
          )}

          {/* Close Editor button & Importer RAW */}
          <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
            <Link 
              href={`/dashboard/projects/${project?.id}`} 
              className="bg-black/60 hover:bg-black/90 p-2.5 rounded-full text-white/80 hover:text-white border border-outline-variant/30 flex items-center justify-center shadow-lg transition-colors"
              title={lang === 'fr' ? 'Retour au projet' : 'Back to project'}
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </Link>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary-container text-on-primary-container hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] font-bold text-[11px] px-3.5 py-1.5 rounded-full border border-primary/20 flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">upload_file</span>
              <span>{lang === 'fr' ? 'Importer RAW / Image' : 'Import RAW / Image'}</span>
            </button>
            <input 
              ref={fileInputRef}
              type="file"
              accept=".raw,.cr2,.nef,.arw,.dng,.pef,.jpg,.jpeg,.png,.webp"
              onChange={handleRawImport}
              className="hidden"
            />
          </div>

          {/* Image Display Container */}
          <div className="relative max-w-full max-h-full shadow-2xl overflow-hidden group">
            {activeTool === 'crop' && cropBox && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-surface-container-high/90 backdrop-blur border border-outline-variant px-4 py-2 rounded-full flex items-center gap-3 shadow-2xl animate-fade-in">
                <span className="text-xs font-bold text-on-surface">Valider le recadrage ?</span>
                <button 
                  onClick={handleExecuteCrop}
                  className="flex items-center justify-center bg-primary hover:bg-primary/90 text-on-primary w-8 h-8 rounded-full transition-colors cursor-pointer"
                  title="Valider"
                >
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                </button>
                <button 
                  onClick={() => {
                    setCropBox(null);
                    const canvas = overlayCanvasRef.current;
                    const ctx = canvas?.getContext('2d');
                    ctx?.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
                  }}
                  className="flex items-center justify-center bg-surface-container-highest hover:bg-outline-variant/30 text-on-surface w-8 h-8 rounded-full transition-colors cursor-pointer"
                  title="Annuler"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            )}

            <div 
              ref={compareContainerRef}
              onMouseMove={handleCompareMouseMove}
              onTouchMove={handleCompareTouchMove}
              onMouseDown={(e) => {
                if (activeTool === 'select') setIsDraggingSlider(true);
              }}
              onMouseUp={() => setIsDraggingSlider(false)}
              onMouseLeave={() => setIsDraggingSlider(false)}
              className={`relative overflow-hidden ${
                activeTool === 'select' ? 'cursor-ew-resize' :
                activeTool === 'heal' ? 'cursor-none' :
                activeTool === 'color' ? 'cursor-cell' :
                activeTool === 'text' ? 'cursor-text' : 'cursor-crosshair'
              }`}
            >
              {/* After image container (Adjusted) */}
              <img
                ref={imageRef}
                src={processedUrl}
                alt="Edited Portrait Preview"
                className={`block select-none max-h-[80vh] w-auto transition-transform ${
                  zoomLevel === '100' ? 'scale-150' : zoomLevel === '200' ? 'scale-[2.5]' : 'scale-100'
                }`}
              />

              {/* Interactive Overlay Canvas */}
              {activeTool !== 'select' && imgNaturalSize.width > 0 && (
                <canvas
                  ref={overlayCanvasRef}
                  width={imgNaturalSize.width}
                  height={imgNaturalSize.height}
                  className={`absolute top-0 left-0 w-full h-full z-30 block select-none transition-transform origin-center ${
                    zoomLevel === '100' ? 'scale-150' : zoomLevel === '200' ? 'scale-[2.5]' : 'scale-100'
                  }`}
                  onMouseDown={handleOverlayMouseDown}
                  onMouseMove={handleOverlayMouseMove}
                  onMouseUp={handleOverlayMouseUp}
                  onMouseLeave={handleOverlayMouseLeave}
                  style={{
                    cursor: activeTool === 'color' ? 'cell' : activeTool === 'heal' ? 'none' : 'crosshair',
                  }}
                />
              )}

              {/* Before image overlay (Grayscale/Unedited) */}
              {isComparing && activeTool === 'select' && (
                <div 
                  style={{ width: `${sliderPosition}%` }}
                  className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-white/50 z-10"
                >
                  <img
                    src={originalUrl}
                    alt="Original Raw Before"
                    className={`max-h-[80vh] w-auto max-w-none transition-transform ${
                      zoomLevel === '100' ? 'scale-150' : zoomLevel === '200' ? 'scale-[2.5]' : 'scale-100'
                    }`}
                    style={{ width: compareContainerRef.current?.getBoundingClientRect().width }}
                  />
                </div>
              )}

              {/* Before/After Labels */}
              {activeTool === 'select' && (
                <>
                  <div className="absolute bottom-4 left-4 z-20 font-body-sm text-body-sm text-white/70 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm pointer-events-none">
                    {t.before}
                  </div>
                  <div className="absolute bottom-4 right-4 z-20 font-body-sm text-body-sm text-white/70 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm pointer-events-none">
                    {t.after}
                  </div>
                </>
              )}
            </div>
            
            {/* Camera Exif metadata glass badge */}
            <div className="absolute top-4 right-4 glass-panel px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex gap-4 pointer-events-none z-20">
              <div className="flex flex-col">
                <span className="text-[9px] text-outline uppercase font-bold tracking-wider">ISO</span>
                <span className="font-label-md text-xs font-bold text-on-surface">{photo?.metadata?.iso || 100}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-outline uppercase font-bold tracking-wider">Shutter</span>
                <span className="font-label-md text-xs font-bold text-on-surface">{photo?.metadata?.shutter || '1/250'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-outline uppercase font-bold tracking-wider">Aperture</span>
                <span className="font-label-md text-xs font-bold text-on-surface">{photo?.metadata?.aperture || 'f/1.8'}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar - Adjustment Panels */}
      <aside className="fixed right-0 top-16 bottom-0 w-[320px] glass-panel border-l border-outline-variant z-40 flex flex-col">
        <div className="p-panel-padding flex-1 overflow-y-auto space-y-8 custom-scrollbar">
          {activeTool === 'crop' ? (
            /* Crop Settings Panel */
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-xl">crop</span>
                <h3 className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider">{t.cropHeader}</h3>
              </div>
              
              <p className="text-on-surface-variant text-[11px] leading-relaxed">
                {lang === 'fr' ? "Choisissez un format prédéfini ou dessinez librement un cadre de sélection sur l'image pour la recadrer." : "Choose a preset format or draw a free selection box on the image to crop it."}
              </p>

              {/* Aspect Ratio Presets Grid */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">{t.cropAspectRatio}</label>
                <div className="grid grid-cols-2 gap-2">
                  {(lang === 'fr' ? [
                    { id: 'free', name: 'Libre', desc: 'Format libre' },
                    { id: '1:1', name: 'Carré (1:1)', desc: 'Post Instagram' },
                    { id: '4:5', name: 'Portrait (4:5)', desc: 'Instagram Feed' },
                    { id: '9:16', name: 'Vertical (9:16)', desc: 'Story / Reel' },
                    { id: '16:9', name: 'Cinéma (16:9)', desc: 'Horizontal 16:9' },
                    { id: '4:3', name: 'Standard (4:3)', desc: 'Photo Standard' },
                    { id: '3:4', name: 'Portrait (3:4)', desc: 'Photo Portrait' },
                  ] : [
                    { id: 'free', name: 'Free', desc: 'Free aspect ratio' },
                    { id: '1:1', name: 'Square (1:1)', desc: 'Instagram Post' },
                    { id: '4:5', name: 'Portrait (4:5)', desc: 'Instagram Feed' },
                    { id: '9:16', name: 'Vertical (9:16)', desc: 'Story / Reel' },
                    { id: '16:9', name: 'Cinema (16:9)', desc: 'Horizontal 16:9' },
                    { id: '4:3', name: 'Standard (4:3)', desc: 'Standard Photo' },
                    { id: '3:4', name: 'Portrait (3:4)', desc: 'Portrait Photo' },
                  ]).map((r) => {
                    const isSelected = cropAspectRatio === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleSetCropAspectRatio(r.id)}
                        className={`text-left p-2.5 rounded-xl transition-all border cursor-pointer flex flex-col gap-0.5 ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary shadow-sm'
                            : 'border-outline-variant/30 bg-surface-container-high hover:border-outline hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        <span className="text-[11px] font-bold">{r.name}</span>
                        <span className="text-[9px] opacity-75 truncate">{r.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Alignment Grid settings */}
              <div className="space-y-2.5 pt-4 border-t border-outline-variant/20">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">{t.cropGridStyle}</label>
                <div className="flex gap-2">
                  {(lang === 'fr' ? [
                    { id: 'none', name: 'Sans grille', icon: 'grid_off' },
                    { id: 'thirds', name: 'Tiers (3x3)', icon: 'grid_on' },
                    { id: 'fine', name: 'Alignement (6x6)', icon: 'grid_goldenratio' },
                  ] : [
                    { id: 'none', name: 'No Grid', icon: 'grid_off' },
                    { id: 'thirds', name: 'Thirds (3x3)', icon: 'grid_on' },
                    { id: 'fine', name: 'Alignment (6x6)', icon: 'grid_goldenratio' },
                  ]).map((g) => {
                    const isSelected = cropGridStyle === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => {
                          setCropGridStyle(g.id as any);
                          if (cropBox) {
                            setTimeout(() => {
                              drawCropOverlay(cropBox);
                            }, 0);
                          }
                        }}
                        className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-all border cursor-pointer gap-1.5 ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-outline-variant/30 bg-surface-container-high hover:border-outline text-on-surface-variant'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">{g.icon}</span>
                        <span className="text-[9px] font-bold text-center">{g.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Crop Actions */}
              <div className="pt-6 border-t border-outline-variant/30 space-y-3">
                <button
                  onClick={handleExecuteCrop}
                  disabled={!cropBox}
                  className={`w-full font-bold py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                    cropBox
                      ? 'bg-primary hover:bg-primary/95 text-on-primary cursor-pointer active:scale-[0.98]'
                      : 'bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                  Appliquer le recadrage
                </button>
                <button
                  onClick={() => {
                    setCropBox(null);
                    setCropAspectRatio('free');
                    setActiveTool('select');
                    const canvas = overlayCanvasRef.current;
                    const ctx = canvas?.getContext('2d');
                    ctx?.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
                  }}
                  className="w-full bg-surface-container-highest hover:bg-outline-variant/30 text-on-surface font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                  Annuler
                </button>
              </div>
            </section>
          ) : activeTool === 'text' ? (
            /* Text Annotation Settings Panel */
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-xl">title</span>
                <h3 className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider">{t.textHeader}</h3>
              </div>
              
              <p className="text-on-surface-variant text-[11px] leading-relaxed">
                {t.textDesc}
              </p>

              {/* Text Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{t.textInputLabel}</label>
                <input
                  type="text"
                  value={textAnnotationText}
                  onChange={(e) => setTextAnnotationText(e.target.value)}
                  className="w-full bg-surface-container-highest border border-outline-variant/30 px-3 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                  placeholder={t.textPlaceholder}
                />
              </div>

              {/* Font Size */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  <span>{t.textSizeLabel}</span>
                  <span>{textAnnotationSize} px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="250"
                  value={textAnnotationSize}
                  onChange={(e) => setTextAnnotationSize(parseInt(e.target.value))}
                  className="w-full h-1 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Font Family (Refined Custom Grid with Hover Preview) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{t.textFontLabel}</label>
                <div className="grid grid-cols-2 gap-1.5 bg-surface-container-low p-2 rounded-xl border border-outline-variant/30">
                  {FONTS_LIST.map((font) => (
                    <button
                      key={font.value}
                      type="button"
                      onMouseEnter={() => setHoveredFont(font.value)}
                      onMouseLeave={() => setHoveredFont(null)}
                      onClick={() => {
                        setTextAnnotationFont(font.value);
                      }}
                      className={`text-left px-2.5 py-1.5 rounded-lg text-[10px] transition-all flex justify-between items-center cursor-pointer truncate ${
                        textAnnotationFont === font.value
                          ? 'bg-primary text-on-primary font-bold shadow-md'
                          : 'hover:bg-outline-variant/30 text-on-surface hover:text-white'
                      }`}
                      style={{ fontFamily: font.value }}
                    >
                      <span className="truncate">{font.name}</span>
                      {textAnnotationFont === font.value && (
                        <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Rotation */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  <span>{t.textRotationLabel}</span>
                  <span>{textAnnotationRotation}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={textAnnotationRotation}
                  onChange={(e) => setTextAnnotationRotation(parseInt(e.target.value))}
                  className="w-full h-1 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Color Preset Palette */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">{lang === 'fr' ? 'Couleur' : 'Color'}</label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {[
                    { name: lang === 'fr' ? 'Blanc' : 'White', value: '#FFFFFF' },
                    { name: lang === 'fr' ? 'Noir' : 'Black', value: '#000000' },
                    { name: lang === 'fr' ? 'Rouge' : 'Red', value: '#FF0000' },
                    { name: lang === 'fr' ? 'Vert' : 'Green', value: '#00FF00' },
                    { name: lang === 'fr' ? 'Bleu' : 'Blue', value: '#0000FF' },
                    { name: lang === 'fr' ? 'Jaune' : 'Yellow', value: '#FFFF00' },
                    { name: lang === 'fr' ? 'Orange' : 'Orange', value: '#FF8800' },
                    { name: lang === 'fr' ? 'Violet' : 'Purple', value: '#8800FF' },
                    { name: lang === 'fr' ? 'Rose' : 'Pink', value: '#FF0088' },
                    { name: lang === 'fr' ? 'Cyan' : 'Cyan', value: '#00FFFF' }
                  ].map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setTextAnnotationColor(color.value)}
                      className={`w-7 h-7 rounded-full border transition-all ${
                        textAnnotationColor === color.value ? 'border-primary scale-110 shadow-lg' : 'border-outline-variant/30 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                
                {/* Custom Color Input */}
                <div className="flex items-center gap-2 mt-3">
                  <input
                    type="color"
                    value={textAnnotationColor}
                    onChange={(e) => setTextAnnotationColor(e.target.value)}
                    className="w-8 h-8 rounded border border-outline-variant/30 bg-transparent cursor-pointer"
                  />
                  <span className="text-[10px] font-semibold text-on-surface-variant uppercase">{textAnnotationColor}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/30 space-y-3">
                <button
                  onClick={handleExecuteText}
                  className="w-full bg-primary hover:bg-primary/95 text-on-primary font-bold py-3 px-4 rounded-xl transition-all shadow-lg active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                  {t.textFinish}
                </button>
                {adjustments.textText && (
                  <button
                    onClick={handleRemoveText}
                    className="w-full border border-error/50 hover:bg-error/10 text-error font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    {t.textDelete}
                  </button>
                )}
                <button
                  onClick={() => {
                    // Reset local states back to adjustments values
                    setTextAnnotationText(adjustments.textText || 'PhotoFlow');
                    setTextAnnotationSize(adjustments.textSize ?? 48);
                    setTextAnnotationColor(adjustments.textColor ?? '#FFFFFF');
                    setTextAnnotationFont(adjustments.textFont ?? 'Arial');
                    setTextAnnotationRotation(adjustments.textRotation ?? 0);
                    if (adjustments.textX !== undefined && adjustments.textY !== undefined) {
                      setTextPosition({ x: adjustments.textX, y: adjustments.textY });
                    } else {
                      setTextPosition(null);
                    }
                    setActiveTool('select');
                    const canvas = overlayCanvasRef.current;
                    const ctx = canvas?.getContext('2d');
                    ctx?.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
                  }}
                  className="w-full bg-surface-container-highest hover:bg-outline-variant/30 text-on-surface font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                  {t.textCancel}
                </button>
              </div>
            </section>
          ) : activeTool === 'brush' ? (
            /* Brush Settings Panel */
            <section className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-xl">brush</span>
                <h3 className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider">{t.brushHeader}</h3>
              </div>
              
              <p className="text-on-surface-variant text-[11px] leading-relaxed">
                {t.brushDesc}
              </p>

              {/* Brush Size */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  <span>{t.brushSizeLabel}</span>
                  <span>{brushSize} px</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="150"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full h-1 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Brush Opacity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  <span>{t.brushOpacityLabel}</span>
                  <span>{brushOpacity} %</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={brushOpacity}
                  onChange={(e) => setBrushOpacity(parseInt(e.target.value))}
                  className="w-full h-1 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Color Preset Palette */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">{t.brushColorLabel}</label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {[
                    { name: lang === 'fr' ? 'Bleu PhotoFlow' : 'PhotoFlow Blue', value: '#0055FF' },
                    { name: lang === 'fr' ? 'Rouge' : 'Red', value: '#FF0000' },
                    { name: lang === 'fr' ? 'Vert' : 'Green', value: '#00FF00' },
                    { name: lang === 'fr' ? 'Jaune' : 'Yellow', value: '#FFFF00' },
                    { name: lang === 'fr' ? 'Noir' : 'Black', value: '#000000' },
                    { name: lang === 'fr' ? 'Blanc' : 'White', value: '#FFFFFF' },
                    { name: lang === 'fr' ? 'Orange' : 'Orange', value: '#FF8800' },
                    { name: lang === 'fr' ? 'Rose' : 'Pink', value: '#FF0088' },
                    { name: lang === 'fr' ? 'Violet' : 'Purple', value: '#8800FF' },
                    { name: lang === 'fr' ? 'Cyan' : 'Cyan', value: '#00FFFF' }
                  ].map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setBrushColor(color.value)}
                      className={`w-7 h-7 rounded-full border transition-all cursor-pointer ${
                        brushColor === color.value ? 'border-primary scale-110 shadow-lg' : 'border-outline-variant/30 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                
                {/* Custom Color Input */}
                <div className="flex items-center gap-2 mt-3">
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="w-8 h-8 rounded border border-outline-variant/30 bg-transparent cursor-pointer"
                  />
                  <span className="text-[10px] font-semibold text-on-surface-variant uppercase">{brushColor}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-outline-variant/30 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTool('select');
                  }}
                  className="w-full bg-primary hover:bg-primary/95 text-on-primary font-bold py-3 px-4 rounded-xl transition-all shadow-lg active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                  {t.brushFinish}
                </button>
              </div>
            </section>
          ) : activeTool === 'heal' ? (
            /* Healing Settings Panel */
            <section className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-xl">healing</span>
                <h3 className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider">{t.healHeader}</h3>
              </div>
              
              <p className="text-on-surface-variant text-[11px] leading-relaxed">
                {t.healDesc}
              </p>

              {/* Heal Size */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  <span>{t.healSizeLabel}</span>
                  <span>{healSize} px</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={healSize}
                  onChange={(e) => setHealSize(parseInt(e.target.value))}
                  className="w-full h-1 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="pt-6 border-t border-outline-variant/30 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTool('select');
                  }}
                  className="w-full bg-primary hover:bg-primary/95 text-on-primary font-bold py-3 px-4 rounded-xl transition-all shadow-lg active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                  {t.healFinish}
                </button>
              </div>
            </section>
          ) : activeTool === 'color' ? (
            /* White Balance Settings Panel */
            <section className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-xl">colorize</span>
                <h3 className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider">{t.colorHeader}</h3>
              </div>
              
              <p className="text-on-surface-variant text-[11px] leading-relaxed">
                {t.colorDesc}
              </p>

              {/* Selected Color Info */}
              {pipetteColor && (
                <div className="bg-surface-container-high p-4 rounded-xl border border-outline-variant/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase">{t.colorSelectedInfo}</span>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border border-outline-variant/30"
                        style={{ backgroundColor: pipetteColor.hex }}
                      />
                      <span className="text-[10px] font-bold text-on-surface">{pipetteColor.hex}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-on-surface-variant flex justify-between">
                    <span>{t.colorRgbValues}</span>
                    <span className="font-semibold">R:{pipetteColor.r} G:{pipetteColor.g} B:{pipetteColor.b}</span>
                  </div>
                  <div className="border-t border-outline-variant/20 pt-2 flex justify-between text-[10px] text-on-surface-variant">
                    <span>{t.colorAppliedCorrection}</span>
                    <span className="font-semibold text-primary">Temp: {adjustments.temperature} | Tint: {adjustments.tint}</span>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-outline-variant/30 space-y-3">
                {pipetteColor && (
                  <button
                    type="button"
                    onClick={() => {
                      pushToHistory();
                      setAdjustments(prev => ({
                        ...prev,
                        temperature: 0,
                        tint: 0
                      }));
                      setPipetteColor(null);
                    }}
                    className="w-full border border-outline hover:bg-surface-container-highest text-on-surface font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 animate-fade-in"
                  >
                    <span className="material-symbols-outlined text-sm">restart_alt</span>
                    {t.colorReset}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTool('select');
                  }}
                  className="w-full bg-primary hover:bg-primary/95 text-on-primary font-bold py-3 px-4 rounded-xl transition-all shadow-lg active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                  {t.colorFinish}
                </button>
              </div>
            </section>
          ) : (
            <>
              {/* AI Automations Panel */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    auto_awesome
                  </span>
                  <h3 className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider">{t.aiHeader}</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => triggerAiAutomation('auto')}
                    className="flex flex-col items-center justify-center p-3 bg-surface-container-high hover:bg-surface-container-highest transition-all rounded-xl border border-outline-variant/30 group cursor-pointer"
                  >
                    <span className="material-symbols-outlined mb-1.5 text-on-surface-variant group-hover:text-primary">magic_button</span>
                    <span className="text-[10px] text-center font-bold">{t.aiAuto}</span>
                  </button>
                  <button 
                    onClick={() => triggerAiAutomation('face')}
                    className="flex flex-col items-center justify-center p-3 bg-primary-container rounded-xl hover:brightness-110 transition-all border border-primary/50 group cursor-pointer text-on-primary-container"
                  >
                    <span className="material-symbols-outlined mb-1.5" style={{ fontVariationSettings: "'FILL' 1" }}>face_6</span>
                    <span className="text-[10px] text-center font-bold">{t.aiFace}</span>
                  </button>
                  <button 
                    onClick={() => triggerAiAutomation('skin')}
                    className="flex flex-col items-center justify-center p-3 bg-surface-container-high hover:bg-surface-container-highest transition-all rounded-xl border border-outline-variant/30 group cursor-pointer"
                  >
                    <span className="material-symbols-outlined mb-1.5 text-on-surface-variant group-hover:text-primary">texture</span>
                    <span className="text-[10px] text-center font-bold">{t.aiSkin}</span>
                  </button>
                  <button 
                    onClick={() => triggerAiAutomation('hdr')}
                    className="flex flex-col items-center justify-center p-3 bg-surface-container-high hover:bg-surface-container-highest transition-all rounded-xl border border-outline-variant/30 group cursor-pointer"
                  >
                    <span className="material-symbols-outlined mb-1.5 text-on-surface-variant group-hover:text-primary">hdr_on</span>
                    <span className="text-[10px] text-center font-bold">{t.aiHdr}</span>
                  </button>
                </div>
              </section>

              {/* AI Prompt Retouching Panel */}
              <section className="mt-6 border-t border-outline-variant/20 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      chat_bubble
                    </span>
                    <h3 className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider">{lang === 'fr' ? 'Retouche par Prompt AI' : 'AI Prompt Retouch'}</h3>
                  </div>
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-widest bg-primary-container text-on-primary-container border border-primary/20">
                    Pro
                  </span>
                </div>
                
                {profile?.plan !== 'pro' ? (
                  <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-black/45 backdrop-blur-[1.5px] flex flex-col items-center justify-center p-3 opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-primary text-xl mb-1">lock</span>
                      <p className="text-[10px] font-bold text-white mb-2">{lang === 'fr' ? 'Passez à la version PRO' : 'Upgrade to PRO version'}</p>
                      <button
                        type="button"
                        onClick={() => setShowUpgradeModal(true)}
                        className="px-3 py-1.5 bg-primary text-on-primary font-bold text-[9px] rounded-lg cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-md"
                      >
                        {lang === 'fr' ? 'Activer PRO' : 'Activate PRO'}
                      </button>
                    </div>
                    <textarea 
                      disabled
                      placeholder="Ex: Rendre l'image plus chaleureuse avec un teint lisse..."
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-2 text-xs h-16 resize-none outline-none text-on-surface-variant/40"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <textarea 
                        value={aiPromptText}
                        onChange={(e) => setAiPromptText(e.target.value)}
                        placeholder={lang === 'fr' ? "Ex: Rendre l'image plus chaleureuse, lumineuse et peaux lisses..." : "Ex: Make the image warmer, brighter with smooth skin..."}
                        className="w-full bg-surface-container border border-outline-variant/50 focus:border-primary/70 rounded-xl p-3 text-xs h-20 resize-none outline-none text-on-surface transition-all placeholder:text-on-surface-variant/50"
                      />
                      {aiPromptText && (
                        <button
                          onClick={() => setAiPromptText('')}
                          className="absolute right-2 top-2 text-on-surface-variant hover:text-white material-symbols-outlined text-xs cursor-pointer"
                        >
                          close
                        </button>
                      )}
                    </div>
                    
                    {/* Model Selector */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block">
                        {lang === 'fr' ? 'Modèle / Moteur IA' : 'AI Model / Engine'}
                      </label>
                      <select
                        value={selectedAiModel}
                        onChange={(e) => setSelectedAiModel(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary/50 rounded-xl px-3 py-2 text-xs outline-none text-on-surface transition-colors cursor-pointer"
                      >
                        <option value="google/gemini-2.5-flash">Gemini 2.5 Flash</option>
                        <option value="openai/gpt-4o-mini">OpenAI GPT-4o Mini</option>
                        <option value="openai/gpt-4o">OpenAI GPT-4o (Premium)</option>
                        <option value="google/gemini-2.5-flash:free">Gemini 2.5 Flash (Free)</option>
                        <option value="openrouter/free">Auto-route Free AI</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      disabled={isAiPromptGenerating || !aiPromptText.trim()}
                      onClick={handleApplyAiPrompt}
                      className="w-full bg-primary hover:bg-primary/95 disabled:bg-surface-container-highest disabled:text-on-surface-variant/50 disabled:cursor-not-allowed text-on-primary font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 text-xs"
                    >
                      {isAiPromptGenerating ? (
                        <>
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-on-primary border-t-transparent animate-spin"></div>
                          <span>{lang === 'fr' ? 'Analyse du prompt...' : 'Analyzing prompt...'}</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-sm">settings_suggest</span>
                          <span>{lang === 'fr' ? "Retoucher avec l'IA" : "Retouch with AI"}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </section>

              {/* Filtres Instagram */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">photo_filter</span>
                    <h3 className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider">{t.filtersHeader}</h3>
                  </div>
                  {adjustments.filter && adjustments.filter !== 'none' && (
                    <button 
                      onClick={() => handleSliderChange('filter', 'none')} 
                      className="text-[10px] text-primary hover:underline cursor-pointer"
                    >
                      {t.filtersReset}
                    </button>
                  )}
                </div>
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-outline-variant/40 scrollbar-track-transparent">
                  {FILTERS.map((f) => {
                    const isSelected = adjustments.filter === f.id || (!adjustments.filter && f.id === 'none');
                    return (
                      <button
                        key={f.id}
                        onClick={() => handleSliderChange('filter', f.id)}
                        className={`flex-shrink-0 flex flex-col items-center gap-1.5 p-1 rounded-xl transition-all border cursor-pointer group ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary scale-105 shadow-md'
                            : 'border-outline-variant/30 bg-surface-container-high hover:border-outline hover:bg-surface-container-highest text-on-surface-variant'
                        }`}
                        style={{ width: '72px' }}
                      >
                        <div className={`w-14 h-14 rounded-lg bg-gradient-to-tr ${f.gradient} shadow-inner transition-transform group-hover:scale-[1.03] overflow-hidden relative flex items-center justify-center`}>
                          {isSelected && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="material-symbols-outlined text-white text-base font-bold">check</span>
                            </div>
                          )}
                        </div>
                        <span className="text-[9px] font-bold tracking-tight truncate w-full text-center">{f.name}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

          {/* Sliders Manual Panel (Camera Raw Style) */}
          <section className="space-y-6 animate-fade-in" onMouseDown={handleSlidersMouseDown}>
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-md" style={{ fontVariationSettings: "'FILL' 1" }}>tune</span>
                <h3 className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider">{lang === 'fr' ? 'Réglages Camera Raw' : 'Camera Raw Settings'}</h3>
              </div>
              <button 
                onClick={resetAdjustments} 
                className="text-[10px] font-bold text-primary hover:underline cursor-pointer bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full"
              >
                {t.manualReset}
              </button>
            </div>

            {/* 1. Réglages de base (Basic Panel) */}
            <details open className="group border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container/20">
              <summary className="flex justify-between items-center p-3 font-semibold text-xs text-white uppercase tracking-wider cursor-pointer hover:bg-surface-container-high transition-colors select-none list-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">filter_hdr</span>
                  {lang === 'fr' ? 'Réglages de base' : 'Basic Settings'}
                </span>
                <span className="material-symbols-outlined text-sm transition-transform group-open:rotate-180">keyboard_arrow_down</span>
              </summary>
              <div className="p-4 space-y-4 border-t border-outline-variant/20">
                {/* White Balance Preset Select */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block">
                    {lang === 'fr' ? 'Balance des blancs' : 'White Balance'}
                  </label>
                  <select
                    onChange={(e) => handleWBPresetChange(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary/50 rounded-xl px-2.5 py-1.5 text-xs outline-none text-on-surface transition-colors cursor-pointer"
                    defaultValue="as-shot"
                  >
                    <option value="as-shot">{lang === 'fr' ? 'Tel quel' : 'As Shot'}</option>
                    <option value="auto">Auto</option>
                    <option value="daylight">{lang === 'fr' ? 'Lumière du jour' : 'Daylight'}</option>
                    <option value="cloudy">{lang === 'fr' ? 'Nuageux' : 'Cloudy'}</option>
                    <option value="shade">{lang === 'fr' ? 'Ombre' : 'Shade'}</option>
                    <option value="tungsten">{lang === 'fr' ? 'Tungstène' : 'Tungsten'}</option>
                    <option value="fluorescent">Fluorescent</option>
                    <option value="flash">Flash</option>
                  </select>
                </div>

                {/* Temperature (gradient track) */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    <span>{t.adjustTemp}</span>
                    <input
                      type="number"
                      min="-100"
                      max="100"
                      value={adjustments.temperature}
                      onFocus={() => pushToHistory()}
                      onChange={(e) => handleSliderChange('temperature', Math.max(-100, Math.min(100, parseInt(e.target.value) || 0)))}
                      className="w-10 bg-surface-container border border-outline-variant/30 rounded text-center text-white text-[9px] font-mono p-0.5 outline-none focus:border-primary"
                    />
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={adjustments.temperature}
                    onMouseDown={() => pushToHistory()}
                    onTouchStart={() => pushToHistory()}
                    onChange={(e) => handleSliderChange('temperature', parseInt(e.target.value))}
                    className="w-full h-1 rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{ background: 'linear-gradient(to right, #3b82f6, #eab308)', WebkitAppearance: 'none' }}
                  />
                </div>

                {/* Tint (gradient track) */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    <span>{t.adjustTint}</span>
                    <input
                      type="number"
                      min="-100"
                      max="100"
                      value={adjustments.tint}
                      onFocus={() => pushToHistory()}
                      onChange={(e) => handleSliderChange('tint', Math.max(-100, Math.min(100, parseInt(e.target.value) || 0)))}
                      className="w-10 bg-surface-container border border-outline-variant/30 rounded text-center text-white text-[9px] font-mono p-0.5 outline-none focus:border-primary"
                    />
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={adjustments.tint}
                    onMouseDown={() => pushToHistory()}
                    onTouchStart={() => pushToHistory()}
                    onChange={(e) => handleSliderChange('tint', parseInt(e.target.value))}
                    className="w-full h-1 rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{ background: 'linear-gradient(to right, #16a34a, #db2777)', WebkitAppearance: 'none' }}
                  />
                </div>

                <div className="h-[1px] bg-outline-variant/20 my-3"></div>

                {/* Tone sliders */}
                {renderSlider(t.adjustExposure, 'exposure', -100, 100)}
                {renderSlider(t.adjustContrast, 'contrast', -100, 100)}
                {renderSlider(t.adjustHighlights, 'highlights', -100, 100)}
                {renderSlider(t.adjustShadows, 'shadows', -100, 100)}
                {renderSlider(t.adjustWhites, 'whites', -100, 100)}
                {renderSlider(t.adjustBlacks, 'blacks', -100, 100)}

                <div className="h-[1px] bg-outline-variant/20 my-3"></div>

                {/* Presence sliders */}
                {renderSlider(t.adjustClarity, 'clarity', -100, 100)}
                {renderSlider(lang === 'fr' ? 'Correction du voile' : 'Dehaze', 'dehaze', -100, 100)}
                {renderSlider(t.adjustVibrance, 'vibrance', -100, 100)}
                {renderSlider(t.adjustSaturation, 'saturation', -100, 100)}
              </div>
            </details>

            {/* 2. Courbe de tonalités (Tone Curve Panel) */}
            <details className="group border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container/20">
              <summary className="flex justify-between items-center p-3 font-semibold text-xs text-white uppercase tracking-wider cursor-pointer hover:bg-surface-container-high transition-colors select-none list-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">show_chart</span>
                  {lang === 'fr' ? 'Courbe des tonalités' : 'Tone Curve'}
                </span>
                <span className="material-symbols-outlined text-sm transition-transform group-open:rotate-180">keyboard_arrow_down</span>
              </summary>
              <div className="p-4 space-y-4 border-t border-outline-variant/20">
                {/* SVG Curve Display */}
                <div className="w-full bg-[#121214] border border-outline-variant/40 rounded-xl p-2 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-24 overflow-visible">
                    {/* Background Grid */}
                    <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
                    <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
                    <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
                    <line x1="25" y1="0" x2="25" y2="100" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
                    <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
                    <line x1="75" y1="0" x2="75" y2="100" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
                    
                    {/* Diagonal baseline */}
                    <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(255,255,255,0.15)" strokeWidth="0.75" strokeDasharray="2,2" />
                    
                    {/* Curve line */}
                    {(() => {
                      const shVal = (adjustments.curveShadows || 0) * 0.25;
                      const dkVal = (adjustments.curveDarks || 0) * 0.25;
                      const ltVal = (adjustments.curveLights || 0) * 0.25;
                      const hiVal = (adjustments.curveHighlights || 0) * 0.25;
                      
                      const pShadY = Math.max(0, Math.min(100, 85 - shVal));
                      const pDarkY = Math.max(0, Math.min(100, 65 - dkVal));
                      const pLightY = Math.max(0, Math.min(100, 35 - ltVal));
                      const pHighY = Math.max(0, Math.min(100, 15 - hiVal));

                      const pathStr = `M 0 100 C 15 ${pShadY}, 35 ${pDarkY}, 65 ${pLightY}, 100 ${pHighY}`;
                      return (
                        <path 
                          d={pathStr} 
                          fill="none" 
                          stroke="#818cf8" 
                          strokeWidth="2"
                          className="transition-all duration-150 ease-out"
                        />
                      );
                    })()}
                  </svg>
                </div>

                {/* Parametric Curve sliders */}
                {renderSlider(lang === 'fr' ? 'Hautes lumières' : 'Highlights', 'curveHighlights', -100, 100)}
                {renderSlider(lang === 'fr' ? 'Tons clairs' : 'Lights', 'curveLights', -100, 100)}
                {renderSlider(lang === 'fr' ? 'Tons sombres' : 'Darks', 'curveDarks', -100, 100)}
                {renderSlider(lang === 'fr' ? 'Ombres' : 'Shadows', 'curveShadows', -100, 100)}
              </div>
            </details>

            {/* 3. Mélangeur de couleurs / HSL (Color Mixer Panel) */}
            <details className="group border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container/20">
              <summary className="flex justify-between items-center p-3 font-semibold text-xs text-white uppercase tracking-wider cursor-pointer hover:bg-surface-container-high transition-colors select-none list-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">filter_b_and_w</span>
                  {lang === 'fr' ? 'Mélangeur de couleurs' : 'Color Mixer (HSL)'}
                </span>
                <span className="material-symbols-outlined text-sm transition-transform group-open:rotate-180">keyboard_arrow_down</span>
              </summary>
              <div className="p-4 space-y-4 border-t border-outline-variant/20">
                {/* Sub-tabs Saturation / Luminance */}
                <div className="flex bg-surface-container-low rounded-lg p-1 border border-outline-variant/20">
                  <button
                    type="button"
                    onClick={() => setColorMixerTab('saturation')}
                    className={`flex-1 text-[10px] font-bold py-1.5 rounded-md cursor-pointer transition-all ${
                      colorMixerTab === 'saturation' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-white'
                    }`}
                  >
                    Saturation
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorMixerTab('luminance')}
                    className={`flex-1 text-[10px] font-bold py-1.5 rounded-md cursor-pointer transition-all ${
                      colorMixerTab === 'luminance' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-white'
                    }`}
                  >
                    Luminance
                  </button>
                </div>

                {/* HSL Sliders */}
                <div className="space-y-3 pt-2">
                  {colorMixerTab === 'saturation' ? (
                    <>
                      {renderSlider('Rouge', 'hslRedSaturation', -100, 100, 'accent-red-500')}
                      {renderSlider('Orange', 'hslOrangeSaturation', -100, 100, 'accent-orange-500')}
                      {renderSlider('Jaune', 'hslYellowSaturation', -100, 100, 'accent-yellow-500')}
                      {renderSlider('Vert', 'hslGreenSaturation', -100, 100, 'accent-green-500')}
                      {renderSlider('Aqua', 'hslAquaSaturation', -100, 100, 'accent-teal-500')}
                      {renderSlider('Bleu', 'hslBlueSaturation', -100, 100, 'accent-blue-500')}
                      {renderSlider('Violet', 'hslPurpleSaturation', -100, 100, 'accent-purple-500')}
                      {renderSlider('Magenta', 'hslMagentaSaturation', -100, 100, 'accent-pink-500')}
                    </>
                  ) : (
                    <>
                      {renderSlider('Rouge', 'hslRedLuminance', -100, 100, 'accent-red-500')}
                      {renderSlider('Orange', 'hslOrangeLuminance', -100, 100, 'accent-orange-500')}
                      {renderSlider('Jaune', 'hslYellowLuminance', -100, 100, 'accent-yellow-500')}
                      {renderSlider('Vert', 'hslGreenLuminance', -100, 100, 'accent-green-500')}
                      {renderSlider('Aqua', 'hslAquaLuminance', -100, 100, 'accent-teal-500')}
                      {renderSlider('Bleu', 'hslBlueLuminance', -100, 100, 'accent-blue-500')}
                      {renderSlider('Violet', 'hslPurpleLuminance', -100, 100, 'accent-purple-500')}
                      {renderSlider('Magenta', 'hslMagentaLuminance', -100, 100, 'accent-pink-500')}
                    </>
                  )}
                </div>
              </div>
            </details>

            {/* 4. Détail (Detail Panel) */}
            <details className="group border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container/20">
              <summary className="flex justify-between items-center p-3 font-semibold text-xs text-white uppercase tracking-wider cursor-pointer hover:bg-surface-container-high transition-colors select-none list-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">blur_on</span>
                  {lang === 'fr' ? 'Détails' : 'Details'}
                </span>
                <span className="material-symbols-outlined text-sm transition-transform group-open:rotate-180">keyboard_arrow_down</span>
              </summary>
              <div className="p-4 space-y-4 border-t border-outline-variant/20">
                {renderSlider(t.adjustSharpening, 'sharpening', 0, 100)}
                {renderSlider(lang === 'fr' ? 'Réduction bruit (Luminance)' : 'Noise Reduction (Luminance)', 'noiseReductionLuminance', 0, 100)}
                {renderSlider(lang === 'fr' ? 'Réduction bruit (Couleur)' : 'Noise Reduction (Color)', 'noiseReductionColor', 0, 100)}
              </div>
            </details>

            {/* 5. Effets (Effects Panel) */}
            <details className="group border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container/20">
              <summary className="flex justify-between items-center p-3 font-semibold text-xs text-white uppercase tracking-wider cursor-pointer hover:bg-surface-container-high transition-colors select-none list-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">grain</span>
                  {lang === 'fr' ? 'Effets' : 'Effects'}
                </span>
                <span className="material-symbols-outlined text-sm transition-transform group-open:rotate-180">keyboard_arrow_down</span>
              </summary>
              <div className="p-4 space-y-4 border-t border-outline-variant/20">
                {/* Vignette */}
                {renderSlider(t.adjustVignette, 'vignette', -100, 100)}

                {/* Vignette Color Presets & Custom Picker */}
                <div className="flex items-center justify-between text-[9px] font-bold text-on-surface-variant/80 mt-1">
                  <span>{t.vignetteColorLabel || "Couleur Vignette"}</span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { name: 'Noir', value: '#000000' },
                      { name: 'Beige', value: '#c2a68c' },
                      { name: 'Marron', value: '#6b4c35' },
                      { name: 'Blanc', value: '#ffffff' }
                    ].map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => handleSliderChange('vignetteColor', c.value)}
                        className={`w-3.5 h-3.5 rounded-full border transition-all ${
                          adjustments.vignetteColor === c.value 
                            ? 'border-primary scale-110 shadow-sm ring-1 ring-primary' 
                            : 'border-outline hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      />
                    ))}
                    <div className="relative w-3.5 h-3.5 rounded-full border border-outline overflow-hidden hover:scale-105 cursor-pointer">
                      <input
                        type="color"
                        value={adjustments.vignetteColor || '#000000'}
                        onChange={(e) => handleSliderChange('vignetteColor', e.target.value)}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      />
                      <div 
                        className="w-full h-full" 
                        style={{ 
                          background: adjustments.vignetteColor && !['#000000','#ffffff','#c2a68c','#6b4c35'].includes(adjustments.vignetteColor) 
                            ? adjustments.vignetteColor 
                            : 'conic-gradient(red, yellow, green, cyan, blue, magenta, red)' 
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="h-[1px] bg-outline-variant/20 my-3"></div>

                {/* Grain sliders */}
                {renderSlider(lang === 'fr' ? 'Quantité de Grain' : 'Grain Amount', 'grainAmount', 0, 100)}
                {renderSlider(lang === 'fr' ? 'Taille du Grain' : 'Grain Size', 'grainSize', 1, 50)}
                {renderSlider(lang === 'fr' ? 'Rugosité du Grain' : 'Grain Roughness', 'grainRoughness', 0, 100)}
              </div>
            </details>

            {/* 6. Étalonnage (Calibration Panel) */}
            <details className="group border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container/20">
              <summary className="flex justify-between items-center p-3 font-semibold text-xs text-white uppercase tracking-wider cursor-pointer hover:bg-surface-container-high transition-colors select-none list-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">settings_input_component</span>
                  {lang === 'fr' ? 'Étalonnage' : 'Calibration'}
                </span>
                <span className="material-symbols-outlined text-sm transition-transform group-open:rotate-180">keyboard_arrow_down</span>
              </summary>
              <div className="p-4 space-y-4 border-t border-outline-variant/20">
                {renderSlider(lang === 'fr' ? 'Teinte des ombres' : 'Shadow Tint', 'shadowTint', -100, 100, 'accent-teal-500')}
                <div className="h-[1px] bg-outline-variant/20 my-2"></div>
                {renderSlider(lang === 'fr' ? 'Teinte Primaire Rouge' : 'Red Primary Hue', 'redPrimaryHue', -100, 100, 'accent-red-500')}
                {renderSlider(lang === 'fr' ? 'Sat. Primaire Rouge' : 'Red Primary Sat.', 'redPrimarySaturation', -100, 100, 'accent-red-500')}
                <div className="h-[1px] bg-outline-variant/20 my-2"></div>
                {renderSlider(lang === 'fr' ? 'Teinte Primaire Verte' : 'Green Primary Hue', 'greenPrimaryHue', -100, 100, 'accent-green-500')}
                {renderSlider(lang === 'fr' ? 'Sat. Primaire Verte' : 'Green Primary Sat.', 'greenPrimarySaturation', -100, 100, 'accent-green-500')}
                <div className="h-[1px] bg-outline-variant/20 my-2"></div>
                {renderSlider(lang === 'fr' ? 'Teinte Primaire Bleue' : 'Blue Primary Hue', 'bluePrimaryHue', -100, 100, 'accent-blue-500')}
                {renderSlider(lang === 'fr' ? 'Sat. Primaire Bleue' : 'Blue Primary Sat.', 'bluePrimarySaturation', -100, 100, 'accent-blue-500')}
              </div>
            </details>
          </section>

          {/* File Info Card */}
          <section className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-3">
            <div className="flex items-center gap-2 text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm">info</span>
              <span>{t.fileInfoHeader}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white truncate" title={photo?.filename}>{photo?.filename}</p>
              <p className="text-[10px] text-outline-variant font-medium mt-0.5">
                {photo?.format} • {((photo?.size_bytes || 0) / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </section>
        </>
      )}
    </div>

        {/* Sidebar Export Footer actions */}
        <div className="p-4 border-t border-outline-variant bg-surface-container-high flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button 
              onClick={handleSavePhoto}
              disabled={isSaving || isSyncing}
              className="py-2.5 bg-primary-container text-on-primary-container font-bold text-xs rounded-lg hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1 cursor-pointer"
              title={t.actionSaveTooltip}
            >
              {isSaving ? (
                <span className="w-4 h-4 rounded-full border-2 border-on-primary-container/30 border-t-on-primary-container animate-spin"></span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">save</span>
                  {t.actionSave}
                </>
              )}
            </button>
            <button 
              onClick={handleOpenSyncModal}
              disabled={isSaving || isSyncing}
              className="py-2.5 bg-surface-container-highest border border-outline-variant text-on-surface hover:text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
              title={t.actionApplyToTooltip}
            >
              {isSyncing ? (
                <span className="w-4 h-4 rounded-full border-2 border-on-surface-variant/30 border-t-on-surface-variant animate-spin"></span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">sync</span>
                  {t.actionApplyTo}
                </>
              )}
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 my-1">
            <button 
              onClick={() => handleExport('jpeg')}
              className="py-2.5 bg-primary text-on-primary font-bold text-xs rounded-lg hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
              title={t.actionJpegTooltip}
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              {t.actionJpeg}
            </button>
            <button 
              onClick={() => handleExport('webp')}
              className="py-2.5 bg-transparent border border-outline-variant text-on-surface hover:text-white font-semibold text-xs rounded-lg hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title={t.actionWebpTooltip}
            >
              <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
              {t.actionWebp}
            </button>
          </div>
          
          {client && (
            <button 
              onClick={handleShareWhatsApp}
              className="w-full py-2.5 bg-transparent border border-[#25D366] text-[#25D366] font-semibold font-label-md rounded-lg hover:bg-[#25D366]/10 transition-colors flex items-center justify-center gap-2 cursor-pointer mt-1"
              title={t.actionShareWhatsAppTooltip}
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/>
              </svg>
              {t.actionShareWhatsApp}
            </button>
          )}
        </div>
      </aside>

      {/* Bottom control bar (Fitting & Comparing) */}
      <footer className="fixed bottom-0 left-[80px] right-[320px] h-16 glass-panel border-t border-outline-variant flex items-center justify-between px-gutter z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-surface-container-high rounded-full p-1 border border-outline-variant/30">
            <button 
              onClick={() => setZoomLevel('fit')}
              className={`px-4 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                zoomLevel === 'fit' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {t.zoomFit}
            </button>
            <button 
              onClick={() => setZoomLevel('100')}
              className={`px-4 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                zoomLevel === '100' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              100%
            </button>
            <button 
              onClick={() => setZoomLevel('200')}
              className={`px-4 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                zoomLevel === '200' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              200%
            </button>
          </div>
          <div className="h-6 w-[1px] bg-outline-variant"></div>
          <button 
            onClick={() => setIsComparing(!isComparing)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border transition-all cursor-pointer ${
              isComparing 
                ? 'bg-primary-container text-on-primary-container border-primary' 
                : 'bg-surface-container-highest border-outline-variant text-on-surface hover:border-primary/50'
            }`}
          >
            <span className="material-symbols-outlined text-sm">compare</span>
            <span className="text-[11px] font-bold">{t.zoomCompare}</span>
          </button>
        </div>

        <div className="flex items-center gap-6 text-xs font-semibold text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-outline">{t.zoomAiQuality}</span>
            <span className="text-[11px] font-bold text-primary">{t.zoomAiQualityVal}</span>
          </div>
        </div>
      </footer>

      {/* Selective Sync Modal */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-surface-container-high border border-outline-variant max-w-2xl w-full rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-outline-variant/50 flex justify-between items-center bg-surface-container-highest">
              <div>
                <h3 className="text-md font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">sync</span>
                  {t.syncTitle}
                </h3>
                <p className="text-xs text-outline-variant mt-1">
                  {t.syncSubtitle}
                </p>
              </div>
              <button 
                onClick={() => setIsSyncModalOpen(false)}
                className="text-on-surface-variant hover:text-white hover:bg-surface-container-high p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-4">
              {fetchingProjectPhotos ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                  <span className="text-xs text-on-surface-variant">{t.syncLoading}</span>
                </div>
              ) : projectPhotos.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant text-sm">
                  {t.syncNoPhotos}
                </div>
              ) : (
                <>
                  {/* Select All / Deselect All Action buttons */}
                  <div className="flex gap-2 justify-end mb-2">
                    <button 
                      onClick={() => setSelectedPhotoIds(projectPhotos.map(p => p.id))}
                      className="px-3 py-1 bg-surface-container-highest hover:bg-outline-variant/30 text-on-surface text-[10px] font-bold rounded-md transition-colors cursor-pointer"
                    >
                      {t.syncSelectAll}
                    </button>
                    <button 
                      onClick={() => setSelectedPhotoIds([])}
                      className="px-3 py-1 bg-surface-container-highest hover:bg-outline-variant/30 text-on-surface text-[10px] font-bold rounded-md transition-colors cursor-pointer"
                    >
                      {t.syncDeselectAll}
                    </button>
                  </div>

                  {/* Photos Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    {projectPhotos.map((photoItem) => {
                      const isSelected = selectedPhotoIds.includes(photoItem.id);
                      return (
                        <div 
                          key={photoItem.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedPhotoIds(prev => prev.filter(id => id !== photoItem.id));
                            } else {
                              setSelectedPhotoIds(prev => [...prev, photoItem.id]);
                            }
                          }}
                          className={`relative rounded-xl border overflow-hidden cursor-pointer group transition-all aspect-video bg-black/40 flex items-center justify-center ${
                            isSelected 
                              ? 'border-primary shadow-[0_0_12px_rgba(0,85,255,0.3)] scale-[0.98]' 
                              : 'border-outline-variant/30 hover:border-outline-variant hover:scale-[1.01]'
                          }`}
                        >
                          {/* Image preview */}
                          <img 
                            src={photoItem.metadata?.processed_thumbnail_url || photoItem.metadata?.thumbnail_url || photoItem.processed_url || photoItem.original_url} 
                            alt={photoItem.filename}
                            className="w-full h-full object-cover select-none pointer-events-none"
                            loading="lazy"
                          />

                          {/* Top-right checkbox overlay */}
                          <div className={`absolute top-2 right-2 w-5 h-5 rounded flex items-center justify-center border transition-all ${
                            isSelected 
                              ? 'bg-primary border-primary text-on-primary' 
                              : 'bg-black/40 border-white/50 group-hover:border-white'
                          }`}>
                            {isSelected && <span className="material-symbols-outlined text-[12px] font-bold">check</span>}
                          </div>

                          {/* Filename hover overlay */}
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[9px] text-white/90 truncate font-semibold">{photoItem.filename}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-outline-variant/50 flex justify-end gap-2 bg-surface-container-highest">
              <button
                onClick={() => setIsSyncModalOpen(false)}
                className="px-4 py-2 bg-transparent border border-outline-variant text-on-surface font-semibold text-xs rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                {t.syncCancel}
              </button>
              <button
                onClick={handleSyncSelectedPhotos}
                disabled={isSyncing || fetchingProjectPhotos || projectPhotos.length === 0 || selectedPhotoIds.length === 0}
                className="px-5 py-2 bg-primary text-on-primary font-bold text-xs rounded-lg hover:brightness-110 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSyncing ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-on-primary/30 border-t-on-primary animate-spin"></span>
                    {t.syncingText}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">sync</span>
                    {t.syncApplyCTA.replace('{count}', selectedPhotoIds.length.toString())}
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Custom Notification Modal */}
      {notification.isOpen && (
        <div 
          onClick={() => setNotification(prev => ({ ...prev, isOpen: false }))}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm glass-panel p-6 rounded-2xl border border-outline-variant/40 shadow-2xl text-center flex flex-col items-center animate-in zoom-in-95 duration-200 cursor-default"
          >
            {notification.type === 'success' && (
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-4 text-green-400">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
              </div>
            )}
            {notification.type === 'error' && (
              <div className="w-16 h-16 rounded-full bg-error/10 border border-error/30 flex items-center justify-center mb-4 text-error">
                <span className="material-symbols-outlined text-4xl">cancel</span>
              </div>
            )}
            {notification.type === 'warning' && (
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400">
                <span className="material-symbols-outlined text-4xl">warning</span>
              </div>
            )}
            {notification.type === 'info' && (
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 text-primary">
                <span className="material-symbols-outlined text-4xl">info</span>
              </div>
            )}

            <h3 className="font-display-lg text-lg font-bold text-white mb-1">
              {notification.title}
            </h3>
            <p className="text-on-surface-variant text-xs mb-6 px-2">
              {notification.message}
            </p>

            <button
              onClick={() => setNotification(prev => ({ ...prev, isOpen: false }))}
              className="w-full bg-surface-container-highest hover:bg-surface-bright text-white font-semibold py-2.5 rounded-xl border border-outline-variant/30 active:scale-98 transition-all cursor-pointer text-xs"
            >
              {t.notifClose}
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
