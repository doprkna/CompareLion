import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export default function FAQPage() {
  const faqs = [
    {
      question: "What is PareL?",
      answer: "PareL is a gamified task routing platform that helps you complete flows, earn XP, and unlock achievements."
    },
    {
      question: "How do I earn XP?",
      answer: "Complete question flows, send messages, unlock achievements, and maintain daily streaks to earn XP."
    },
    {
      question: "What are achievements?",
      answer: "Achievements are milestones you unlock by completing specific tasks. Each achievement rewards bonus XP."
    },
    {
      question: "How does the leveling system work?",
      answer: "Your level is calculated from your total XP. Higher levels unlock new features and rewards."
    },
    {
      question: "Can I customize my profile?",
      answer: "Yes! Visit the Profile page to manage your settings, view stats, and customize your character."
    },
  ];

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-accent mb-2">Frequently Asked Questions</h1>
          <p className="text-subtle">Find answers to common questions about PareL</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="bg-card border-border text-text">
              <CardHeader>
                <CardTitle className="text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-subtle">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-card border border-accent text-text">
          <CardContent className="p-6 text-center">
            <p className="text-subtle">
              Still have questions? <a href="/info/contact" className="text-accent hover:underline">Contact us</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}













