'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  
  useEffect(() => {
    // 3초 후 자동으로 홈으로 이동
    const timer = setTimeout(() => {
      router.push('/');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [router]);
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
        <p>잠시 후 홈으로 이동합니다...</p>
        <br /> <br /> <br />
        <Link
          href="/"
          className="not-found-button"
        >
          지금 홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

