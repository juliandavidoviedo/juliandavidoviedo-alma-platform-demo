import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ShieldCheck, UserPlus } from 'lucide-react';
import {
  api,
  CONSENT_TYPE_LABELS,
  DOCUMENT_TYPE_LABELS,
  EMERGENCY_RELATIONSHIP_LABELS,
  GUARDIAN_RELATIONSHIP_LABELS,
  PROGRAM_LABELS,
  REGISTRATION_POLICY_VERSION,
} from '../../lib/api';
import type {
  DocumentType,
  EmergencyRelationship,
  GuardianRelationship,
  ProgramName,
  RegistrationConsentInput,
} from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ActionFeedback } from '../../components/ui/ActionFeedback';
import { AlmaLoader } from '../../components/ui/AlmaLoader';

const DOCUMENT_TYPES: DocumentType[] = ['CC', 'TI', 'CE', 'PASAPORTE', 'RC'];
const PROGRAMS: ProgramName[] = ['ALMA_OPEN', 'ALMA_KIDS', 'ALMA_EVOLUTION', 'ALMA_PRO', 'ALMA_PROJECT'];
const EMERGENCY_RELATIONSHIPS: EmergencyRelationship[] = ['MADRE', 'PADRE', 'HERMANO_A', 'PAREJA', 'AMIGO_A', 'OTRO'];
const GUARDIAN_RELATIONSHIPS: GuardianRelationship[] = ['MADRE', 'PADRE', 'ACUDIENTE'];

const EMPTY_CONSENTS: RegistrationConsentInput = {
  personalData: false,
  sensitiveHealth: false,
  internalImage: false,
  publicImage: false,
  marketing: false,
};

const INPUT_CLASS =
  'min-h-[44px] w-full rounded-xl border border-alma-border bg-alma-bg px-3.5 text-sm text-alma-text placeholder:text-alma-text-muted focus:border-alma-gold focus:outline-none';

function isMinorFromBirthDate(birthDateIso: string): boolean | null {
  if (!birthDateIso) return null;
  const birth = new Date(`${birthDateIso}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hadBirthdayThisYear =
    today.getMonth() > birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hadBirthdayThisYear) age -= 1;
  return age < 18;
}

/**
 * Public, unauthenticated registration/update intake — distributed by QR or
 * WhatsApp link, not the authenticated Student Portal (/student). Models
 * PERSON → STUDENT → CONSENTS, not a single form-response row — see
 * PROJECT_CONTEXT.md and `types.ts`. No student/admin data is fetched or
 * rendered on this page.
 */
export function StudentRegistration() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('CC');
  const [documentNumber, setDocumentNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [currentProgram, setCurrentProgram] = useState<ProgramName>('ALMA_OPEN');
  const [interests, setInterests] = useState('');

  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState<EmergencyRelationship>('MADRE');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [eps, setEps] = useState('');

  const [guardianFullName, setGuardianFullName] = useState('');
  const [guardianDocumentType, setGuardianDocumentType] = useState<DocumentType>('CC');
  const [guardianDocumentNumber, setGuardianDocumentNumber] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianRelationship, setGuardianRelationship] = useState<GuardianRelationship>('MADRE');

  const [consents, setConsents] = useState<RegistrationConsentInput>(EMPTY_CONSENTS);

  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; duplicate: boolean } | null>(null);

  const isMinor = useMemo(() => isMinorFromBirthDate(birthDate), [birthDate]);

  useEffect(() => {
    setDuplicateWarning(false);
  }, [documentType, documentNumber]);

  async function checkDuplicate() {
    if (!documentNumber.trim()) return;
    setCheckingDuplicate(true);
    try {
      const result = await api.registration.lookup(documentNumber.trim());
      setDuplicateWarning(result.found);
    } catch {
      // Non-critical — the submit itself still does the real duplicate check server-side.
      setDuplicateWarning(false);
    } finally {
      setCheckingDuplicate(false);
    }
  }

  const requiresGuardian = isMinor === true;
  const epsRequiresConsent = eps.trim().length > 0;

  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    documentNumber.trim() &&
    birthDate &&
    phone.trim() &&
    emergencyContactName.trim() &&
    emergencyContactPhone.trim() &&
    consents.personalData &&
    (!epsRequiresConsent || consents.sensitiveHealth) &&
    (!requiresGuardian ||
      (guardianFullName.trim() && guardianDocumentNumber.trim() && guardianPhone.trim() && guardianEmail.trim()));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit || isMinor === null) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const result = await api.registration.submit({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        documentType,
        documentNumber: documentNumber.trim(),
        birthDate,
        phone: phone.trim(),
        email: email.trim(),
        currentProgram,
        interests: interests.trim() || undefined,
        emergencyContactName: emergencyContactName.trim(),
        emergencyContactRelationship,
        emergencyContactPhone: emergencyContactPhone.trim(),
        eps: eps.trim(),
        guardianFullName: requiresGuardian ? guardianFullName.trim() : undefined,
        guardianDocumentType: requiresGuardian ? guardianDocumentType : undefined,
        guardianDocumentNumber: requiresGuardian ? guardianDocumentNumber.trim() : undefined,
        guardianPhone: requiresGuardian ? guardianPhone.trim() : undefined,
        guardianEmail: requiresGuardian ? guardianEmail.trim() : undefined,
        guardianRelationship: requiresGuardian ? guardianRelationship : undefined,
        consents,
      });
      setFeedback({ message: result.message, duplicate: result.duplicate });
    } catch (err) {
      setFeedback({
        message:
          err instanceof Error
            ? err.message.replace(/^[A-Z_]+: /, '')
            : 'No se pudo guardar tu registro. Revisa tu conexión e intenta de nuevo.',
        duplicate: false,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:px-6">
      <p className="text-sm text-alma-text-muted">Registro público · Alma de Tango</p>
      <h1 className="mt-1 font-display text-2xl text-alma-text">Tu perfil en Alma</h1>
      <p className="mt-2 text-sm text-alma-text-secondary">
        Completa tus datos para crear o actualizar tu perfil. Un asesor confirmará tu plan y horario después
        — este formulario no procesa pagos.
      </p>

      <Card className="mt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <p className="text-xs font-medium tracking-wide text-alma-text-muted uppercase">Identidad</p>
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Nombres"
            className={INPUT_CLASS}
          />
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Apellidos"
            className={INPUT_CLASS}
          />
          <div className="flex gap-2">
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              className={`${INPUT_CLASS} w-auto`}
            >
              {DOCUMENT_TYPES.map((d) => (
                <option key={d} value={d}>
                  {DOCUMENT_TYPE_LABELS[d]}
                </option>
              ))}
            </select>
            <input
              type="text"
              required
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              onBlur={checkDuplicate}
              placeholder="Número de documento"
              className={INPUT_CLASS}
            />
          </div>
          {checkingDuplicate && <AlmaLoader label="Verificando…" />}
          {duplicateWarning && (
            <p className="flex items-start gap-1.5 text-xs text-alma-gold">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Ya existe un registro con este documento. Puedes continuar: al enviar, actualizaremos tu perfil
              en lugar de crear uno nuevo.
            </p>
          )}
          <input
            type="date"
            required
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className={INPUT_CLASS}
          />
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Teléfono"
            className={INPUT_CLASS}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo (opcional)"
            className={INPUT_CLASS}
          />

          <p className="mt-2 text-xs font-medium tracking-wide text-alma-text-muted uppercase">
            Relación académica
          </p>
          <select
            value={currentProgram}
            onChange={(e) => setCurrentProgram(e.target.value as ProgramName)}
            className={INPUT_CLASS}
          >
            {PROGRAMS.map((p) => (
              <option key={p} value={p}>
                {PROGRAM_LABELS[p]}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="Disciplina de interés (opcional)"
            className={INPUT_CLASS}
          />

          {isMinor !== null && (
            <div
              className={[
                'mt-1 rounded-xl border px-3.5 py-2 text-xs',
                isMinor
                  ? 'border-alma-gold/30 bg-alma-gold/5 text-alma-gold'
                  : 'border-alma-border bg-alma-bg text-alma-text-muted',
              ].join(' ')}
            >
              {isMinor ? 'Registro de menor de edad — se requieren datos del acudiente.' : 'Registro de persona adulta.'}
            </div>
          )}

          {requiresGuardian && (
            <div className="rounded-xl border border-alma-border bg-alma-bg p-3.5">
              <p className="text-xs font-medium tracking-wide text-alma-text-muted uppercase">
                Acudiente responsable
              </p>
              <div className="mt-2 flex flex-col gap-2.5">
                <input
                  type="text"
                  required={requiresGuardian}
                  value={guardianFullName}
                  onChange={(e) => setGuardianFullName(e.target.value)}
                  placeholder="Nombre completo del acudiente"
                  className={`${INPUT_CLASS} bg-alma-surface`}
                />
                <div className="flex gap-2">
                  <select
                    value={guardianDocumentType}
                    onChange={(e) => setGuardianDocumentType(e.target.value as DocumentType)}
                    className={`${INPUT_CLASS} w-auto bg-alma-surface`}
                  >
                    {DOCUMENT_TYPES.map((d) => (
                      <option key={d} value={d}>
                        {DOCUMENT_TYPE_LABELS[d]}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required={requiresGuardian}
                    value={guardianDocumentNumber}
                    onChange={(e) => setGuardianDocumentNumber(e.target.value)}
                    placeholder="Documento del acudiente"
                    className={`${INPUT_CLASS} bg-alma-surface`}
                  />
                </div>
                <input
                  type="tel"
                  required={requiresGuardian}
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  placeholder="Teléfono del acudiente"
                  className={`${INPUT_CLASS} bg-alma-surface`}
                />
                <input
                  type="email"
                  required={requiresGuardian}
                  value={guardianEmail}
                  onChange={(e) => setGuardianEmail(e.target.value)}
                  placeholder="Correo del acudiente"
                  className={`${INPUT_CLASS} bg-alma-surface`}
                />
                <select
                  value={guardianRelationship}
                  onChange={(e) => setGuardianRelationship(e.target.value as GuardianRelationship)}
                  className={`${INPUT_CLASS} bg-alma-surface`}
                >
                  {GUARDIAN_RELATIONSHIPS.map((r) => (
                    <option key={r} value={r}>
                      {GUARDIAN_RELATIONSHIP_LABELS[r]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <p className="mt-2 text-xs font-medium tracking-wide text-alma-text-muted uppercase">
            Información de emergencia
          </p>
          <input
            type="text"
            required
            value={emergencyContactName}
            onChange={(e) => setEmergencyContactName(e.target.value)}
            placeholder="Nombre del contacto de emergencia"
            className={INPUT_CLASS}
          />
          <select
            value={emergencyContactRelationship}
            onChange={(e) => setEmergencyContactRelationship(e.target.value as EmergencyRelationship)}
            className={INPUT_CLASS}
          >
            {EMERGENCY_RELATIONSHIPS.map((r) => (
              <option key={r} value={r}>
                {EMERGENCY_RELATIONSHIP_LABELS[r]}
              </option>
            ))}
          </select>
          <input
            type="tel"
            required
            value={emergencyContactPhone}
            onChange={(e) => setEmergencyContactPhone(e.target.value)}
            placeholder="Teléfono del contacto de emergencia"
            className={INPUT_CLASS}
          />
          <input
            type="text"
            value={eps}
            onChange={(e) => setEps(e.target.value)}
            placeholder="EPS (opcional — solo para emergencias)"
            className={INPUT_CLASS}
          />
          <p className="text-xs text-alma-text-muted">
            La EPS se trata como información sensible y solo se usa para apoyo en caso de emergencia.
          </p>

          <div className="mt-1 flex flex-col gap-2.5 rounded-xl border border-alma-border bg-alma-bg p-3.5">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-alma-gold" aria-hidden="true" />
              <p className="text-xs font-medium tracking-wide text-alma-text-muted uppercase">
                Consentimientos — cada uno es independiente
              </p>
            </div>
            <label className="flex items-start gap-2 text-xs text-alma-text-secondary">
              <input
                type="checkbox"
                checked={consents.personalData}
                onChange={(e) => setConsents((c) => ({ ...c, personalData: e.target.checked }))}
                required
              />
              {CONSENT_TYPE_LABELS.PERSONAL_DATA} (requerido).
            </label>
            <label className="flex items-start gap-2 text-xs text-alma-text-secondary">
              <input
                type="checkbox"
                checked={consents.sensitiveHealth}
                onChange={(e) => setConsents((c) => ({ ...c, sensitiveHealth: e.target.checked }))}
                required={epsRequiresConsent}
              />
              {CONSENT_TYPE_LABELS.SENSITIVE_HEALTH_DATA}
              {epsRequiresConsent ? ' (requerido porque registraste EPS).' : ' (aplica solo si registras EPS).'}
            </label>
            <label className="flex items-start gap-2 text-xs text-alma-text-secondary">
              <input
                type="checkbox"
                checked={consents.internalImage}
                onChange={(e) => setConsents((c) => ({ ...c, internalImage: e.target.checked }))}
              />
              {CONSENT_TYPE_LABELS.INTERNAL_IMAGE} (opcional).
            </label>
            <label className="flex items-start gap-2 text-xs text-alma-text-secondary">
              <input
                type="checkbox"
                checked={consents.publicImage}
                onChange={(e) => setConsents((c) => ({ ...c, publicImage: e.target.checked }))}
              />
              {CONSENT_TYPE_LABELS.PUBLIC_IMAGE} (opcional).
            </label>
            <label className="flex items-start gap-2 text-xs text-alma-text-secondary">
              <input
                type="checkbox"
                checked={consents.marketing}
                onChange={(e) => setConsents((c) => ({ ...c, marketing: e.target.checked }))}
              />
              {CONSENT_TYPE_LABELS.MARKETING_COMMUNICATIONS} (opcional).
            </label>
            <p className="text-xs text-alma-text-muted">
              Texto legal sujeto a validación. Versión de política: {REGISTRATION_POLICY_VERSION}. Ver{' '}
              <Link to="/privacidad#aviso" className="underline decoration-dotted">
                Aviso de privacidad
              </Link>{' '}
              y{' '}
              <Link to="/privacidad#politica" className="underline decoration-dotted">
                Política de tratamiento de datos
              </Link>
              .
            </p>
          </div>

          <Button type="submit" variant="primary" disabled={!canSubmit || submitting}>
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            {submitting ? 'Enviando…' : 'Crear / actualizar mi perfil en Alma'}
          </Button>
          {submitting && <AlmaLoader label="Guardando tu perfil…" />}
          {feedback && <ActionFeedback message={feedback.message} />}
        </form>
      </Card>
    </div>
  );
}
