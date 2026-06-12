/**
 * PhotoFlow AI Image Processing Utility
 * Implements client-side photo adjustments, format conversion, compression, and watermarking.
 */

export interface PhotoAdjustments {
  exposure: number;     // -100 to 100
  contrast: number;     // -100 to 100
  highlights: number;   // -100 to 100
  shadows: number;      // -100 to 100
  whites: number;       // -100 to 100
  blacks: number;       // -100 to 100
  temperature: number;  // -100 to 100 (warm/cool)
  tint: number;         // -100 to 100 (green/magenta)
  vibrance: number;     // -100 to 100
  saturation: number;   // -100 to 100
  clarity: number;      // -100 to 100
  vignette: number;     // -100 to 100 (vignette strength, negative for dark/colored, positive for white/colored)
  vignetteColor?: string; // Hex color for vignette, e.g. '#000000', '#ffffff', '#c2a68c'
  sharpening: number;   // 0 to 100
  // Color Grading / HSL controls
  hslRedSaturation: number;
  hslOrangeSaturation: number;
  hslOrangeLuminance: number;
  hslBlueSaturation: number;
  // Presets
  skinSmoothing: boolean;
  hdrEnabled: boolean;
  filter?: string;
  // Text Overlay properties (processed after adjustments to avoid filters)
  textText?: string;
  textSize?: number;
  textColor?: string;
  textFont?: string;
  textX?: number;
  textY?: number;
  textRotation?: number;
}

export const DEFAULT_ADJUSTMENTS: PhotoAdjustments = {
  exposure: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  temperature: 0,
  tint: 0,
  vibrance: 0,
  saturation: 0,
  clarity: 0,
  vignette: 0,
  vignetteColor: '#000000',
  sharpening: 0,
  hslRedSaturation: 0,
  hslOrangeSaturation: 0,
  hslOrangeLuminance: 0,
  hslBlueSaturation: 0,
  skinSmoothing: false,
  hdrEnabled: false,
  filter: 'none',
  textText: '',
  textSize: 48,
  textColor: '#FFFFFF',
  textFont: 'Arial',
  textX: undefined,
  textY: undefined,
  textRotation: 0,
};

/**
 * Loads an image from URL
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Applies a 3x3 sharpening convolution to the canvas
 */
function applySharpen(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, weight: number) {
  const w = canvas.width;
  const h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  
  const copy = new Uint8ClampedArray(data);
  const k = weight * 0.35; // scale kernel impact
  const a = 1 + 4 * k;
  const b = -k;

  for (let y = 1; y < h - 1; y++) {
    const yW = y * w;
    const yTopW = (y - 1) * w;
    const yBottomW = (y + 1) * w;
    
    for (let x = 1; x < w - 1; x++) {
      const idx = (yW + x) * 4;
      const topIdx = (yTopW + x) * 4;
      const bottomIdx = (yBottomW + x) * 4;
      const leftIdx = (yW + x - 1) * 4;
      const rightIdx = (yW + x + 1) * 4;
      
      for (let c = 0; c < 3; c++) {
        const newVal = copy[idx + c] * a + (copy[topIdx + c] + copy[bottomIdx + c] + copy[leftIdx + c] + copy[rightIdx + c]) * b;
        data[idx + c] = Math.max(0, Math.min(255, newVal));
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

/**
 * Applies adjustments to an image and returns a base64 Data URL.
 */
export async function applyAdjustments(
  imageSrc: string,
  adjustments: PhotoAdjustments,
  addWatermarkText?: string,
  isPreview: boolean | number = false,
  exportFormat?: 'image/jpeg' | 'image/webp' | 'image/png'
): Promise<string> {
  try {
    const img = await loadImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { colorSpace: 'display-p3', willReadFrequently: true }) || canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Downscale for preview to achieve real-time responsiveness (Lightroom style preview)
    let width = img.naturalWidth;
    let height = img.naturalHeight;
    const maxPreviewDim = typeof isPreview === 'number' ? isPreview : 1200;
    
    if (isPreview && (width > maxPreviewDim || height > maxPreviewDim)) {
      if (width > height) {
        height = Math.round((maxPreviewDim / width) * height);
        width = maxPreviewDim;
      } else {
        width = Math.round((maxPreviewDim / height) * width);
        height = maxPreviewDim;
      }
    }

    canvas.width = width;
    canvas.height = height;

    // Draw baseline image scaled to canvas
    ctx.drawImage(img, 0, 0, width, height);

    // Apply adjustments using pixel manipulation for high fidelity results
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const len = data.length;

    // Precalculate factors for performance
    const expFactor = Math.pow(2, adjustments.exposure / 100);
    const contrastFactor = (100 + adjustments.contrast) / 100;
    
    const satFactor = (100 + adjustments.saturation) / 100;
    const vibAmt = adjustments.vibrance / 100;
    
    const tempAmt = adjustments.temperature / 2.5; 
    const tintAmt = adjustments.tint / 2.5;
    
    const highAmt = adjustments.highlights / 100;
    const shadAmt = adjustments.shadows / 100;
    const whiteAmt = adjustments.whites / 100;
    const blackAmt = adjustments.blacks / 100;
    const clarityAmt = adjustments.clarity / 100;
    const vignetteAmt = adjustments.vignette / 100;
    
    // HSL parameters
    const rSatAmt = (100 + adjustments.hslRedSaturation) / 100;
    const oSatAmt = (100 + (adjustments.hslOrangeSaturation || 0)) / 100;
    const oLumAmt = (adjustments.hslOrangeLuminance || 0) / 100;
    const bSatAmt = (100 + adjustments.hslBlueSaturation) / 100;

    // Vignette coordinates and color parameters
    const cx = width / 2;
    const cy = height / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy);
    let vigR = 0;
    let vigG = 0;
    let vigB = 0;
    if (adjustments.vignetteColor) {
      const hex = adjustments.vignetteColor.replace('#', '');
      vigR = parseInt(hex.substring(0, 2), 16) || 0;
      vigG = parseInt(hex.substring(2, 4), 16) || 0;
      vigB = parseInt(hex.substring(4, 6), 16) || 0;
    } else {
      if (adjustments.vignette > 0) {
        vigR = 255; vigG = 255; vigB = 255;
      }
    }

    for (let i = 0; i < len; i += 4) {
      let r = data[i];
      let g = data[i+1];
      let b = data[i+2];

      // 1. White Balance (Temperature & Tint)
      if (tempAmt !== 0 || tintAmt !== 0) {
        const t = tempAmt / 130; 
        const tint = tintAmt / 130;
        
        r *= (1 + t * 0.15);
        g *= (1 + t * 0.05);
        b *= (1 - t * 0.20);
        
        r *= (1 + tint * 0.08);
        g *= (1 - tint * 0.16);
        b *= (1 + tint * 0.08);
      }

      // 2. Exposure
      if (adjustments.exposure !== 0) {
        r *= expFactor;
        g *= expFactor;
        b *= expFactor;
      }

      // 3. Contrast (using a professional non-clipping sigmoidal s-curve)
      if (adjustments.contrast !== 0) {
        const contrastFactor = adjustments.contrast / 50; // range -2.0 to 2.0
        let normR = r / 255;
        let normG = g / 255;
        let normB = b / 255;
        
        normR = normR + contrastFactor * normR * (1 - normR) * (normR - 0.5);
        normG = normG + contrastFactor * normG * (1 - normG) * (normG - 0.5);
        normB = normB + contrastFactor * normB * (1 - normB) * (normB - 0.5);
        
        r = normR * 255;
        g = normG * 255;
        b = normB * 255;
      }

      // Calculate luminance
      let lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // 4 & 5. Highlights, Shadows, Whites, Blacks (using smooth non-linear tone curves to mimic Lightroom)
      if (highAmt !== 0 || shadAmt !== 0 || whiteAmt !== 0 || blackAmt !== 0) {
        const L = Math.max(0, Math.min(1, lum / 255));
        const wHigh = L * L;
        const wShadow = (1 - L) * (1 - L);
        const wWhite = L * L * L * L;
        const wBlack = (1 - L) * (1 - L) * (1 - L) * (1 - L);
        
        let scale = 1.0;
        scale += highAmt * wHigh * 0.4;
        scale += shadAmt * wShadow * 0.4;
        scale += whiteAmt * wWhite * 0.3;
        
        r *= scale;
        g *= scale;
        b *= scale;
        
        if (blackAmt !== 0) {
          const offset = blackAmt * wBlack * 30;
          r += offset;
          g += offset;
          b += offset;
        }
      }

      // Calculate luminance again for Clarity
      lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // 6. Clarity (local midtone contrast adjustment using sigmoidal s-curve to prevent clipping)
      if (clarityAmt !== 0) {
        const midtoneWeight = Math.exp(-Math.pow(lum - 128, 2) / (2 * 64 * 64));
        const clarityFactor = clarityAmt * midtoneWeight * 0.7; // scale factor
        
        let normR = Math.max(0, Math.min(1, r / 255));
        let normG = Math.max(0, Math.min(1, g / 255));
        let normB = Math.max(0, Math.min(1, b / 255));
        
        normR = normR + clarityFactor * normR * (1 - normR) * (normR - 0.5);
        normG = normG + clarityFactor * normG * (1 - normG) * (normG - 0.5);
        normB = normB + clarityFactor * normB * (1 - normB) * (normB - 0.5);
        
        r = normR * 255;
        g = normG * 255;
        b = normB * 255;
      }

      // Recalculate luminance for HSL and Saturation
      lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // 7. HSL Color grading
      const maxVal = Math.max(r, g, b);
      const minVal = Math.min(r, g, b);
      const diff = maxVal - minVal;
      let hue = 0;
      
      if (diff !== 0) {
        if (maxVal === r) hue = ((g - b) / diff) % 6;
        else if (maxVal === g) hue = (b - r) / diff + 2;
        else hue = (r - g) / diff + 4;
        hue = Math.round(hue * 60);
        if (hue < 0) hue += 360;
      }

      // Calculate pixel saturation & neutral tone weight to protect backgrounds / whites / blacks
      // Calculate pixel saturation & neutral tone weight to protect backgrounds / whites / blacks
      const pixelSat = maxVal === 0 ? 0 : diff / maxVal;
      const satWeight = Math.min(1, Math.max(0, (pixelSat - 0.08) / 0.1)); // smooth transition from 8% to 18% saturation

      if (satWeight > 0) {
        // 1. Orange / Skin Tone Weight (Center 25, width 30) using circular distance
        let hueDiffOrange = Math.abs(hue - 25);
        if (hueDiffOrange > 180) hueDiffOrange = 360 - hueDiffOrange;
        const orangeWeight = Math.max(0, 1 - hueDiffOrange / 30) * satWeight;

        // 2. Red Weight (Center 0/360, width 20) using circular distance
        let hueDiffRed = Math.abs(hue - 0);
        if (hueDiffRed > 180) hueDiffRed = 360 - hueDiffRed;
        const redWeight = Math.max(0, 1 - hueDiffRed / 20) * satWeight;

        // 3. Blue Weight (Center 210, width 45) using circular distance
        let hueDiffBlue = Math.abs(hue - 210);
        if (hueDiffBlue > 180) hueDiffBlue = 360 - hueDiffBlue;
        const blueWeight = Math.max(0, 1 - hueDiffBlue / 45) * satWeight;

        let deltaR = 0;
        let deltaG = 0;
        let deltaB = 0;

        // Apply Orange adjustments
        if (orangeWeight > 0) {
          let adjR = r;
          let adjG = g;
          let adjB = b;
          if (oSatAmt !== 1) {
            adjR = lum + (r - lum) * oSatAmt;
            adjG = lum + (g - lum) * oSatAmt;
            adjB = lum + (b - lum) * oSatAmt;
          }
          if (oLumAmt !== 0) {
            const lFactor = 1 + oLumAmt * 0.25;
            adjR *= lFactor;
            adjG *= lFactor;
            adjB *= lFactor;
          }
          deltaR += (adjR - r) * orangeWeight;
          deltaG += (adjG - g) * orangeWeight;
          deltaB += (adjB - b) * orangeWeight;
        }

        // Apply Red adjustments
        if (redWeight > 0 && rSatAmt !== 1) {
          const adjR = lum + (r - lum) * rSatAmt;
          const adjG = lum + (g - lum) * rSatAmt;
          const adjB = lum + (b - lum) * rSatAmt;
          deltaR += (adjR - r) * redWeight;
          deltaG += (adjG - g) * redWeight;
          deltaB += (adjB - b) * redWeight;
        }

        // Apply Blue adjustments
        if (blueWeight > 0 && bSatAmt !== 1) {
          const adjR = lum + (r - lum) * bSatAmt;
          const adjG = lum + (g - lum) * bSatAmt;
          const adjB = lum + (b - lum) * bSatAmt;
          deltaR += (adjR - r) * blueWeight;
          deltaG += (adjG - g) * blueWeight;
          deltaB += (adjB - b) * blueWeight;
        }

        r += deltaR;
        g += deltaG;
        b += deltaB;
      }

      // Recalculate luminance
      lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // 8. Saturation & Vibrance
      let finalSatFactor = satFactor;
      if (vibAmt !== 0) {
        const sat = maxVal === 0 ? 0 : diff / maxVal;
        finalSatFactor += (1.0 - sat) * vibAmt * 0.7;
      }

      if (finalSatFactor !== 1) {
        r = lum + (r - lum) * finalSatFactor;
        g = lum + (g - lum) * finalSatFactor;
        b = lum + (b - lum) * finalSatFactor;
      }

      // 9. Vignette (apply darker, lighter, or custom-colored corners based on pixel distance)
      if (adjustments.vignette !== 0) {
        const px = (i / 4) % width;
        const py = Math.floor((i / 4) / width);
        const dx = px - cx;
        const dy = py - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const distRatio = dist / maxDist; // 0 to 1
        
        // Quadratic vignette curve
        const blend = Math.min(1.0, Math.max(0.0, Math.abs(adjustments.vignette / 100) * Math.pow(distRatio, 2.2) * 0.85));
        
        r = r * (1 - blend) + vigR * blend;
        g = g * (1 - blend) + vigG * blend;
        b = b * (1 - blend) + vigB * blend;
      }

      // 10. Instagram Filters
      if (adjustments.filter && adjustments.filter !== 'none') {
        const filter = adjustments.filter;
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        
        if (filter === 'clarendon') {
          r = 128 + (r - 128) * 1.15;
          g = 128 + (g - 128) * 1.15;
          b = 128 + (b - 128) * 1.15;
          if (lum < 128) {
            b += (128 - lum) * 0.12;
            r -= (128 - lum) * 0.05;
          } else {
            r += (lum - 128) * 0.10;
            g += (lum - 128) * 0.05;
          }
          r = lum + (r - lum) * 1.1;
          g = lum + (g - lum) * 1.1;
          b = lum + (b - lum) * 1.1;
        } 
        else if (filter === 'juno') {
          r = 128 + (r - 128) * 1.1;
          g = 128 + (g - 128) * 1.1;
          b = 128 + (b - 128) * 1.1;
          r *= 1.08;
          g *= 1.03;
        }
        else if (filter === 'lark') {
          r *= 1.08;
          g *= 1.08;
          b *= 1.08;
          const maxVal = Math.max(r, g, b);
          const minVal = Math.min(r, g, b);
          const diff = maxVal - minVal;
          if (diff > 0) {
            let hue = maxVal === r ? ((g - b) / diff) % 6 : maxVal === g ? (b - r) / diff + 2 : (r - g) / diff + 4;
            hue = Math.round(hue * 60);
            if (hue < 0) hue += 360;
            if (hue < 20 || hue > 340) {
              r = lum + (r - lum) * 0.8;
              g = lum + (g - lum) * 0.8;
              b = lum + (b - lum) * 0.8;
            } else if (hue > 80 && hue < 260) {
              r = lum + (r - lum) * 1.15;
              g = lum + (g - lum) * 1.15;
              b = lum + (b - lum) * 1.15;
            }
          }
        }
        else if (filter === 'valencia') {
          r = r * 0.95 + 20;
          g = g * 0.90 + 15;
          b = b * 0.82 + 10;
          r = 128 + (r - 128) * 0.95;
          g = 128 + (g - 128) * 0.95;
          b = 128 + (b - 128) * 0.95;
        }
        else if (filter === 'gingham') {
          r = r * 0.85 + 25;
          g = g * 0.85 + 25;
          b = b * 0.90 + 20;
          r = lum + (r - lum) * 0.85;
          g = lum + (g - lum) * 0.85;
          b = lum + (b - lum) * 0.85;
        }
        else if (filter === 'lofi') {
          r = 128 + (r - 128) * 1.25;
          g = 128 + (g - 128) * 1.25;
          b = 128 + (b - 128) * 1.25;
          r = lum + (r - lum) * 1.3;
          g = lum + (g - lum) * 1.3;
          b = lum + (b - lum) * 1.3;
        }
        else if (filter === 'inkwell') {
          r = 128 + (lum - 128) * 1.3;
          g = r;
          b = r;
        }
      }

      // Clamp values
      data[i] = Math.max(0, Math.min(255, r));
      data[i+1] = Math.max(0, Math.min(255, g));
      data[i+2] = Math.max(0, Math.min(255, b));
    }

    ctx.putImageData(imgData, 0, 0);

    // Apply Sharpening if enabled
    if (adjustments.sharpening > 0) {
      applySharpen(canvas, ctx, adjustments.sharpening / 100);
    }

    // Apply skin smoothing (blur only over skin tone regions using a soft feathered mask)
    if (adjustments.skinSmoothing) {
      const blurCanvas = document.createElement('canvas');
      blurCanvas.width = width;
      blurCanvas.height = height;
      const blurCtx = blurCanvas.getContext('2d');
      if (blurCtx) {
        // Dynamic blur radius matching the image scale (Lightroom portrait smoothing style)
        const baseDim = Math.max(width, height);
        const blurRadius = Math.max(3, Math.round(baseDim / 200)); // ~20px for 4000px, ~6px for 1200px
        blurCtx.filter = `blur(${blurRadius}px)`;
        blurCtx.drawImage(canvas, 0, 0);
        
        const mainData = ctx.getImageData(0, 0, width, height);
        const blurData = blurCtx.getImageData(0, 0, width, height);
        const mData = mainData.data;
        const bData = blurData.data;
        
        for (let j = 0; j < len; j += 4) {
          const pxR = mData[j];
          const pxG = mData[j+1];
          const pxB = mData[j+2];
          
          const maxVal = Math.max(pxR, pxG, pxB);
          const minVal = Math.min(pxR, pxG, pxB);
          const diff = maxVal - minVal;
          const pixelSat = maxVal === 0 ? 0 : diff / maxVal;
          let hue = 0;
          if (diff !== 0) {
            if (maxVal === pxR) hue = ((pxG - pxB) / diff) % 6;
            else if (maxVal === pxG) hue = (pxB - pxR) / diff + 2;
            else hue = (pxR - pxG) / diff + 4;
            hue = Math.round(hue * 60);
            if (hue < 0) hue += 360;
          }
          
          // Soft skin tone detection (center 25, width 32) with circular distance
          let hueDiff = Math.abs(hue - 25);
          if (hueDiff > 180) hueDiff = 360 - hueDiff;
          
          let skinWeight = 0;
          if (hueDiff <= 32) {
            skinWeight = 1 - hueDiff / 32;
          }
          // Lower saturation limit for skin (0.03) to smooth shadows, and soft transition
          const satWeight = Math.min(1, Math.max(0, (pixelSat - 0.03) / 0.10));
          const skinToneWeight = skinWeight * satWeight;

          if (skinToneWeight > 0) {
            // Bilateral-like edge preservation: measure difference between original and blurred pixel
            const diffR = Math.abs(pxR - bData[j]);
            const diffG = Math.abs(pxG - bData[j+1]);
            const diffB = Math.abs(pxB - bData[j+2]);
            const diffVal = (diffR + diffG + diffB) / 3;
            
            // If the difference is large (e.g. eyes, lips, nostrils, hair), preserve the edge (edgeWeight -> 0)
            // If the difference is small (skin texture/blemishes/noise), smooth it completely (edgeWeight -> 1)
            const edgeWeight = Math.max(0, 1 - diffVal / 38);
            
            // Smoothly blend the blurred pixel up to 90% strength for a spot-free Lightroom texture
            const blend = skinToneWeight * edgeWeight * 0.90;
            if (blend > 0) {
              mData[j] = Math.round(pxR * (1 - blend) + bData[j] * blend);
              mData[j+1] = Math.round(pxG * (1 - blend) + bData[j+1] * blend);
              mData[j+2] = Math.round(pxB * (1 - blend) + bData[j+2] * blend);
            }
          }
        }
        ctx.putImageData(mainData, 0, 0);
      }
    }

    // Apply text annotation if provided (drawn after filters/adjustments so it is not affected by them)
    if (adjustments.textText) {
      ctx.save();
      
      const scaleX = canvas.width / img.naturalWidth;
      const scaleY = canvas.height / img.naturalHeight;
      const x = (adjustments.textX ?? (img.naturalWidth / 2)) * scaleX;
      const y = (adjustments.textY ?? (img.naturalHeight / 2)) * scaleY;
      const size = (adjustments.textSize ?? 48) * ((scaleX + scaleY) / 2);

      ctx.fillStyle = adjustments.textColor ?? '#FFFFFF';
      const font = adjustments.textFont ?? 'Arial';
      ctx.font = `bold ${size}px ${font}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.translate(x, y);
      if (adjustments.textRotation) {
        ctx.rotate((adjustments.textRotation * Math.PI) / 180);
      }

      const isDarkText = adjustments.textColor === '#000000' || adjustments.textColor === '#000';
      ctx.strokeStyle = isDarkText ? '#FFFFFF' : '#000000';
      ctx.lineWidth = Math.max(2, Math.round(size / 15));
      ctx.strokeText(adjustments.textText, 0, 0);
      ctx.fillText(adjustments.textText, 0, 0);

      ctx.restore();
    }

    // Apply watermark if provided
    if (addWatermarkText) {
      drawWatermark(canvas, ctx, addWatermarkText);
    }

    // Auto-detect format from the source URL/base64 to preserve it if not explicitly overridden
    let format = exportFormat || 'image/jpeg';
    if (!exportFormat) {
      const lowerSrc = imageSrc.toLowerCase();
      if (lowerSrc.includes('.webp') || lowerSrc.startsWith('data:image/webp')) {
        format = 'image/webp';
      } else if (lowerSrc.includes('.png') || lowerSrc.startsWith('data:image/png')) {
        format = 'image/png';
      }
    }

    const quality = isPreview ? 0.90 : 1.0;
    return canvas.toDataURL(format, format === 'image/png' ? undefined : quality);
  } catch (err) {
    console.error('Error applying adjustments:', err);
    return imageSrc;
  }
}


/**
 * Draws a diagonal transparent watermark across the canvas
 */
function drawWatermark(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, text: string) {
  const size = Math.max(canvas.width, canvas.height);
  const fontSize = Math.floor(size / 25);
  
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-Math.PI / 4); // 45 degrees diagonal
  
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.lineWidth = 2;
  ctx.textAlign = 'center';
  
  // Draw repeating watermark text
  const spacing = fontSize * 3;
  for (let offset = -size; offset < size; offset += spacing) {
    ctx.fillText(text, offset, 0);
    ctx.strokeText(text, offset, 0);
  }
  
  ctx.restore();
}

/**
 * Scans a RAW file's binary buffer to extract the largest embedded JPEG preview.
 */
function extractEmbeddedJpeg(arrayBuffer: ArrayBuffer): Blob | null {
  const bytes = new Uint8Array(arrayBuffer);
  const length = bytes.length;
  
  // 1. Find all SOI markers (0xFFD8)
  const soiOffsets: number[] = [];
  for (let i = 0; i < length - 1; i++) {
    if (bytes[i] === 0xFF && bytes[i+1] === 0xD8) {
      soiOffsets.push(i);
    }
  }
  
  if (soiOffsets.length === 0) return null;
  
  const candidates: { start: number; size: number }[] = [];
  
  // 2. For each SOI, scan backwards from the next SOI (or end of file) to find the EOI (0xFFD9)
  for (let k = 0; k < soiOffsets.length; k++) {
    const start = soiOffsets[k];
    const limit = (k < soiOffsets.length - 1) ? soiOffsets[k+1] : length;
    
    // We expect the preview to be larger than 50KB (51200 bytes)
    const minSize = 51200; 
    if (limit - start < minSize) {
      continue; 
    }
    
    // Scan backwards from limit - 2 down to start + minSize
    let eoi = -1;
    for (let i = limit - 2; i >= start + minSize; i--) {
      if (bytes[i] === 0xFF && bytes[i+1] === 0xD9) {
        eoi = i + 2;
        break;
      }
    }
    
    if (eoi !== -1) {
      candidates.push({ start, size: eoi - start });
    }
  }
  
  if (candidates.length === 0) return null;
  
  // Sort candidates by size descending and select the largest one (the main preview)
  candidates.sort((a, b) => b.size - a.size);
  const largest = candidates[0];
  const jpegData = bytes.subarray(largest.start, largest.start + largest.size);
  return new Blob([jpegData], { type: 'image/jpeg' });
}

/**
 * Creates a fallback dark canvas representing a developed RAW file
 */
function createPlaceholderRaw(file: File, resolve: any, reject: any, quality: number) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0055FF';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`RAW DEVELOPER: ${file.name}`, 100, 100);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px sans-serif';
    ctx.fillText('Conversion du décodeur RAW simulée effectuée avec succès.', 100, 150);
  }
  canvas.toBlob((blob) => {
    if (blob) {
      const convertedName = file.name.replace(/\.[^/.]+$/, "") + '.webp';
      resolve(new File([blob], convertedName, { type: 'image/webp' }));
    } else {
      reject(new Error('Canvas blob generation failed'));
    }
  }, 'image/webp', quality);
}

/**
 * Compresses an image file and returns an optimized WebP or JPEG File.
 */
export async function compressAndConvert(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'image/jpeg' | 'image/webp' | 'image/png';
  } = {}
): Promise<File> {
  const {
    maxWidth = 16384,
    maxHeight = 16384,
    quality = 1.0,
    format = 'image/webp'
  } = options;

  // If file is RAW format (not standard browser formats), we extract its embedded JPEG
  const isRaw = /\.(raw|cr2|nef|arw|dng|pef)$/i.test(file.name);

  if (isRaw) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          if (!arrayBuffer) {
            reject(new Error('Failed to read RAW array buffer'));
            return;
          }

          const jpegBlob = extractEmbeddedJpeg(arrayBuffer);
          if (jpegBlob) {
            const imgUrl = URL.createObjectURL(jpegBlob);
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d', { colorSpace: 'display-p3' }) || canvas.getContext('2d');
              if (!ctx) {
                URL.revokeObjectURL(imgUrl);
                return;
              }
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';

              let width = img.naturalWidth;
              let height = img.naturalHeight;

              // Scale maintaining aspect ratio ONLY if dimensions are explicitly provided
              if (options.maxWidth && width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
              }
              if (options.maxHeight && height > maxHeight) {
                width = (maxHeight / height) * width;
                height = maxHeight;
              }

              canvas.width = width;
              canvas.height = height;
              ctx.drawImage(img, 0, 0, width, height);

              canvas.toBlob((blob) => {
                URL.revokeObjectURL(imgUrl);
                if (blob) {
                  const ext = format === 'image/webp' ? '.webp' : format === 'image/png' ? '.png' : '.jpg';
                  const convertedName = file.name.replace(/\.[^/.]+$/, "") + ext;
                  resolve(new File([blob], convertedName, { type: format }));
                } else {
                  reject(new Error('Blob conversion failed'));
                }
              }, format, quality);
            };
            img.onerror = () => {
              URL.revokeObjectURL(imgUrl);
              createPlaceholderRaw(file, resolve, reject, quality);
            };
            img.src = imgUrl;
          } else {
            createPlaceholderRaw(file, resolve, reject, quality);
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const srcUrl = e.target?.result as string;
        
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { colorSpace: 'display-p3' }) || canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get 2D context'));
            return;
          }
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          let width = img.naturalWidth;
          let height = img.naturalHeight;

          // Scale maintaining aspect ratio ONLY if dimensions are explicitly provided
          if (options.maxWidth && width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }
          if (options.maxHeight && height > maxHeight) {
            width = (maxHeight / height) * width;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              const ext = format === 'image/webp' ? '.webp' : format === 'image/png' ? '.png' : '.jpg';
              const convertedName = file.name.replace(/\.[^/.]+$/, "") + ext;
              resolve(new File([blob], convertedName, { type: format }));
            } else {
              reject(new Error('Blob conversion failed'));
            }
          }, format, quality);
        };
        img.onerror = () => {
          reject(new Error('Failed to load image element'));
        };
        img.src = srcUrl;
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
