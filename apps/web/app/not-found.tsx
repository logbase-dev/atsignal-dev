import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="not-found">
      <div>
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="not-found-text">
          요청하신 페이지가 존재하지 않습니다.
        </p>
        <Link
          href="/"
          className="not-found-button"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

