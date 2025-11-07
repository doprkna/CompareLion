'use client';

import { motion } from 'framer-motion';

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
      {options.map((option, index) => {
        const isSelected = selectedId === option.id;
        
        return (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(option.id)}
            className={`
              w-full text-left px-6 py-4 rounded-lg border-2 transition-all duration-200
              ${
                isSelected
                  ? 'border-accent bg-accent/10 text-text shadow-lg'
                  : 'border-border bg-card text-text hover:border-accent/50 hover:bg-card/80'
              }
            `}
          >
            <motion.div 
              className="flex items-center justify-between"
              initial={false}
              animate={{ 
                scale: isSelected ? 1.05 : 1,
                transition: { duration: 0.2 }
              }}
            >
              <span className="font-medium">{option.label}</span>
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: isSelected ? 1 : 0, 
                  scale: isSelected ? 1 : 0 
                }}
                transition={{ duration: 0.2 }}
                className="text-accent text-xl"
              >
                ✓
              </motion.span>
            </motion.div>
          </motion.button>
        );
      })}
    </div>
  );
}













