export interface MenuOption {
  id: string;
  depth: number;
  path: string;
  label: string;
  enabled: boolean;
}

export interface PageFormValues {
  id?: string;
  menuId: string;
  slug: string;
  labels: {
    ko: string;
    en?: string;
  };
  content: {
    ko: string;
    en?: string;
  };
}

