import { useEffect, useState } from 'react';
import { CalendarCheck, Flame, QrCode, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, JULIAN } from '../../lib/api';
import type { StudentSummary } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { ActionFeedback } from '../../components/ui/ActionFeedback';
import { formatDateLong, formatDateWithWeekday } from '../../lib/format';

export function StudentHome() {
  const [data, setData] = useState<StudentSummary | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  function load() {
    api.student.getSummary(JULIAN.studentId).then(setData);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleConfirm() {
    setConfirming(true);
    const result = await api.checkIn.confirm(JULIAN.studentId);
    setFeedback(result.message);
    load();
    setConfirming(false);
  }

  async function handleCancel() {
    setConfirming(true);
    const result = await api.checkIn.cancelConfirmation(JULIAN.studentId);
    setFeedback(result.message);
    load();
    setConfirming(false);
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
        <div className="h-72 animate-pulse rounded-2xl border border-alma-border bg-alma-surface" />
      </div>
    );
  }

  const expirySoon = (data.package?.daysUntilExpiry ?? 99) <= 7;
  const todayStatus = data.todayClass?.registrationStatus ?? null;

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

      {/* Today's class — confirm / cancel lifecycle */}
      {data.todayClass && (
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
              <Button variant="ghost" onClick={handleCancel} disabled={confirming}>
                <X className="h-4 w-4" aria-hidden="true" />
                Cancelar
              </Button>
            </div>
          ) : (
            <Button variant="secondary" className="mt-3 w-full" onClick={handleConfirm} disabled={confirming}>
              <CalendarCheck className="h-4 w-4" aria-hidden="true" />
              {confirming ? 'Confirmando…' : 'Confirmar asistencia (simulación)'}
            </Button>
          )}

          {feedback && <div className="mt-3"><ActionFeedback message={feedback} /></div>}
        </Card>
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

      {/* Upcoming classes */}
      <section className="mt-8">
        <h2 className="font-display text-lg text-alma-text">Próximas clases</h2>
        <div className="mt-3 flex flex-col gap-3">
          {data.upcomingClasses.map((cls) => (
            <Card key={cls.classId} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-alma-text">{cls.name}</p>
                <p className="text-xs text-alma-text-muted">
                  {formatDateWithWeekday(cls.date)} · {cls.startTime}–{cls.endTime}
                </p>
                <p className="text-xs text-alma-text-muted">
                  {cls.roomName} · Profesor{cls.teacher === 'Laura' ? 'a' : ''} {cls.teacher}
                </p>
              </div>
              <span className="text-xs text-alma-text-muted">
                {cls.attendeeCount}/{cls.capacity}
              </span>
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
