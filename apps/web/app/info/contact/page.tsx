import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare, Github } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-accent mb-2">Contact Us</h1>
          <p className="text-subtle">Get in touch with the PareL team</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-card border-border text-text">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-accent" />
                Email Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-subtle mb-4">
                For general inquiries and support requests:
              </p>
              <a 
                href="mailto:support@parel.app"
                className="text-accent hover:underline font-semibold"
              >
                support@parel.app
              </a>
            </CardContent>
          </Card>

          <Card className="bg-card border-border text-text">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-accent" />
                Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-subtle mb-4">
                Join our community for discussions and updates:
              </p>
              <a 
                href="#"
                className="text-accent hover:underline font-semibold"
              >
                Discord Community (Coming Soon)
              </a>
            </CardContent>
          </Card>

          <Card className="bg-card border-border text-text">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5 text-accent" />
                Development
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-subtle mb-4">
                Report bugs or contribute to the project:
              </p>
              <a 
                href="#"
                className="text-accent hover:underline font-semibold"
              >
                GitHub Repository
              </a>
            </CardContent>
          </Card>

          <Card className="bg-card border-border text-text">
            <CardHeader>
              <CardTitle>Business Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-subtle mb-4">
                For partnerships and business opportunities:
              </p>
              <a 
                href="mailto:business@parel.app"
                className="text-accent hover:underline font-semibold"
              >
                business@parel.app
              </a>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border border-border text-text">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-3">Office Hours</h3>
            <p className="text-subtle">
              We typically respond within 24-48 hours during business days (Monday-Friday, 9 AM - 5 PM CET).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}










