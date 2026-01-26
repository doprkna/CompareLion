/**
 * Alert Notification System
 * Sends alerts via webhooks (Discord, Slack, generic) and email
 * v0.33.1 - Alert Notifications & Webhooks
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import type { SystemAlert } from '@parel/core/hooks/useMarket';

const MAX_RETRY_ATTEMPTS = 3;

interface WebhookPayload {
  content?: string; // Discord
  text?: string; // Slack
  message?: string; // Generic
  level?: string;
  type?: string;
  timestamp?: string;
}

/**
 * Send alert notification to all active webhooks
 * Retries up to 3 times on failure
 */
export async function sendAlert(alert: {
  type: string;
  level: string;
  message: string;
  metadata?: any;
}): Promise<void> {
  try {
    // Get all active webhooks
    const webhooks = await prisma.alertWebhook.findMany({
      where: { isActive: true },
    });

    if (webhooks.length === 0) {
      logger.info('[NOTIFY] No active webhooks configured');
      return;
    }

    // Send to all webhooks in parallel
    const sendPromises = webhooks.map((webhook) =>
      sendToWebhook(webhook, alert)
    );

    await Promise.allSettled(sendPromises);
  } catch (error) {
    logger.error('[NOTIFY] Failed to send alert notifications:', error);
  }
}

/**
 * Send alert to specific webhook with retry logic
 */
async function sendToWebhook(
  webhook: { id: string; name: string; url: string; type: string },
  alert: { type: string; level: string; message: string; metadata?: any }
): Promise<void> {
  let attempts = 0;
  let lastError: Error | null = null;

  while (attempts < MAX_RETRY_ATTEMPTS) {
    try {
      attempts++;

      // Format payload based on webhook type
      const payload = formatWebhookPayload(webhook.type, alert);

      // Send webhook
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}: ${response.statusText}`);
      }

      logger.info(`[NOTIFY] Alert sent to ${webhook.name} (attempt ${attempts})`);
      return; // Success
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      logger.warn(
        `[NOTIFY] Failed to send to ${webhook.name} (attempt ${attempts}/${MAX_RETRY_ATTEMPTS}):`,
        error
      );

      // Wait before retry (exponential backoff)
      if (attempts < MAX_RETRY_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
      }
    }
  }

  // All retries failed
  logger.error(
    `[NOTIFY] Failed to send to ${webhook.name} after ${MAX_RETRY_ATTEMPTS} attempts:`,
    lastError
  );
}

/**
 * Format webhook payload based on type
 */
function formatWebhookPayload(
  webhookType: string,
  alert: { type: string; level: string; message: string; metadata?: any }
): WebhookPayload {
  const levelEmoji = {
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
    critical: '🚨',
  };

  const emoji = levelEmoji[alert.level as keyof typeof levelEmoji] || '📢';
  const formattedMessage = `${emoji} **[${alert.level.toUpperCase()}]** ${alert.type}: ${alert.message}`;

  switch (webhookType) {
    case 'discord':
      return {
        content: formattedMessage,
        embeds: [
          {
            title: `${alert.type.toUpperCase()} Alert`,
            description: alert.message,
            color: getLevelColor(alert.level),
            fields: alert.metadata
              ? Object.entries(alert.metadata).map(([key, value]) => ({
                  name: key,
                  value: String(value),
                  inline: true,
                }))
              : [],
            timestamp: new Date().toISOString(),
          },
        ],
      };

    case 'slack':
      return {
        text: formattedMessage,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: formattedMessage,
            },
          },
          ...(alert.metadata
            ? [
                {
                  type: 'context',
                  elements: [
                    {
                      type: 'mrkdwn',
                      text: Object.entries(alert.metadata)
                        .map(([key, value]) => `*${key}:* ${value}`)
                        .join(' | '),
                    },
                  ],
                },
              ]
            : []),
        ],
      };

    case 'generic':
    default:
      return {
        message: formattedMessage,
        level: alert.level,
        type: alert.type,
        timestamp: new Date().toISOString(),
        metadata: alert.metadata,
      };
  }
}

/**
 * Get color code for Discord embeds based on alert level
 */
function getLevelColor(level: string): number {
  switch (level) {
    case 'info':
      return 0x3b82f6; // Blue
    case 'warn':
      return 0xf59e0b; // Yellow
    case 'error':
      return 0xef4444; // Red
    case 'critical':
      return 0x991b1b; // Dark Red
    default:
      return 0x6b7280; // Gray
  }
}

/**
 * Send email alert (optional, requires email service)
 */
export async function sendEmailAlert(alert: {
  type: string;
  level: string;
  message: string;
  metadata?: any;
}): Promise<void> {
  const emailTo = process.env.EMAIL_ALERT_TO;

  if (!emailTo) {
    logger.info('[NOTIFY] EMAIL_ALERT_TO not configured, skipping email');
    return;
  }

  try {
    // TODO: Implement email sending via nodemailer or email service
    // For now, just log
    logger.info('[NOTIFY] Email alert would be sent to:', emailTo);
    logger.info('[NOTIFY] Subject:', `[PareL Alert] ${alert.type} - ${alert.level}`);
    logger.info('[NOTIFY] Message:', alert.message);

    // Example implementation (commented out):
    // const { sendEmail } = await import('@/lib/email');
    // await sendEmail({
    //   to: emailTo,
    //   subject: `[PareL Alert] ${alert.type} - ${alert.level}`,
    //   html: `
    //     <h2>${alert.level.toUpperCase()} Alert: ${alert.type}</h2>
    //     <p>${alert.message}</p>
    //     <p><small>Timestamp: ${new Date().toISOString()}</small></p>
    //   `,
    // });
  } catch (error) {
    logger.error('[NOTIFY] Failed to send email alert:', error);
  }
}

/**
 * Send test alert to verify webhook configuration
 */
export async function sendTestAlert(webhookUrl: string, webhookType: string): Promise<boolean> {
  try {
    const testAlert = {
      type: 'test',
      level: 'info',
      message: 'This is a test alert from PareL',
      metadata: { test: true, timestamp: new Date().toISOString() },
    };

    const payload = formatWebhookPayload(webhookType, testAlert);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}: ${response.statusText}`);
    }

    logger.info('[NOTIFY] Test alert sent successfully');
    return true;
  } catch (error) {
    logger.error('[NOTIFY] Test alert failed:', error);
    return false;
  }
}









