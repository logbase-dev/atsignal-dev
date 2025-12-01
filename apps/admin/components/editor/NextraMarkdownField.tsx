'use client';

import { useMemo, useState, type CSSProperties } from 'react';

type EditorMode = 'write' | 'preview';

interface NextraMarkdownFieldProps {
  id: string;
  label: string;
  locale: string;
  value: string;
  required?: boolean;
  helperText?: string;
  placeholder?: string;
  onChange: (nextValue: string) => void;
}

export function NextraMarkdownField({
  id,
  label,
  locale,
  value,
  required,
  helperText,
  placeholder = '# 제목\n본문을 작성하세요.',
  onChange,
}: NextraMarkdownFieldProps) {
  const [mode, setMode] = useState<EditorMode>('write');
  const previewHtml = useMemo(() => markdownToHtml(value), [value]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  const handleModeChange = (nextMode: EditorMode) => {
    setMode(nextMode);
  };

  return (
    <section style={wrapperStyle}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={badgeStyle}>{locale.toUpperCase()}</span>
          <label htmlFor={id} style={titleStyle}>
            {label}
            {required ? <span style={requiredStyle}>*</span> : null}
          </label>
        </div>
        <div style={tabGroupStyle}>
          <button
            type="button"
            onClick={() => handleModeChange('write')}
            style={mode === 'write' ? tabActiveStyle : tabStyle}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('preview')}
            style={mode === 'preview' ? tabActiveStyle : tabStyle}
          >
            Preview
          </button>
        </div>
      </header>
      {helperText ? <p style={helperStyle}>{helperText}</p> : null}

      {mode === 'write' ? (
        <div style={editorShellStyle}>
          <textarea
            id={id}
            spellCheck={false}
            onChange={handleInput}
            value={value}
            placeholder={placeholder}
            style={textareaStyle}
          />
        </div>
      ) : (
        <div style={previewStyle}>
          {value.trim() ? (
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          ) : (
            <p style={{ color: '#9ca3af', margin: 0 }}>내용이 없습니다.</p>
          )}
        </div>
      )}
    </section>
  );
}

function markdownToHtml(markdown: string) {
  if (!markdown.trim()) {
    return '';
  }

  const normalized = markdown.replace(/\r\n/g, '\n').trim();
  const blocks = normalized.split(/\n{2,}/).map((block) => block.trim());

  const html = blocks
    .map((block) => {
      if (!block) {
        return '';
      }

      if (/^```/.test(block)) {
        const code = block.replace(/^```.*\n?/, '').replace(/```$/, '');
        return `<pre style="background:#f3f4f6;border:1px solid #d1d5db;color:#111827;padding:1rem;border-radius:0.75rem;overflow:auto;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;font-size:0.875rem;line-height:1.5;"><code>${escapeHtml(
          code,
        )}</code></pre>`;
      }

      if (/^#{1,6}\s/.test(block)) {
        const level = (block.match(/^#+/)?.[0].length ?? 1).toString();
        const text = block.replace(/^#{1,6}\s*/, '');
        return `<h${level} style="margin:1rem 0 0.5rem;font-weight:700;">${formatInline(text)}</h${level}>`;
      }

      if (block.split('\n').every((line) => /^[-*]\s+/.test(line))) {
        const items = block
          .split('\n')
          .map((line) => line.replace(/^[-*]\s+/, '').trim())
          .map((item) => `<li>${formatInline(item)}</li>`)
          .join('');
        return `<ul style="padding-left:1.25rem;margin:0.5rem 0;">${items}</ul>`;
      }

      if (block.split('\n').every((line) => /^\d+\.\s+/.test(line))) {
        const items = block
          .split('\n')
          .map((line) => line.replace(/^\d+\.\s+/, '').trim())
          .map((item) => `<li>${formatInline(item)}</li>`)
          .join('');
        return `<ol style="padding-left:1.25rem;margin:0.5rem 0;">${items}</ol>`;
      }

      if (/^>\s?/.test(block)) {
        const text = block.replace(/^>\s?/, '');
        return `<blockquote style="border-left:4px solid #dbeafe;padding-left:1rem;margin:0.75rem 0;color:#475569;">${formatInline(
          text,
        )}</blockquote>`;
      }

      return `<p style="margin:0.5rem 0;line-height:1.6;">${formatInline(block).replace(/\n/g, '<br />')}</p>`;
    })
    .join('');

  return html;
}

function formatInline(text: string) {
  let formatted = escapeHtml(text);
  formatted = formatted.replace(/`([^`]+)`/g, '<code style="background:#e2e8f0;padding:0.1rem 0.35rem;border-radius:0.35rem;">$1</code>');
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
  formatted = formatted.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noreferrer" style="color:#2563eb;">$1</a>');
  return formatted;
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const wrapperStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  padding: '1.25rem',
  borderRadius: '1rem',
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const badgeStyle: CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#1d4ed8',
  backgroundColor: '#dbeafe',
  padding: '0.1rem 0.5rem',
  borderRadius: '999px',
};

const titleStyle: CSSProperties = {
  fontSize: '1rem',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
};

const requiredStyle: CSSProperties = {
  color: '#dc2626',
};

const tabGroupStyle: CSSProperties = {
  display: 'inline-flex',
  gap: '0.25rem',
  backgroundColor: '#f1f5f9',
  borderRadius: '999px',
  padding: '0.15rem',
};

const tabStyle: CSSProperties = {
  border: 'none',
  background: 'transparent',
  padding: '0.3rem 0.9rem',
  borderRadius: '999px',
  fontSize: '0.9rem',
  fontWeight: 500,
  color: '#475569',
  cursor: 'pointer',
};

const tabActiveStyle: CSSProperties = {
  ...tabStyle,
  backgroundColor: '#ffffff',
  color: '#0f172a',
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.12)',
};

const helperStyle: CSSProperties = {
  margin: 0,
  fontSize: '0.85rem',
  color: '#6b7280',
};

const editorShellStyle: CSSProperties = {
  position: 'relative',
  borderRadius: '0.75rem',
  border: '1px solid #e2e8f0',
  backgroundColor: '#f8fafc',
  minHeight: '500px',
};

const textareaStyle: CSSProperties = {
  width: '100%',
  minHeight: '800px',
  padding: '1rem',
  border: 'none',
  outline: 'none',
  resize: 'vertical',
  fontFamily:
    'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace)',
  fontSize: '0.95rem',
  lineHeight: 1.6,
  backgroundColor: 'transparent',
  color: '#0f172a',
};

const previewStyle: CSSProperties = {
  borderRadius: '0.75rem',
  border: '1px solid #e2e8f0',
  backgroundColor: '#fff',
  padding: '1rem',
  minHeight: '500px',
  color: '#0f172a',
};


