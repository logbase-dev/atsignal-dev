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

export interface FAQCategory {
  id?: string;
  name: LocalizedField;
  description?: LocalizedField;
  order: number;
  enabled: {
    ko: boolean;
    en: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FAQ {
  id?: string;
  question: LocalizedField;
  answer: LocalizedField;
  categoryId?: string; // 카테고리 (선택사항)
  level: number; // 우선순위 레벨 (낮을수록 높은 우선순위, 기본값: 999)
  isTop: boolean; // 맨 상위 표시 여부 (기본값: false)
  enabled: {
    ko: boolean;
    en: boolean;
  };
  tags?: string[]; // 해시태그 배열 (선택사항) - 추가
  editorType?: 'nextra' | 'toast'; // 에디터 타입
  saveFormat?: 'markdown' | 'html'; // 저장 형식
  createdAt?: Date;
  updatedAt?: Date;
  order?: number; // 정렬 순서 (같은 level 내에서)
}

