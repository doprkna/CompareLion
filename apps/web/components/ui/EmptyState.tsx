import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: LucideIcon;
  emoji?: string;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ 
  icon: Icon, 
  emoji, 
  title, 
  description, 
  action,
  className = ""
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}>
      {/* Icon or Emoji */}
      {Icon && (
        <Icon className="h-16 w-16 text-subtle mb-4 opacity-50" />
      )}
      {emoji && !Icon && (
        <div className="text-6xl mb-4 opacity-60">{emoji}</div>
      )}
      
      {/* Content */}
      <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
      <p className="text-sm text-subtle opacity-75 max-w-md">{description}</p>
      
      {/* Optional Action */}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
}

export default EmptyState;








