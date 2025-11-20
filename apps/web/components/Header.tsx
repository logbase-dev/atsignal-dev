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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const menuTree = buildMenuTree();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (path: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpenDropdown(path);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const renderMenuItems = (nodes: MenuNode[], level: number = 0): React.ReactNode => {
    return nodes.map((node) => {
      const hasChildren = node.children && node.children.length > 0;

      if (hasChildren) {
        return (
          <div key={node.path} className="nav-item">
            <button
              onMouseEnter={() => handleMouseEnter(node.path)}
              className="nav-button"
            >
              {node.name}
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openDropdown === node.path && (
              <div
                className="dropdown"
                onMouseEnter={() => handleMouseEnter(node.path)}
                onMouseLeave={handleMouseLeave}
              >
                {node.children!.map((child) => {
                  if (child.children && child.children.length > 0) {
                    return (
                      <div key={child.path} className="dropdown-section">
                        <div className="dropdown-section-title">
                          {child.name}
                        </div>
                        <div className="dropdown-section-items">
                          {child.children.map((grandchild) => (
                            <Link
                              key={grandchild.path}
                              href={pathToUrl(grandchild.path)}
                              className="dropdown-link"
                            >
                              {grandchild.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={child.path}
                      href={pathToUrl(child.path)}
                      className="dropdown-item"
                    >
                      {child.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

      return (
        <Link
          key={node.path}
          href={pathToUrl(node.path)}
          className="nav-link"
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
          <Link href="/" className="logo">
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
              href={pathToUrl("/Pricing/Contact Sales")}
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

