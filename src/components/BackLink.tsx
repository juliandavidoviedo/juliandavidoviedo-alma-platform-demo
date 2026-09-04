import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface BackLinkProps {
  /** Fixed destination. Omit to use real browser history (navigate(-1)). */
  to?: string;
  label?: string;
}

export function BackLink({ to, label = 'Volver' }: BackLinkProps) {
  const navigate = useNavigate();

  const className =
    'inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-alma-text-secondary transition-colors hover:text-alma-gold';

  if (to) {
    return (
      <Link to={to} className={className}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => navigate(-1)} className={className}>
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}
