"use client";

import "@toast-ui/editor/dist/toastui-editor.css";
import { Editor } from "@toast-ui/react-editor";
import { ForwardedRef, useRef, useEffect, useState } from "react";

interface ToastMarkdownEditorProps {
  value: string;
  onChange: (next: string) => void;
  saveFormat?: 'markdown' | 'html';
  onSaveFormatChange?: (format: 'markdown' | 'html') => void;
  isNewPage?: boolean; // 페이지 추가 모드인지 여부
}

export function ToastMarkdownEditor({
  value,
  onChange,
  saveFormat = 'markdown',
  onSaveFormatChange,
  isNewPage = false, // 기본값은 false (수정 모드)
}: ToastMarkdownEditorProps) {
  const editorRef = useRef<Editor>(null);
  const isUserTypingRef = useRef(false);
  const previousValueRef = useRef<string>(''); // 이전 value 추적
  const previousSaveFormatRef = useRef<'markdown' | 'html'>(saveFormat);

  // HTML 이스케이프 정규화 함수: 중복된 &amp;를 정규화
  const normalizeHtmlEscapes = (html: string): string => {
    if (!html) return html;
    
    // &amp;가 반복되는 모든 패턴을 찾아서 &amp;로 정규화
    // &amp;amp; -> &amp;
    // &amp;amp;amp; -> &amp;
    // 등등...
    let normalized = html;
    let previous = '';
    
    // 반복적으로 정규화하여 모든 중복을 제거
    while (normalized !== previous) {
      previous = normalized;
      // &amp;amp;를 &amp;로 변환
      normalized = normalized.replace(/&amp;amp;/g, '&amp;');
    }
    
    return normalized;
  };

  // getHTML을 안전하게 호출하는 헬퍼 함수
  const safeGetHTML = (editorInstance: any): string => {
    try {
      // 에디터가 완전히 초기화되었는지 확인
      if (!editorInstance || typeof editorInstance.getHTML !== 'function') {
        return '';
      }
      const html = editorInstance.getHTML();
      
      // 중복 이스케이프 정규화
      return normalizeHtmlEscapes(html || '');
    } catch (error) {
      console.warn('Failed to get HTML from editor:', error);
      // HTML을 가져오는 데 실패하면 마크다운을 반환
      try {
        return editorInstance.getMarkdown() || '';
      } catch {
        return '';
      }
    }
  };

  // 에디터 마운트 후 초기화 및 value 설정
  useEffect(() => {
    const editorInstance = editorRef.current?.getInstance();
    if (!editorInstance) {
      return;
    }

    // saveFormat에 따라 모드 변경 (saveFormat이 변경되었을 때)
    if (previousSaveFormatRef.current !== saveFormat) {
      const targetMode = saveFormat === 'html' ? 'wysiwyg' : 'markdown';
      try {
        editorInstance.changeMode(targetMode);
        previousSaveFormatRef.current = saveFormat;
        
        // 모드 변경 후 value 설정 (모드 변경 직후)
        if (value && value.trim() !== '') {
          if (saveFormat === 'html') {
            editorInstance.setHTML(value);
          } else {
            editorInstance.setMarkdown(value);
          }
        }
      } catch (e) {
        console.warn('Failed to change editor mode:', e);
      }
      return; // 모드 변경 시 여기서 종료
    }

    // 사용자가 입력 중이면 에디터를 업데이트하지 않음
    if (isUserTypingRef.current) {
      return;
    }

    // value가 변경되었을 때만 업데이트 (외부에서 변경된 경우)
    if (previousValueRef.current !== value) {
      previousValueRef.current = value;

      if (saveFormat === 'html') {
        try {
          const currentHTML = editorInstance.getHTML();
          if (value && value.trim() !== '' && value !== currentHTML) {
            // 수정 모드: value가 있으면 설정
            editorInstance.setHTML(value);
          } else if (isNewPage && (!value || value.trim() === '') && currentHTML && currentHTML.trim() !== '') {
            // 새 페이지일 때만: 에디터에 기본 텍스트가 있으면 비우기
            editorInstance.setHTML('');
          }
        } catch (e) {
          console.warn('Failed to set HTML:', e);
        }
      } else {
        try {
          const currentMarkdown = editorInstance.getMarkdown();
          if (value && value.trim() !== '' && value !== currentMarkdown) {
            // 수정 모드: value가 있으면 설정
            editorInstance.setMarkdown(value);
          } else if (isNewPage && (!value || value.trim() === '') && currentMarkdown && currentMarkdown.trim() !== '') {
            // 새 페이지일 때만: 에디터에 기본 텍스트가 있으면 비우기
            const defaultTexts = ['write', 'preview', 'markdown', 'wysiwyg'];
            const hasDefaultText = defaultTexts.some(text => 
              currentMarkdown.toLowerCase().includes(text.toLowerCase())
            );
            if (hasDefaultText) {
              editorInstance.setMarkdown('');
            }
          }
        } catch (e) {
          console.warn('Failed to set Markdown:', e);
        }
      }
    }
  }, [value, saveFormat, isNewPage]);

  // 에디터 초기 마운트 시 value 설정 및 기본 텍스트 제거 (한 번만)
  useEffect(() => {
    const timer = setTimeout(() => {
      const editorInstance = editorRef.current?.getInstance();
      if (!editorInstance) return;

      // 초기 마운트 시 value 설정
      if (value && value.trim() !== '') {
        try {
          if (saveFormat === 'html') {
            const currentHTML = editorInstance.getHTML();
            if (value !== currentHTML) {
              editorInstance.setHTML(value);
            }
          } else {
            const currentMarkdown = editorInstance.getMarkdown();
            if (value !== currentMarkdown) {
              editorInstance.setMarkdown(value);
            }
          }
        } catch (e) {
          console.warn('Failed to set initial value:', e);
        }
      } else if (isNewPage) {
        // 새 페이지일 때만 기본 텍스트 제거 (더 빠르게)
        try {
          const currentMarkdown = editorInstance.getMarkdown();
          const defaultTexts = ['write', 'preview', 'markdown', 'wysiwyg'];
          const hasDefaultText = defaultTexts.some(text => 
            currentMarkdown.toLowerCase().includes(text.toLowerCase())
          );
          if (hasDefaultText) {
            editorInstance.setMarkdown('');
          }
        } catch (e) {
          // 무시
        }
      }
    }, 1); // 300ms에서 100ms로 줄임

    return () => clearTimeout(timer);
  }, []); // 마운트 시 한 번만

  return (
    <div>
      <Editor
        ref={editorRef as ForwardedRef<Editor>}
        initialValue={value || ""}
        previewStyle="vertical"
        height="800px"  // 600px에서 800px로 변경
        initialEditType={saveFormat === 'html' ? 'wysiwyg' : 'markdown'}
        useCommandShortcut={true}
        onChange={() => {
          const editorInstance = editorRef.current?.getInstance();
          if (!editorInstance) return;
          
          isUserTypingRef.current = true;
          
          const content = saveFormat === 'html' 
            ? safeGetHTML(editorInstance)
            : editorInstance.getMarkdown();
          onChange(content || "");
          
          setTimeout(() => {
            isUserTypingRef.current = false;
          }, 100);
        }}
        hideModeSwitch={false}
        toolbarItems={[
          ['heading', 'bold', 'italic', 'strike'],
          ['hr', 'quote'],
          ['ul', 'ol', 'task', 'indent', 'outdent'],
          ['table', 'image', 'link'],
          ['code', 'codeblock'],
          ['scrollSync'],
        ]}
      />
      <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.85rem', color: '#6b7280' }}>저장 형식:</label>
        <select
          value={saveFormat}
          onChange={(e) => {
            const format = e.target.value as 'markdown' | 'html';
            onSaveFormatChange?.(format);
            // 저장 형식 변경 시 에디터 모드도 변경
            const editorInstance = editorRef.current?.getInstance();
            if (editorInstance) {
              const targetMode = format === 'html' ? 'wysiwyg' : 'markdown';
              editorInstance.changeMode(targetMode);
              
              // 현재 내용을 선택한 형식으로 변환하여 저장
              const content = format === 'html' 
                ? safeGetHTML(editorInstance)
                : editorInstance.getMarkdown();
              onChange(content || "");
            }
          }}
          style={{
            padding: '0.4rem 0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid #d1d5db',
            fontSize: '0.85rem',
            backgroundColor: '#fff',
            cursor: 'pointer',
          }}
        >
          <option value="markdown">Markdown</option>
          <option value="html">HTML</option>
        </select>
      </div>
    </div>
  );
}

