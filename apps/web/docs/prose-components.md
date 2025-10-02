# Prose Components

This document explains how to use the prose components for consistent typography and markdown content rendering.

## Overview

The prose components provide consistent typography styling for markdown content with proper dark mode support. They use neutral tokens to prevent inheritance of random brand colors and ensure readability in both light and dark themes.

## Installation

The prose components require the `@tailwindcss/typography` plugin, which is already installed and configured in this project.

## Components

### `Prose`

The base prose component with customizable max width and styling.

```tsx
import { Prose } from '@/components/ui/prose';

<Prose maxWidth="4xl" className="mx-auto">
  <h1>Your Content Here</h1>
  <p>This content will be styled with neutral prose tokens.</p>
</Prose>
```

**Props:**
- `maxWidth`: Controls maximum width ("none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl")
- `className`: Additional CSS classes
- `children`: Content to render

### `ChangelogProse`

Specialized component for changelog content with proper indentation.

```tsx
import { ChangelogProse } from '@/components/ui/prose';

<ChangelogProse>
  <h3>Added</h3>
  <ul>
    <li>New feature</li>
    <li>Another feature</li>
  </ul>
</ChangelogProse>
```

### `DocsProse`

Component for documentation content with centered layout and optimal reading width.

```tsx
import { DocsProse } from '@/components/ui/prose';

<DocsProse>
  <h1>Documentation Title</h1>
  <p>Documentation content...</p>
</DocsProse>
```

### `BlogProse`

Component for blog posts with centered layout and comfortable reading width.

```tsx
import { BlogProse } from '@/components/ui/prose';

<BlogProse>
  <h1>Blog Post Title</h1>
  <p>Blog post content...</p>
</BlogProse>
```

## Key Features

### Neutral Tokens

All prose components use `prose-neutral` to ensure consistent, neutral styling that doesn't inherit random brand colors:

```tsx
<div className="prose prose-neutral dark:prose-invert max-w-none">
  {/* Your content */}
</div>
```

### Dark Mode Support

Automatic dark mode support with `dark:prose-invert`:

- Light mode: Uses neutral colors for optimal readability
- Dark mode: Inverts colors appropriately while maintaining contrast
- Seamless transition between themes

### Responsive Design

Components are responsive and work well on all screen sizes:

- Mobile: Full width with appropriate padding
- Tablet: Optimized reading width
- Desktop: Centered layout with max width constraints

## Usage Examples

### Basic Markdown Content

```tsx
<Prose>
  <h1>Heading 1</h1>
  <h2>Heading 2</h2>
  <p>This is a paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
  <ul>
    <li>List item 1</li>
    <li>List item 2</li>
  </ul>
  <blockquote>
    This is a blockquote.
  </blockquote>
</Prose>
```

### Code Content

```tsx
<Prose>
  <p>Here's some inline <code>code</code>.</p>
  <pre><code>
function example() {
  return "Hello, World!";
}
  </code></pre>
</Prose>
```

### Links and Navigation

```tsx
<Prose>
  <p>
    Visit our <a href="/docs">documentation</a> for more information.
  </p>
</Prose>
```

## Best Practices

### When to Use Prose Components

- ✅ Markdown content rendering
- ✅ Documentation pages
- ✅ Blog posts and articles
- ✅ Changelog entries
- ✅ Rich text content

### When NOT to Use Prose Components

- ❌ UI component styling (use shadcn/ui components instead)
- ❌ Form elements
- ❌ Navigation menus
- ❌ Interactive elements

### Styling Guidelines

1. **Use neutral tokens**: Always use `prose-neutral` to prevent color inheritance
2. **Add dark mode**: Include `dark:prose-invert` for proper dark mode support
3. **Set max width**: Use appropriate max width for content type
4. **Maintain consistency**: Use the same prose component for similar content types

## Migration Guide

### From Custom Styling

If you have existing markdown content with custom styling, migrate to prose components:

**Before:**
```tsx
<div className="custom-markdown-styles">
  <h1>Title</h1>
  <p>Content</p>
</div>
```

**After:**
```tsx
<Prose>
  <h1>Title</h1>
  <p>Content</p>
</Prose>
```

### From Other Typography Libraries

If migrating from other typography libraries:

1. Remove old typography imports
2. Replace with prose components
3. Update any custom CSS that conflicts with prose styling
4. Test dark mode compatibility

## Troubleshooting

### Common Issues

**Colors not neutral:**
- Ensure you're using `prose-neutral` class
- Check for conflicting CSS rules
- Verify Tailwind typography plugin is installed

**Dark mode not working:**
- Add `dark:prose-invert` class
- Check if dark mode is properly configured in your app
- Verify CSS variables are defined for dark mode

**Content too wide/narrow:**
- Adjust `maxWidth` prop
- Use responsive classes if needed
- Consider using specialized prose components (DocsProse, BlogProse)

### Performance

Prose components are lightweight and don't impact performance:

- CSS classes are processed at build time
- No JavaScript overhead
- Minimal bundle size impact
- Optimized for production builds

## Examples

See `components/examples/ProseExample.tsx` for comprehensive examples of all prose components in action.
