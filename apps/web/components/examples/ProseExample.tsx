import React from 'react';
import { Prose, ChangelogProse, DocsProse, BlogProse } from '@/components/ui/prose';

/**
 * Example component demonstrating proper usage of prose components
 * with neutral tokens and dark mode support
 */
export function ProseExample() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-4">Prose Components Examples</h1>
        <p className="text-gray-600">
          Examples showing how to use prose components with neutral tokens and proper dark mode support.
        </p>
      </div>

      {/* Basic Prose Example */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Basic Prose</h2>
        <Prose>
          <h1>Heading 1</h1>
          <h2>Heading 2</h2>
          <h3>Heading 3</h3>
          <p>
            This is a paragraph with <strong>bold text</strong> and <em>italic text</em>.
            It also contains a <a href="#">link</a> and some <code>inline code</code>.
          </p>
          <ul>
            <li>First list item</li>
            <li>Second list item with <a href="#">a link</a></li>
            <li>Third list item</li>
          </ul>
          <blockquote>
            This is a blockquote with some important information.
          </blockquote>
          <pre><code>{`// This is a code block
function example() {
  return "Hello, World!";
}`}</code></pre>
        </Prose>
      </section>

      {/* Changelog Prose Example */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Changelog Prose</h2>
        <ChangelogProse>
          <h3>Added</h3>
          <ul>
            <li>New feature for user authentication</li>
            <li>Dashboard improvements</li>
          </ul>
          <h3>Changed</h3>
          <ul>
            <li>Updated API endpoints</li>
            <li>Improved performance</li>
          </ul>
          <h3>Fixed</h3>
          <ul>
            <li>Bug in user registration</li>
            <li>Issue with dark mode</li>
          </ul>
        </ChangelogProse>
      </section>

      {/* Documentation Prose Example */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Documentation Prose</h2>
        <DocsProse>
          <h1>Getting Started</h1>
          <p>Welcome to our documentation. This section will help you get up and running quickly.</p>
          
          <h2>Installation</h2>
          <p>To install our package, run the following command:</p>
          <pre><code>npm install @parel/web</code></pre>
          
          <h2>Usage</h2>
          <p>Here's a simple example of how to use our components:</p>
          <pre><code>{`import { Prose } from '@parel/web/components/ui/prose';

function MyComponent() {
  return (
    <Prose>
      <h1>Hello World</h1>
      <p>This is some content.</p>
    </Prose>
  );
}`}</code></pre>
          
          <h2>Configuration</h2>
          <p>You can configure the prose component with various options:</p>
          <ul>
            <li><code>maxWidth</code>: Controls the maximum width of the content</li>
            <li><code>className</code>: Additional CSS classes</li>
            <li><code>children</code>: The content to render</li>
          </ul>
        </DocsProse>
      </section>

      {/* Blog Prose Example */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Blog Prose</h2>
        <BlogProse>
          <h1>Building Better User Interfaces</h1>
          <p className="text-gray-600 italic">
            Published on {new Date().toLocaleDateString()} by John Doe
          </p>
          
          <p>
            In today's digital landscape, creating user interfaces that are both beautiful and functional 
            is more important than ever. This article explores the key principles and techniques for 
            building better UIs.
          </p>
          
          <h2>Design Principles</h2>
          <p>When designing user interfaces, there are several key principles to keep in mind:</p>
          
          <h3>1. Consistency</h3>
          <p>
            Consistency in design helps users understand and navigate your interface more easily. 
            This includes consistent use of colors, typography, spacing, and interaction patterns.
          </p>
          
          <h3>2. Accessibility</h3>
          <p>
            Ensuring your interface is accessible to all users is not just good practice—it's essential. 
            This includes proper color contrast, keyboard navigation, and screen reader support.
          </p>
          
          <blockquote>
            "Good design is not just what looks good, but what works well for the user."
          </blockquote>
          
          <h2>Implementation Tips</h2>
          <p>Here are some practical tips for implementing these principles:</p>
          <ul>
            <li>Use a design system or component library</li>
            <li>Test with real users early and often</li>
            <li>Keep performance in mind during design</li>
            <li>Document your design decisions</li>
          </ul>
        </BlogProse>
      </section>

      {/* Dark Mode Toggle Example */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Dark Mode Support</h2>
        <p className="text-gray-600 mb-4">
          All prose components automatically support dark mode with the <code>dark:prose-invert</code> class.
          Toggle your system's dark mode to see the difference.
        </p>
        <Prose>
          <p>
            This content will automatically adapt to dark mode. In light mode, it uses neutral colors,
            and in dark mode, it inverts appropriately while maintaining readability.
          </p>
          <p>
            The <code>prose-neutral</code> class ensures that no random brand colors are inherited,
            providing a clean, neutral appearance that works well in any theme.
          </p>
        </Prose>
      </section>
    </div>
  );
}
