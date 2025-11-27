'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMenus } from '@/lib/admin/menuService';
import { deletePage, getPageById, getPages, publishPage, savePageDraft } from '@/lib/admin/pageService';
import { buildMenuTree, flattenMenuTree } from '@/utils/menuTree';
import type { Menu, Page, Site } from '@/lib/admin/types';
import type { MenuOption, PageFormValues } from '../types';
import { buildPreviewUrl } from '@/lib/admin/preview';

export function usePageEditor(site: Site, pageId: string | null) {
  const router = useRouter();
  const [page, setPage] = useState<Page | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [pages, setPages] = useState<Page[]>([]); // 추가
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [menuList, pageList, pageData] = await Promise.all([
        getMenus(site),
        getPages(site), // 추가
        pageId ? getPageById(pageId) : Promise.resolve(null),
      ]);
      setMenus(menuList);
      setPages(pageList); // 추가
      if (pageData) {
        if (pageData.site !== site) {
          setError('이 페이지는 현재 사이트에 속하지 않습니다.');
          return;
        }
        setPage(pageData);
      } else if (pageId) {
        setError('페이지를 찾을 수 없습니다.');
      }
    } catch (err) {
      console.error('[usePageEditor] Failed to load data', err);
      setError('데이터를 불러오지 못했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, [site, pageId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const menuOptions = useMemo<MenuOption[]>(() => {
    const validMenus = menus.filter((menu): menu is Menu & { id: string } => Boolean(menu.id));
    
    // 이미 페이지가 연결된 메뉴 ID 수집 (현재 편집 중인 페이지 제외)
    const usedMenuIds = new Set(
      pages
        .filter(p => p.id !== pageId && p.menuId) // 현재 편집 중인 페이지 제외
        .map(p => p.menuId)
    );
    
    // 트리 구조로 변환 후 평면 배열로 변환 (부모-자식 관계 유지)
    const tree = buildMenuTree(validMenus);
    const flattened = flattenMenuTree(tree);
    
    // 이미 페이지가 연결된 메뉴 제외
    return flattened
      .filter((menu) => !usedMenuIds.has(menu.id!))
      .map((menu) => ({
        id: menu.id!,
        depth: menu.depth,
        path: menu.path,
        label: `${menu.labels.ko}${menu.labels.en ? ` / ${menu.labels.en}` : ''}`,
        enabled: menu.enabled.ko || menu.enabled.en,
      }));
  }, [menus, pages, pageId]); // pages와 pageId를 의존성에 추가

  const persistDraft = async (
    values: PageFormValues,
    options: { silent?: boolean; refresh?: boolean } = {},
  ) => {
    const { silent = false, refresh = true } = options;
    if (!silent) {
      setSubmitting(true);
    }
    try {
      const id = await savePageDraft(
        site,
        {
          menuId: values.menuId,
          slug: values.slug,
          labels: values.labels,
          content: values.content,
        },
        pageId ?? undefined,
      );

      if (!pageId) {
        router.replace(`/pages/${site}/${id}`);
      } else if (refresh) {
        await loadData();
      }

      return id;
    } catch (err) {
      console.error('[usePageEditor] Failed to save draft', err);
      setError('드래프트 저장에 실패했습니다.');
      throw err;
    } finally {
      if (!silent) {
        setSubmitting(false);
      }
    }
  };

  const handleSaveDraft = async (values: PageFormValues) => {
    await persistDraft(values);
  };

  const handlePublish = async (values: PageFormValues) => {
    const id = await persistDraft(values, { refresh: false });
    try {
      setSubmitting(true);
      await publishPage(id, {
        menuId: values.menuId,
        slug: values.slug,
        labels: values.labels,
        content: values.content,
      });
      router.push(`/pages/${site}`);
    } catch (err) {
      console.error('[usePageEditor] Failed to publish page', err);
      setError('페이지 게시에 실패했습니다.');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreview = async (values: PageFormValues, locale: 'ko' | 'en') => {
    const id = await persistDraft(values, { silent: true, refresh: false });
    return buildPreviewUrl(site, values.slug, locale, id);
  };

  const handleDelete = async () => {
    if (!pageId || !page?.id) return;
    try {
      await deletePage(page.id);
      router.push(`/pages/${site}`);
    } catch (err) {
      console.error('[usePageEditor] Failed to delete page', err);
      setError('페이지 삭제에 실패했습니다.');
      throw err;
    }
  };

  return {
    page,
    menus,
    menuOptions,
    loading,
    error,
    submitting,
    handleSaveDraft,
    handlePublish,
    handlePreview,
    handleDelete,
  };
}

