"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function RoadmapPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">🚀 Roadmap</h1>
      <Card className="rounded-2xl shadow-md">
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">
            Our roadmap will be displayed here soon.  
            Stay tuned for upcoming features and milestones!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
