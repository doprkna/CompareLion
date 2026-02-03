#!/usr/bin/env tsx
/**
 * Deployment Webhook (v0.11.6)
 *
 * Send deployment summary to Discord/Slack.
 */
interface DeploymentInfo {
    environment: "staging" | "production";
    version: string;
    commit: string;
    author: string;
    url: string;
    status: "success" | "failure";
    duration?: number;
    tests?: {
        passed: number;
        total: number;
    };
    coverage?: number;
}
/**
 * Send Discord webhook
 */
declare function sendDiscordWebhook(webhookUrl: string, deployment: DeploymentInfo): Promise<void>;
/**
 * Send Slack webhook
 */
declare function sendSlackWebhook(webhookUrl: string, deployment: DeploymentInfo): Promise<void>;
/**
 * Main function
 */
declare function main(): Promise<void>;
