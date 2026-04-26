import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toolBySlug } from '../lib/tools';
import { NotFound } from './NotFound';

export function ToolPage({ onVisit }: { onVisit: (slug: string) => void }) {
  const { slug } = useParams<{ slug: string }>();
  const tool = slug ? toolBySlug[slug] : undefined;

  useEffect(() => {
    if (slug && tool) onVisit(slug);
  }, [slug, tool, onVisit]);

  if (!tool) return <NotFound />;
  const Component = tool.Component;
  return <Component />;
}
