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
async function sendDiscordWebhook(
  webhookUrl: string,
  deployment: DeploymentInfo
) {
  const color = deployment.status === "success" ? 5763719 : 15158332;
  const emoji = deployment.status === "success" ? "✅" : "❌";
  const title = deployment.status === "success"
    ? `${emoji} ${deployment.environment.toUpperCase()} Deployment Success`
    : `${emoji} ${deployment.environment.toUpperCase()} Deployment Failed`;
  
  const fields: Array<{ name: string; value: string; inline?: boolean }> = [
    { name: "Environment", value: deployment.environment, inline: true },
    { name: "Version", value: deployment.version, inline: true },
    { name: "Commit", value: deployment.commit.slice(0, 7), inline: true },
    { name: "Author", value: deployment.author, inline: true },
    { name: "URL", value: deployment.url, inline: false },
  ];
  
  if (deployment.duration) {
    const minutes = Math.floor(deployment.duration / 60);
    const seconds = deployment.duration % 60;
    fields.push({
      name: "Duration",
      value: `${minutes}m ${seconds}s`,
      inline: true,
    });
  }
  
  if (deployment.tests) {
    fields.push({
      name: "Tests",
      value: `${deployment.tests.passed}/${deployment.tests.total} passed`,
      inline: true,
    });
  }
  
  if (deployment.coverage) {
    fields.push({
      name: "Coverage",
      value: `${deployment.coverage.toFixed(1)}%`,
      inline: true,
    });
  }
  
  const payload = {
    embeds: [
      {
        title,
        description: `PareL v${deployment.version} deployment ${deployment.status}`,
        color,
        fields,
        footer: {
          text: "PareL CI/CD",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };
  
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    throw new Error(`Discord webhook failed: ${response.statusText}`);
  }
}

/**
 * Send Slack webhook
 */
async function sendSlackWebhook(
  webhookUrl: string,
  deployment: DeploymentInfo
) {
  const color = deployment.status === "success" ? "good" : "danger";
  const emoji = deployment.status === "success" ? ":white_check_mark:" : ":x:";
  const title = deployment.status === "success"
    ? `${emoji} ${deployment.environment.toUpperCase()} Deployment Success`
    : `${emoji} ${deployment.environment.toUpperCase()} Deployment Failed`;
  
  const fields = [
    { title: "Environment", value: deployment.environment, short: true },
    { title: "Version", value: deployment.version, short: true },
    { title: "Commit", value: deployment.commit.slice(0, 7), short: true },
    { title: "Author", value: deployment.author, short: true },
    { title: "URL", value: deployment.url, short: false },
  ];
  
  if (deployment.duration) {
    const minutes = Math.floor(deployment.duration / 60);
    const seconds = deployment.duration % 60;
    fields.push({
      title: "Duration",
      value: `${minutes}m ${seconds}s`,
      short: true,
    });
  }
  
  if (deployment.tests) {
    fields.push({
      title: "Tests",
      value: `${deployment.tests.passed}/${deployment.tests.total} passed`,
      short: true,
    });
  }
  
  if (deployment.coverage) {
    fields.push({
      title: "Coverage",
      value: `${deployment.coverage.toFixed(1)}%`,
      short: true,
    });
  }
  
  const payload = {
    attachments: [
      {
        color,
        title,
        text: `PareL v${deployment.version} deployment ${deployment.status}`,
        fields,
        footer: "PareL CI/CD",
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };
  
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    throw new Error(`Slack webhook failed: ${response.statusText}`);
  }
}

/**
 * Main function
 */
async function main() {
  const deployment: DeploymentInfo = {
    environment: (process.env.DEPLOYMENT_ENV as any) || "staging",
    version: process.env.VERSION || "unknown",
    commit: process.env.COMMIT_SHA || "unknown",
    author: process.env.COMMIT_AUTHOR || "unknown",
    url: process.env.DEPLOYMENT_URL || "unknown",
    status: (process.env.DEPLOYMENT_STATUS as any) || "success",
    duration: process.env.DEPLOYMENT_DURATION
      ? parseInt(process.env.DEPLOYMENT_DURATION)
      : undefined,
    tests: process.env.TEST_RESULTS
      ? JSON.parse(process.env.TEST_RESULTS)
      : undefined,
    coverage: process.env.COVERAGE
      ? parseFloat(process.env.COVERAGE)
      : undefined,
  };
  
  console.log("📢 Sending deployment webhook...");
  console.log(JSON.stringify(deployment, null, 2));
  
  const promises: Promise<void>[] = [];
  
  // Send to Discord
  if (process.env.DISCORD_WEBHOOK_URL) {
    promises.push(
      sendDiscordWebhook(process.env.DISCORD_WEBHOOK_URL, deployment)
    );
  }
  
  // Send to Slack
  if (process.env.SLACK_WEBHOOK_URL) {
    promises.push(sendSlackWebhook(process.env.SLACK_WEBHOOK_URL, deployment));
  }
  
  if (promises.length === 0) {
    console.log("⚠️  No webhooks configured, skipping notifications");
    return;
  }
  
  await Promise.all(promises);
  
  console.log("✅ Webhook notifications sent successfully");
}

main().catch((error) => {
  console.error("❌ Webhook failed:", error);
  process.exit(1);
});













