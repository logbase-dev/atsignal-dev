'use client';

import { useState, useEffect, useMemo } from 'react';
import { buildMenuTree, flattenMenuTree } from '@/utils/menuTree';
import type { Menu, Site } from '@/lib/admin/types';

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (menuData: {
    labels: { ko: string; en?: string };
    path: string;
    depth: number;
    parentId: string;
    order: number;
    enabled: { ko: boolean; en: boolean };
  }) => Promise<void>;
  site: Site;
  parentMenus: Menu[]; // 부모 선택용 (모든 언어 포함)
  initialMenu?: Menu;
}

export function MenuModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  site, 
  parentMenus, 
  initialMenu 
}: MenuModalProps) {
  const [formData, setFormData] = useState({
    labelKo: '',
    labelEn: '',
    path: '',
    depth: 1,
    parentId: '0', // 최상위 메뉴는 "0"
    order: 1,
    enabled: {
      ko: true,
      en: false,
    },
  });

  // 부모 메뉴를 계층 구조로 정렬
  const sortedParentMenus = useMemo(() => {
    const validMenus = parentMenus.filter((menu): menu is Menu & { id: string } => Boolean(menu.id));
    const tree = buildMenuTree(validMenus);
    return flattenMenuTree(tree);
  }, [parentMenus]);

  useEffect(() => {
    if (initialMenu) {
      setFormData({
        labelKo: initialMenu.labels.ko,
        labelEn: initialMenu.labels.en || '',
        path: initialMenu.path,
        depth: initialMenu.depth,
        parentId: initialMenu.parentId || '0',
        order: initialMenu.order,
        enabled: initialMenu.enabled,
      });
    } else {
      // 새 메뉴 추가 시 기본값
      const maxOrder = parentMenus.length > 0 
        ? Math.max(...parentMenus.map(m => m.order)) + 1 
        : 1;
      setFormData({
        labelKo: '',
        labelEn: '',
        path: '',
        depth: 1,
        parentId: '0',
        order: maxOrder,
        enabled: {
          ko: true,
          en: false,
        },
      });
    }
  }, [initialMenu, isOpen, parentMenus, site]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit({
        labels: {
          ko: formData.labelKo,
          en: formData.labelEn || undefined, // 빈 문자열이면 undefined
        },
        path: formData.path,
        depth: formData.depth,
        parentId: formData.parentId || '0',
        order: formData.order,
        enabled: formData.enabled,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save menu:', error);
      alert('저장에 실패했습니다.');
    }
  };

  // 부모 선택 시 depth 자동 계산
  const handleParentChange = (parentId: string) => {
    if (parentId && parentId !== '0') {
      const parent = sortedParentMenus.find(m => m.id === parentId);
      if (parent) {
        setFormData({
          ...formData,
          parentId,
          depth: parent.depth + 1,
        });
      }
    } else {
      setFormData({
        ...formData,
        parentId: '0', // 최상위 메뉴는 "0"
        depth: 1,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '2rem',
        borderRadius: '0.5rem',
        width: '90%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
          {initialMenu?.id ? '메뉴 수정' : (initialMenu ? '하위메뉴 추가' : '메뉴 추가')}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  한글 메뉴명 <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <small style={{ color: '#666', display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  UI에 보이는 메뉴 이름입니다. (예: 제품, 솔루션, 문서)
                </small>
                <input
                  type="text"
                  value={formData.labelKo}
                  onChange={(e) => setFormData({ ...formData, labelKo: e.target.value })}
                  required
                  placeholder="한국어 (예: 제품)"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '0.25rem' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  영문 메뉴명
                </label>
                <small style={{ color: '#666', display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  선택사항입니다.
                </small>
                <input
                  type="text"
                  value={formData.labelEn}
                  onChange={(e) => setFormData({ ...formData, labelEn: e.target.value })}
                  placeholder="영어 (예: Products)"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '0.25rem' }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              경로 <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <small style={{ color: '#666', display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              URL 경로입니다. 슬래시(/) 없이 입력하세요. (예: product 또는 product/log-collecting)
            </small>
            <input
              type="text"
              value={formData.path}
              onChange={(e) => setFormData({ ...formData, path: e.target.value })}
              required
              placeholder="예: product/log-collecting"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '0.25rem' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  부모 메뉴 <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <small style={{ color: '#666', display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  상위 메뉴를 선택하세요. 최상위 메뉴는 "없음 (최상위)"를 선택하세요.
                </small>
                <select
                  value={formData.parentId}
                  onChange={(e) => handleParentChange(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '0.25rem' }}
                >
                  <option value="0">없음 (최상위) [Depth: 1]</option>
                  {sortedParentMenus
                    .filter(m => {
                      // 자기 자신 제외
                      if (initialMenu && m.id === initialMenu.id) return false;
                      return true;
                    })
                    .map(menu => (
                      <option key={menu.id} value={menu.id}>
                        {`${'— '.repeat(Math.max(menu.depth - 1, 0))}[Depth: ${menu.depth}] ${menu.labels.ko}${menu.labels.en ? ` / ${menu.labels.en}` : ''} (${menu.path})`}
                      </option>
                    ))}
                </select>
                <small style={{ color: '#666', display: 'block', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                  Depth: {formData.depth} (부모 선택 시 자동 계산)
                </small>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  순서 <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <small style={{ color: '#666', display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  메뉴 표시 순서입니다. 숫자가 작을수록 앞에 표시됩니다. (예: 1, 2, 3)
                </small>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                  required
                  min="1"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '0.25rem' }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  <input
                    type="checkbox"
                    checked={formData.enabled.ko}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      enabled: { ...formData.enabled, ko: e.target.checked }
                    })}
                    style={{ marginRight: '0.5rem', width: '1rem', height: '1rem' }}
                  />
                  한글 메뉴 활성화
                </label>
                <small style={{ color: '#666', display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  한글 사이트에 메뉴를 표시합니다.
                </small>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  <input
                    type="checkbox"
                    checked={formData.enabled.en}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      enabled: { ...formData.enabled, en: e.target.checked }
                    })}
                    style={{ marginRight: '0.5rem', width: '1rem', height: '1rem' }}
                  />
                  영문 메뉴 활성화
                </label>
                <small style={{ color: '#666', display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  영문 사이트에 메뉴를 표시합니다.
                </small>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              취소
            </button>
            <button 
              type="submit"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              {initialMenu?.id ? '수정' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

