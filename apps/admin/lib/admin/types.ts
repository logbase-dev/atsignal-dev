export type Site = 'web' | 'docs';
export type Locale = 'ko' | 'en';

export interface LocalizedField {
  ko: string;
  en?: string;
}

export interface Menu {
  id?: string;
  site: Site;
  labels: LocalizedField;
  path: string;
  isExternal?: boolean;  // 외부 링크 여부
  depth: number;
  parentId: string;  // "0" 또는 부모 ID
  order: number;
  enabled: {
    ko: boolean;     // 한글 메뉴 표시 여부
    en: boolean;     // 영문 메뉴 표시 여부
  };
  description?: LocalizedField;  // 설명 (다국어 지원)
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Page {
  id?: string;
  site: Site;
  menuId: string;
  slug: string;
  labelsLive: LocalizedField;
  labelsDraft?: LocalizedField;
  contentLive: LocalizedField;
  contentDraft?: LocalizedField;
  editorType?: 'nextra' | 'toast';
  saveFormat?: 'markdown' | 'html';
  createdAt?: Date;
  updatedAt?: Date;
  draftUpdatedAt?: Date;
}

export interface Block {
  type: string;
  data: Record<string, any>;
}

export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author?: string;
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  published: boolean;
}

