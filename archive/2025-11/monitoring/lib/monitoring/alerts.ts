/**
 * Alert System (v0.11.3)
 * 
 * Send critical alerts to Slack/Discord webhooks.
 */

import { createLogger } from "./correlation-id";

const logger = createLogger("Alerts");

export enum AlertSeverity {
  INFO = "info",
  WARNING = "warning",
  CRITICAL = "critical",
}

export interface AlertOptions {
  title: string;
  message: string;
  severity: AlertSeverity;
  metadata?: Record<string, any>;
  userId?: string;
  endpoint?: string;
}

/**
 * Send alert to Slack
 */
async function sendSlackAlert(options: AlertOptions): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    logger.debug("Slack webhook not configured, skipping alert");
    return;
  }
  
  const color = {
    [AlertSeverity.INFO]: "#36a64f",
    [AlertSeverity.WARNING]: "#ff9900",
    [AlertSeverity.CRITICAL]: "#ff0000",
  }[options.severity];
  
  const icon = {
    [AlertSeverity.INFO]: ":information_source:",
    [AlertSeverity.WARNING]: ":warning:",
    [AlertSeverity.CRITICAL]: ":rotating_light:",
  }[options.severity];
  
  const payload = {
    attachments: [
      {
        color,
        title: `${icon} ${options.title}`,
        text: options.message,
        fields: [
          {
            title: "Severity",
            value: options.severity.toUpperCase(),
            short: true,
          },
          {
            title: "Timestamp",
            value: new Date().toISOString(),
            short: true,
          },
          ...(options.endpoint
            ? [{ title: "Endpoint", value: options.endpoint, short: true }]
            : []),
          ...(options.userId
            ? [{ title: "User ID", value: options.userId, short: true }]
            : []),
          ...(options.metadata
            ? [
                {
                  title: "Metadata",
                  value: `\`\`\`${JSON.stringify(options.metadata, null, 2)}\`\`\``,
                  short: false,
                },
              ]
            : []),
        ],
        footer: "PareL Monitoring",
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };
  
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      logger.error(`Slack alert failed: ${response.statusText}`);
    }
  } catch (error) {
    logger.error("Failed to send Slack alert:", error as Error);
  }
}

/**
 * Send alert to Discord
 */
async function sendDiscordAlert(options: AlertOptions): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  if (!webhookUrl) {
    logger.debug("Discord webhook not configured, skipping alert");
    return;
  }
  
  const color = {
    [AlertSeverity.INFO]: 0x36a64f,
    [AlertSeverity.WARNING]: 0xff9900,
    [AlertSeverity.CRITICAL]: 0xff0000,
  }[options.severity];
  
  const emoji = {
    [AlertSeverity.INFO]: "ℹ️",
    [AlertSeverity.WARNING]: "⚠️",
    [AlertSeverity.CRITICAL]: "🚨",
  }[options.severity];
  
  const fields: Array<{ name: string; value: string; inline?: boolean }> = [
    {
      name: "Severity",
      value: options.severity.toUpperCase(),
      inline: true,
    },
    {
      name: "Timestamp",
      value: new Date().toISOString(),
      inline: true,
    },
  ];
  
  if (options.endpoint) {
    fields.push({ name: "Endpoint", value: options.endpoint, inline: true });
  }
  
  if (options.userId) {
    fields.push({ name: "User ID", value: options.userId, inline: true });
  }
  
  if (options.metadata) {
    fields.push({
      name: "Metadata",
      value: `\`\`\`json\n${JSON.stringify(options.metadata, null, 2)}\n\`\`\``,
      inline: false,
    });
  }
  
  const payload = {
    embeds: [
      {
        title: `${emoji} ${options.title}`,
        description: options.message,
        color,
        fields,
        footer: {
          text: "PareL Monitoring",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };
  
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      logger.error(`Discord alert failed: ${response.statusText}`);
    }
  } catch (error) {
    logger.error("Failed to send Discord alert:", error as Error);
  }
}

/**
 * Send alert to all configured channels
 */
export async function sendAlert(options: AlertOptions): Promise<void> {
  logger.info(`Sending ${options.severity} alert: ${options.title}`);
  
  // Only send warnings and critical alerts to avoid spam
  if (options.severity === AlertSeverity.INFO && process.env.NODE_ENV === "production") {
    return;
  }
  
  await Promise.all([sendSlackAlert(options), sendDiscordAlert(options)]);
}

/**
 * Convenience functions
 */
export const alertInfo = (title: string, message: string, metadata?: Record<string, any>) =>
  sendAlert({ title, message, severity: AlertSeverity.INFO, metadata });

export const alertWarning = (title: string, message: string, metadata?: Record<string, any>) =>
  sendAlert({ title, message, severity: AlertSeverity.WARNING, metadata });

export const alertCritical = (title: string, message: string, metadata?: Record<string, any>) =>
  sendAlert({ title, message, severity: AlertSeverity.CRITICAL, metadata });













