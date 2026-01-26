'use client';

/**
 * Tooltip Atom
 * v0.42.4 - C4 Step 5: Interaction atoms implementation
 * Contextual information on hover/focus with simple positioning
 */

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@parel/ui/atoms';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

import { getUiConfig } from '@parel/core/config';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement; // Trigger element
  placement?: TooltipPlacement;
  delay?: number; // Milliseconds before showing (default from config)
  className?: string;
  showInfoIcon?: boolean; // Show info icon before content
}

const placementStyles: Record<TooltipPlacement, { tooltip: string; arrow: string }> = {
  top: {
    tooltip: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    arrow: 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-900',
  },
  bottom: {
    tooltip: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    arrow: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-900',
  },
  left: {
    tooltip: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    arrow: 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-900',
  },
  right: {
    tooltip: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
    arrow: 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-900',
  },
};

export function Tooltip({
  content,
  children,
  placement = 'top',
  delay,
  className = '',
  showInfoIcon = false,
}: TooltipProps) {
  // Get default delay from config if not provided
  const uiConfig = getUiConfig();
  const finalDelay = delay ?? uiConfig.toast.tooltipDelay;
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = triggerRect.top + scrollY - tooltipRect.height - 8;
        left = triggerRect.left + scrollX + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollY + 8;
        left = triggerRect.left + scrollX + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'left':
        top = triggerRect.top + scrollY + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.left + scrollX - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + scrollY + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.right + scrollX + 8;
        break;
    }

    // Basic overflow fallback - flip if out of viewport
    if (left < 0) left = triggerRect.left + scrollX + 8;
    if (left + tooltipRect.width > window.innerWidth + scrollX) {
      left = triggerRect.right + scrollX - tooltipRect.width - 8;
    }
    if (top < scrollY) top = triggerRect.bottom + scrollY + 8;
    if (top + tooltipRect.height > window.innerHeight + scrollY) {
      top = triggerRect.top + scrollY - tooltipRect.height - 8;
    }

    setPosition({ top, left });
  };

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Update position after showing
      setTimeout(updatePosition, 0);
    }, finalDelay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isVisible, placement]);

  const triggerId = `tooltip-trigger-${Math.random().toString(36).substr(2, 9)}`;
  const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;

  const triggerElement = React.cloneElement(children, {
    ref: triggerRef,
    id: triggerId,
    'aria-describedby': tooltipId,
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip,
    onFocus: showTooltip,
    onBlur: hideTooltip,
  });

  const placementStyle = placementStyles[placement];

  return (
    <>
      {triggerElement}
      {isVisible && typeof window !== 'undefined' && createPortal(
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className={`absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg pointer-events-none flex items-center gap-1.5 ${placementStyle.tooltip} ${className}`.trim()}
          style={{ top: position.top, left: position.left }}
        >
          {showInfoIcon && (
            <Icon name="info" size="sm" className="text-white flex-shrink-0" aria-hidden="true" />
          )}
          <span>{content}</span>
          <div
            className={`absolute w-0 h-0 border-4 border-transparent ${placementStyle.arrow}`}
          />
        </div>,
        document.body
      )}
    </>
  );
}
