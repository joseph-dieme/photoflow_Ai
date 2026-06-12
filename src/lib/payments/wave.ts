/**
 * PhotoFlow AI Wave API Mobile Money Payment Module
 * Supports Senegal (XOF) and Côte d'Ivoire (XOF) payments.
 */

export interface WavePaymentRequest {
  amountFcfa: number;
  customerEmail: string;
  customerPhone?: string;
  projectName?: string;
  invoiceId?: string;
  successUrl: string;
  errorUrl: string;
}

export interface WavePaymentSession {
  id: string;
  amount: number;
  checkoutUrl: string;
  waveLaunchUrl: string;
  status: 'pending' | 'success' | 'failed';
}

/**
 * Initializes a Wave Payment session by calling the local Next.js API route.
 * If credentials are configured, it performs a real integration, otherwise it falls back to a sandbox simulation.
 */
export async function createWavePaymentSession(
  request: WavePaymentRequest
): Promise<WavePaymentSession> {
  try {
    const response = await fetch('/api/payments/wave', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Wave Payment API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    console.error('Failed to create Wave payment session:', err);
    
    // Fail-safe client-side mock session
    const mockSessionId = 'wave_sess_' + Math.random().toString(36).substring(2, 12);
    return {
      id: mockSessionId,
      amount: request.amountFcfa,
      checkoutUrl: `/checkout/wave?sessionId=${mockSessionId}&amount=${request.amountFcfa}&email=${encodeURIComponent(request.customerEmail)}&phone=${request.customerPhone || ''}&invoiceId=${request.invoiceId || ''}`,
      waveLaunchUrl: '',
      status: 'pending'
    };
  }
}

/**
 * Checks the status of a Wave checkout session
 */
export async function getWavePaymentStatus(sessionId: string): Promise<{ status: string }> {
  try {
    const response = await fetch(`/api/payments/wave?sessionId=${sessionId}`);
    if (!response.ok) throw new Error('Failed to fetch Wave status');
    return await response.json();
  } catch (err) {
    console.error('Error fetching Wave status:', err);
    return { status: 'pending' };
  }
}
