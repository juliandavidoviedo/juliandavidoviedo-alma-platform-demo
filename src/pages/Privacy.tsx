import { ShieldCheck } from 'lucide-react';
import { REGISTRATION_POLICY_VERSION } from '../lib/api';
import { Card } from '../components/ui/Card';

const RESPONSABLE = {
  nombre: 'Iván Ovalle',
  rol: 'Director ejecutivo y representante legal de Alma de Tango',
  documento: 'C.C. 000.000.000 (dato provisional — pendiente de actualizar)',
  contacto: 'Por definir — mientras tanto, contacta directamente a Iván en la academia.',
};

const FINALIDADES = [
  {
    titulo: 'Tratamiento de datos personales',
    detalle:
      'Identificar al estudiante (o a su acudiente, si es menor de edad), gestionar su inscripción, su plan y su relación con la academia.',
  },
  {
    titulo: 'Tratamiento de datos sensibles de salud (EPS)',
    detalle: 'Uso exclusivo para apoyo en caso de emergencia médica durante una clase o evento.',
  },
  {
    titulo: 'Uso interno de imagen/video',
    detalle: 'Registro interno de clases y eventos (por ejemplo, memorias del equipo docente).',
  },
  {
    titulo: 'Uso público/redes sociales de imagen/video',
    detalle: 'Publicación en redes sociales o material promocional de la academia.',
  },
  {
    titulo: 'Comunicaciones de mercadeo e informativas',
    detalle: 'Envío de novedades, promociones y avisos relacionados con la academia.',
  },
];

const DERECHOS = [
  'Conocer, actualizar y rectificar tus datos personales.',
  'Solicitar prueba de la autorización otorgada.',
  'Ser informado sobre el uso que se ha dado a tus datos.',
  'Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) por infracciones a la ley.',
  'Revocar la autorización y/o solicitar la supresión de tus datos, cuando no exista un deber legal o contractual que impida eliminarlos.',
  'Acceder de forma gratuita a tus datos personales que hayan sido objeto de tratamiento.',
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="font-display text-xl text-alma-text">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-alma-text-secondary">{children}</div>
    </section>
  );
}

/**
 * Short/general Aviso de Privacidad + Política de Tratamiento de Datos —
 * required minimums per la Ley 1581 de 2012 y el Decreto 1377 de 2013
 * (identidad del responsable, finalidades, derechos, canal de contacto,
 * almacenamiento, conservación). Deliberately NOT final legal language —
 * every provisional value is marked as such; see PROJECT_CONTEXT.md.
 */
export function Privacy() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <p className="text-sm text-alma-text-muted">Alma de Tango</p>
      <h1 className="mt-1 font-display text-2xl text-alma-text sm:text-3xl">
        Aviso de Privacidad y Política de Tratamiento de Datos
      </h1>

      <Card className="mt-5 flex items-start gap-2.5 border-alma-gold/30 bg-alma-gold/5">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-alma-gold" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-alma-gold">
          Versión piloto beta ({REGISTRATION_POLICY_VERSION}) — texto legal sujeto a validación por un
          abogado. El nombre del responsable es real; el número de documento y el canal de contacto
          mostrados abajo son datos provisionales que se actualizarán antes de que este documento se
          considere definitivo.
        </p>
      </Card>

      <div className="mt-8 flex flex-col gap-8">
        <Section id="aviso" title="Aviso de Privacidad">
          <p>
            <strong className="text-alma-text">Responsable del tratamiento:</strong> {RESPONSABLE.nombre},{' '}
            {RESPONSABLE.rol}. {RESPONSABLE.documento}.
          </p>
          <p>
            <strong className="text-alma-text">Datos de contacto:</strong> {RESPONSABLE.contacto}
          </p>
          <p>
            <strong className="text-alma-text">Finalidad:</strong> tratamos tus datos personales para
            gestionar tu vínculo con Alma de Tango — inscripción, plan, y contacto de emergencia — y, solo
            si lo autorizas de forma independiente, para usos adicionales de imagen y comunicaciones. Ver el
            detalle en la Política de Tratamiento de Datos, abajo.
          </p>
          <p>
            <strong className="text-alma-text">Derechos:</strong> como titular, tienes derecho a conocer,
            actualizar, rectificar y solicitar la supresión de tus datos, y a revocar tu autorización en
            cualquier momento, conforme a la Ley 1581 de 2012 (Habeas Data).
          </p>
          <p>
            <strong className="text-alma-text">Mecanismo:</strong> puedes ejercer estos derechos
            contactando directamente a Iván en la academia. La política completa está en esta misma página.
          </p>
        </Section>

        <Section id="politica" title="Política de Tratamiento de Datos Personales">
          <p>
            Alma de Tango recolecta y trata datos personales de sus estudiantes (y, cuando aplica, de sus
            acudientes) a través del formulario de registro público, en cumplimiento de la Ley 1581 de 2012
            y el Decreto 1377 de 2013.
          </p>

          <div>
            <p className="font-medium text-alma-text">Finalidades del tratamiento</p>
            <p className="mt-1 text-xs text-alma-text-muted">
              Cada una se autoriza de forma independiente en el formulario de registro — nunca como una
              autorización general.
            </p>
            <ul className="mt-2 flex flex-col gap-2">
              {FINALIDADES.map((f) => (
                <li key={f.titulo}>
                  <span className="font-medium text-alma-text">{f.titulo}.</span> {f.detalle}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-medium text-alma-text">Datos sensibles</p>
            <p>
              La EPS es un dato sensible de salud. Se recolecta únicamente con fines de apoyo en caso de
              emergencia y solo se trata si autorizas expresamente esta finalidad. No estás obligado a
              suministrar este dato ni a autorizar su tratamiento.
            </p>
          </div>

          <div>
            <p className="font-medium text-alma-text">Menores de edad</p>
            <p>
              Cuando el titular es menor de edad, la autorización la otorga su padre, madre o acudiente, y
              el tratamiento respeta en todo momento el interés superior del menor y sus derechos
              fundamentales.
            </p>
          </div>

          <div>
            <p className="font-medium text-alma-text">Dónde se almacenan tus datos</p>
            <p>
              Durante esta fase piloto, tus datos se almacenan de forma segura en la infraestructura de
              Netlify (Netlify Blobs). Está planeado migrarlos a Google Sheets/Drive administrados por Alma
              de Tango cuando esa integración esté lista — esa migración no requiere que vuelvas a
              registrarte.
            </p>
          </div>

          <div>
            <p className="font-medium text-alma-text">Conservación</p>
            <p>
              Tus datos se conservan mientras exista una relación con la academia o mientras no solicites su
              supresión, salvo que exista una obligación legal de conservarlos por más tiempo.
            </p>
          </div>

          <div>
            <p className="font-medium text-alma-text">Derechos del titular</p>
            <ul className="mt-2 list-disc pl-5">
              {DERECHOS.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-medium text-alma-text">Vigencia</p>
            <p>Esta política entra en vigor desde su publicación y puede actualizarse; la versión vigente siempre está disponible en esta misma página.</p>
          </div>
        </Section>
      </div>
    </div>
  );
}
