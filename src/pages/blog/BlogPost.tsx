import { Navigate, useParams } from 'react-router-dom';
import { BLOG_POSTS } from '../../content/blog';
import { BackLink } from '../../components/BackLink';
import { formatDateLong } from '../../lib/format';

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) return <Navigate to="/blog" replace />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <BackLink to="/blog" label="Volver al blog" />

      <p className="mt-6 text-xs text-alma-text-muted">
        {formatDateLong(post.date)} · {post.author}
      </p>
      <h1 className="mt-2 font-display text-3xl text-alma-text sm:text-4xl">{post.title}</h1>

      <div className="mt-8 flex flex-col gap-4 text-alma-text-secondary">
        {post.body.map((paragraph, i) => (
          <p key={i} className="leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
