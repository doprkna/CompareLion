interface AnswerOption {
  id: string;
  label: string;
  value: string;
}

interface AnswerPadProps {
  options: AnswerOption[];
  selectedId?: string;
  onSelect: (optionId: string) => void;
}

export function AnswerPad({ options, selectedId, onSelect }: AnswerPadProps) {
  return (
    <div className="space-y-3">
      {options.map((option) => {
        const isSelected = selectedId === option.id;
        
        return (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`
              w-full text-left px-6 py-4 rounded-lg border-2 transition-all
              ${
                isSelected
                  ? 'border-accent bg-accent/10 text-text shadow-lg'
                  : 'border-border bg-card text-text hover:border-accent/50 hover:bg-card/80'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{option.label}</span>
              {isSelected && (
                <span className="text-accent">✓</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}











