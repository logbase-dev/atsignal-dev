'use client';

import { useMemo } from 'react';
import type { Menu, Page } from '@/lib/admin/types';

interface PageListProps {
  pages: Page[];
  menus: Menu[];
  loading: boolean;
  onEdit: (page: Page) => void;
  onDelete: (page: Page) => void | Promise<void>;
  onPreview?: (page: Page, locale: 'ko' | 'en') => void;
}

export function PageList({ pages, menus, loading, onEdit, onDelete, onPreview }: PageListProps) {
  const menuLookup = useMemo(() => {
    return menus.reduce<Record<string, Menu>>((acc, menu) => {
      if (menu.id) {
        acc[menu.id] = menu;
      }
      return acc;
    }, {});
  }, [menus]);

  if (loading) {
    return (
      <div style={{ padding: '2rem 0' }}>
        <p style={{ color: '#4b5563' }}>페이지를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (!pages.length) {
    return (
      <div style={{ padding: '2rem 0' }}>
        <p style={{ color: '#6b7280' }}>등록된 페이지가 없습니다. 우측 상단의 “페이지 추가” 버튼으로 새 페이지를 생성하세요.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6' }}>
            <th style={headerCellStyle}>페이지 제목</th>
            <th style={headerCellStyle}>연결 메뉴</th>
            <th style={headerCellStyle}>Slug</th>
            <th style={headerCellStyle}>상태</th>
            <th style={headerCellStyle}>업데이트</th>
            <th style={headerCellStyle}>작업</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => {
            const menu = menuLookup[page.menuId];
            const hasPendingDraft =
              !!page.draftUpdatedAt &&
              (!page.updatedAt || new Date(page.draftUpdatedAt).getTime() > new Date(page.updatedAt).getTime());
            return (
              <tr key={page.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={bodyCellStyle}>
                  <div style={{ fontWeight: 600 }}>{page.labelsDraft?.ko ?? page.labelsLive.ko}</div>
                  {(page.labelsDraft?.en || page.labelsLive.en) && (
                    <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                      {page.labelsDraft?.en ?? page.labelsLive.en}
                    </div>
                  )}
                </td>
                <td style={bodyCellStyle}>
                  {menu ? (
                    <>
                      <div style={{ fontWeight: 600 }}>
                        {menu.labels.ko}
                        {menu.labels.en && <span style={{ color: '#6b7280' }}> / {menu.labels.en}</span>}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                        {menu.path} · Depth {menu.depth}
                        {!menu.enabled && <span style={{ color: '#dc2626', marginLeft: '0.25rem' }}>[비활성화]</span>}
                      </div>
                    </>
                  ) : (
                    <span style={{ color: '#dc2626' }}>연결된 메뉴가 없습니다</span>
                  )}
                </td>
                <td style={bodyCellStyle}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <code style={{ backgroundColor: '#f9fafb', padding: '0.25rem 0.5rem', borderRadius: '0.375rem' }}>
                      {page.slug}
                    </code>
                    {onPreview && page.id && (
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        <button
                          style={previewBtnStyle}
                          onClick={() => onPreview(page, 'ko')}
                          type="button"
                        >
                          KO 미리보기
                        </button>
                        <button
                          style={{
                            ...previewBtnStyle,
                            opacity: page.labelsDraft?.en || page.labelsLive.en ? 1 : 0.5,
                            cursor: page.labelsDraft?.en || page.labelsLive.en ? 'pointer' : 'not-allowed',
                          }}
                          onClick={() => onPreview(page, 'en')}
                          type="button"
                          disabled={!page.labelsDraft?.en && !page.labelsLive.en}
                        >
                          EN 미리보기
                        </button>
                      </div>
                    )}
                  </div>
                </td>
                <td style={bodyCellStyle}>
                  <span
                    style={{
                      padding: '0.25rem 0.65rem',
                      borderRadius: '9999px',
                      fontSize: '0.85rem',
                      backgroundColor: hasPendingDraft ? '#fee2e2' : '#dcfce7',
                      color: hasPendingDraft ? '#b91c1c' : '#166534',
                      fontWeight: 600,
                    }}
                  >
                    {hasPendingDraft ? '미발행' : '발행'}
                  </span>
                </td>
                <td style={bodyCellStyle}>
                  {page.updatedAt
                    ? new Date(page.updatedAt).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })
                    : '-'}
                </td>
                <td style={{ ...bodyCellStyle, whiteSpace: 'nowrap' }}>
                  <button style={secondaryBtnStyle} onClick={() => onEdit(page)}>
                    수정
                  </button>
                  <button style={dangerBtnStyle} onClick={() => onDelete(page)}>
                    삭제
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const headerCellStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.9rem 1rem',
  fontSize: '0.9rem',
  fontWeight: 600,
  color: '#374151',
};

const bodyCellStyle: React.CSSProperties = {
  padding: '1rem',
  fontSize: '0.93rem',
  verticalAlign: 'top',
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: '0.35rem 0.75rem',
  marginRight: '0.5rem',
  borderRadius: '0.375rem',
  border: '1px solid #d1d5db',
  backgroundColor: '#fff',
  cursor: 'pointer',
};

const dangerBtnStyle: React.CSSProperties = {
  padding: '0.35rem 0.75rem',
  borderRadius: '0.375rem',
  border: 'none',
  backgroundColor: '#dc2626',
  color: '#fff',
  cursor: 'pointer',
};

const previewBtnStyle: React.CSSProperties = {
  padding: '0.25rem 0.5rem',
  borderRadius: '0.375rem',
  border: '1px solid #cbd5f5',
  backgroundColor: '#edf2ff',
  color: '#3730a3',
  fontSize: '0.8rem',
  cursor: 'pointer',
};

