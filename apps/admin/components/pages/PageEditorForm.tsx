'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Page, Site } from '@/lib/admin/types';
import type { MenuOption, PageFormValues } from '@/src/features/pages/types';
import { NextraMarkdownField } from '@/components/editor/NextraMarkdownField';

// SSR 비활성화하여 동적 import
const ToastMarkdownEditor = dynamic(
  () => import('@/components/editor/ToastMarkdownEditor').then((mod) => ({ default: mod.ToastMarkdownEditor })),
  { ssr: false }
);

interface PageEditorFormProps {
  site: Site;
  pageId: string | null;
  initialPage: Page | null;
  menuOptions: MenuOption[];
  onSaveDraft: (values: PageFormValues) => Promise<void>;
  onPublish: (values: PageFormValues) => Promise<void>;
  onPreview: (values: PageFormValues, locale: 'ko' | 'en') => Promise<string>;
  submitting: boolean;
}

const requiredMark = <span style={{ color: '#dc2626' }}>*</span>;

const rowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '1.5rem',
};

const labelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  fontWeight: 600,
  marginBottom: '0.5rem',
};

const helpTextStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: '#6b7280',
  marginBottom: '0.75rem',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '0.5rem',
  border: '1px solid #d1d5db',
  fontSize: '0.95rem',
};

const sectionStyle: React.CSSProperties = {
  marginBottom: '1rem',
  padding: '1.5rem',
  backgroundColor: '#f9fafb',
  borderRadius: '0.75rem',
};

const contentTabWrapperStyle: React.CSSProperties = {
  display: 'inline-flex',
  gap: '0.25rem',
  backgroundColor: '#e2e8f0',
  borderRadius: '999px',
  padding: '0.25rem',
};

const contentTabStyle: React.CSSProperties = {
  border: 'none',
  background: 'transparent',
  padding: '0.5rem 1.5rem',
  borderRadius: '999px',
  fontSize: '0.95rem',
  fontWeight: 600,
  color: '#475569',
  cursor: 'pointer',
};

const contentTabActiveStyle: React.CSSProperties = {
  ...contentTabStyle,
  backgroundColor: '#ffffff',
  color: '#0f172a',
  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.12)',
};

export function PageEditorForm({
  site,
  pageId,
  initialPage,
  menuOptions,
  onSaveDraft,
  onPublish,
  onPreview,
  submitting,
}: PageEditorFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState({
    menuId: '',
    slug: '',
    labelKo: '',
    labelEn: '',
    contentKo: '',
    contentEn: '',
  });
  const [activeContentLocale, setActiveContentLocale] = useState<'ko' | 'en'>('ko');
  const [editorType, setEditorType] = useState<'nextra' | 'toast'>('toast');
  const [saveFormat, setSaveFormat] = useState<'markdown' | 'html'>('markdown');
  const [previewing, setPreviewing] = useState(false);

  const lastPublishedAt = useMemo(() => {
    if (!initialPage?.updatedAt) return null;
    return new Date(initialPage.updatedAt).toLocaleString('ko-KR');
  }, [initialPage?.updatedAt]);

  const lastDraftAt = useMemo(() => {
    if (!initialPage?.draftUpdatedAt) return null;
    return new Date(initialPage.draftUpdatedAt).toLocaleString('ko-KR');
  }, [initialPage?.draftUpdatedAt]);

  const hasPendingDraft = useMemo(() => {
    if (!initialPage?.draftUpdatedAt) return false;
    if (!initialPage?.updatedAt) return true;
    return initialPage.draftUpdatedAt > initialPage.updatedAt;
  }, [initialPage?.draftUpdatedAt, initialPage?.updatedAt]);

  useEffect(() => {
    if (!initialPage) {
      setFormState({
        menuId: '',
        slug: '',
        labelKo: '',
        labelEn: '',
        contentKo: '',
        contentEn: '',
      });
      return;
    }

    const labelsSource = initialPage.labelsDraft ?? initialPage.labelsLive;
    const contentSource = initialPage.contentDraft ?? initialPage.contentLive;

    setFormState({
      menuId: initialPage.menuId,
      slug: initialPage.slug,
      labelKo: labelsSource.ko,
      labelEn: labelsSource.en || '',
      contentKo: contentSource.ko,
      contentEn: contentSource.en || '',
    });
  }, [initialPage]);

  const buildPayload = () => ({
    menuId: formState.menuId,
    slug: formState.slug.trim(),
    labels: {
      ko: formState.labelKo.trim(),
      ...(formState.labelEn.trim() ? { en: formState.labelEn.trim() } : {}),
    },
    content: {
      ko: formState.contentKo,
      ...(formState.contentEn ? { en: formState.contentEn } : {}),
    },
  });

  const validateForm = () => {
    if (!formState.menuId) {
      alert('메뉴를 선택해주세요.');
      return false;
    }
    if (!formState.labelKo.trim() || !formState.slug.trim()) {
      alert('필수 항목을 입력해주세요.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;
    await onPublish(buildPayload());
  };

  const handleSaveDraftClick = async () => {
    if (!validateForm()) return;
    await onSaveDraft(buildPayload());
  };

  const handlePreviewClick = async () => {
    if (!validateForm()) return;
    setPreviewing(true);
    try {
      const url = await onPreview(buildPayload(), activeContentLocale);
      window.open(url, '_blank', 'noopener,noreferrer');
    } finally {
      setPreviewing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0rem' }}>
      <div style={sectionStyle}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <h2 style={{ margin: 0 }}>기본 정보</h2>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '999px',
              backgroundColor: hasPendingDraft ? '#fef3c7' : '#e0f2fe',
              color: hasPendingDraft ? '#92400e' : '#075985',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            {hasPendingDraft ? '게시 전 임시 저장본이 있습니다' : '게시본과 임시 저장본이 동일합니다'}
          </span>
          <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>
            {lastPublishedAt ? `마지막 게시: ${lastPublishedAt}` : '게시 이력 없음'}
          </span>
          {lastDraftAt && (
            <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>마지막 임시 저장: {lastDraftAt}</span>
          )}
        </div>
        <div style={rowStyle}>
          <div>
            <label style={labelStyle}>
              메뉴 선택 {requiredMark}
            </label>
            <p style={helpTextStyle}>콘텐츠가 연결될 메뉴를 지정합니다.</p>
            <select
              required
              style={inputStyle}
              value={formState.menuId}
              onChange={(event) => {
                const selectedMenuId = event.target.value;
                const selectedMenu = menuOptions.find((opt) => opt.id === selectedMenuId);
                setFormState((prev) => ({
                  ...prev,
                  menuId: selectedMenuId,
                  slug: selectedMenu ? selectedMenu.path : prev.slug,
                }));
              }}
            >
              <option value="">메뉴를 선택하세요</option>
              {menuOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {`${'— '.repeat(Math.max(option.depth - 1, 0))}[Depth: ${option.depth}] ${option.label} (${option.path})${
                    option.enabled ? '' : ' [비활성화]'
                  }`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>
              Slug {requiredMark}
            </label>
            <p style={helpTextStyle}>페이지 URL에 사용될 식별자입니다. 수정을 원하시면 메뉴 관리 페이지에서 수정하세요.</p>
            <input
              required
              style={inputStyle}
              readOnly
              value={formState.slug}
              title="메뉴 경로가 자동으로 채워집니다."
            />
          </div>
        </div>

        <div style={{ ...rowStyle, marginTop: '1.5rem' }}>
          <div>
            <label style={labelStyle}>
              페이지 제목 (한국어) {requiredMark}
            </label>
            <p style={helpTextStyle}>사이트 내에서 보여질 한글 페이지 제목입니다.</p>
            <input
              required
              style={inputStyle}
              value={formState.labelKo}
              onChange={(event) => setFormState((prev) => ({ ...prev, labelKo: event.target.value }))}
              placeholder="예: 솔루션 소개"
            />
          </div>
          <div>
            <label style={labelStyle}>페이지 제목 (영어)</label>
            <p style={helpTextStyle}>영문 페이지 제목입니다.</p>
            <input
              style={inputStyle}
              value={formState.labelEn}
              onChange={(event) => setFormState((prev) => ({ ...prev, labelEn: event.target.value }))}
              placeholder="예: Solutions overview"
            />
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>콘텐츠</h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>에디터 타입:</span>
            <select
              value={editorType}
              onChange={(e) => {
                const newType = e.target.value as 'nextra' | 'toast';
                if (window.confirm('에디터를 전환하면 현재 입력된 내용이 그대로 유지됩니다. 계속하시겠습니까?')) {
                  setEditorType(newType);
                }
              }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #d1d5db',
                fontSize: '0.9rem',
                backgroundColor: '#fff',
                cursor: 'pointer',
              }}
            >
              <option value="toast">TOAST UI Editor</option>
              <option value="nextra">Nextra</option>
            </select>
          </div>
        </div>
        <div style={contentTabWrapperStyle}>
          <button
            type="button"
            style={activeContentLocale === 'ko' ? contentTabActiveStyle : contentTabStyle}
            onClick={() => setActiveContentLocale('ko')}
          >
            KO 콘텐츠
          </button>
          <button
            type="button"
            style={activeContentLocale === 'en' ? contentTabActiveStyle : contentTabStyle}
            onClick={() => setActiveContentLocale('en')}
          >
            EN 콘텐츠
          </button>
        </div>
        <div style={{ marginTop: '1.25rem' }}>
          {activeContentLocale === 'ko' ? (
            editorType === 'nextra' ? (
              <NextraMarkdownField
                id="content-ko"
                label="콘텐츠 (한국어)"
                locale="ko"
                required
                helperText="한글 페이지 본문입니다. Markdown 또는 MDX 형식으로 작성하세요."
                value={formState.contentKo}
                onChange={(next) => setFormState((prev) => ({ ...prev, contentKo: next }))}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                  콘텐츠 (한국어) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
                  한글 페이지 본문입니다. Markdown 형식으로 작성하세요.
                </p>
                <ToastMarkdownEditor
                  value={formState.contentKo}
                  onChange={(next) => setFormState((prev) => ({ ...prev, contentKo: next }))}
                  saveFormat={saveFormat}
                  onSaveFormatChange={setSaveFormat}
                />
              </div>
            )
          ) : (
            editorType === 'nextra' ? (
              <NextraMarkdownField
                id="content-en"
                label="콘텐츠 (영어)"
                locale="en"
                helperText="영문 페이지 본문입니다. Markdown 또는 MDX 형식으로 작성하세요."
                value={formState.contentEn}
                onChange={(next) => setFormState((prev) => ({ ...prev, contentEn: next }))}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                  콘텐츠 (영어)
                </label>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
                  영문 페이지 본문입니다. Markdown 형식으로 작성하세요.
                </p>
                <ToastMarkdownEditor
                  value={formState.contentEn}
                  onChange={(next) => setFormState((prev) => ({ ...prev, contentEn: next }))}
                  saveFormat={saveFormat}
                  onSaveFormatChange={setSaveFormat}
                />
              </div>
            )
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          paddingTop: '1rem',
          borderTop: '1px solid #e5e7eb',
        }}
      >
        <button
          type="button"
          onClick={handlePreviewClick}
          disabled={previewing}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: '1px solid #cbd5f5',
            backgroundColor: '#eef2ff',
            color: '#4338ca',
            cursor: previewing ? 'not-allowed' : 'pointer',
            minWidth: '140px',
          }}
        >
          {previewing ? '미리보기 준비중...' : '미리보기'}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/pages/${site}`)}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: '1px solid #d1d5db',
            backgroundColor: '#fff',
            cursor: 'pointer',
          }}
        >
          목록
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={handleSaveDraftClick}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: '1px solid #d1d5db',
            backgroundColor: '#fff',
            color: '#111827',
            cursor: submitting ? 'not-allowed' : 'pointer',
            minWidth: '130px',
          }}
        >
          {submitting ? '저장 중...' : '임시 저장'}
        </button>
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            backgroundColor: '#2563eb',
            color: '#fff',
            cursor: submitting ? 'not-allowed' : 'pointer',
            minWidth: '130px',
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? '발행 중...' : pageId ? '발행' : '생성 후 발행'}
        </button>
      </div>
    </form>
  );
}