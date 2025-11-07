"use client";
import { ReactNode } from 'react';

interface RarityFrameProps {
  rarity?: {
    key?: string;
    name?: string;
    colorPrimary?: string;
    colorGlow?: string;
    frameStyle?: string;
    rankOrder?: number;
    description?: string;
  } | string | null;
  children: ReactNode;
  className?: string;
}

export function RarityFrame({ rarity, children, className = '' }: RarityFrameProps) {
  if (!rarity) {
    return <div className={className}>{children}</div>;
  }

  const rarityData = typeof rarity === 'string' 
    ? { key: rarity, colorPrimary: '#9ca3af', frameStyle: 'solid' }
    : rarity;

  const colorPrimary = rarityData.colorPrimary || '#9ca3af';
  const colorGlow = rarityData.colorGlow || null;
  const frameStyle = rarityData.frameStyle || 'solid';

  const getFrameClasses = () => {
    if (frameStyle === 'glow') {
      return `border-2 rounded-lg relative overflow-hidden ${
        colorGlow ? 'shadow-lg' : ''
      }`;
    }
    return 'border-2 rounded-lg';
  };

  const getFrameStyles = () => {
    const styles: React.CSSProperties = {
      borderColor: colorPrimary,
    };

    if (frameStyle === 'glow' && colorGlow) {
      styles.boxShadow = `0 0 10px ${colorGlow}, 0 0 20px ${colorGlow}40`;
    }

    return styles;
  };

  return (
    <div className={`${getFrameClasses()} ${className}`} style={getFrameStyles()}>
      {frameStyle === 'glow' && colorGlow && (
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${colorGlow} 0%, transparent 70%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

