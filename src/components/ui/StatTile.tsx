import type { ReactNode } from 'react';
import { Card } from './Card';

interface StatTileProps {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: 'positive' | 'negative' | 'neutral';
  icon?: ReactNode;
}

const DELTA_CLASSES: Record<NonNullable<StatTileProps['deltaTone']>, string> = {
  positive: 'text-[#8fd18f]',
  negative: 'text-[#e4a3ab]',
  neutral: 'text-alma-text-muted',
};

export function StatTile({ label, value, delta, deltaTone = 'neutral', icon }: StatTileProps) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-alma-text-secondary">{label}</span>
        {icon ? <span className="text-alma-text-muted">{icon}</span> : null}
      </div>
      <span className="font-display text-3xl text-alma-text">{value}</span>
      {delta ? (
        <span className={['text-xs font-medium', DELTA_CLASSES[deltaTone]].join(' ')}>
          {delta} vs. mes anterior
        </span>
      ) : null}
    </Card>
  );
}
