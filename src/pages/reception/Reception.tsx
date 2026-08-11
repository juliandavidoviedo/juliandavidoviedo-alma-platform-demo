import { useEffect, useState } from 'react';
import {
  Search,
  UserRound,
  UserPlus,
  PackagePlus,
  LogIn,
  AlertCircle,
  History,
  BellRing,
  Check,
  CalendarClock,
  Clock,
  Users2,
  Activity,
  DoorOpen,
  X,
  Ban,
  AlertOctagon,
  Wallet,
} from 'lucide-react';
import {
  api,
  CATEGORY_LABELS,
  CLASS_STATUS_LABELS,
  DEMO_TODAY,
  ENGAGEMENT_LABELS,
  PAYMENT_METHOD_LABELS,
  PROGRAM_LABELS,
  ATTENDANCE_INTENT_LABELS,
  RENEWAL_METHOD_LABELS,
  ROOM_BOOKING_TYPE_LABELS,
  ROOMS,
} from '../../lib/api';
import type {
  AttendanceIntentStatus,
  AttentionItem,
  ClassRoster,
  ClassStatus,
  DanceRole,
  PaymentMethod,
  ReceptionSummary,
  RenewalRequest,
  RoomBooking,
  RoomBookingType,
  ScheduledClass,
  SearchResult,
  StudentLevel,
  StudentSummary,
} from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge, type BadgeTone } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { StatTile } from '../../components/ui/StatTile';
import { ActionFeedback } from '../../components/ui/ActionFeedback';
import { formatCOP, formatDateLong, formatDateWithWeekday } from '../../lib/format';

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
  { name: 'Alma Open (mensual)', classes: 999, price: 220_000, validityDays: 30 },
];

const PAYMENT_METHODS: PaymentMethod[] = ['EFECTIVO', 'QR', 'TARJETA'];
const LEVELS: StudentLevel[] = ['INICIAL', 'INTERMEDIO', 'AVANZADO'];
const DANCE_ROLES: DanceRole[] = ['LIDER', 'SEGUIDOR', 'AMBOS'];
const BOOKING_TYPES: RoomBookingType[] = ['PERSONALIZADA', 'ENSAYO', 'PRACTICA'];

const ENGAGEMENT_TONE: Record<string, BadgeTone> = {
  CRECIENDO: 'success',
  ESTABLE: 'neutral',
  EN_RIESGO: 'danger',
};

const REGISTRATION_TONE: Record<AttendanceIntentStatus, BadgeTone> = {
  ATTENDED: 'success',
  CONFIRMED: 'gold',
  NO_SHOW: 'danger',
  CANCELLED: 'neutral',
};

const CLASS_STATUS_TONE: Record<ClassStatus, BadgeTone> = {
  PROGRAMADA: 'neutral',
  CONFIRMADA: 'gold',
  CANCELADA: 'danger',
};

type Tab = 'mostrador' | 'agenda' | 'salones';

function NewStudentForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [level, setLevel] = useState<StudentLevel>('INICIAL');
  const [danceRole, setDanceRole] = useState<DanceRole>('AMBOS');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ studentId: string; pin: string; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const r = await api.frontDesk.createStudent({ firstName, lastName, phone, level, danceRole, dataConsent: consent });
    setResult(r);
    setSubmitting(false);
    setFirstName('');
    setLastName('');
    setPhone('');
    setConsent(false);
    onCreated();
  }

  if (!open) {
    return (
      <Button variant="secondary" className="w-full" onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4" aria-hidden="true" />
        Nuevo alumno
      </Button>
    );
  }

  if (result) {
    return (
      <Card className="border-alma-gold/30 bg-alma-gold/5">
        <p className="text-sm text-alma-text">{result.message}</p>
        <p className="mt-2 text-xs text-alma-text-muted">ID: {result.studentId}</p>
        <p className="mt-3 text-center font-display text-4xl tracking-[0.3em] text-alma-gold">{result.pin}</p>
        <Button
          variant="secondary"
          className="mt-3 w-full"
          onClick={() => {
            setResult(null);
            setOpen(false);
          }}
        >
          Listo
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <p className="text-sm font-medium text-alma-text">Alta de alumno</p>
        <input
          type="text"
          required
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Nombre"
          className="min-h-[44px] w-full rounded-xl border border-alma-border bg-alma-bg px-3.5 text-sm text-alma-text placeholder:text-alma-text-muted focus:border-alma-gold focus:outline-none"
        />
        <input
          type="text"
          required
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Apellido"
          className="min-h-[44px] w-full rounded-xl border border-alma-border bg-alma-bg px-3.5 text-sm text-alma-text placeholder:text-alma-text-muted focus:border-alma-gold focus:outline-none"
        />
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Teléfono"
          className="min-h-[44px] w-full rounded-xl border border-alma-border bg-alma-bg px-3.5 text-sm text-alma-text placeholder:text-alma-text-muted focus:border-alma-gold focus:outline-none"
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as StudentLevel)}
            className="min-h-[44px] rounded-xl border border-alma-border bg-alma-bg px-2 text-sm text-alma-text focus:border-alma-gold focus:outline-none"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <select
            value={danceRole}
            onChange={(e) => setDanceRole(e.target.value as DanceRole)}
            className="min-h-[44px] rounded-xl border border-alma-border bg-alma-bg px-2 text-sm text-alma-text focus:border-alma-gold focus:outline-none"
          >
            {DANCE_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-xs text-alma-text-secondary">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
          Consiente el tratamiento de sus datos personales (habeas data)
        </label>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" className="flex-1" disabled={submitting || !consent}>
            {submitting ? 'Creando…' : 'Crear alumno (simulación)'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function Reception() {
  const [tab, setTab] = useState<Tab>('mostrador');

  // Mostrador
  const [query, setQuery] = useState('Julián');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudentSummary | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [roster, setRoster] = useState<ClassRoster | null>(null);
  const [renewalRequests, setRenewalRequests] = useState<RenewalRequest[]>([]);
  const [attentionItems, setAttentionItems] = useState<AttentionItem[]>([]);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PackageOption>(PACKAGE_OPTIONS[2]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TRANSFERENCIA');
  const [selling, setSelling] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Agenda
  const [summary, setSummary] = useState<ReceptionSummary | null>(null);
  const [schedule, setSchedule] = useState<ScheduledClass[]>([]);
  const [confirmingClassId, setConfirmingClassId] = useState<string | null>(null);
  const [cancelingClassId, setCancelingClassId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [scheduleFeedback, setScheduleFeedback] = useState<string | null>(null);

  // Salones
  const [roomBookings, setRoomBookings] = useState<RoomBooking[]>([]);
  const [bookingRoomId, setBookingRoomId] = useState(ROOMS[0].roomId);
  const [bookingTitle, setBookingTitle] = useState('');
  const [bookingTeacher, setBookingTeacher] = useState('');
  const [bookingDate, setBookingDate] = useState('2026-08-06');
  const [bookingStart, setBookingStart] = useState('17:00');
  const [bookingEnd, setBookingEnd] = useState('18:00');
  const [bookingType, setBookingType] = useState<RoomBookingType>('PERSONALIZADA');
  const [booking, setBooking] = useState(false);
  const [bookingFeedback, setBookingFeedback] = useState<string | null>(null);

  function runSearch(q: string) {
    setSearching(true);
    api.frontDesk.searchStudents(q).then((r) => {
      setResults(r);
      setSearching(false);
    });
  }

  function loadRoster() {
    api.frontDesk.getClassRoster().then(setRoster);
  }

  function loadRenewalRequests() {
    api.frontDesk.getRenewalRequests().then(setRenewalRequests);
  }

  function loadAttentionItems() {
    api.frontDesk.getAttentionItems().then(setAttentionItems);
  }

  function loadSummary() {
    api.frontDesk.getSummary().then(setSummary);
  }

  function loadSchedule() {
    api.frontDesk.getSchedule().then(setSchedule);
  }

  function loadRoomBookings() {
    api.frontDesk.getRoomBookings().then(setRoomBookings);
  }

  useEffect(() => {
    runSearch('Julián');
    loadRoster();
    loadRenewalRequests();
    loadAttentionItems();
    loadSummary();
    loadSchedule();
    loadRoomBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function resolveRenewal(requestId: string) {
    setResolvingId(requestId);
    await api.frontDesk.resolveRenewalRequest(requestId);
    loadRenewalRequests();
    setResolvingId(null);
  }

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
      paymentMethod,
    });
    const refreshed = await api.frontDesk.getStudentProfile(selectedId);
    setProfile(refreshed);
    setFeedback(result.message);
    setSelling(false);
    loadRenewalRequests();
    loadSummary();
  }

  async function manualCheckIn() {
    if (!selectedId) return;
    setCheckingIn(true);
    const result = await api.frontDesk.manualCheckIn(selectedId);
    const refreshed = await api.frontDesk.getStudentProfile(selectedId);
    setProfile(refreshed);
    loadRoster();
    loadSummary();
    setFeedback(result.message);
    setCheckingIn(false);
  }

  async function confirmWithTeacher(classId: string) {
    setConfirmingClassId(classId);
    const r = await api.frontDesk.confirmClassWithTeacher(classId);
    setScheduleFeedback(r.message);
    loadSchedule();
    setConfirmingClassId(null);
  }

  async function submitCancelClass(classId: string) {
    const r = await api.frontDesk.cancelClass(classId, cancelReason);
    setScheduleFeedback(r.message);
    setCancelingClassId(null);
    setCancelReason('');
    loadSchedule();
    loadSummary();
    loadRoster();
  }

  async function createBooking(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBooking(true);
    const r = await api.frontDesk.createRoomBooking({
      roomId: bookingRoomId,
      title: bookingTitle,
      teacher: bookingTeacher,
      date: bookingDate,
      startTime: bookingStart,
      endTime: bookingEnd,
      type: bookingType,
    });
    setBookingFeedback(r.message);
    setBookingTitle('');
    setBookingTeacher('');
    loadRoomBookings();
    setBooking(false);
  }

  async function cancelBooking(bookingId: string) {
    await api.frontDesk.cancelRoomBooking(bookingId);
    loadRoomBookings();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-1">
        <span className="text-sm text-alma-text-muted">Panel de recepción · Jonathan</span>
        <h1 className="font-display text-3xl text-alma-text">Sala y mostrador</h1>
      </header>

      <nav className="mt-6 inline-flex rounded-full border border-alma-border bg-alma-surface p-1">
        {([
          ['mostrador', 'Mostrador'],
          ['agenda', 'Agenda y KPIs'],
          ['salones', 'Salones'],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={[
              'rounded-full px-4 py-2 text-sm font-medium transition-colors',
              tab === value ? 'bg-alma-gold text-alma-bg' : 'text-alma-text-secondary hover:text-alma-text',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === 'mostrador' && (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
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

            <NewStudentForm
              onCreated={() => {
                runSearch(query);
                loadSummary();
              }}
            />

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
                      <div className="min-w-0 flex-1">
                        <h2 className="font-display text-lg text-alma-text">{profile.firstName}</h2>
                        <p className="text-xs text-alma-text-muted">
                          {profile.level} · {profile.danceRole} · {PROGRAM_LABELS[profile.program]}
                        </p>
                      </div>
                      <Badge tone={ENGAGEMENT_TONE[profile.engagement.status]}>
                        {ENGAGEMENT_LABELS[profile.engagement.status]}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-alma-text-muted">
                      <span>{profile.engagement.attendancesLast30Days} clases en 30 días</span>
                      <span>
                        {profile.engagement.daysSinceLastAttendance === null
                          ? 'Sin asistencias registradas'
                          : `${profile.engagement.daysSinceLastAttendance} días sin venir`}
                      </span>
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
                      {profile.packageHistory[0] && (
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-alma-text-muted">
                          <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
                          Último pago: {PAYMENT_METHOD_LABELS[profile.packageHistory[0].paymentMethod]}
                          {' '}(informativo)
                        </p>
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

                      <label htmlFor="payment-method" className="mt-3 block text-sm font-medium text-alma-text">
                        Medio de pago
                      </label>
                      <select
                        id="payment-method"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="mt-2 min-h-[48px] w-full rounded-xl border border-alma-border bg-alma-bg px-3.5 text-alma-text focus:border-alma-gold focus:outline-none"
                      >
                        {PAYMENT_METHODS.map((m) => (
                          <option key={m} value={m}>
                            {PAYMENT_METHOD_LABELS[m]}
                          </option>
                        ))}
                      </select>

                      <Button variant="primary" className="mt-3 w-full" onClick={sellPackage} disabled={selling}>
                        <PackagePlus className="h-4 w-4" aria-hidden="true" />
                        {selling ? 'Registrando venta…' : 'Confirmar venta (simulación)'}
                      </Button>
                    </div>

                    <Button variant="secondary" className="w-full" onClick={manualCheckIn} disabled={checkingIn}>
                      <LogIn className="h-4 w-4" aria-hidden="true" />
                      {checkingIn ? 'Registrando…' : 'Check-in manual (simulación)'}
                    </Button>

                    {feedback && <ActionFeedback message={feedback} />}

                    {/* Purchase history */}
                    {profile.packageHistory.length > 0 && (
                      <div>
                        <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-alma-text-muted uppercase">
                          <History className="h-3.5 w-3.5" aria-hidden="true" />
                          Historial de compras
                        </p>
                        <ul className="mt-2 space-y-2">
                          {profile.packageHistory.slice(0, 3).map((p) => (
                            <li
                              key={p.packageId + p.purchaseDate}
                              className="flex items-center justify-between rounded-lg border border-alma-border bg-alma-bg px-3 py-2 text-xs"
                            >
                              <span className="text-alma-text-secondary">
                                {p.name} · {formatDateLong(p.purchaseDate)}
                              </span>
                              <span className="text-alma-text-muted">
                                {formatCOP(p.amount)} · {PAYMENT_METHOD_LABELS[p.paymentMethod]}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </Card>
            )}
          </div>

          {/* Class roster + renewal requests */}
          <div className="flex flex-col gap-6">
            <Card className="h-fit">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg text-alma-text">Clase de hoy</h2>
                  {roster?.danceClass && (
                    <p className="text-xs text-alma-text-muted">
                      {roster.danceClass.name} · {roster.danceClass.startTime}–{roster.danceClass.endTime} ·{' '}
                      {roster.danceClass.roomName} · Profesora {roster.danceClass.teacher}
                    </p>
                  )}
                </div>
                <Badge tone="gold">
                  {roster?.registrations.filter((r) => r.status === 'ATTENDED').length ?? 0} en sala
                </Badge>
              </div>

              <ul className="mt-5 divide-y divide-alma-border">
                {roster?.registrations.map((entry) => (
                  <li key={entry.registrationId} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-alma-text">{entry.studentName}</p>
                      <p className="text-xs text-alma-text-muted">
                        {entry.status === 'ATTENDED' && `Llegó a las ${entry.checkedInAt}`}
                        {entry.status === 'CONFIRMED' && `Confirmó a las ${entry.confirmedAt}`}
                        {entry.status === 'NO_SHOW' && `Confirmó a las ${entry.confirmedAt} — no llegó`}
                        {entry.status === 'CANCELLED' && `Canceló a las ${entry.cancelledAt}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.status === 'ATTENDED' && entry.consumptionType === 'SIN_PAQUETE' && (
                        <Badge tone="danger">
                          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                          Sin paquete
                        </Badge>
                      )}
                      <Badge tone={REGISTRATION_TONE[entry.status]}>{ATTENDANCE_INTENT_LABELS[entry.status]}</Badge>
                    </div>
                  </li>
                ))}
                {roster && roster.registrations.length === 0 && (
                  <li className="py-6 text-center text-sm text-alma-text-muted">
                    Nadie ha confirmado ni marcado asistencia todavía.
                  </li>
                )}
              </ul>
            </Card>

            {/* Renewal / reactivation requests raised from the student portal */}
            <Card className="h-fit">
              <div className="flex items-center gap-2">
                <BellRing className="h-4 w-4 text-alma-gold" aria-hidden="true" />
                <h2 className="font-display text-lg text-alma-text">Solicitudes de renovación</h2>
              </div>
              <p className="mt-1 text-xs text-alma-text-muted">
                Avisos enviados por alumnos desde su portal — aviso directo o transferencia por QR.
              </p>

              <ul className="mt-4 divide-y divide-alma-border">
                {renewalRequests.map((r) => (
                  <li key={r.requestId} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-alma-text">{r.studentName}</p>
                      <p className="text-xs text-alma-text-muted">
                        {RENEWAL_METHOD_LABELS[r.method]} · {r.requestedAt}
                      </p>
                    </div>
                    {r.status === 'PENDIENTE' ? (
                      <Button
                        variant="secondary"
                        onClick={() => resolveRenewal(r.requestId)}
                        disabled={resolvingId === r.requestId}
                      >
                        <Check className="h-4 w-4" aria-hidden="true" />
                        Contactado
                      </Button>
                    ) : (
                      <Badge tone="neutral">Contactado</Badge>
                    )}
                  </li>
                ))}
                {renewalRequests.length === 0 && (
                  <li className="py-6 text-center text-sm text-alma-text-muted">Sin solicitudes pendientes.</li>
                )}
              </ul>
            </Card>

            {/* Students that need a human decision today — short and human-triaged, not a score */}
            <Card className="h-fit">
              <div className="flex items-center gap-2">
                <AlertOctagon className="h-4 w-4 text-alma-gold" aria-hidden="true" />
                <h2 className="font-display text-lg text-alma-text">Alumnos que requieren atención</h2>
              </div>
              <ul className="mt-4 divide-y divide-alma-border">
                {attentionItems.map((item) => (
                  <li key={item.studentId} className="py-3">
                    <p className="text-sm font-medium text-alma-text">{item.name}</p>
                    <p className="text-xs text-alma-text-muted">{item.reason}</p>
                  </li>
                ))}
                {attentionItems.length === 0 && (
                  <li className="py-6 text-center text-sm text-alma-text-muted">Nada pendiente hoy.</li>
                )}
              </ul>
            </Card>
          </div>
        </div>
      )}

      {tab === 'agenda' && (
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {summary ? (
              <>
                <StatTile
                  label="Clases hoy"
                  value={summary.classesToday.toString()}
                  icon={<CalendarClock className="h-4 w-4" aria-hidden="true" />}
                />
                <StatTile
                  label="Clases esta semana"
                  value={summary.classesThisWeek.toString()}
                  delta={`${Math.round(summary.averageOccupancy * 100)}% ocupación prom.`}
                  deltaTone="neutral"
                  icon={<Activity className="h-4 w-4" aria-hidden="true" />}
                />
                <StatTile
                  label="Horas dictadas esta semana"
                  value={`${summary.hoursThisWeek}h`}
                  icon={<Clock className="h-4 w-4" aria-hidden="true" />}
                />
                <StatTile
                  label="Alumnos activos"
                  value={summary.activeStudents.toString()}
                  icon={<Users2 className="h-4 w-4" aria-hidden="true" />}
                />
                <StatTile
                  label="Check-ins hoy"
                  value={summary.checkInsToday.toString()}
                  icon={<LogIn className="h-4 w-4" aria-hidden="true" />}
                />
                <StatTile
                  label="Renovaciones pendientes"
                  value={summary.pendingRenewals.toString()}
                  icon={<BellRing className="h-4 w-4" aria-hidden="true" />}
                />
              </>
            ) : (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[104px] animate-pulse rounded-2xl border border-alma-border bg-alma-surface" />
              ))
            )}
          </div>

          {scheduleFeedback && (
            <div className="mt-6">
              <ActionFeedback message={scheduleFeedback} />
            </div>
          )}

          {/* "What needs attention right now" — today's classes, one row per occurrence */}
          <Card className="mt-6">
            <h2 className="font-display text-lg text-alma-text">Clases de hoy</h2>
            <p className="mt-1 text-xs text-alma-text-muted">
              Alma corre clases simultáneas en distintos salones — cada fila es una clase independiente.
            </p>

            <ul className="mt-4 divide-y divide-alma-border">
              {schedule
                .filter((cls) => cls.date === DEMO_TODAY)
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((cls) => {
                  const pending = Math.max(0, cls.capacity - cls.confirmedCount - cls.cancelledCount);
                  const occupancy = cls.confirmedCount / cls.capacity;
                  return (
                    <li key={cls.classId} className="py-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-alma-text">
                            {cls.name} · <span className="text-alma-text-muted">{CATEGORY_LABELS[cls.category]}</span>
                          </p>
                          <p className="text-xs text-alma-text-muted">
                            {cls.startTime}–{cls.endTime} · {cls.roomName} · Prof. {cls.teacher}
                          </p>
                          <p className="text-xs text-alma-text-muted">
                            {cls.confirmedCount} confirmados · {cls.cancelledCount} cancelados · {pending} pendientes
                            {' '}· cupo {cls.capacity}
                          </p>
                        </div>
                        <Badge tone={occupancy >= 0.85 ? 'gold' : occupancy < 0.5 ? 'danger' : 'neutral'}>
                          {Math.round(occupancy * 100)}% ocupación
                        </Badge>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </Card>

          <Card className="mt-6">
            <h2 className="font-display text-lg text-alma-text">Agenda de clases</h2>
            <p className="mt-1 text-xs text-alma-text-muted">
              Confirma con el profesor, o cancela una clase con poca reserva por aforo.
            </p>

            <ul className="mt-4 divide-y divide-alma-border">
              {schedule.map((cls) => (
                <li key={cls.classId} className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-alma-text">{cls.name}</p>
                      <p className="text-xs text-alma-text-muted">
                        {formatDateWithWeekday(cls.date)} · {cls.startTime}–{cls.endTime} · {cls.roomName} · Prof.{' '}
                        {cls.teacher}
                      </p>
                      <p className="text-xs text-alma-text-muted">
                        {cls.confirmedCount}/{cls.capacity} reservados
                        {cls.status === 'CANCELADA' && cls.cancelReason ? ` · Motivo: ${cls.cancelReason}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={CLASS_STATUS_TONE[cls.status]}>{CLASS_STATUS_LABELS[cls.status]}</Badge>
                      {cls.status !== 'CANCELADA' && (
                        <>
                          {cls.status === 'PROGRAMADA' && (
                            <Button
                              variant="secondary"
                              onClick={() => confirmWithTeacher(cls.classId)}
                              disabled={confirmingClassId === cls.classId}
                            >
                              <Check className="h-4 w-4" aria-hidden="true" />
                              Confirmar
                            </Button>
                          )}
                          <Button
                            variant="danger"
                            onClick={() =>
                              setCancelingClassId(cancelingClassId === cls.classId ? null : cls.classId)
                            }
                          >
                            <Ban className="h-4 w-4" aria-hidden="true" />
                            Cancelar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {cancelingClassId === cls.classId && (
                    <div className="mt-3 flex flex-col gap-2 rounded-xl border border-alma-wine/40 bg-alma-wine/5 p-3 sm:flex-row">
                      <input
                        type="text"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Motivo (p. ej. poca reserva)"
                        className="min-h-[44px] flex-1 rounded-lg border border-alma-border bg-alma-bg px-3 text-sm text-alma-text placeholder:text-alma-text-muted focus:border-alma-gold focus:outline-none"
                      />
                      <Button variant="danger" onClick={() => submitCancelClass(cls.classId)}>
                        Confirmar cancelación
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {tab === 'salones' && (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
          <Card className="h-fit">
            <div className="flex items-center gap-2">
              <DoorOpen className="h-4 w-4 text-alma-gold" aria-hidden="true" />
              <h2 className="font-display text-lg text-alma-text">Reservar salón</h2>
            </div>
            <p className="mt-1 text-xs text-alma-text-muted">
              Clases personalizadas, ensayos o práctica libre fuera del horario grupal.
            </p>

            <form onSubmit={createBooking} className="mt-4 flex flex-col gap-2.5">
              <select
                value={bookingRoomId}
                onChange={(e) => setBookingRoomId(e.target.value)}
                className="min-h-[44px] rounded-xl border border-alma-border bg-alma-bg px-3 text-sm text-alma-text focus:border-alma-gold focus:outline-none"
              >
                {ROOMS.map((r) => (
                  <option key={r.roomId} value={r.roomId}>
                    {r.name} (cupo {r.capacity})
                  </option>
                ))}
              </select>
              <input
                type="text"
                required
                value={bookingTitle}
                onChange={(e) => setBookingTitle(e.target.value)}
                placeholder="Título (p. ej. Clase personalizada — nombre)"
                className="min-h-[44px] rounded-xl border border-alma-border bg-alma-bg px-3 text-sm text-alma-text placeholder:text-alma-text-muted focus:border-alma-gold focus:outline-none"
              />
              <input
                type="text"
                required
                value={bookingTeacher}
                onChange={(e) => setBookingTeacher(e.target.value)}
                placeholder="Profesor"
                className="min-h-[44px] rounded-xl border border-alma-border bg-alma-bg px-3 text-sm text-alma-text placeholder:text-alma-text-muted focus:border-alma-gold focus:outline-none"
              />
              <input
                type="date"
                required
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="min-h-[44px] rounded-xl border border-alma-border bg-alma-bg px-3 text-sm text-alma-text focus:border-alma-gold focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="time"
                  required
                  value={bookingStart}
                  onChange={(e) => setBookingStart(e.target.value)}
                  className="min-h-[44px] rounded-xl border border-alma-border bg-alma-bg px-3 text-sm text-alma-text focus:border-alma-gold focus:outline-none"
                />
                <input
                  type="time"
                  required
                  value={bookingEnd}
                  onChange={(e) => setBookingEnd(e.target.value)}
                  className="min-h-[44px] rounded-xl border border-alma-border bg-alma-bg px-3 text-sm text-alma-text focus:border-alma-gold focus:outline-none"
                />
              </div>
              <select
                value={bookingType}
                onChange={(e) => setBookingType(e.target.value as RoomBookingType)}
                className="min-h-[44px] rounded-xl border border-alma-border bg-alma-bg px-3 text-sm text-alma-text focus:border-alma-gold focus:outline-none"
              >
                {BOOKING_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {ROOM_BOOKING_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
              <Button type="submit" variant="primary" disabled={booking}>
                {booking ? 'Reservando…' : 'Reservar (simulación)'}
              </Button>
              {bookingFeedback && <ActionFeedback message={bookingFeedback} />}
            </form>
          </Card>

          <Card className="h-fit">
            <h2 className="font-display text-lg text-alma-text">Reservas activas</h2>
            <p className="mt-1 text-xs text-alma-text-muted">
              Clases personalizadas y ensayos que ocupan un salón fuera del horario grupal.
            </p>

            <ul className="mt-4 divide-y divide-alma-border">
              {roomBookings.map((b) => (
                <li key={b.bookingId} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-alma-text">{b.title}</p>
                    <p className="text-xs text-alma-text-muted">
                      {formatDateWithWeekday(b.date)} · {b.startTime}–{b.endTime} · {b.roomName} · Prof. {b.teacher}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={b.status === 'CANCELADA' ? 'neutral' : 'gold'}>
                      {ROOM_BOOKING_TYPE_LABELS[b.type]}
                    </Badge>
                    {b.status === 'CONFIRMADA' && (
                      <Button variant="ghost" onClick={() => cancelBooking(b.bookingId)}>
                        <X className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                </li>
              ))}
              {roomBookings.length === 0 && (
                <li className="py-6 text-center text-sm text-alma-text-muted">Sin reservas de salón.</li>
              )}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
