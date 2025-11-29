"use client";

import "@toast-ui/editor/dist/toastui-editor.css";
import { Editor } from "@toast-ui/react-editor";
import { ForwardedRef, useRef, useEffect } from "react";

interface ToastMarkdownEditorProps {
  value: string;
  onChange: (next: string) => void;
  saveFormat?: 'markdown' | 'html';
  onSaveFormatChange?: (format: 'markdown' | 'html') => void;
}

export function ToastMarkdownEditor({
  value,
  onChange,
  saveFormat = 'markdown',
  onSaveFormatChange,
}: ToastMarkdownEditorProps) {
  const editorRef = useRef<Editor>(null);

  // 초기값 주입 (에디터 마운트 후 setMarkdown)
  useEffect(() => {
    const editorInstance = editorRef.current?.getInstance();
    if (editorInstance) {
      const currentMarkdown = editorInstance.getMarkdown();
      // value가 마크다운인지 HTML인지 확인하여 적절히 설정
      // HTML인 경우 마크다운으로 변환할 수 없으므로, 마크다운으로만 설정
      if (value !== currentMarkdown) {
        editorInstance.setMarkdown(value || "");
      }
    }
  }, [value]);

  return (
    <div>
      <Editor
        ref={editorRef as ForwardedRef<Editor>}
        initialValue={value}
        previewStyle="vertical"
        height="600px"
        initialEditType="markdown"
        useCommandShortcut={true}
        onChange={() => {
          const editorInstance = editorRef.current?.getInstance();
          if (!editorInstance) return;
          
          const content = saveFormat === 'html' 
            ? editorInstance.getHTML() 
            : editorInstance.getMarkdown();
          onChange(content || "");
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
            // 즉시 현재 내용을 선택한 형식으로 변환하여 저장
            const editorInstance = editorRef.current?.getInstance();
            if (editorInstance) {
              const content = format === 'html' 
                ? editorInstance.getHTML() 
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

