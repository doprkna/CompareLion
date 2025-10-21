import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-accent mb-2">Privacy Policy</h1>
          <p className="text-subtle">Last updated: October 14, 2025</p>
        </div>

        <Card className="bg-card border-border text-text">
          <CardContent className="p-8 prose prose-invert max-w-none">
            <h2 className="text-2xl font-bold text-text mb-4">1. Information We Collect</h2>
            <p className="text-subtle mb-6">
              We collect information you provide directly to us, including:
            </p>
            <ul className="text-subtle mb-6 list-disc list-inside">
              <li>Email address and name</li>
              <li>Profile information and preferences</li>
              <li>Activity data (questions answered, messages sent)</li>
              <li>Usage analytics and performance metrics</li>
            </ul>

            <h2 className="text-2xl font-bold text-text mb-4">2. How We Use Your Information</h2>
            <p className="text-subtle mb-6">
              We use the information we collect to:
            </p>
            <ul className="text-subtle mb-6 list-disc list-inside">
              <li>Provide, maintain, and improve our services</li>
              <li>Personalize your experience</li>
              <li>Send you technical notices and updates</li>
              <li>Respond to your comments and questions</li>
            </ul>

            <h2 className="text-2xl font-bold text-text mb-4">3. Data Security</h2>
            <p className="text-subtle mb-6">
              We implement appropriate security measures to protect your personal information. 
              Passwords are hashed using industry-standard algorithms (Argon2id).
            </p>

            <h2 className="text-2xl font-bold text-text mb-4">4. Third-Party Services</h2>
            <p className="text-subtle mb-6">
              We may use third-party services for analytics and authentication (Google, Facebook, etc.). 
              These services have their own privacy policies.
            </p>

            <h2 className="text-2xl font-bold text-text mb-4">5. Your Rights</h2>
            <p className="text-subtle mb-6">
              You have the right to access, update, or delete your personal information at any time. 
              Contact us at privacy@parel.app for data requests.
            </p>

            <h2 className="text-2xl font-bold text-text mb-4">6. Changes to Privacy Policy</h2>
            <p className="text-subtle">
              We may update this privacy policy from time to time. 
              We will notify you of any changes by posting the new policy on this page.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}










