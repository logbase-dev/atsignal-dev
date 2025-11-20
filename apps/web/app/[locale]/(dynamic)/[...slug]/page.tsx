import { notFound } from "next/navigation";
import { getMenuByPath } from "@/utils/menu";
import PageRenderer from "@/components/PageRenderer";
import { menuData } from "@/data/menu";
import { validLocales } from "@/lib/i18n/getLocale";

interface PageProps {
  params: Promise<{
    locale: string;
    slug: string[];
  }>;
}

export const dynamicParams = false;

export default async function DynamicPage({ params }: PageProps) {
  const { locale, slug } = await params;
  
  // URL 경로 구성 (공백이 %20으로 인코딩되어 있을 수 있음)
  const decodedSlug = slug.map(s => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  });
  const fullPath = '/' + decodedSlug.join('/');
  const menuItem = getMenuByPath(fullPath);

  if (!menuItem) {
    notFound();
  }

  return (
    <div className="main">
      <PageRenderer item={menuItem} />
    </div>
  );
}

export function generateStaticParams() {
  // 모든 메뉴 경로를 정적으로 생성
  const params: { locale: string; slug: string[] }[] = [];
  
  validLocales.forEach((locale) => {
    menuData.forEach((item) => {
      // "Direct link"는 홈이므로 제외
      if (item.depth1 === 'Direct link') return;
      
      // 경로를 슬래시로 분리
      const pathParts = item.fullPath
        .trim()
        .replace(/\/{2,}/g, '/')
        .split('/')
        .filter(Boolean);
      
      // 각 부분을 URL 인코딩 (공백은 %20으로, @는 %40으로 변환)
      const encodedParts = pathParts.map(part => encodeURIComponent(part));
      
      params.push({ locale, slug: encodedParts });
      
      // 중간 경로도 추가 (예: /Product, /Product/Product@signal)
      for (let i = 1; i < pathParts.length; i++) {
        const intermediatePath = pathParts.slice(0, i);
        const intermediateEncoded = intermediatePath.map(part => encodeURIComponent(part));
        
        // 중복 제거
        const exists = params.some(p => 
          p.locale === locale &&
          p.slug.length === intermediateEncoded.length &&
          p.slug.every((s, idx) => s === intermediateEncoded[idx])
        );
        
        if (!exists) {
          params.push({ locale, slug: intermediateEncoded });
        }
      }
    });
  });
  
  return params;
}

