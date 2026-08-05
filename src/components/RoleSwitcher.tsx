import { NavLink } from 'react-router-dom';

const ROLES = [
  { to: '/admin', label: 'Dirección' },
  { to: '/reception', label: 'Recepción' },
  { to: '/student', label: 'Alumno' },
] as const;

/**
 * Demo-only navigation control — not a production feature. Lets a presenter
 * jump between the three role perspectives without a login screen.
 */
export function RoleSwitcher() {
  return (
    <nav
      aria-label="Selector de rol (solo demo)"
      className="inline-flex items-center gap-1 rounded-full border border-alma-border bg-alma-surface p-1"
    >
      {ROLES.map((role) => (
        <NavLink
          key={role.to}
          to={role.to}
          className={({ isActive }) =>
            [
              'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-alma-gold text-alma-bg'
                : 'text-alma-text-secondary hover:text-alma-text',
            ].join(' ')
          }
        >
          {role.label}
        </NavLink>
      ))}
    </nav>
  );
}
