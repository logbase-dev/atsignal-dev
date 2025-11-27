import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import { TOC } from './TOC';

interface PageRendererProps {
  title: string;
  content: string;
  updatedAt?: Date;
  isPreview?: boolean;
}

export default function PageRenderer({ title, content, updatedAt, isPreview }: PageRendererProps) {
  return (
    <div className="page-renderer-wrapper">
      <article className="page-renderer-content">
        <header style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>{title}</h1>
            {isPreview && (
              <span
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '999px',
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                Preview
              </span>
            )}
          </div>
          {isPreview && updatedAt && (
            <p style={{ color: '#6b7280', marginTop: '0.75rem' }}>
              마지막 업데이트 {new Date(updatedAt).toLocaleString('ko-KR')}
            </p>
          )}
        </header>
        <div
          className="prose prose-lg max-w-none"
          style={{
            fontSize: '1.05rem',
            lineHeight: 1.75,
            color: '#111827',
          }}
        >
          <ReactMarkdown
            rehypePlugins={[rehypeSlug]}
            components={{
              h1: ({ node, ...props }) => (
                <h1 id={props.id} style={{ scrollMarginTop: '100px' }} {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 id={props.id} style={{ scrollMarginTop: '100px' }} {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 id={props.id} style={{ scrollMarginTop: '100px' }} {...props} />
              ),
              h4: ({ node, ...props }) => (
                <h4 id={props.id} style={{ scrollMarginTop: '100px' }} {...props} />
              ),
              h5: ({ node, ...props }) => (
                <h5 id={props.id} style={{ scrollMarginTop: '100px' }} {...props} />
              ),
              h6: ({ node, ...props }) => (
                <h6 id={props.id} style={{ scrollMarginTop: '100px' }} {...props} />
              ),
            }}
          >
            {content || '콘텐츠가 아직 준비되지 않았습니다.'}
          </ReactMarkdown>
        </div>
      </article>
      <aside className="page-renderer-toc">
        <TOC content={content} />
      </aside>
    </div>
  );
}
