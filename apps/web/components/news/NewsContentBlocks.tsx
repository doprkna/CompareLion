'use client';

import Image from 'next/image';

export type ContentBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'image'; url: string; caption?: string }
  | { type: 'video'; url: string };

const VIDEO_DOMAINS = ['youtube.com', 'youtu.be', 'vimeo.com', 'player.vimeo.com'];

function isAllowedVideoUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return VIDEO_DOMAINS.some((d) => u.hostname.includes(d));
  } catch {
    return false;
  }
}

export function NewsContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  if (!Array.isArray(blocks)) return null;

  return (
    <div className="news-content space-y-4">
      {blocks.map((b, i) => {
        if (b.type === 'p' && 'text' in b)
          return <p key={i} className="text-text">{b.text}</p>;
        if (b.type === 'h2' && 'text' in b)
          return <h2 key={i} className="text-xl font-bold text-text mt-6 mb-2">{b.text}</h2>;
        if (b.type === 'bullets' && 'items' in b)
          return (
            <ul key={i} className="list-disc list-inside space-y-1 text-text">
              {b.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        if (b.type === 'image' && 'url' in b)
          return (
            <figure key={i} className="my-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                  src={b.url}
                  alt={b.caption ?? ''}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 720px"
                  unoptimized
                />
              </div>
              {b.caption && <figcaption className="text-sm text-subtle mt-1">{b.caption}</figcaption>}
            </figure>
          );
        if (b.type === 'video' && 'url' in b && isAllowedVideoUrl(b.url)) {
          const embedUrl = b.url.startsWith('http') ? b.url : `https://${b.url}`;
          return (
            <div key={i} className="aspect-video w-full overflow-hidden rounded-lg my-4">
              <iframe
                src={embedUrl}
                title="Video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
