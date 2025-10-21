'use client';

import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function SettingsAccordion() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <Card className="bg-card border-border text-text">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Account Settings */}
        <div className="border border-border rounded-lg">
          <button
            onClick={() => toggleSection("account")}
            className="w-full flex items-center justify-between p-4 hover:bg-bg/50 transition-colors"
          >
            <span className="font-semibold text-text">Account Settings</span>
            {openSection === "account" ? (
              <ChevronDown className="h-5 w-5 text-subtle" />
            ) : (
              <ChevronRight className="h-5 w-5 text-subtle" />
            )}
          </button>
          {openSection === "account" && (
            <div className="p-4 border-t border-border space-y-3">
              <div>
                <label className="text-sm text-subtle block mb-1">Email</label>
                <input
                  type="email"
                  className="w-full bg-bg border border-border rounded px-3 py-2 text-text"
                  placeholder="demo@example.com"
                  disabled
                />
              </div>
              <div>
                <label className="text-sm text-subtle block mb-1">Display Name</label>
                <input
                  type="text"
                  className="w-full bg-bg border border-border rounded px-3 py-2 text-text"
                  placeholder="Your name"
                />
              </div>
              <button className="bg-accent text-white px-4 py-2 rounded hover:opacity-90">
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Preferences */}
        <div className="border border-border rounded-lg">
          <button
            onClick={() => toggleSection("preferences")}
            className="w-full flex items-center justify-between p-4 hover:bg-bg/50 transition-colors"
          >
            <span className="font-semibold text-text">Preferences</span>
            {openSection === "preferences" ? (
              <ChevronDown className="h-5 w-5 text-subtle" />
            ) : (
              <ChevronRight className="h-5 w-5 text-subtle" />
            )}
          </button>
          {openSection === "preferences" && (
            <div className="p-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-text">Email Notifications</span>
                <input type="checkbox" className="h-4 w-4" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text">Sound Effects</span>
                <input type="checkbox" className="h-4 w-4" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text">Show Online Status</span>
                <input type="checkbox" className="h-4 w-4" defaultChecked />
              </div>
            </div>
          )}
        </div>

        {/* Privacy */}
        <div className="border border-border rounded-lg">
          <button
            onClick={() => toggleSection("privacy")}
            className="w-full flex items-center justify-between p-4 hover:bg-bg/50 transition-colors"
          >
            <span className="font-semibold text-text">Privacy</span>
            {openSection === "privacy" ? (
              <ChevronDown className="h-5 w-5 text-subtle" />
            ) : (
              <ChevronRight className="h-5 w-5 text-subtle" />
            )}
          </button>
          {openSection === "privacy" && (
            <div className="p-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-text">Profile Visibility</span>
                <select className="bg-bg border border-border rounded px-3 py-1 text-text">
                  <option>Public</option>
                  <option>Friends Only</option>
                  <option>Private</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text">Allow Messages From</span>
                <select className="bg-bg border border-border rounded px-3 py-1 text-text">
                  <option>Everyone</option>
                  <option>Friends Only</option>
                  <option>Nobody</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}










