import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { DemoBadge } from '../components/DemoBadge';
import { DemoDisclaimer } from '../components/DemoDisclaimer';
import { RegistrationDisclaimer } from '../components/RegistrationDisclaimer';
import { RoleSwitcher } from '../components/RoleSwitcher';

/** Routes where real data is captured — the blanket "es una demo" footer would be actively misleading here. */
const REAL_DATA_ROUTES = ['/registro-estudiante', '/privacidad'];

const PUBLIC_LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/clases', label: 'Clases', end: false },
  { to: '/blog', label: 'Blog', end: false },
  { to: '/eventos', label: 'Eventos', end: false },
  { to: '/registro-estudiante', label: 'Registro', end: false },
] as const;

export function AppShell() {
  const { pathname } = useLocation();
  const isRealDataRoute = REAL_DATA_ROUTES.includes(pathname);

  return (
    <div className="flex min-h-dvh flex-col bg-alma-bg">
      <header className="border-b border-alma-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Brand />
            <DemoBadge />
          </div>

          <nav aria-label="Navegación principal" className="flex flex-wrap items-center gap-1">
            {PUBLIC_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  [
                    'rounded-full px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'text-alma-gold' : 'text-alma-text-secondary hover:text-alma-text',
                  ].join(' ')
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <RoleSwitcher />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-alma-border">
        {isRealDataRoute ? <RegistrationDisclaimer /> : <DemoDisclaimer />}
      </footer>
    </div>
  );
}
