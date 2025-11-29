'use client';

import Link from 'next/link';

interface MenuNode {
  id: string;
  label?: string;
  labels?: { ko: string; en?: string };
  path: string;
  isExternal?: boolean;
  children?: MenuNode[];
}

interface SidebarProps {
  menus: MenuNode[];
  locale: 'ko' | 'en';
  currentPath: string;
}

export function Sidebar({ menus, locale, currentPath }: SidebarProps) {
  // 현재 경로와 일치하는지 확인
  const isActive = (menuPath: string) => {
    if (menuPath === currentPath) return true;
    // 하위 경로인지 확인 (예: admin과 admin/test)
    return currentPath.startsWith(menuPath + '/');
  };

  const getMenuLabel = (menu: MenuNode): string => {
    return menu.label || menu.labels?.[locale] || menu.labels?.ko || '';
  };

  const renderMenu = (menu: MenuNode, depth: number = 0) => {
    const active = isActive(menu.path);
    const hasChildren = menu.children && menu.children.length > 0;
    const menuLabel = getMenuLabel(menu);

    return (
      <div key={menu.id} style={{ marginBottom: depth === 0 ? '0.5rem' : '0' }}>
        {menu.isExternal ? (
          <a
            href={menu.path}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              padding: '0.5rem 0.75rem',
              paddingLeft: `${0.75 + depth * 1.25}rem`,
              fontSize: depth === 0 ? '0.9rem' : '0.85rem',
              fontWeight: depth === 0 ? 600 : 400,
              color: active ? '#2563eb' : '#6b7280',
              textDecoration: 'none',
              borderRadius: '0.375rem',
              transition: 'all 0.2s',
              backgroundColor: active ? '#eff6ff' : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.color = '#111827';
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.color = '#6b7280';
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {menuLabel}
          </a>
        ) : (
          <Link
            href={`/${locale}/${menu.path}`}
            style={{
              display: 'block',
              padding: '0.5rem 0.75rem',
              paddingLeft: `${0.75 + depth * 1.25}rem`,
              fontSize: depth === 0 ? '0.9rem' : '0.85rem',
              fontWeight: depth === 0 ? 600 : 400,
              color: active ? '#2563eb' : '#6b7280',
              textDecoration: 'none',
              borderRadius: '0.375rem',
              transition: 'all 0.2s',
              backgroundColor: active ? '#eff6ff' : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.color = '#111827';
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.color = '#6b7280';
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {menuLabel}
          </Link>
        )}
        {hasChildren && (
          <div style={{ marginTop: '0.25rem' }}>
            {menu.children!.map((child) => renderMenu(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="page-renderer-sidebar">
      <nav className="sidebar-container">
        <div className="sidebar-header">
          <span className="sidebar-title">문서</span>
        </div>
        <div className="sidebar-menu">
          {menus.map((menu) => renderMenu(menu))}
        </div>
      </nav>
    </aside>
  );
}

