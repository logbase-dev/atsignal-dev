import React from 'react';
import Footer from '@/components/Footer';
import './globals.css';
import { getMenusByLocale } from '@/lib/cms/getMenus';
import { defaultLocale } from '@/lib/i18n/getLocale';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Firestore에서 메뉴 가져오기 (기본 locale 사용)
  const menus = await getMenusByLocale('docs', defaultLocale);
  
  // Footer용: 전체 메뉴를 전달 (depth2의 자식을 찾기 위해)
  const footerMenus = menus.map((menu: any) => ({
    id: menu.id,
    labels: menu.labels,
    label: menu.label,
    path: menu.path,
    depth: menu.depth,
    parentId: menu.parentId,
    order: menu.order || 0,
    pageType: menu.pageType,
    url: menu.url,
  }));

  return (
    <html lang="ko">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {children}
          <Footer menus={footerMenus} />
        </div>
      </body>
    </html>
  );
}

