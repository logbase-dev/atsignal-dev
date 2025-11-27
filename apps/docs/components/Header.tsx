'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

interface HeaderProps {
  navItems: NavItem[];
  locale: 'ko' | 'en';
}

export default function Header({ navItems, locale }: HeaderProps) {
  const pathname = usePathname();
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

  return (
    <header style={headerStyle}>
      <div style={headerContainerStyle}>
        <Link href={`/${locale}`} style={logoStyle}>
          <span style={logoTextStyle}>AtSignal Docs</span>
        </Link>
        <nav style={navStyle}>
          {navItems.map((item) => (
            <div
              key={item.href}
              style={navItemWrapperStyle}
              onMouseEnter={() => item.children && setHoveredMenu(item.href)}
              onMouseLeave={() => setHoveredMenu(null)}
            >
              <Link
                href={item.href}
                className="nav-item-link"
                style={{
                  ...navItemStyle,
                  ...(pathname?.startsWith(item.href) ? navItemActiveStyle : {}),
                }}
              >
                {item.label}
                {item.children && item.children.length > 0 && (
                  //하위 메뉴있을때 보여주는 역삼각형 아이콘
                  // <span style={{ marginLeft: '0.25rem', fontSize: '0.75rem' }}>▼</span>
                  null
                )}
              </Link>
              {item.children && item.children.length > 0 && hoveredMenu === item.href && (
                <div style={dropdownStyle}>
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      style={{
                        ...dropdownItemStyle,
                        ...(pathname?.startsWith(child.href) ? dropdownItemActiveStyle : {}),
                      }}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </header>
  );
}

const headerStyle: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 100,
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e5e7eb',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
};

const headerContainerStyle: React.CSSProperties = {
  maxWidth: '1280px',
  margin: '0 auto',
  padding: '0 1.5rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: '8rem',
  height: '64px',
};

const logoStyle: React.CSSProperties = {
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
};

const logoTextStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  fontWeight: 700,
  color: '#111827',
};

const navStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  position: 'relative',
};

const navItemWrapperStyle: React.CSSProperties = {
  position: 'relative',
};

const navItemStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: '#6b7280',
  textDecoration: 'none',
  borderRadius: '0.375rem',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
};

const navItemActiveStyle: React.CSSProperties = {
  color: '#111827',
  backgroundColor: '#f3f4f6',
};

const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  marginTop: '0.25rem',
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '0.5rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  minWidth: '200px',
  padding: '0.5rem 0',
  zIndex: 1000,
};

const dropdownItemStyle: React.CSSProperties = {
  display: 'block',
  padding: '0.5rem 1rem',
  fontSize: '0.875rem',
  color: '#6b7280',
  textDecoration: 'none',
  transition: 'all 0.2s',
};

const dropdownItemActiveStyle: React.CSSProperties = {
  color: '#111827',
  backgroundColor: '#f3f4f6',
};

