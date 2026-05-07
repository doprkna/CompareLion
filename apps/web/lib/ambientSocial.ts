import { FLOW_CONTENT_KEYS } from '@/lib/content/flowContent';
import { resolveContent } from '@/lib/content/resolveContent';
import type { FlowMoodKey } from '@/lib/flowTopics';

export type AmbientSignalKind =
  | 'flowActivity'
  | 'hesitation'
  | 'continuation'
  | 'wildcard'
  | 'comparison';

export type AmbientSignal = {
  kind: AmbientSignalKind;
  text: string;
};

function formatCompact(n: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

export function getEntryAmbientSignal(input: {
  questionCount?: number;
  recentResponses?: number | null;
}): AmbientSignal {
  const count = input.recentResponses ?? null;
  if (count != null && count > 0) {
    const template = resolveContent(
      FLOW_CONTENT_KEYS.ambientFlowActivityCount,
      '{count} people tried this topic'
    );
    return { kind: 'flowActivity', text: template.replace('{count}', formatCompact(count)) };
  }
  if ((input.questionCount ?? 0) >= 10) {
    return {
      kind: 'flowActivity',
      text: resolveContent(
        FLOW_CONTENT_KEYS.ambientFlowActivitySoft,
        'People are answering this topic right now.'
      ),
    };
  }
  return {
    kind: 'flowActivity',
    text: resolveContent(
      FLOW_CONTENT_KEYS.ambientFlowActivitySoft,
      'People are answering this topic right now.'
    ),
  };
}

export function getCheckpointAmbientSignal(mood: FlowMoodKey | string | undefined): AmbientSignal {
  if (mood === 'deep' || mood === 'reflective') {
    return {
      kind: 'hesitation',
      text: resolveContent(FLOW_CONTENT_KEYS.ambientCheckpointDeep, 'People usually slow down here.'),
    };
  }
  if (mood === 'funny' || mood === 'chaotic' || mood === 'light') {
    return {
      kind: 'hesitation',
      text: resolveContent(
        FLOW_CONTENT_KEYS.ambientCheckpointFunny,
        'This is where answers start getting weird.'
      ),
    };
  }
  if (mood === 'spicy' || mood === 'late-night') {
    return {
      kind: 'hesitation',
      text: resolveContent(
        FLOW_CONTENT_KEYS.ambientCheckpointSpicy,
        'Most people hesitate before the next one.'
      ),
    };
  }
  return {
    kind: 'continuation',
    text: resolveContent(
      FLOW_CONTENT_KEYS.ambientContinuationSoft,
      'Many players continue after this point.'
    ),
  };
}

export function getTemptationAmbientSignal(input: {
  totalAnswers?: number | null;
  prefersLighterNext?: boolean;
}): AmbientSignal {
  if ((input.totalAnswers ?? 0) > 0) {
    const template = resolveContent(
      FLOW_CONTENT_KEYS.ambientComparisonCount,
      '{count} answers already compare in this topic'
    );
    return {
      kind: 'comparison',
      text: template.replace('{count}', formatCompact(input.totalAnswers as number)),
    };
  }
  if (input.prefersLighterNext) {
    return {
      kind: 'continuation',
      text: resolveContent(
        FLOW_CONTENT_KEYS.ambientLighterNext,
        'People often jump into a lighter flow next.'
      ),
    };
  }
  return {
    kind: 'comparison',
    text: resolveContent(
      FLOW_CONTENT_KEYS.ambientComparisonSoft,
      'You are not answering in isolation.'
    ),
  };
}
