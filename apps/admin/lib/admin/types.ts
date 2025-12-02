export type Site = 'web' | 'docs';
export type Locale = 'ko' | 'en';

export type PageType = 'dynamic' | 'static' | 'notice' | 'links';

export interface LocalizedField {
  ko: string;
  en?: string;
}

export interface Menu {
  id?: string;
  site: Site;
  labels: LocalizedField;
  path: string;
  pageType?: PageType;  // 새 필드 추가 (기본값: 'dynamic')
  depth: number;
  parentId: string;
  order: number;
  enabled: {
    ko: boolean;
    en: boolean;
  };
  description?: LocalizedField;
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

