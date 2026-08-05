import { useEffect, useState } from 'react';
import { Bell, CalendarCheck, Flame, QrCode, Wallet, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, JULIAN } from '../../lib/api';
import type { StudentSummary } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { ActionFeedback } from '../../components/ui/ActionFeedback';
import { QrGlyph } from '../../components/QrGlyph';
import { formatDateLong, formatDateWithWeekday } from '../../lib/format';

function RenewalCard({ urgent }: { urgent: boolean }) {
  const [showQr, setShowQr] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function alertReception() {
    setBusy(true);
    const r = await api.student.requestRenewal('ALARMA_RECEPCION');
    setFeedback(r.message);
    setBusy(false);
  }

  async function confirmTransfer() {
    setBusy(true);
    const r = await api.student.requestRenewal('QR_TRANSFERENCIA');
    setFeedback(r.message);
    setBusy(false);
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
        Sin pasarela real: recepción confirma cualquiera de las dos opciones a mano.
      </p>

      {!showQr ? (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Button variant="secondary" className="flex-1" onClick={alertReception} disabled={busy}>
            <Bell className="h-4 w-4" aria-hidden="true" />
            Avisar a recepción
          </Button>
          <Button variant="primary" className="flex-1" onClick={() => setShowQr(true)} disabled={busy}>
            <QrCode className="h-4 w-4" aria-hidden="true" />
            Pagar por transferencia
          </Button>
        </div>
      ) : (
        <div className="mt-3 flex flex-col items-center gap-3 rounded-xl border border-alma-border bg-alma-bg p-4 text-center">
          <QrGlyph seed={`transfer-${JULIAN.studentId}`} />
          <div className="text-xs text-alma-text-muted">
            <p>Cuenta de ahorros ficticia · Banco Alma</p>
            <p>N.º 000-000000-00 · Alma de Tango SAS</p>
          </div>
          <Button variant="primary" className="w-full" onClick={confirmTransfer} disabled={busy}>
            {busy ? 'Enviando…' : 'Ya transferí, notificar a recepción'}
          </Button>
          <button
            type="button"
            className="text-xs text-alma-text-muted underline underline-offset-2"
            onClick={() => setShowQr(false)}
          >
            Cancelar
          </button>
        </div>
      )}

      {feedback && (
        <div className="mt-3">
          <ActionFeedback message={feedback} />
        </div>
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
        <div className="h-72 animate-pulse rounded-2xl border border-alma-border bg-alma-surface" />
      </div>
    );
  }

  const expirySoon = (data.package?.daysUntilExpiry ?? 99) <= 7;
  const needsRenewal = !data.package || data.availableClasses === 0 || expirySoon;
  const todayStatus = data.todayClass?.registrationStatus ?? null;
  const todayClassId = data.todayClass?.danceClass.classId;

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:px-6">
      <p className="text-sm text-alma-text-muted">Portal del alumno · Julián</p>
      <h1 className="mt-1 font-display text-2xl text-alma-text">Hola, Julián</h1>

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
          <p className="mt-4 text-sm text-[#e4a3ab]">Pasa por recepción para recargar</p>
        )}

        <Link to="/checkin" className="mt-6 block">
          <Button variant="primary" className="w-full">
            <QrCode className="h-4 w-4" aria-hidden="true" />
            Registrar asistencia
          </Button>
        </Link>
      </Card>

      <RenewalCard urgent={needsRenewal} />

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
            {data.todayClass.danceClass.roomName} (piso {data.todayClass.danceClass.floor}) · Profesora{' '}
            {data.todayClass.danceClass.teacher}
          </p>

          {todayStatus === 'CHECKED_IN' ? (
            <p className="mt-3 text-xs text-alma-text-muted">Ya marcaste tu asistencia hoy.</p>
          ) : todayStatus === 'CONFIRMED' ? (
            <div className="mt-3 flex items-center justify-between gap-3">
              <Badge tone="gold">Confirmado</Badge>
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
                    {cls.roomName} · Profesor{cls.teacher === 'Laura' ? 'a' : ''} {cls.teacher}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-alma-text-muted">
                  {cls.attendeeCount}/{cls.capacity}
                </span>
              </div>

              <div className="mt-3">
                {cls.registrationStatus === 'CHECKED_IN' ? (
                  <p className="text-xs text-alma-text-muted">Ya asististe a esta clase.</p>
                ) : cls.registrationStatus === 'CONFIRMED' ? (
                  <div className="flex items-center justify-between gap-3">
                    <Badge tone="gold">Reservado</Badge>
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
