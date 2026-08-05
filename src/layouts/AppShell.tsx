import { NavLink, Outlet } from 'react-router-dom';
import { QrCode } from 'lucide-react';
import { Brand } from '../components/Brand';
import { DemoBadge } from '../components/DemoBadge';
import { DemoDisclaimer } from '../components/DemoDisclaimer';
import { RoleSwitcher } from '../components/RoleSwitcher';

export function AppShell() {
  return (
    <div className="flex min-h-dvh flex-col bg-alma-bg">
      <header className="border-b border-alma-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Brand />
            <DemoBadge />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <RoleSwitcher />
            <NavLink
              to="/checkin"
              className={({ isActive }) =>
                [
                  'inline-flex min-h-[40px] items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-alma-gold/50 bg-alma-gold/10 text-alma-gold'
                    : 'border-alma-border text-alma-text-secondary hover:text-alma-text',
                ].join(' ')
              }
            >
              <QrCode className="h-4 w-4" aria-hidden="true" />
              Check-in
            </NavLink>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-alma-border">
        <DemoDisclaimer />
      </footer>
    </div>
  );
}
