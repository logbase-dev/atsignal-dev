import type { Site } from './types';

const WEB_ORIGIN = process.env.NEXT_PUBLIC_WEB_PREVIEW_ORIGIN || 'http://localhost:3000';
const DOCS_ORIGIN = process.env.NEXT_PUBLIC_DOCS_PREVIEW_ORIGIN || 'http://localhost:3001';
const PREVIEW_SECRET = process.env.NEXT_PUBLIC_PREVIEW_SECRET || 'atsignal-preview';

const ORIGIN_MAP: Record<Site, string> = {
  web: WEB_ORIGIN,
  docs: DOCS_ORIGIN,
};

export function buildPreviewUrl(site: Site, slug: string, locale: 'ko' | 'en', draftId: string) {
  const base = ORIGIN_MAP[site];
  const sanitizedSlug = slug.replace(/^\/+/, '');
  const previewUrl = new URL('/api/preview', base);
  previewUrl.searchParams.set('secret', PREVIEW_SECRET);
  previewUrl.searchParams.set('slug', sanitizedSlug);
  previewUrl.searchParams.set('locale', locale);
  previewUrl.searchParams.set('draftId', draftId);
  previewUrl.searchParams.set('preview', '1');
  return previewUrl.toString();
}

