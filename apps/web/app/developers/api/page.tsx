/**
 * Public API Documentation Page
 * Developer documentation for AURE Public API
 * v0.38.15 - AURE Public API
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Key, Zap, AlertCircle } from 'lucide-react';

export default function DevelopersApiPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AURE Public API</h1>
        <p className="text-gray-600">
          External API for integrating AI Universal Rating Engine into your applications
        </p>
      </div>

      <div className="space-y-6">
        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700">
              The AURE Public API allows external applications to submit content for AI rating and receive detailed metrics, summaries, and feedback.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Base URL:</p>
              <code className="text-sm">https://parel.app/api/public/rating</code>
            </div>
          </CardContent>
        </Card>

        {/* Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700">
              All requests require an API key. Include it in one of the following ways:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
              <li><strong>Authorization header:</strong> <code>Authorization: Bearer YOUR_API_KEY</code></li>
              <li><strong>X-API-Key header:</strong> <code>X-API-Key: YOUR_API_KEY</code></li>
              <li><strong>Request body:</strong> <code>{`{ "apiKey": "YOUR_API_KEY", ... }`}</code></li>
            </ul>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Contact support to obtain an API key. Set <code>PUBLIC_API_KEY</code> environment variable for access.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Rate Limiting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Rate Limiting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700">
              Rate limits are enforced per API key:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
              <li><strong>Limit:</strong> 10 requests per minute</li>
              <li><strong>Window:</strong> Rolling 60-second window</li>
            </ul>
            <p className="text-sm text-gray-600 mt-2">
              Rate limit headers are included in responses:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
              <li><code>X-RateLimit-Limit</code> - Maximum requests per window</li>
              <li><code>X-RateLimit-Remaining</code> - Remaining requests in current window</li>
              <li><code>X-RateLimit-Reset</code> - Unix timestamp when limit resets</li>
              <li><code>Retry-After</code> - Seconds to wait before retrying (on 429 errors)</li>
            </ul>
          </CardContent>
        </Card>

        {/* Request Example */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Request Example
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">POST /api/public/rating</p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
{`{
  "apiKey": "your-api-key-here",
  "category": "snack",
  "imageUrl": "https://example.com/image.jpg",
  "text": "Optional description"
}`}
              </pre>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Request Body Fields:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li><code>apiKey</code> (required) - Your API key</li>
                <li><code>category</code> (required) - Category name (e.g., "snack", "outfit", "car") or template ID (e.g., "template:xyz")</li>
                <li><code>imageUrl</code> (optional) - URL to image for rating</li>
                <li><code>text</code> (optional) - Text description (either imageUrl or text required)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Response Example */}
        <Card>
          <CardHeader>
            <CardTitle>Response Example</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Success Response (200):</p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
{`{
  "success": true,
  "metrics": {
    "creativity": 75,
    "visualAppeal": 82,
    "vibeScore": 68
  },
  "summary": "This snack has a nice balance...",
  "roast": "This snack is so good, it should be illegal! 🍪",
  "requestId": "clx123abc",
  "timestamp": "2025-11-24T12:00:00.000Z"
}`}
              </pre>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Error Responses:</p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-red-600">401 Unauthorized</p>
                  <pre className="bg-red-50 border border-red-200 p-2 rounded text-xs mt-1">
{`{
  "success": false,
  "error": "Invalid or missing API key"
}`}
                  </pre>
                </div>
                <div>
                  <p className="text-xs font-medium text-orange-600">429 Too Many Requests</p>
                  <pre className="bg-orange-50 border border-orange-200 p-2 rounded text-xs mt-1">
{`{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 45
}`}
                  </pre>
                </div>
                <div>
                  <p className="text-xs font-medium text-yellow-600">400 Bad Request</p>
                  <pre className="bg-yellow-50 border border-yellow-200 p-2 rounded text-xs mt-1">
{`{
  "success": false,
  "error": "Either imageUrl or text must be provided"
}`}
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Available Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-2">Built-in categories:</p>
            <div className="flex flex-wrap gap-2">
              {['snack', 'outfit', 'car', 'room', 'gift', 'pet'].map((cat) => (
                <span key={cat} className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                  {cat}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-4">
              You can also use public template IDs in the format: <code>template:xyz</code>
            </p>
          </CardContent>
        </Card>

        {/* cURL Example */}
        <Card>
          <CardHeader>
            <CardTitle>cURL Example</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
{`curl -X POST https://parel.app/api/public/rating \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your-api-key-here" \\
  -d '{
    "category": "snack",
    "imageUrl": "https://example.com/image.jpg"
  }'`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

