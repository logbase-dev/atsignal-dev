interface PageRendererProps {
  data: any;
  locale: string;
}

export default function PageRenderer({ data, locale }: PageRendererProps) {
  return (
    <div>
      <h1>{data.title || "Page"}</h1>
      <p>Locale: {locale}</p>
      {/* TODO: 실제 페이지 렌더링 로직 구현 */}
    </div>
  );
}

