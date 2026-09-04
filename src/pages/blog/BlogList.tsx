import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BLOG_POSTS } from '../../content/blog';
import { Card } from '../../components/ui/Card';
import { formatDateLong } from '../../lib/format';

export function BlogList() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <span className="text-xs font-semibold tracking-[0.2em] text-alma-gold uppercase">Blog</span>
      <h1 className="mt-3 font-display text-4xl text-alma-text sm:text-5xl">Historias de la academia</h1>
      <p className="mt-4 max-w-xl text-lg text-alma-text-secondary">
        Notas cortas sobre tango, técnica y la vida de Alma de Tango, escritas por quienes enseñan cada semana.
      </p>

      <div className="mt-12 flex flex-col gap-5">
        {BLOG_POSTS.map((post) => (
          <Link key={post.slug} to={`/blog/${post.slug}`}>
            <Card className="transition-colors hover:border-alma-gold/40">
              <p className="text-xs text-alma-text-muted">
                {formatDateLong(post.date)} · {post.author}
              </p>
              <h2 className="mt-1.5 font-display text-xl text-alma-text">{post.title}</h2>
              <p className="mt-2 text-sm text-alma-text-secondary">{post.excerpt}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-alma-gold">
                Leer más
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
