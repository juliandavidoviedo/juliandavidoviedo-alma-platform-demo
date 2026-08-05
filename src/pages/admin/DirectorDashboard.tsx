import { useEffect, useState } from 'react';
import { AlertTriangle, Lightbulb, Users2, Wallet, CalendarClock, Activity } from 'lucide-react';
import { api } from '../../lib/api';
import type { DirectorDashboard as DirectorDashboardData } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { StatTile } from '../../components/ui/StatTile';
import { Badge } from '../../components/ui/Badge';
import { formatCOP, formatPercentDelta, formatSignedInt } from '../../lib/format';

function SkeletonTile() {
  return <div className="h-[104px] animate-pulse rounded-2xl border border-alma-border bg-alma-surface" />;
}

export function DirectorDashboard() {
  const [data, setData] = useState<DirectorDashboardData | null>(null);

  useEffect(() => {
    let active = true;
    api.admin.getDashboard().then((result) => {
      if (active) setData(result);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-1">
        <span className="text-sm text-alma-text-muted">Panel de dirección · Iván</span>
        <h1 className="font-display text-3xl text-alma-text">
          {data ? `Resumen de ${data.monthLabel}` : 'Cargando resumen del mes…'}
        </h1>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data ? (
          <>
            <StatTile
              label="Alumnos activos"
              value={data.activeStudents.toString()}
              delta={formatSignedInt(data.activeStudentsDelta)}
              deltaTone={data.activeStudentsDelta >= 0 ? 'positive' : 'negative'}
              icon={<Users2 className="h-4 w-4" aria-hidden="true" />}
            />
            <StatTile
              label="Caja del mes"
              value={formatCOP(data.monthlyCash)}
              delta={formatPercentDelta(data.monthlyCashDelta)}
              deltaTone={data.monthlyCashDelta >= 0 ? 'positive' : 'negative'}
              icon={<Wallet className="h-4 w-4" aria-hidden="true" />}
            />
            <StatTile
              label="Asistencias"
              value={data.attendances.toString()}
              delta={formatPercentDelta(data.attendancesDelta)}
              deltaTone={data.attendancesDelta >= 0 ? 'positive' : 'negative'}
              icon={<Activity className="h-4 w-4" aria-hidden="true" />}
            />
            <StatTile
              label="Paquetes por vencer (7 días)"
              value={data.packagesExpiringSoon.toString()}
              icon={<CalendarClock className="h-4 w-4" aria-hidden="true" />}
            />
            <StatTile
              label="Ingreso diferido"
              value={formatCOP(data.deferredRevenue)}
              icon={<Wallet className="h-4 w-4" aria-hidden="true" />}
            />
            <StatTile
              label="Alumnos en riesgo"
              value={data.studentsAtRisk.length.toString()}
              icon={<AlertTriangle className="h-4 w-4" aria-hidden="true" />}
            />
          </>
        ) : (
          Array.from({ length: 6 }).map((_, i) => <SkeletonTile key={i} />)
        )}
      </div>

      {data && (
        <>
          {/* Insights */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {data.insights.map((insight) => (
              <Card key={insight} className="flex gap-3 border-alma-gold/25 bg-alma-gold/5">
                <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-alma-gold" aria-hidden="true" />
                <p className="text-sm text-alma-text-secondary">{insight}</p>
              </Card>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Students at risk */}
            <Card>
              <h2 className="font-display text-lg text-alma-text">Alumnos en riesgo de fuga</h2>
              <p className="mt-1 text-xs text-alma-text-muted">
                21 días o más sin venir, con clases disponibles.
              </p>
              <ul className="mt-4 divide-y divide-alma-border">
                {data.studentsAtRisk.map((student) => (
                  <li key={student.studentId} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-alma-text">{student.name}</p>
                      <p className="text-xs text-alma-text-muted">
                        {student.daysAbsent} días sin venir · {student.availableClasses} clase
                        {student.availableClasses === 1 ? '' : 's'} disponible
                        {student.availableClasses === 1 ? '' : 's'}
                      </p>
                    </div>
                    <Badge tone="danger">Riesgo</Badge>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Occupancy */}
            <Card>
              <h2 className="font-display text-lg text-alma-text">Ocupación por clase</h2>
              <p className="mt-1 text-xs text-alma-text-muted">Promedio de asistentes vs. cupo.</p>
              <ul className="mt-4 space-y-4">
                {data.occupancyByClass.map((cls) => (
                  <li key={cls.className}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-alma-text">{cls.className}</span>
                      <span className="text-alma-text-muted">
                        {cls.averageAttendees}/{cls.capacity} · {Math.round(cls.occupancy * 100)}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-alma-border">
                      <div
                        className="h-full rounded-full bg-alma-gold"
                        style={{ width: `${Math.round(cls.occupancy * 100)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-alma-text-muted">Profesor: {cls.teacher}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
