// hCaptcha verification utility

export interface HCaptchaResponse {
  success: boolean;
  error_codes?: string[];
}

export async function verifyHCaptcha(
  token: string,
  secret: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret,
        response: token,
      }),
    });

    if (!response.ok) {
      console.error('hCaptcha API error:', response.status, response.statusText);
      return { success: false, error: 'hCaptcha verification failed' };
    }

    const data: HCaptchaResponse = await response.json();

    if (!data.success) {
      console.error('hCaptcha verification failed:', data.error_codes);
      return { 
        success: false, 
        error: `hCaptcha verification failed: ${data.error_codes?.join(', ') || 'Unknown error'}` 
      };
    }

    return { success: true };
  } catch (error) {
    console.error('hCaptcha verification error:', error);
    return { success: false, error: 'hCaptcha verification failed' };
  }
}

export function isHCaptchaRequired(req: Request): boolean {
  // Check if hCaptcha is configured
  const secret = process.env.HCAPTCHA_SECRET;
  if (!secret) {
    return false; // hCaptcha not configured
  }

  // Check if request is from signup endpoint and rate limited
  const url = new URL(req.url);
  return url.pathname === '/api/auth/signup';
}
