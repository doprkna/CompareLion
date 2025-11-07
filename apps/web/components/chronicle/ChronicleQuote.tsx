'use client';

interface ChronicleQuoteProps {
  quote: string;
}

export function ChronicleQuote({ quote }: ChronicleQuoteProps) {
  return (
    <div className="border-l-4 border-accent pl-4 py-2 bg-accent/5 rounded-r">
      <p className="text-text italic">"{quote}"</p>
    </div>
  );
}

