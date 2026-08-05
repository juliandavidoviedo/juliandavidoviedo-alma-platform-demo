/** Marketing content for /blog. Fictional posts, first names only — same cast as the rest of the demo. */
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  body: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'por-que-empezar-tango-adulto',
    title: 'Por qué empezar tango de adulto no es tarde (ni raro)',
    excerpt:
      'La mayoría de quienes bailan hoy en la academia empezaron después de los 30. Esto es lo que les tomó superar en las primeras semanas.',
    date: '2026-07-18',
    author: 'Laura',
    body: [
      'Casi nadie llega al tango desde la niñez. La mayoría de nuestros alumnos empezaron entre los 28 y los 55 años, muchos sin ninguna experiencia previa en baile.',
      'Lo primero que hay que soltar es la idea de que el cuerpo "no sirve" para esto. El tango se aprende con repetición, no con talento innato — la postura y la caminata se construyen en semanas, no en meses.',
      'Lo segundo es la vergüenza de equivocarse frente a otros. En Alma de Tango agrupamos por nivel exactamente para evitar eso: nadie empieza al lado de quien ya lleva tres años.',
    ],
  },
  {
    slug: 'diferencia-tango-salon-escenario',
    title: 'Tango de salón vs. tango escenario: no es solo velocidad',
    excerpt: 'Son dos lenguajes distintos. Uno se baila para uno mismo y su pareja; el otro, para quien mira.',
    date: '2026-07-05',
    author: 'Diego',
    body: [
      'El tango de salón se baila en una pista compartida, con tráfico real y espacio limitado. La prioridad es la conexión con la pareja y el respeto por la ronda.',
      'El tango escenario nace pensando en quien observa: hay coreografía, hay marcas de espacio en el piso, hay una historia que contar en tres minutos.',
      'Nuestra clase de los domingos —Tango Escenario, de 10 a 1 pm— existe justamente para quienes ya caminan bien en salón y quieren dar ese salto hacia la puesta en escena.',
    ],
  },
  {
    slug: 'que-llevar-primera-clase',
    title: 'Qué llevar a tu primera clase (y qué no hace falta)',
    excerpt: 'La lista corta: zapatos con suela de cuero si tienes, ropa cómoda, y ganas de equivocarte en público.',
    date: '2026-06-22',
    author: 'Camila',
    body: [
      'No necesitas zapatos de tango para la primera clase. Cualquier zapato cerrado, cómodo, con suela lisa o de cuero funciona bien al comienzo.',
      'Evita suela de caucho gruesa — se pega al piso y dificulta los giros. Y evita tacones muy altos si es tu primera vez, hay tiempo de sobra para eso.',
      'Lo único que de verdad hace falta es llegar dispuesto a que el primer día se sienta torpe. A la tercera clase ya nadie se acuerda de cómo empezó.',
    ],
  },
  {
    slug: 'salsa-y-tap-nueva-oferta',
    title: 'Por qué sumamos Salsa y Tap al portafolio',
    excerpt: 'No dejamos el tango — lo complementamos con dos ritmos que piden nuestros propios alumnos hace meses.',
    date: '2026-06-01',
    author: 'Iván',
    body: [
      'La pregunta más repetida en recepción durante el último año fue "¿y no dictan algo más aparte de tango?". La respuesta ya es sí.',
      'Salsa entra los lunes y miércoles a las 8 pm, con Camila. Tap entra los sábados a las 11 am, también con Camila.',
      'La idea no es diluir la identidad de la academia — el tango sigue siendo el corazón — sino darle a la comunidad más razones para venir entre semana.',
    ],
  },
];
