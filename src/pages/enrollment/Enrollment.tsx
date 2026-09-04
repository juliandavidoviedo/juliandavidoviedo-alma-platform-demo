import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { api, GUARDIAN_RELATIONSHIP_LABELS } from '../../lib/api';
import type { ConsentChoices, GuardianRelationship, StudentLevel } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ActionFeedback } from '../../components/ui/ActionFeedback';
import { AlmaLoader } from '../../components/ui/AlmaLoader';

const LEVELS: StudentLevel[] = ['INICIAL', 'INTERMEDIO', 'AVANZADO'];
const RELATIONSHIPS: GuardianRelationship[] = ['MADRE', 'PADRE', 'ACUDIENTE'];

const EMPTY_CONSENTS: ConsentChoices = {
  personalData: false,
  sensitiveHealth: false,
  internalImage: false,
  publicImage: false,
};

/**
 * Minimal online-enrollment intake — adult or minor, deliberately not
 * overbuilt: one form, one submission, no review screen for Gestión/Admin
 * yet (out of scope until the pilot needs one, see PROJECT_CONTEXT.md).
 */
export function Enrollment() {
  const [isMinor, setIsMinor] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [level, setLevel] = useState<StudentLevel>('INICIAL');
  const [eps, setEps] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianRelationship, setGuardianRelationship] = useState<GuardianRelationship>('MADRE');
  const [consents, setConsents] = useState<ConsentChoices>(EMPTY_CONSENTS);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    phone.trim() &&
    consents.personalData &&
    (!eps.trim() || consents.sensitiveHealth) &&
    (!isMinor || (guardianName.trim() && guardianPhone.trim()));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setMessage(null);
    const result = await api.public.enroll({
      isMinor,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      birthDate,
      level,
      eps: eps.trim(),
      guardianName: isMinor ? guardianName.trim() : undefined,
      guardianPhone: isMinor ? guardianPhone.trim() : undefined,
      guardianRelationship: isMinor ? guardianRelationship : undefined,
      consents,
    });
    setMessage(result.message);
    setSubmitting(false);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <p className="text-sm text-alma-text-muted">Inscripción en línea</p>
      <h1 className="mt-1 font-display text-2xl text-alma-text">Inscríbete en Alma de Tango</h1>
      <p className="mt-2 text-sm text-alma-text-secondary">
        Un asesor confirma tu plan y horario después de recibir esta inscripción (simulación) — no se
        realiza ningún pago aquí.
      </p>

      <Card className="mt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="inline-flex w-full rounded-full border border-alma-border bg-alma-surface-elevated p-1">
            <button
              type="button"
              onClick={() => setIsMinor(false)}
              className={[
                'flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors',
                !isMinor ? 'bg-alma-gold text-alma-bg' : 'text-alma-text-secondary',
              ].join(' ')}
            >
              Adulto
            </button>
            <button
              type="button"
              onClick={() => setIsMinor(true)}
              className={[
                'flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors',
                isMinor ? 'bg-alma-gold text-alma-bg' : 'text-alma-text-secondary',
              ].join(' ')}
            >
              Menor de edad
            </button>
          </div>

          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Nombre del alumno"
            className="min-h-[44px] w-full rounded-xl border border-alma-border bg-alma-bg px-3.5 text-sm text-alma-text placeholder:text-alma-text-muted focus:border-alma-gold focus:outline-none"
          />
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Apellido del alumno"
            className="min-h-[44px] w-full rounded-xl border border-alma-border bg-alma-bg px-3.5 text-sm text-alma-text placeholder:text-alma-text-muted focus:border-alma-gold focus:outline-none"
          />
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="min-h-[44px] w-full rounded-xl border border-alma-border bg-alma-bg px-3.5 text-sm text-alma-text focus:border-alma-gold focus:outline-none"
          />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as StudentLevel)}
            className="min-h-[44px] w-full rounded-xl border border-alma-border bg-alma-bg px-3.5 text-sm text-alma-text focus:border-alma-gold focus:outline-none"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                Nivel: {l}
              </option>
            ))}
          </select>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={isMinor ? 'Teléfono de contacto (acudiente)' : 'Teléfono'}
            className="min-h-[44px] w-full rounded-xl border border-alma-border bg-alma-bg px-3.5 text-sm text-alma-text placeholder:text-alma-text-muted focus:border-alma-gold focus:outline-none"
          />

          {isMinor && (
            <div className="rounded-xl border border-alma-border bg-alma-bg p-3.5">
              <p className="text-xs font-medium tracking-wide text-alma-text-muted uppercase">
                Acudiente responsable
              </p>
              <div className="mt-2 flex flex-col gap-2.5">
                <input
                  type="text"
                  required={isMinor}
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="Nombre del acudiente"
                  className="min-h-[44px] w-full rounded-xl border border-alma-border bg-alma-surface px-3.5 text-sm text-alma-text placeholder:text-alma-text-muted focus:border-alma-gold focus:outline-none"
                />
                <input
                  type="tel"
                  required={isMinor}
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  placeholder="Teléfono del acudiente"
                  className="min-h-[44px] w-full rounded-xl border border-alma-border bg-alma-surface px-3.5 text-sm text-alma-text placeholder:text-alma-text-muted focus:border-alma-gold focus:outline-none"
                />
                <select
                  value={guardianRelationship}
                  onChange={(e) => setGuardianRelationship(e.target.value as GuardianRelationship)}
                  className="min-h-[44px] w-full rounded-xl border border-alma-border bg-alma-surface px-3.5 text-sm text-alma-text focus:border-alma-gold focus:outline-none"
                >
                  {RELATIONSHIPS.map((r) => (
                    <option key={r} value={r}>
                      {GUARDIAN_RELATIONSHIP_LABELS[r]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <input
            type="text"
            value={eps}
            onChange={(e) => setEps(e.target.value)}
            placeholder="EPS (opcional — solo para emergencias)"
            className="min-h-[44px] w-full rounded-xl border border-alma-border bg-alma-bg px-3.5 text-sm text-alma-text placeholder:text-alma-text-muted focus:border-alma-gold focus:outline-none"
          />
          <p className="text-xs text-alma-text-muted">
            La EPS se trata como información sensible y solo se usa en caso de emergencia.
          </p>

          <div className="mt-1 flex flex-col gap-2.5 rounded-xl border border-alma-border bg-alma-bg p-3.5">
            <p className="text-xs font-medium tracking-wide text-alma-text-muted uppercase">
              Consentimientos — cada uno es independiente
            </p>
            <label className="flex items-start gap-2 text-xs text-alma-text-secondary">
              <input
                type="checkbox"
                checked={consents.personalData}
                onChange={(e) => setConsents((c) => ({ ...c, personalData: e.target.checked }))}
                required
              />
              Autorizo el tratamiento de mis datos personales (habeas data).
            </label>
            <label className="flex items-start gap-2 text-xs text-alma-text-secondary">
              <input
                type="checkbox"
                checked={consents.sensitiveHealth}
                onChange={(e) => setConsents((c) => ({ ...c, sensitiveHealth: e.target.checked }))}
              />
              Autorizo el tratamiento de mi información sensible de salud (EPS, si aplica).
            </label>
            <label className="flex items-start gap-2 text-xs text-alma-text-secondary">
              <input
                type="checkbox"
                checked={consents.internalImage}
                onChange={(e) => setConsents((c) => ({ ...c, internalImage: e.target.checked }))}
              />
              Autorizo uso interno de imagen/video (registro de clases y eventos).
            </label>
            <label className="flex items-start gap-2 text-xs text-alma-text-secondary">
              <input
                type="checkbox"
                checked={consents.publicImage}
                onChange={(e) => setConsents((c) => ({ ...c, publicImage: e.target.checked }))}
              />
              Autorizo uso público/redes sociales de imagen/video.
            </label>
            <p className="text-xs text-alma-text-muted">
              Texto legal pendiente de validación — estas descripciones son provisionales.
            </p>
          </div>

          <Button type="submit" variant="primary" disabled={!canSubmit || submitting}>
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            {submitting ? 'Enviando…' : 'Enviar inscripción (simulación)'}
          </Button>
          {submitting && <AlmaLoader label="Registrando inscripción…" />}
          {message && <ActionFeedback message={message} />}
        </form>
      </Card>
    </div>
  );
}
