"use client";
import React from 'react';

export default function LegalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Legal & Info</h1>
        <div className="space-y-6">
          <div className="border rounded p-4 bg-gray-50">
            <h2 className="font-semibold mb-2">GDPR & Privacy Policy</h2>
            <p className="text-gray-600">[Placeholder for GDPR and privacy policy document]</p>
          </div>
          <div className="border rounded p-4 bg-gray-50">
            <h2 className="font-semibold mb-2">Code of Conduct</h2>
            <p className="text-gray-600">[Placeholder for code of conduct]</p>
          </div>
          <div className="border rounded p-4 bg-gray-50">
            <h2 className="font-semibold mb-2">Company Info</h2>
            <p className="text-gray-600">[Placeholder for company information, address, registration, etc.]</p>
          </div>
          <div className="border rounded p-4 bg-gray-50">
            <h2 className="font-semibold mb-2">FAQ</h2>
            <p className="text-gray-600">[Placeholder for frequently asked questions]</p>
          </div>
          <div className="border rounded p-4 bg-gray-50">
            <h2 className="font-semibold mb-2">Other Legal Documents</h2>
            <p className="text-gray-600">[Placeholder for terms of service, disclaimers, etc.]</p>
          </div>
        </div>
      </div>
    </div>
  );
}
