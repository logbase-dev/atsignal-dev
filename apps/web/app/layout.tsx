import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Splash from "@/components/Splash";
import { getMenusByLocale } from "@/lib/cms/getMenus";
import { buildMenuTreeFromFirestore } from "@/utils/menuTree";
import { defaultLocale } from "@/lib/i18n/getLocale";

export const metadata: Metadata = {
  title: "AtSignal - 통합 행동데이터 플랫폼",
  description: "Nethru가 보유한 데이터 분석 기술력과 경험을 집약한 통합 행동데이터 플랫폼",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Firestore에서 메뉴 가져오기 (기본 locale 사용)
  const menus = await getMenusByLocale('web', defaultLocale);
  const menuTree = buildMenuTreeFromFirestore(menus, defaultLocale);

  // Footer용: 전체 메뉴를 전달 (depth2의 자식을 찾기 위해)
  const footerMenus = menus.map((menu: any) => ({
    id: menu.id,
    labels: menu.labels,
    label: menu.label,
    path: menu.path,
    depth: menu.depth,
    parentId: menu.parentId,
    order: menu.order || 0,
    pageType: menu.pageType, // 추가
    url: menu.url, // 추가
  }));

  return (
    <html lang="ko">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <Splash />
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header menuTree={menuTree} />
          <main className="min-h-screen bg-gray-50 dark:bg-gray-900" style={{ flex: 1 }}>
            {children}
          </main>
          <Footer menus={footerMenus} />
        </div>
      </body>
    </html>
  );
}
