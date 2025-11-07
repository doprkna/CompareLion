/**
 * Webhook Notification System
 * 
 * Sends notifications when database reseed is triggered
 * Supports Discord webhooks and generic HTTP endpoints
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface WebhookConfig {
  discord?: {
    webhookUrl: string;
  };
  generic?: {
    url: string;
    headers?: Record<string, string>;
  };
}

class WebhookNotifier {
  private config: WebhookConfig;

  constructor() {
    this.config = {
      discord: process.env.DISCORD_WEBHOOK_URL ? {
        webhookUrl: process.env.DISCORD_WEBHOOK_URL,
      } : undefined,
      generic: process.env.WEBHOOK_URL ? {
        url: process.env.WEBHOOK_URL,
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.WEBHOOK_HEADERS ? JSON.parse(process.env.WEBHOOK_HEADERS) : {}),
        },
      } : undefined,
    };
  }

  async notifyReseed(recordCount: number, timestamp: string): Promise<void> {
    const message = {
      title: '🔄 Database Auto-Reseed Triggered',
      description: `Database was automatically reseeded due to low record count.`,
      fields: [
        {
          name: 'Records Created',
          value: recordCount.toString(),
          inline: true,
        },
        {
          name: 'Timestamp',
          value: timestamp,
          inline: true,
        },
        {
          name: 'Environment',
          value: process.env.NODE_ENV || 'development',
          inline: true,
        },
      ],
      color: 0x00ff00, // Green
    };

    // Send Discord notification
    if (this.config.discord) {
      await this.sendDiscordNotification(message);
    }

    // Send generic webhook
    if (this.config.generic) {
      await this.sendGenericWebhook(message);
    }
  }

  private async sendDiscordNotification(message: any): Promise<void> {
    try {
      const discordPayload = {
        embeds: [{
          title: message.title,
          description: message.description,
          fields: message.fields,
          color: message.color,
          timestamp: new Date().toISOString(),
        }],
      };

      const curlCommand = `curl -X POST "${this.config.discord!.webhookUrl}" -H "Content-Type: application/json" -d '${JSON.stringify(discordPayload)}'`;
      await execAsync(curlCommand);
      
      console.log('📢 Discord notification sent');
    } catch (error) {
      console.error('❌ Discord notification failed:', error);
    }
  }

  private async sendGenericWebhook(message: any): Promise<void> {
    try {
      const curlCommand = `curl -X POST "${this.config.generic!.url}" -H "Content-Type: application/json" -d '${JSON.stringify(message)}'`;
      await execAsync(curlCommand);
      
      console.log('📢 Generic webhook notification sent');
    } catch (error) {
      console.error('❌ Generic webhook notification failed:', error);
    }
  }
}

export { WebhookNotifier };

























