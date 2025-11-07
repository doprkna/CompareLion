import { Resend } from 'resend';
import { logger } from '@/lib/logger';

const FROM_EMAIL = process.env.APP_MAIL_FROM || 'noreply@example.com';

// Initialize Resend only if API key is available
const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(apiKey);
};

export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const resend = getResend();
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      text,
    });

    if (result.error) {
      logger.error('Email send error', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    logger.error('Email send error', error);
    return { success: false, error: 'Failed to send email' };
  }
}

export async function sendEmailVerification({
  to,
  verificationUrl,
}: {
  to: string;
  verificationUrl: string;
}) {
  const subject = 'Verify your email address';
  const text = `Hello!

Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.

Best regards,
The Team`;

  return sendEmail({ to, subject, text });
}

export async function sendPasswordReset({
  to,
  resetUrl,
}: {
  to: string;
  resetUrl: string;
}) {
  const subject = 'Reset your password';
  const text = `Hello!

You requested a password reset. Click the link below to reset your password:

${resetUrl}

This link will expire in 24 hours.

If you didn't request a password reset, you can safely ignore this email.

Best regards,
The Team`;

  return sendEmail({ to, subject, text });
}
