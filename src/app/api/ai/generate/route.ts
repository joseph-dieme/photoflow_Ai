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

    const { prompt, model } = await request.json();
    const selectedModel = model || 'black-forest-labs/flux-schnell';

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'PhotoFlow AI SaaS',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: 'user', content: prompt }
        ],
        modalities: ['image'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter Image Gen API error: ${errorText}`);
    }

    const data = await response.json();
    const imageObject = data.choices?.[0]?.message?.images?.[0];
    const imageUrl = imageObject?.image_url?.url || imageObject?.url;

    if (!imageUrl) {
      throw new Error('No image was returned from the OpenRouter model. Please try a different model or prompt.');
    }

    return NextResponse.json({ imageUrl });

  } catch (error: any) {
    console.error('Error in AI Generate API:', error);
    return NextResponse.json({ error: error.message || 'An error occurred during image generation.' }, { status: 500 });
  }
}
