'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuNode } from '@/types/menu';
import { buildMenuTree, pathToUrl } from '@/utils/menu';
import { getLocaleFromPath, defaultLocale } from '@/lib/i18n/getLocale';
import koMessages from '@/locales/ko.json';
import enMessages from '@/locales/en.json';

const translations = {
  ko: koMessages,
  en: enMessages,
} as const;

export default function Header() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const translation = translations[locale] ?? translations[defaultLocale];
  const contactCta = translation.header?.contactCta ?? translations.ko.header.contactCta;
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const menuTree = buildMenuTree();
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const handleMouseEnter = (path: string) => {
    // 해당 path의 timeout이 있으면 취소
    const existingTimeout = timeoutRefs.current.get(path);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      timeoutRefs.current.delete(path);
    }
    
    setOpenDropdowns((prev) => {
      const next = new Set(prev);
      next.add(path);
      return next;
    });
  };

  const handleMouseLeave = (path: string) => {
    const timeout = setTimeout(() => {
      setOpenDropdowns((prev) => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
      timeoutRefs.current.delete(path);
    }, 200);
    
    timeoutRefs.current.set(path, timeout);
  };

  useEffect(() => {
    return () => {
      // 모든 timeout 정리
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
      timeoutRefs.current.clear();
    };
  }, []);

  const renderMenuItems = (nodes: MenuNode[], level: number = 0): React.ReactNode => {
    return nodes.map((node) => {
      const hasChildren = node.children && node.children.length > 0;
      const isOpen = openDropdowns.has(node.path);

      if (hasChildren) {
        // level 0 (depth1)은 nav-item으로 렌더링
        if (level === 0) {
          return (
            <div key={node.path} className="nav-item">
              <button
                onMouseEnter={() => handleMouseEnter(node.path)}
                onMouseLeave={() => handleMouseLeave(node.path)}
                className="nav-button"
              >
                {node.name}
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isOpen && (
                <div
                  className="dropdown"
                  onMouseEnter={() => handleMouseEnter(node.path)}
                  onMouseLeave={() => handleMouseLeave(node.path)}
                >
                  {renderMenuItems(node.children!, level + 1)}
                </div>
              )}
            </div>
          );
        }
        
        // level 1 이상 (depth2, depth3 등)은 dropdown-item-wrapper로 렌더링
        return (
          <div key={node.path} className="dropdown-item-wrapper">
            <div
              className="dropdown-item"
              onMouseEnter={() => handleMouseEnter(node.path)}
              onMouseLeave={() => handleMouseLeave(node.path)}
            >
              <Link
                href={pathToUrl(node.path, locale)}
                className="dropdown-link"
                style={{ display: 'block', width: '100%' }}
              >
                {node.name}
              </Link>
            </div>
            {isOpen && node.children && node.children.length > 0 && (
              <div
                className="dropdown dropdown-nested"
                style={{ 
                  position: 'relative',
                  width: '100%',
                  paddingLeft: '1rem',
                  marginTop: '0.25rem'
                }}
                onMouseEnter={() => handleMouseEnter(node.path)}
                onMouseLeave={() => handleMouseLeave(node.path)}
              >
                {renderMenuItems(node.children, level + 1)}
              </div>
            )}
          </div>
        );
      }

      // children이 없는 경우
      if (level === 0) {
        return (
          <Link
            key={node.path}
            href={pathToUrl(node.path, locale)}
            className="nav-link"
          >
            {node.name}
          </Link>
        );
      }

      return (
        <Link
          key={node.path}
          href={pathToUrl(node.path, locale)}
          className="dropdown-item"
        >
          {node.name}
        </Link>
      );
    });
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          <Link href={`/${locale}`} className="logo">
            <img
              src="/images/logo.svg"
              alt="AtSignal"
              className="logo-image"
            />
          </Link>
          
          <nav className="nav">
            {renderMenuItems(menuTree)}
          </nav>

          <div>
            <Link
              href={pathToUrl("/Pricing/Contact Sales", locale)}
              className="cta-button"
            >
              {contactCta}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

