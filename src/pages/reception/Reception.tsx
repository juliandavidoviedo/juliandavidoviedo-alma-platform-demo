import { useEffect, useState } from 'react';
import { Search, UserRound, PackagePlus, LogIn, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import type { LiveRoom, SearchResult, StudentSummary } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ActionFeedback } from '../../components/ui/ActionFeedback';
import { formatCOP, formatDateLong } from '../../lib/format';

interface PackageOption {
  name: string;
  classes: number;
  price: number;
  validityDays: number;
}

const PACKAGE_OPTIONS: PackageOption[] = [
  { name: 'Clase suelta', classes: 1, price: 40_000, validityDays: 30 },
  { name: 'Paquete 4 clases', classes: 4, price: 150_000, validityDays: 45 },
  { name: 'Paquete 8 clases', classes: 8, price: 280_000, validityDays: 60 },
  { name: 'Paquete 12 clases', classes: 12, price: 390_000, validityDays: 90 },
];

export function Reception() {
  const [query, setQuery] = useState('Julián');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudentSummary | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [liveRoom, setLiveRoom] = useState<LiveRoom | null>(null);

  const [selectedPackage, setSelectedPackage] = useState<PackageOption>(PACKAGE_OPTIONS[2]);
  const [selling, setSelling] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  const [feedback, setFeedback] = useState<string | null>(null);

  function runSearch(q: string) {
    setSearching(true);
    api.frontDesk.searchStudents(q).then((r) => {
      setResults(r);
      setSearching(false);
    });
  }

  function loadLiveRoom() {
    api.frontDesk.getLiveRoom().then(setLiveRoom);
  }

  useEffect(() => {
    runSearch('Julián');
    loadLiveRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearchChange(value: string) {
    setQuery(value);
    runSearch(value);
  }

  function openProfile(studentId: string) {
    setSelectedId(studentId);
    setLoadingProfile(true);
    setFeedback(null);
    api.frontDesk.getStudentProfile(studentId).then((p) => {
      setProfile(p);
      setLoadingProfile(false);
    });
  }

  async function sellPackage() {
    if (!selectedId) return;
    setSelling(true);
    const result = await api.frontDesk.sellPackage({
      studentId: selectedId,
      packageTypeName: selectedPackage.name,
      classes: selectedPackage.classes,
      amountPaid: selectedPackage.price,
      validityDays: selectedPackage.validityDays,
    });
    const refreshed = await api.frontDesk.getStudentProfile(selectedId);
    setProfile(refreshed);
    setFeedback(result.message);
    setSelling(false);
  }

  async function manualCheckIn() {
    if (!selectedId) return;
    setCheckingIn(true);
    const result = await api.frontDesk.manualCheckIn(selectedId);
    const refreshed = await api.frontDesk.getStudentProfile(selectedId);
    setProfile(refreshed);
    loadLiveRoom();
    setFeedback(result.message);
    setCheckingIn(false);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-1">
        <span className="text-sm text-alma-text-muted">Panel de recepción · Jonathan</span>
        <h1 className="font-display text-3xl text-alma-text">Sala y mostrador</h1>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        {/* Search + profile column */}
        <div className="flex flex-col gap-6">
          <Card>
            <label htmlFor="student-search" className="text-sm font-medium text-alma-text">
              Buscar alumno
            </label>
            <div className="relative mt-2">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-alma-text-muted"
                aria-hidden="true"
              />
              <input
                id="student-search"
                type="text"
                value={query}
                autoFocus
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Nombre del alumno…"
                className="min-h-[48px] w-full rounded-xl border border-alma-border bg-alma-bg py-2 pr-3 pl-10 text-alma-text placeholder:text-alma-text-muted focus:border-alma-gold focus:outline-none"
              />
            </div>

            <ul className="mt-4 space-y-1.5">
              {searching && <li className="text-sm text-alma-text-muted">Buscando…</li>}
              {!searching && results.length === 0 && (
                <li className="text-sm text-alma-text-muted">Sin resultados.</li>
              )}
              {!searching &&
                results.map((r) => (
                  <li key={r.studentId}>
                    <button
                      type="button"
                      onClick={() => openProfile(r.studentId)}
                      className={[
                        'flex min-h-[48px] w-full items-center justify-between rounded-xl border px-3.5 text-left transition-colors',
                        selectedId === r.studentId
                          ? 'border-alma-gold/50 bg-alma-gold/10'
                          : 'border-alma-border bg-alma-surface-elevated hover:border-alma-text-muted',
                      ].join(' ')}
                    >
                      <span>
                        <span className="block text-sm font-medium text-alma-text">{r.name}</span>
                        <span className="block text-xs text-alma-text-muted">{r.level}</span>
                      </span>
                      <span className="text-xs text-alma-text-muted">
                        {r.availableClasses} clase{r.availableClasses === 1 ? '' : 's'}
                      </span>
                    </button>
                  </li>
                ))}
            </ul>
          </Card>

          {/* Profile */}
          {selectedId && (
            <Card className="flex flex-col gap-5">
              {loadingProfile || !profile ? (
                <div className="h-40 animate-pulse rounded-xl bg-alma-surface-elevated" />
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-alma-border bg-alma-surface-elevated">
                      <UserRound className="h-5 w-5 text-alma-text-secondary" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="font-display text-lg text-alma-text">{profile.firstName}</h2>
                      <p className="text-xs text-alma-text-muted">
                        {profile.level} · {profile.danceRole}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-alma-border bg-alma-bg p-4">
                    <p className="text-3xl font-display text-alma-gold">{profile.availableClasses}</p>
                    <p className="text-xs text-alma-text-muted">
                      clase{profile.availableClasses === 1 ? '' : 's'} disponible
                      {profile.availableClasses === 1 ? '' : 's'}
                    </p>
                    {profile.package ? (
                      <p className="mt-2 text-xs text-alma-text-secondary">
                        Vence el {formatDateLong(profile.package.expiresOn)} · {profile.package.daysUntilExpiry}{' '}
                        días
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-[#e4a3ab]">Sin paquete activo</p>
                    )}
                  </div>

                  {/* Sell package */}
                  <div>
                    <label htmlFor="package-select" className="text-sm font-medium text-alma-text">
                      Vender paquete
                    </label>
                    <select
                      id="package-select"
                      value={selectedPackage.name}
                      onChange={(e) =>
                        setSelectedPackage(
                          PACKAGE_OPTIONS.find((p) => p.name === e.target.value) ?? PACKAGE_OPTIONS[0],
                        )
                      }
                      className="mt-2 min-h-[48px] w-full rounded-xl border border-alma-border bg-alma-bg px-3.5 text-alma-text focus:border-alma-gold focus:outline-none"
                    >
                      {PACKAGE_OPTIONS.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name} · {formatCOP(p.price)} · {p.validityDays} días
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="primary"
                      className="mt-3 w-full"
                      onClick={sellPackage}
                      disabled={selling}
                    >
                      <PackagePlus className="h-4 w-4" aria-hidden="true" />
                      {selling ? 'Registrando venta…' : 'Confirmar venta (simulación)'}
                    </Button>
                  </div>

                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={manualCheckIn}
                    disabled={checkingIn}
                  >
                    <LogIn className="h-4 w-4" aria-hidden="true" />
                    {checkingIn ? 'Registrando…' : 'Check-in manual (simulación)'}
                  </Button>

                  {feedback && <ActionFeedback message={feedback} />}
                </>
              )}
            </Card>
          )}
        </div>

        {/* Live room */}
        <Card className="h-fit">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg text-alma-text">Sala en vivo</h2>
              {liveRoom?.danceClass && (
                <p className="text-xs text-alma-text-muted">
                  {liveRoom.danceClass.name} · {liveRoom.danceClass.startTime}–{liveRoom.danceClass.endTime} ·
                  Profesora {liveRoom.danceClass.teacher}
                </p>
              )}
            </div>
            <Badge tone="gold">{liveRoom?.attendees.length ?? 0} en sala</Badge>
          </div>

          <ul className="mt-5 divide-y divide-alma-border">
            {liveRoom?.attendees.map((entry) => (
              <li key={entry.attendanceId} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-alma-text">{entry.name}</p>
                  <p className="text-xs text-alma-text-muted">Marcó a las {entry.time}</p>
                </div>
                {entry.consumptionType === 'SIN_PAQUETE' ? (
                  <Badge tone="danger">
                    <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    Sin paquete
                  </Badge>
                ) : (
                  <span className="text-xs text-alma-text-muted">
                    {entry.remainingClasses} restante{entry.remainingClasses === 1 ? '' : 's'}
                  </span>
                )}
              </li>
            ))}
            {liveRoom && liveRoom.attendees.length === 0 && (
              <li className="py-6 text-center text-sm text-alma-text-muted">
                Nadie ha marcado asistencia todavía.
              </li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
