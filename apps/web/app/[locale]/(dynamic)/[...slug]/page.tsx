import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import PageRenderer from '@/components/cms/PageRenderer';
import { getPageById, getPageBySlug } from '@/lib/cms/getPage';

interface PageProps {
  params: {
    locale: string;
    slug: string[];
  };
  searchParams?: {
    draftId?: string;
    preview?: string;
  };
}

export const dynamic = 'force-dynamic';

export default async function DynamicPage({ params, searchParams }: PageProps) {
  const { locale, slug } = params;
  const slugPath = slug.map(decodeURIComponent).join('/');
  const preview = draftMode().isEnabled && searchParams?.draftId;

  let page =
    preview && searchParams?.draftId
      ? await getPageById(searchParams.draftId)
      : await getPageBySlug('web', slugPath);

  if (!page) {
    notFound();
  }

  const labels = preview ? page.labelsDraft ?? page.labelsLive : page.labelsLive;
  const content = preview ? page.contentDraft ?? page.contentLive : page.contentLive;

  const localizedTitle = locale === 'en' ? labels.en || labels.ko : labels.ko;
  const localizedContent = locale === 'en' ? content.en || content.ko : content.ko;

  return (
    <PageRenderer
      title={localizedTitle || page.slug}
      content={localizedContent || '준비 중입니다.'}
      updatedAt={preview ? page.draftUpdatedAt : page.updatedAt}
      isPreview={Boolean(preview)}
    />
  );
}

