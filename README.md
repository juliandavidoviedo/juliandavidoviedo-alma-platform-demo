# Alma Platform — Demo de validación

Demo navegable de **Alma Platform**, construida para presentarle a la dirección
de **Alma de Tango** en 5–8 minutos y validar cuatro cosas:

1. si el problema operativo es real;
2. si los flujos propuestos son útiles;
3. si la academia quiere participar en un piloto;
4. qué funcionalidades merecen implementarse de verdad.

> ### Esto es una simulación
>
> **Todos los datos son ficticios y deterministas.** No hay conexión con ningún
> sistema real, ni base de datos, ni autenticación, ni pagos. No contiene ningún
> registro real de la academia ni de sus estudiantes.
>
> Las acciones (vender un paquete, registrar asistencia) modifican estado **en
> memoria** durante la sesión; al recargar la página el demo vuelve a su estado
> inicial. Eso es intencional.

El backend real y la arquitectura del producto viven en un repositorio aparte,
[`juliandavidoviedo/Alma_de_Tango`](https://github.com/juliandavidoviedo/Alma_de_Tango).
Este repositorio es **exclusivamente** el demo visual: no recibe código de
backend ni duplica su documentación.

---

## Requisitos

- **Node 20** (ver [`.nvmrc`](.nvmrc))
- **npm**

## Desarrollo local

```bash
npm install
npm run dev          # http://localhost:5173
```

## Verificación

Los tres comandos deben pasar en cada commit:

```bash
npm run build        # tsc -b && vite build  → dist/
npm run typecheck    # TypeScript en modo strict
npm run lint         # oxlint
```

`npm run build` ya incluye el chequeo de tipos: `tsc -b` corre antes de
`vite build`, así que un error de tipos rompe la compilación.

## Previsualizar la compilación de producción

```bash
npm run build
npm run preview
```

---

## Stack

| Pieza | Elección |
|---|---|
| Framework | React 19 + TypeScript (modo `strict`) |
| Build | Vite 8 |
| Estilos | Tailwind CSS 4 (plugin `@tailwindcss/vite`, configuración en CSS) |
| Lint | oxlint |
| Gestor de paquetes | npm |
| Hosting | Netlify |

Los tokens de marca se definen con `@theme` en
[`src/index.css`](src/index.css). No hay `tailwind.config.js`: Tailwind 4 se
configura desde CSS.

---

## Despliegue en Netlify

La configuración está versionada en [`netlify.toml`](netlify.toml), así que se
revisa en los pull requests en vez de vivir escondida en el panel de Netlify.

| Ajuste | Valor |
|---|---|
| Rama de producción | `main` |
| Comando de build | `npm run build` |
| Directorio publicado | `dist` |
| Versión de Node | `20` |
| Fallback SPA | `/*` → `/index.html` (200) |

El fallback SPA no es opcional: sin él, recargar en una ruta como `/admin`
devuelve el 404 de Netlify. Es un fallo que **no aparece nunca en `vite dev`**,
solo en producción.

### Deploy Previews

Después del primer despliegue exitoso, todo el trabajo va en ramas de
funcionalidad con pull request. Cada PR genera una URL de preview:

```
https://deploy-preview-<n>--<sitio>.netlify.app
```

### Variables de entorno

| Variable | Valor | Para qué |
|---|---|---|
| `VITE_DEMO_MODE` | `true` | Mantiene visibles el distintivo `DEMO` y los avisos de simulación |
| `VITE_API_BASE_URL` | *sin definir* | Reservada. Mientras esté vacía responde el adaptador de datos simulados |

**Nunca** se configuran aquí `VITE_API_KEY`, PINs, IDs de despliegue de Apps
Script ni ninguna credencial. Todo lo que empieza por `VITE_` termina en el
bundle del navegador, que es público. `.env*` está en `.gitignore`.

---

## Estado

Andamiaje y canal de despliegue. Ni el sistema de diseño ni las pantallas del
producto están construidos todavía.
