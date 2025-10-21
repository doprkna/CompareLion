import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        {/* 404 Number */}
        <div className="text-9xl font-black text-accent opacity-20">
          404
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-text">
            Page Not Found
          </h1>
          <p className="text-subtle text-lg">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Search Icon */}
        <div className="flex justify-center">
          <Search className="h-24 w-24 text-subtle opacity-30" />
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center pt-6">
          <Link href="/main">
            <Button className="bg-accent text-white hover:opacity-90">
              <Home className="h-5 w-5 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Link href="/info/contact">
            <Button variant="outline" className="border-border text-text hover:bg-card/50">
              Contact Support
            </Button>
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="pt-8 border-t border-border">
          <p className="text-subtle text-sm mb-4">You might be looking for:</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/profile" className="text-accent hover:underline text-sm">
              Profile
            </Link>
            <span className="text-subtle">•</span>
            <Link href="/shop" className="text-accent hover:underline text-sm">
              Shop
            </Link>
            <span className="text-subtle">•</span>
            <Link href="/leaderboard" className="text-accent hover:underline text-sm">
              Leaderboard
            </Link>
            <span className="text-subtle">•</span>
            <Link href="/info/faq" className="text-accent hover:underline text-sm">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
