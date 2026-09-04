import { CheckCircle2, AlertTriangle } from 'lucide-react';

export type FeedbackTone = 'success' | 'warning';

interface ActionFeedbackProps {
  message: string;
  tone?: FeedbackTone;
}

/**
 * Renders the result of a simulated action. Every message passed in from
 * `mock-api.ts` already contains the word "simulación" — this component does
 * not add it, so a missing word here is a bug in the copy, not silently
 * patched over.
 */
export function ActionFeedback({ message, tone = 'success' }: ActionFeedbackProps) {
  const Icon = tone === 'success' ? CheckCircle2 : AlertTriangle;
  const toneClasses =
    tone === 'success'
      ? 'border-alma-gold/40 bg-alma-gold/10 text-alma-gold'
      : 'border-alma-wine/50 bg-alma-wine/10 text-[#e4a3ab]';

  return (
    <div
      role="status"
      className={['flex items-start gap-3 rounded-xl border p-4 text-sm', toneClasses].join(' ')}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
