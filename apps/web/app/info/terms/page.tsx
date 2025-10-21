import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-accent mb-2">Terms of Service</h1>
          <p className="text-subtle">Last updated: October 14, 2025</p>
        </div>

        <Card className="bg-card border-border text-text">
          <CardContent className="p-8 prose prose-invert max-w-none">
            <h2 className="text-2xl font-bold text-text mb-4">1. Acceptance of Terms</h2>
            <p className="text-subtle mb-6">
              By accessing and using PareL, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2 className="text-2xl font-bold text-text mb-4">2. Use License</h2>
            <p className="text-subtle mb-6">
              Permission is granted to temporarily use PareL for personal, non-commercial purposes. 
              This is the grant of a license, not a transfer of title.
            </p>

            <h2 className="text-2xl font-bold text-text mb-4">3. User Accounts</h2>
            <p className="text-subtle mb-6">
              You are responsible for maintaining the confidentiality of your account and password. 
              You agree to accept responsibility for all activities that occur under your account.
            </p>

            <h2 className="text-2xl font-bold text-text mb-4">4. Virtual Currency</h2>
            <p className="text-subtle mb-6">
              XP, Gold, and Diamonds are virtual currencies with no real-world value. 
              They cannot be exchanged for real money.
            </p>

            <h2 className="text-2xl font-bold text-text mb-4">5. Limitation of Liability</h2>
            <p className="text-subtle mb-6">
              PareL shall not be held liable for any damages arising from the use or inability to use the service.
            </p>

            <h2 className="text-2xl font-bold text-text mb-4">6. Changes to Terms</h2>
            <p className="text-subtle">
              We reserve the right to modify these terms at any time. 
              Continued use of the service constitutes acceptance of modified terms.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}











