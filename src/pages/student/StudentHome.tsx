import { useEffect, useState } from 'react';
import { CalendarCheck, Flame, Receipt, Wallet, X } from 'lucide-react';
import {
  api,
  ATTENDANCE_INTENT_LABELS,
  JULIAN,
  PAYMENT_METHOD_LABELS,
  PAYMENT_REPORT_STATUS_LABELS,
  PROGRAM_LABELS,
} from '../../lib/api';
import type { PaymentMethod, PaymentReportStatus, StudentSummary } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge, type BadgeTone } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { ActionFeedback } from '../../components/ui/ActionFeedback';
import { AlmaLoader } from '../../components/ui/AlmaLoader';
import { formatDateLong, formatDateWithWeekday } from '../../lib/format';

const PAYMENT_REPORT_TONE: Record<PaymentReportStatus, BadgeTone> = {
  PENDING_REVIEW: 'gold',
  APPROVED: 'success',
  REJECTED: 'danger',
};

const REPORT_PLANS = [
  { name: 'Alma Open (mensual)', classes: 999, price: 220_000 },
  { name: 'Paquete 4 clases', classes: 4, price: 150_000 },
  { name: 'Paquete 8 clases', classes: 8, price: 280_000 },
  { name: 'Paquete 12 clases', classes: 12, price: 390_000 },
];

/**
 * Report a payment — not instant checkout. It starts PENDING_REVIEW;
 * Jonathan or Iván review and approve it from Gestión, which is what
 * actually activates the plan (30 days from that approval).
 */
function PaymentCard({ data, onReported }: { data: StudentSummary; onReported: () => void }) {
  const [plan, setPlan] = useState(REPORT_PLANS[0]);
  const [method, setMethod] = useState<PaymentMethod>('QR');
  const [proofNote, setProofNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const urgent = !data.package || data.availableClasses === 0 || (data.package?.daysUntilExpiry ?? 99) <= 7;

  async function submitReport() {
    setBusy(true);
    const r = await api.payments.report({
      studentId: data.studentId,
      planName: plan.name,
      classes: plan.classes,
      amount: plan.price,
      paymentMethod: method,
      proofNote: proofNote || undefined,
      actedBy: 'STUDENT',
      actedByName: data.firstName,
    });
    setFeedback(r.message);
    setBusy(false);
    onReported();
  }

  return (
    <Card className={urgent ? 'mt-5 border-alma-gold/30 bg-alma-gold/5' : 'mt-5'}>
      <div className="flex items-center gap-2">
        <Wallet className="h-4 w-4 text-alma-gold" aria-hidden="true" />
        <p className="text-sm font-medium text-alma-text">
          {urgent ? 'Tu plan necesita renovarse' : 'Renovar o reactivar tu plan'}
        </p>
      </div>
      <p className="mt-1 text-xs text-alma-text-muted">
        Métodos: efectivo, QR Davivienda o tarjeta. Reportar aquí no activa el plan de inmediato — Jonathan
        o Iván lo revisan y lo activan por 30 días.
      </p>

      <div className="mt-3 flex flex-col gap-2">
        <select
          value={plan.name}
          onChange={(e) => setPlan(REPORT_PLANS.find((p) => p.name === e.target.value) ?? REPORT_PLANS[0])}
          className="min-h-[44px] rounded-xl border border-alma-border bg-alma-bg px-3 text-sm text-alma-text focus:border-alma-gold focus:outline-none"
        >
          {REPORT_PLANS.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name} · ${p.price.toLocaleString('es-CO')}
            </option>
          ))}
        </select>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as PaymentMethod)}
          className="min-h-[44px] rounded-xl border border-alma-border bg-alma-bg px-3 text-sm text-alma-text focus:border-alma-gold focus:outline-none"
        >
          {(['EFECTIVO', 'QR', 'TARJETA'] as PaymentMethod[]).map((m) => (
            <option key={m} value={m}>
              {PAYMENT_METHOD_LABELS[m]}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={proofNote}
          onChange={(e) => setProofNote(e.target.value)}
          placeholder="Nota de comprobante (opcional)"
          className="min-h-[44px] rounded-xl border border-alma-border bg-alma-bg px-3 text-sm text-alma-text placeholder:text-alma-text-muted focus:border-alma-gold focus:outline-none"
        />
        <Button variant="primary" onClick={submitReport} disabled={busy}>
          <Receipt className="h-4 w-4" aria-hidden="true" />
          {busy ? 'Reportando…' : 'Reportar pago (simulación)'}
        </Button>
        {busy && <AlmaLoader label="Enviando reporte…" />}
      </div>

      {feedback && (
        <div className="mt-3">
          <ActionFeedback message={feedback} />
        </div>
      )}

      {data.paymentReports.length > 0 && (
        <ul className="mt-4 divide-y divide-alma-border">
          {data.paymentReports.map((r) => (
            <li key={r.reportId} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-xs text-alma-text-secondary">{r.planName}</p>
                <p className="text-xs text-alma-text-muted">
                  {r.reportedAt} · {PAYMENT_METHOD_LABELS[r.paymentMethod]}
                  {r.saleConsecutive ? ` · ${r.saleConsecutive}` : ''}
                </p>
              </div>
              <Badge tone={PAYMENT_REPORT_TONE[r.status]}>{PAYMENT_REPORT_STATUS_LABELS[r.status]}</Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function StudentHome() {
  const [data, setData] = useState<StudentSummary | null>(null);
  const [pendingClassId, setPendingClassId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  function load() {
    api.student.getSummary(JULIAN.studentId).then(setData);
  }

  useEffect(() => {
    load();
  }, []);

  async function reserve(classId: string) {
    setPendingClassId(classId);
    const result = await api.student.confirmClass(classId);
    setFeedback(result.message);
    load();
    setPendingClassId(null);
  }

  async function cancelReservation(classId: string) {
    setPendingClassId(classId);
    const result = await api.student.cancelClass(classId);
    setFeedback(result.message);
    load();
    setPendingClassId(null);
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
        <div className="flex h-72 items-center justify-center rounded-2xl border border-alma-border bg-alma-surface px-8">
          <AlmaLoader label="Cargando tu portal…" />
        </div>
      </div>
    );
  }

  const expirySoon = (data.package?.daysUntilExpiry ?? 99) <= 7;
  const todayStatus = data.todayClass?.registrationStatus ?? null;
  const todayClassId = data.todayClass?.danceClass.classId;

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:px-6">
      <p className="text-sm text-alma-text-muted">Portal del alumno · Julián</p>
      <h1 className="mt-1 font-display text-2xl text-alma-text">Hola, Julián</h1>
      <p className="mt-1 text-xs text-alma-text-muted">Plan: {PROGRAM_LABELS[data.program]}</p>

      {/* Balance — the dominant metric */}
      <Card elevated className="mt-6 text-center">
        <p
          className={[
            'font-display text-7xl',
            data.availableClasses === 0 ? 'text-[#e4a3ab]' : 'text-alma-gold',
          ].join(' ')}
        >
          {data.availableClasses}
        </p>
        <p className="mt-1 text-sm text-alma-text-secondary">
          {data.availableClasses === 1 ? 'clase disponible' : 'clases disponibles'}
        </p>

        {data.package ? (
          <div className="mt-4 flex justify-center">
            <Badge tone={expirySoon ? 'danger' : 'neutral'}>
              Vence el {formatDateLong(data.package.expiresOn)} · faltan {data.package.daysUntilExpiry}{' '}
              días
            </Badge>
          </div>
        ) : (
          <p className="mt-4 text-sm text-[#e4a3ab]">Reporta un pago para reactivar tu plan</p>
        )}
      </Card>

      <PaymentCard data={data} onReported={load} />

      {/* Today's class — reserve / cancel lifecycle */}
      {data.todayClass && todayClassId && (
        <Card className="mt-5">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-alma-gold" aria-hidden="true" />
            <p className="text-sm font-medium text-alma-text">Clase de hoy</p>
          </div>
          <p className="mt-1 text-sm text-alma-text-secondary">
            {data.todayClass.danceClass.name} · {data.todayClass.danceClass.startTime}–
            {data.todayClass.danceClass.endTime}
          </p>
          <p className="text-xs text-alma-text-muted">
            {data.todayClass.danceClass.roomName} · Profesora {data.todayClass.danceClass.teacher}
          </p>

          {todayStatus === 'ATTENDED' ? (
            <p className="mt-3 text-xs text-alma-text-muted">Ya marcaste tu asistencia hoy.</p>
          ) : todayStatus === 'CONFIRMED' ? (
            <div className="mt-3 flex items-center justify-between gap-3">
              <Badge tone="gold">{ATTENDANCE_INTENT_LABELS.CONFIRMED}</Badge>
              <Button
                variant="ghost"
                onClick={() => cancelReservation(todayClassId)}
                disabled={pendingClassId === todayClassId}
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Cancelar
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              className="mt-3 w-full"
              onClick={() => reserve(todayClassId)}
              disabled={pendingClassId === todayClassId}
            >
              <CalendarCheck className="h-4 w-4" aria-hidden="true" />
              {pendingClassId === todayClassId ? 'Confirmando…' : 'Confirmar asistencia (simulación)'}
            </Button>
          )}
        </Card>
      )}

      {feedback && (
        <div className="mt-3">
          <ActionFeedback message={feedback} />
        </div>
      )}

      {/* Points */}
      <Card className="mt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-alma-text-secondary">Puntos</p>
            <p className="font-display text-2xl text-alma-text">{data.points.balance}</p>
          </div>
          <Badge tone="gold">Nivel {data.points.tierLabel}</Badge>
        </div>
        <div className="mt-3">
          <ProgressBar value={data.points.progress} />
          {data.points.nextTier && (
            <p className="mt-1.5 text-xs text-alma-text-muted">
              {data.points.pointsToNextTier} puntos para {data.points.nextTier}
            </p>
          )}
        </div>
      </Card>

      {/* Streak */}
      {data.streak.consecutiveWeeks > 0 && (
        <Card className="mt-5 flex items-center gap-3 border-alma-gold/25 bg-alma-gold/5">
          <Flame className="h-5 w-5 text-alma-gold" aria-hidden="true" />
          <p className="text-sm text-alma-text">
            {data.streak.consecutiveWeeks} semanas seguidas asistiendo
          </p>
        </Card>
      )}

      {/* Upcoming classes — each reservable and cancellable on its own */}
      <section className="mt-8">
        <h2 className="font-display text-lg text-alma-text">Próximas clases</h2>
        <p className="mt-1 text-xs text-alma-text-muted">
          Puedes reservar más de una clase el mismo día. Cancela hasta 30 minutos antes.
        </p>
        <div className="mt-3 flex flex-col gap-3">
          {data.upcomingClasses.map((cls) => (
            <Card key={cls.classId}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-alma-text">{cls.name}</p>
                  <p className="text-xs text-alma-text-muted">
                    {formatDateWithWeekday(cls.date)} · {cls.startTime}–{cls.endTime}
                  </p>
                  <p className="text-xs text-alma-text-muted">
                    {cls.roomName} · Con {cls.teacher}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-alma-text-muted">
                  {cls.confirmedCount}/{cls.capacity}
                </span>
              </div>

              <div className="mt-3">
                {cls.registrationStatus === 'ATTENDED' ? (
                  <p className="text-xs text-alma-text-muted">Ya asististe a esta clase.</p>
                ) : cls.registrationStatus === 'CONFIRMED' ? (
                  <div className="flex items-center justify-between gap-3">
                    <Badge tone="gold">{ATTENDANCE_INTENT_LABELS.CONFIRMED}</Badge>
                    <Button
                      variant="ghost"
                      onClick={() => cancelReservation(cls.classId)}
                      disabled={pendingClassId === cls.classId}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => reserve(cls.classId)}
                    disabled={pendingClassId === cls.classId}
                  >
                    <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                    {pendingClassId === cls.classId ? 'Reservando…' : 'Reservar cupo (simulación)'}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Attendance history */}
      <section className="mt-8 pb-8">
        <h2 className="font-display text-lg text-alma-text">Historial de asistencia</h2>
        <Card className="mt-3 divide-y divide-alma-border p-0">
          {data.attendanceHistory.map((record) => (
            <div key={record.attendanceId} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="text-sm text-alma-text">{record.className}</p>
                <p className="text-xs text-alma-text-muted">
                  {formatDateLong(record.date)} · Prof. {record.teacher}
                </p>
              </div>
              <span className="text-xs text-alma-gold">+{record.points} pts</span>
            </div>
          ))}
        </Card>
      </section>
    </div>
  );
}
