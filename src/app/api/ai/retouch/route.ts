import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key is missing. Please add OPENROUTER_API_KEY to your .env.local file.' },
        { status: 500 }
      );
    }

    const { prompt, currentAdjustments } = await request.json();

    const systemPrompt = `You are an expert photo editing assistant. Your job is to translate the user's natural language photo editing request into specific slider adjustments.
The available adjustments are:
- exposure (number, -100 to 100)
- contrast (number, -100 to 100)
- highlights (number, -100 to 100)
- shadows (number, -100 to 100)
- whites (number, -100 to 100)
- blacks (number, -100 to 100)
- temperature (number, -100 to 100)
- tint (number, -100 to 100)
- vibrance (number, -100 to 100)
- saturation (number, -100 to 100)
- clarity (number, -100 to 100)
- vignette (number, -100 to 100, negative for dark/colored vignette, positive for white/colored vignette)
- vignetteColor (string, hex color like '#000000', '#ffffff', '#c2a68c' (beige), or '#6b4c35' (brown))
- sharpening (number, 0 to 100)
- skinSmoothing (boolean)
- hdrEnabled (boolean)
- filter (string, one of: 'none', 'clarendon', 'juno', 'lark', 'valencia', 'gingham', 'lofi', 'inkwell')
- hslRedSaturation (number, -100 to 100)
- hslOrangeSaturation (number, -100 to 100)
- hslOrangeLuminance (number, -100 to 100)
- hslBlueSaturation (number, -100 to 100)

Special Portrait & Studio Rendering Guidelines:
- If the user asks for a professional studio portrait look, high-end studio skin, "Wadens" style, or clean portrait retouching:
  1. Enable skinSmoothing: true
  2. Increase hslOrangeLuminance (skin glow) to +15 to +35
  3. Slightly decrease hslOrangeSaturation (-5 to -15) to keep skin tones natural and avoid oversaturated orange
  4. Compress highlights (-10 to -25) and open shadows (+10 to +25) for soft, professional lighting
  5. Add a soft colored vignette matching the background (e.g., vignetteColor: '#c2a68c' (beige) or '#6b4c35' (warm brown) with vignette: -25 to -45)

Input:
User Prompt: "${prompt}"
Current Adjustments: ${JSON.stringify(currentAdjustments)}

Task:
Return a JSON object containing ONLY the keys that should be modified, along with their new values. Make adjustments relative or absolute based on the user's request. Keep existing adjustments if they don't need changes.
Do not explain anything. Return ONLY the JSON object. Do not wrap it in markdown codeblocks.
Example output format:
{
  "temperature": 25,
  "vignette": -30,
  "vignetteColor": "#c2a68c"
}`;

    // List of active models on OpenRouter to cycle through as fallbacks (prioritizing fast/cheap paid models, followed by the auto-routing free endpoint and specific free models)
    const MODELS = [
      'google/gemini-2.5-flash',
      'meta-llama/llama-3.3-70b-instruct',
      'openrouter/free',
      'google/gemma-4-31b-it:free',
      'meta-llama/llama-3.3-70b-instruct:free',
      'meta-llama/llama-3.2-3b-instruct:free',
      'nousresearch/hermes-3-llama-3.1-405b:free'
    ];

    let lastError = null;
    let content = '';
    let selectedModel = '';

    for (const model of MODELS) {
      try {
        console.log(`[AI Retouch] Attempting call with model: ${model}`);
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'PhotoFlow AI SaaS',
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            temperature: 0.1,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Model ${model} returned error: ${errorText}`);
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content?.trim();
        
        if (text) {
          content = text;
          selectedModel = model;
          console.log(`[AI Retouch] Successfully completed with model: ${model}`);
          break; // Exit the loop on success
        }
      } catch (err: any) {
        console.warn(`[AI Retouch] Model ${model} failed:`, err.message);
        lastError = err;
      }
    }

    if (!content) {
      throw new Error(`All fallback free models failed. Last error: ${lastError?.message || 'Unknown error'}`);
    }
    
    // Clean markdown code blocks if any
    let cleanedContent = content;
    if (content.startsWith('```')) {
      cleanedContent = content.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    }

    const newAdjustments = JSON.parse(cleanedContent);
    return NextResponse.json({ adjustments: newAdjustments, modelUsed: selectedModel });

  } catch (error: any) {
    console.error('Error in AI Retouch API:', error);
    return NextResponse.json({ error: error.message || 'An error occurred during AI processing.' }, { status: 500 });
  }
}
