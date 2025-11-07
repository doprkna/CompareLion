/**
 * Email Campaign Script
 * Sends marketing emails to users via Resend API
 * Tracks delivery, opens, and clicks in metrics
 * v0.15.0 - Marketing Expansion
 * 
 * Usage:
 *   pnpm tsx scripts/send-campaign.ts --campaign-id=<id>
 *   pnpm tsx scripts/send-campaign.ts --template=welcome --segment=beta-users
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

// Parse command line args
function parseArgs() {
  const args = process.argv.slice(2);
  const params: Record<string, string> = {};
  
  args.forEach(arg => {
    const [key, value] = arg.split('=');
    if (key && value) {
      params[key.replace('--', '')] = value;
    }
  });
  
  return params;
}

// Load email template from markdown
function loadTemplate(templateName: string): EmailTemplate {
  const templatePath = path.join(process.cwd(), 'scripts', 'email-templates', `${templateName}.md`);
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }
  
  const content = fs.readFileSync(templatePath, 'utf-8');
  const lines = content.split('\n');
  
  const subject = lines[0].replace('# ', '').trim();
  const body = lines.slice(2).join('\n').trim();
  
  return {
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">PareL</h1>
        </div>
        <div style="padding: 30px; background: white;">
          ${body.replace(/\n/g, '<br>')}
        </div>
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© ${new Date().getFullYear()} PareL. All rights reserved.</p>
          <p><a href="{{unsubscribe_url}}" style="color: #667eea;">Unsubscribe</a></p>
        </div>
      </div>
    `,
    text: body
  };
}

// Get users by segment
async function getUsersBySegment(segment: string) {
  switch (segment) {
    case 'all':
      return await prisma.user.findMany({
        where: { newsletterOptIn: true },
        select: { id: true, email: true, name: true }
      });
    
    case 'beta-users':
      return await prisma.user.findMany({
        where: { 
          newsletterOptIn: true,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        select: { id: true, email: true, name: true }
      });
    
    case 'active-users':
      return await prisma.user.findMany({
        where: {
          newsletterOptIn: true,
          lastActiveAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        select: { id: true, email: true, name: true }
      });
    
    case 'waitlist':
      const waitlistEntries = await prisma.waitlist.findMany({
        where: { status: 'pending' },
        select: { email: true }
      });
      return waitlistEntries.map(w => ({ id: 'waitlist', email: w.email, name: null }));
    
    default:
      throw new Error(`Unknown segment: ${segment}`);
  }
}

// Send email via Resend
async function sendEmail(to: string, subject: string, html: string, text: string) {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    console.warn('⚠️ RESEND_API_KEY not set. Skipping actual send (dry run).');
    return { success: true, messageId: `dry-run-${Date.now()}` };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.APP_MAIL_FROM || 'noreply@parel.app',
        to,
        subject,
        html,
        text
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email');
    }

    return { success: true, messageId: data.id };
  } catch (error) {
    console.error(`❌ Failed to send to ${to}:`, error);
    return { success: false, error };
  }
}

// Main campaign execution
async function runCampaign() {
  const args = parseArgs();
  
  console.log('📧 Email Campaign Script');
  console.log('========================\n');

  let campaignId = args['campaign-id'];
  let template = args['template'];
  let segment = args['segment'];
  
  // Load campaign from database or use CLI params
  let campaign;
  if (campaignId) {
    campaign = await prisma.marketingCampaign.findUnique({
      where: { id: campaignId }
    });
    
    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }
    
    if (campaign.status !== 'draft') {
      throw new Error(`Campaign already sent: ${campaign.status}`);
    }
  } else if (!template || !segment) {
    throw new Error('Must provide either --campaign-id or --template + --segment');
  }

  // Load template
  const emailTemplate = campaign 
    ? { subject: campaign.title, html: campaign.content, text: campaign.content }
    : loadTemplate(template!);

  console.log(`📋 Subject: ${emailTemplate.subject}`);
  console.log(`👥 Segment: ${segment || 'from-campaign'}\n`);

  // Get recipients
  const users = segment 
    ? await getUsersBySegment(segment)
    : []; // In real implementation, load from campaign.recipientList

  console.log(`✉️ Sending to ${users.length} recipients...\n`);

  // Update campaign status
  if (campaignId && campaign) {
    await prisma.marketingCampaign.update({
      where: { id: campaignId },
      data: { 
        status: 'sending',
        sentAt: new Date()
      }
    });
  }

  // Send emails
  let sent = 0;
  let failed = 0;

  for (const user of users) {
    const result = await sendEmail(
      user.email,
      emailTemplate.subject,
      emailTemplate.html,
      emailTemplate.text || ''
    );

    if (result.success) {
      sent++;
      console.log(`✅ Sent to ${user.email}`);
    } else {
      failed++;
      console.log(`❌ Failed to send to ${user.email}`);
    }

    // Rate limit: 10 emails per second max
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n========================');
  console.log(`✅ Sent: ${sent}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Success rate: ${((sent / users.length) * 100).toFixed(1)}%`);

  // Update campaign final status
  if (campaignId && campaign) {
    await prisma.marketingCampaign.update({
      where: { id: campaignId },
      data: {
        status: 'sent',
        deliveredCount: sent
      }
    });
  }

  // Track metrics
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        events: [{
          name: 'campaign_sent',
          timestamp: Date.now(),
          data: {
            campaignId,
            sent,
            failed,
            segment
          }
        }]
      })
    });
  } catch (err) {
    console.error('Error tracking metrics:', err);
  }
}

// Run
runCampaign()
  .then(() => {
    console.log('\n✅ Campaign complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Campaign failed:', error.message);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

