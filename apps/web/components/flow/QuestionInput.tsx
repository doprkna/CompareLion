'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

const OPTION_CARD_BASE =
  'flex w-full min-h-[2.75rem] cursor-pointer items-center gap-3 rounded-lg border p-3 outline-none transition-colors duration-75 select-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background';

const OPTION_CARD_IDLE =
  'border-border bg-card hover:border-accent/60 hover:bg-accent/10';

const OPTION_CARD_SELECTED =
  'border-accent bg-accent text-white shadow-sm scale-[1.02] hover:border-accent hover:bg-accent';

export interface FlowQuestionOption {
  id: string;
  label: string;
  value: string;
  order?: number;
}

export interface FlowQuestion {
  id: string;
  text: string;
  type: string;
  options?: FlowQuestionOption[];
  categoryName?: string;
  challengeEnabled?: boolean;
}

export type AnswerValue =
  | { kind: 'text'; text: string }
  | { kind: 'single'; optionId: string }
  | { kind: 'multi'; optionIds: string[] }
  | { kind: 'number'; value: number | null };

/** Align API strings with Prisma / shared UI (flow-demo uses NUMERIC + MULTIPLE_CHOICE). */
export function normalizeFlowQuestionType(raw: string | undefined): string {
  const u = (raw || 'SINGLE_CHOICE').toUpperCase();
  if (u === 'NUMERIC') return 'NUMBER';
  if (u === 'MULTIPLE_CHOICE') return 'MULTI_CHOICE';
  return u;
}

interface QuestionInputProps {
  question: FlowQuestion;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  /** Called when user selects a valid answer (for single choice: instant-submit hook) */
  onSelectForSubmit?: (value: AnswerValue) => void;
  /** Disable interactions (e.g. during submit) */
  disabled?: boolean;
}

function toggleMulti(optionIds: string[], optionId: string): string[] {
  if (optionIds.includes(optionId)) {
    return optionIds.filter((id) => id !== optionId);
  }
  return [...optionIds, optionId];
}

export function QuestionInput({ question, value, onChange, onSelectForSubmit, disabled }: QuestionInputProps) {
  const type = normalizeFlowQuestionType(question.type);
  const options = question.options ?? [];

  const handleSingleChange = (v: string) => {
    if (disabled) return;
    const next = { kind: 'single' as const, optionId: v };
    onChange(next);
    if (v && onSelectForSubmit) onSelectForSubmit(next);
  };

  if (type === 'TEXT') {
    const text = value.kind === 'text' ? value.text : '';
    return (
      <Input
        data-testid="answer-option"
        type="text"
        placeholder="Type your answer..."
        value={text}
        onChange={(e) => onChange({ kind: 'text', text: e.target.value })}
        className="w-full"
        disabled={disabled}
      />
    );
  }

  if (type === 'SINGLE_CHOICE') {
    const selected = value.kind === 'single' ? value.optionId : '';
    return (
      <RadioGroup
        value={selected}
        onValueChange={handleSingleChange}
        disabled={disabled}
        className="flex flex-col gap-3"
      >
        {options.map((opt) => {
          const inputId = `${question.id}-${opt.id}`;
          const isSelected = selected === opt.id;
          return (
            <label
              key={opt.id}
              htmlFor={inputId}
              data-testid="answer-option"
              className={cn(
                OPTION_CARD_BASE,
                isSelected ? OPTION_CARD_SELECTED : OPTION_CARD_IDLE,
                disabled && 'pointer-events-none cursor-not-allowed opacity-50',
              )}
            >
              <RadioGroupItem
                value={opt.id}
                id={inputId}
                className={isSelected ? 'border-white text-white' : undefined}
              />
              <span className="flex-1 cursor-pointer text-sm font-medium leading-snug">{opt.label}</span>
            </label>
          );
        })}
      </RadioGroup>
    );
  }

  if (type === 'MULTI_CHOICE') {
    const selected = value.kind === 'multi' ? value.optionIds : [];
    return (
      <div className="flex flex-col gap-3">
        {options.map((opt) => {
          const inputId = `multi-${question.id}-${opt.id}`;
          const isChecked = selected.includes(opt.id);
          return (
            <label
              key={opt.id}
              htmlFor={inputId}
              data-testid="answer-option"
              className={cn(
                OPTION_CARD_BASE,
                isChecked ? OPTION_CARD_SELECTED : OPTION_CARD_IDLE,
                disabled && 'pointer-events-none cursor-not-allowed opacity-50',
              )}
            >
              <Checkbox
                id={inputId}
                checked={isChecked}
                disabled={disabled}
                className={
                  isChecked
                    ? 'border-white data-[state=checked]:bg-white data-[state=checked]:text-accent'
                    : undefined
                }
                onCheckedChange={() => {
                  if (disabled) return;
                  onChange({ kind: 'multi', optionIds: toggleMulti(selected, opt.id) });
                }}
              />
              <span className="flex-1 cursor-pointer text-sm font-medium leading-snug">{opt.label}</span>
            </label>
          );
        })}
        {selected.length > 0 && (
          <p className="text-xs text-accent px-0.5">
            {selected.length} option{selected.length > 1 ? 's' : ''} selected
          </p>
        )}
      </div>
    );
  }

  if (type === 'RANGE' || type === 'NUMBER') {
    const num = value.kind === 'number' ? value.value : null;
    const min = type === 'RANGE' ? 1 : 0;
    const max = type === 'RANGE' ? 10 : 999;
    const defaultVal = type === 'RANGE' ? 5 : null;

    if (type === 'RANGE') {
      const v = num ?? defaultVal ?? 5;
      const clamped = Math.min(max, Math.max(min, v));
      return (
        <div
          className="space-y-3 rounded-lg border border-border bg-card p-4 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background"
          data-testid="answer-option"
        >
          <p className="text-xs text-subtle">Drag to choose a value from {min} to {max}.</p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-subtle tabular-nums">{min}</span>
            <span className="text-lg font-bold text-accent tabular-nums">{clamped}</span>
            <span className="text-sm text-subtle tabular-nums">{max}</span>
          </div>
          <Slider
            min={min}
            max={max}
            step={1}
            value={[clamped]}
            disabled={disabled}
            onValueChange={(vals) => {
              const n = vals[0];
              if (n !== undefined) onChange({ kind: 'number', value: n });
            }}
            onValueCommit={(vals) => {
              if (disabled || !onSelectForSubmit) return;
              const n = vals[0];
              if (n !== undefined) onSelectForSubmit({ kind: 'number', value: n });
            }}
            className="w-full cursor-pointer"
          />
        </div>
      );
    }

    return (
      <Input
        data-testid="answer-option"
        type="number"
        placeholder="Enter a number..."
        min={min}
        max={max}
        value={num ?? ''}
        onChange={(e) => onChange({ kind: 'number', value: e.target.value ? parseFloat(e.target.value) : null })}
        className="w-full"
        disabled={disabled}
      />
    );
  }

  return (
    <div className="p-4 border border-destructive/50 rounded bg-destructive/5 text-destructive text-sm">
      Unknown question type: {question.type}. Use Skip to continue.
    </div>
  );
}

export function isValidAnswer(question: FlowQuestion, value: AnswerValue): boolean {
  const type = normalizeFlowQuestionType(question.type);

  if (type === 'TEXT') {
    return value.kind === 'text' && value.text.trim().length > 0;
  }
  if (type === 'SINGLE_CHOICE') {
    return value.kind === 'single' && value.optionId.length > 0;
  }
  if (type === 'MULTI_CHOICE') {
    return value.kind === 'multi' && value.optionIds.length > 0;
  }
  if (type === 'RANGE' || type === 'NUMBER') {
    return value.kind === 'number' && value.value !== null;
  }

  return false;
}

export function toApiPayload(question: FlowQuestion, value: AnswerValue): Record<string, unknown> {
  const base = { questionId: question.id };
  const type = normalizeFlowQuestionType(question.type);

  if (type === 'TEXT' && value.kind === 'text') {
    return { ...base, textValue: value.text };
  }
  if (type === 'SINGLE_CHOICE' && value.kind === 'single') {
    return { ...base, optionIds: [value.optionId] };
  }
  if (type === 'MULTI_CHOICE' && value.kind === 'multi') {
    return { ...base, optionIds: value.optionIds };
  }
  if ((type === 'RANGE' || type === 'NUMBER') && value.kind === 'number' && value.value !== null) {
    if (type === 'RANGE') {
      const v = Math.min(10, Math.max(1, Math.round(value.value)));
      return { ...base, numericValue: v };
    }
    return { ...base, numericValue: value.value };
  }

  return base;
}

export function getInitialValue(question: FlowQuestion): AnswerValue {
  const type = normalizeFlowQuestionType(question.type);
  if (type === 'TEXT') return { kind: 'text', text: '' };
  if (type === 'SINGLE_CHOICE') return { kind: 'single', optionId: '' };
  if (type === 'MULTI_CHOICE') return { kind: 'multi', optionIds: [] };
  if (type === 'RANGE') return { kind: 'number', value: 5 };
  if (type === 'NUMBER') return { kind: 'number', value: null };
  return { kind: 'text', text: '' };
}
