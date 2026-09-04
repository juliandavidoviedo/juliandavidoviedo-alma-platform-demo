import { Link } from 'react-router-dom';

/**
 * Text lockup standing in for the academy logo.
 *
 * LOGO PLACEHOLDER: no source asset for Alma de Tango's logo was available to
 * this build in a form safe to embed (a real vector/high-res file, with
 * rights confirmed). Recreating it approximately from memory would ship a
 * wrong mark under the academy's name, which is worse than not having one.
 * Drop the real file at `src/assets/logo.svg` and swap it in here when it
 * exists — nothing else in the app references a logo path.
 */
export function Brand() {
  return (
    <Link to="/" className="flex items-baseline gap-2">
      <span className="font-display text-lg tracking-wide text-alma-text">Alma</span>
      <span className="font-display text-lg tracking-wide text-alma-gold">Platform</span>
    </Link>
  );
}
