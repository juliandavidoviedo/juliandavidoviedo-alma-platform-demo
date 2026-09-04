import { Link } from 'react-router-dom';

/**
 * Shown instead of `DemoDisclaimer` on /registro-estudiante and /privacidad
 * — everywhere else in this app is a demo with fictional data, but this
 * form is the one real, persisted surface (piloto beta), so the blanket
 * "no hay conexión a un sistema real" disclaimer would be actively
 * misleading here.
 */
export function RegistrationDisclaimer() {
  return (
    <p className="mx-auto max-w-2xl px-4 py-6 text-center text-xs leading-relaxed text-alma-text-muted">
      Este formulario forma parte del piloto beta de Alma de Tango — tus datos se guardan de verdad, no son
      una simulación.
      <br />
      Consulta el{' '}
      <Link to="/privacidad#aviso" className="underline decoration-dotted">
        Aviso de Privacidad
      </Link>{' '}
      y la{' '}
      <Link to="/privacidad#politica" className="underline decoration-dotted">
        Política de Tratamiento de Datos
      </Link>
      .
    </p>
  );
}
