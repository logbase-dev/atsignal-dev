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
    isExternal?: boolean;
    depth: number;
    parentId: string;
    order: number;
    enabled: { ko: boolean; en: boolean };
    description?: { ko: string; en?: string };
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
    descriptionKo: '',
    descriptionEn: '',
    path: '',
    isExternal: false,
    depth: 1,
    parentId: '0', // 최상위 메뉴는 "0"
    order: 1,
    enabled: {
      ko: true,
      en: false,
    },
  });
  const [pathError, setPathError] = useState<string>('');
  const [pathManuallyEdited, setPathManuallyEdited] = useState(false);

  // 부모 메뉴를 계층 구조로 정렬
  const sortedParentMenus = useMemo(() => {
    const validMenus = parentMenus.filter((menu): menu is Menu & { id: string } => Boolean(menu.id));
    const tree = buildMenuTree(validMenus);
    return flattenMenuTree(tree);
  }, [parentMenus]);

  useEffect(() => {
    // 모달이 열릴 때 수동 수정 플래그 및 경고 초기화
    setPathManuallyEdited(false);
    setPathError('');
    
    if (initialMenu) {
      // 수정 모드
      if (initialMenu.id) {
        setFormData({
          labelKo: initialMenu.labels.ko,
          labelEn: initialMenu.labels.en || '',
          descriptionKo: initialMenu.description?.ko || '',
          descriptionEn: initialMenu.description?.en || '',
          path: initialMenu.path,
          isExternal: initialMenu.isExternal || false,
          depth: initialMenu.depth,
          parentId: initialMenu.parentId || '0',
          order: initialMenu.order,
          enabled: initialMenu.enabled,
        });
      } else {
        // 하위 메뉴 추가 모드 - 부모 경로 자동 설정
        const parentId = initialMenu.parentId || '0';
        const parent = parentMenus.find(m => m.id === parentId);
        const parentPath = parent?.path || '';
        const initialPath = parentPath ? `${parentPath}/` : '';
        
        const maxOrder = parentMenus.length > 0 
          ? Math.max(...parentMenus.map(m => m.order)) + 1 
          : 1;
        
        setFormData({
          labelKo: '',
          labelEn: '',
          descriptionKo: '',
          descriptionEn: '',
          path: initialPath, // 부모 경로 자동 설정
          isExternal: false,
          depth: initialMenu.depth,
          parentId: parentId,
          order: initialMenu.order || maxOrder,
          enabled: initialMenu.enabled || {
            ko: true,
            en: false,
          },
        });
      }
    } else {
      // 새 메뉴 추가 시 기본값
      const maxOrder = parentMenus.length > 0 
        ? Math.max(...parentMenus.map(m => m.order)) + 1 
        : 1;
      setFormData({
        labelKo: '',
        labelEn: '',
        descriptionKo: '',
        descriptionEn: '',
        path: '', // 최상위 메뉴는 경로 비움
        isExternal: false,
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
    
    // 외부 링크가 아닌 경우에만 경로 검증 및 중복 체크
    if (!formData.isExternal) {
      const finalPath = formData.path.endsWith('/') ? formData.path.slice(0, -1) : formData.path;
      const formatError = validatePath(finalPath);
      const duplicateError = formatError ? '' : checkPathDuplicate(finalPath);
      
      if (formatError || duplicateError) {
        setPathError(formatError || duplicateError);
        alert('경로 형식이 올바르지 않거나 이미 사용 중인 경로입니다. 경로를 확인해주세요.');
        return;
      }
    }
    
    // 외부 링크인 경우 URL 검증
    if (formData.isExternal && formData.path) {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(formData.path) && !formData.path.startsWith('http://') && !formData.path.startsWith('https://')) {
        setPathError('올바른 URL 형식을 입력하세요. (예: https://docs.example.com/admin/test)');
        alert('URL 형식이 올바르지 않습니다. URL을 확인해주세요.');
        return;
      }
    }
    
    try {
      await onSubmit({
        labels: {
          ko: formData.labelKo,
          en: formData.labelEn || undefined, // 빈 문자열이면 undefined
        },
        path: formData.isExternal ? formData.path : (formData.path.endsWith('/') ? formData.path.slice(0, -1) : formData.path),
        isExternal: formData.isExternal,
        depth: formData.depth,
        parentId: formData.parentId || '0',
        order: formData.order,
        enabled: formData.enabled,
        description: (formData.descriptionKo || formData.descriptionEn) ? {
          ko: formData.descriptionKo,
          en: formData.descriptionEn || undefined,
        } : undefined,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save menu:', error);
      alert('저장에 실패했습니다.');
    }
  };

  // 경로 검증 함수
  const validatePath = (path: string, allowTrailingSlash: boolean = false): string => {
    if (!path) return '';
    
    // 한글 감지 (한글 유니코드 범위: \uAC00-\uD7A3)
    const hasKorean = /[\uAC00-\uD7A3]/.test(path);
    if (hasKorean) {
      return '경로에는 한글을 사용할 수 없습니다. 영문, 숫자, 하이픈(-), 언더스코어(_)만 사용하세요.';
    }
    
    // 허용된 문자: 영문 소문자, 숫자, 하이픈, 언더스코어, 슬래시(/)
    const validPattern = /^[a-z0-9\-_\/]+$/;
    if (!validPattern.test(path)) {
      return '경로는 영문 소문자, 숫자, 하이픈(-), 언더스코어(_), 슬래시(/)만 사용할 수 있습니다.';
    }
    
    // 연속된 슬래시 방지
    if (path.includes('//')) {
      return '연속된 슬래시(//)는 사용할 수 없습니다.';
    }
    
    // 시작에 슬래시 방지
    if (path.startsWith('/')) {
      return '경로는 슬래시(/)로 시작할 수 없습니다.';
    }
    
    // 끝에 슬래시 방지 (부모 경로 자동 설정 시는 허용)
    if (!allowTrailingSlash && path.endsWith('/')) {
      return '경로는 슬래시(/)로 끝날 수 없습니다.';
    }
    
    return '';
  };

  // 경로 중복 체크 함수
  const checkPathDuplicate = (path: string): string => {
    if (!path || formData.isExternal) {
      return ''; // 외부 링크는 중복 체크 불필요
    }
    
    // 슬래시 제거하여 정규화
    const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
    if (!normalizedPath) return '';
    
    // 같은 사이트의 기존 메뉴들 중에서 중복 확인
    const existingMenus = parentMenus.filter((menu) => {
      // 현재 수정 중인 메뉴는 제외
      if (initialMenu?.id && menu.id === initialMenu.id) {
        return false;
      }
      // 같은 사이트의 메뉴만 확인
      return menu.site === site && !menu.isExternal;
    });
    
    // 중복 체크
    const duplicate = existingMenus.find((menu) => {
      const existingPath = menu.path.endsWith('/') ? menu.path.slice(0, -1) : menu.path;
      return existingPath === normalizedPath;
    });
    
    if (duplicate) {
      return `이미 사용 중인 경로입니다. (메뉴: ${duplicate.labels.ko}${duplicate.labels.en ? ` / ${duplicate.labels.en}` : ''})`;
    }
    
    return '';
  };

  // 영문 메뉴명을 경로 형식으로 변환하는 함수
  const convertLabelToPath = (label: string): string => {
    if (!label) return '';
    
    // 공백을 하이픈으로 변환
    let path = label.replace(/\s+/g, '-');
    
    // 대문자를 소문자로 변환
    path = path.toLowerCase();
    
    // 영문, 숫자, 하이픈, 언더스코어만 남기고 나머지 제거
    path = path.replace(/[^a-z0-9\-_]/g, '');
    
    // 연속된 하이픈 제거
    path = path.replace(/-+/g, '-');
    
    // 시작/끝의 하이픈 제거
    path = path.replace(/^-+|-+$/g, '');
    
    return path;
  };

  // 영문 메뉴명 입력 핸들러
  const handleLabelEnChange = (value: string) => {
    setFormData({ ...formData, labelEn: value });
    
    // 수정 모드이거나 경로를 수동으로 수정한 경우, 또는 외부 링크인 경우 자동 업데이트 안 함
    if (initialMenu?.id || pathManuallyEdited || formData.isExternal) {
      return;
    }
    
    // 영문 메뉴명을 경로로 변환
    const convertedPath = convertLabelToPath(value);
    
    if (convertedPath) {
      // 부모 메뉴가 있으면 부모 경로 + "/" + 변환된 경로
      if (formData.parentId && formData.parentId !== '0') {
        const parent = sortedParentMenus.find(m => m.id === formData.parentId);
        const parentPath = parent?.path || '';
        const newPath = parentPath ? `${parentPath}/${convertedPath}` : convertedPath;
        
        // 형식 검증
        const formatError = validatePath(newPath);
        // 중복 체크
        const duplicateError = formatError ? '' : checkPathDuplicate(newPath);
        
        setPathError(formatError || duplicateError);
        setFormData(prev => ({ ...prev, labelEn: value, path: newPath }));
      } else {
        // 최상위 메뉴는 변환된 경로만
        const formatError = validatePath(convertedPath);
        const duplicateError = formatError ? '' : checkPathDuplicate(convertedPath);
        
        setPathError(formatError || duplicateError);
        setFormData(prev => ({ ...prev, labelEn: value, path: convertedPath }));
      }
    } else {
      // 영문 메뉴명이 비어있으면 부모 경로만 유지
      if (formData.parentId && formData.parentId !== '0') {
        const parent = sortedParentMenus.find(m => m.id === formData.parentId);
        const parentPath = parent?.path || '';
        const newPath = parentPath ? `${parentPath}/` : '';
        setFormData(prev => ({ ...prev, labelEn: value, path: newPath }));
      } else {
        setFormData(prev => ({ ...prev, labelEn: value, path: '' }));
      }
      setPathError('');
    }
  };

  // 경로 입력 핸들러 (공백 자동 변환 및 검증)
  const handlePathChange = (value: string) => {
    // 경로를 수동으로 수정했다고 표시
    setPathManuallyEdited(true);
    
    if (formData.isExternal) {
      // 외부 링크인 경우 URL 검증
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (value && !urlPattern.test(value) && !value.startsWith('http://') && !value.startsWith('https://')) {
        setPathError('올바른 URL 형식을 입력하세요. (예: https://docs.example.com/admin/test)');
      } else {
        setPathError('');
      }
      setFormData({ ...formData, path: value });
    } else {
      // 기존 로직 (상대 경로)
      // 공백을 하이픈으로 자동 변환
      let sanitizedPath = value.replace(/\s+/g, '-');
      
      // 대문자를 소문자로 변환
      sanitizedPath = sanitizedPath.toLowerCase();
      
      // 슬래시로 끝나는 경우는 부모 경로 자동 설정이므로 허용
      const allowTrailingSlash = sanitizedPath.endsWith('/');
      
      // 경로 형식 검증
      const formatError = validatePath(sanitizedPath, allowTrailingSlash);
      
      // 중복 체크 (형식 검증 통과 시에만)
      const duplicateError = formatError ? '' : checkPathDuplicate(sanitizedPath);
      
      // 에러 우선순위: 형식 에러 > 중복 에러
      setPathError(formatError || duplicateError);
      
      setFormData({ ...formData, path: sanitizedPath });
    }
  };

  // 부모 선택 시 depth 자동 계산 및 경로 자동 설정
  const handleParentChange = (parentId: string) => {
    if (parentId && parentId !== '0') {
      const parent = sortedParentMenus.find(m => m.id === parentId);
      if (parent) {
        const parentPath = parent.path || '';
        const initialPath = parentPath ? `${parentPath}/` : '';
        
        // 부모 경로 설정 시 검증 (슬래시로 끝나는 것은 허용)
        const error = initialPath ? validatePath(initialPath, true) : '';
        setPathError(error);
        
        setFormData({
          ...formData,
          parentId,
          depth: parent.depth + 1,
          path: initialPath, // 부모 경로 자동 설정
        });
      }
    } else {
      setFormData({
        ...formData,
        parentId: '0', // 최상위 메뉴는 "0"
        depth: 1,
        path: '', // 최상위 메뉴는 경로 비움
      });
      setPathError('');
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
        maxWidth: '1000px',
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
                  onChange={(e) => handleLabelEnChange(e.target.value)}
                  placeholder="영어 (예: Products)"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '0.25rem' }}
                />
                <small style={{ color: '#666', display: 'block', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                  영문 메뉴명 입력 시 경로가 자동으로 생성됩니다.
                </small>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  한글 설명
                </label>
                <small style={{ color: '#666', display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  선택사항입니다. 메뉴에 대한 설명을 입력하세요.
                </small>
                <textarea
                  value={formData.descriptionKo}
                  onChange={(e) => setFormData({ ...formData, descriptionKo: e.target.value })}
                  placeholder="한국어 설명 (예: 다양한 디지털 채널에서 발생하는 사용자 행동 로그를 안정적으로 수집하고 표준화하는 데이터 수집 모듈)"
                  rows={3}
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem', 
                    border: '1px solid #ddd', 
                    borderRadius: '0.25rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  영문 설명
                </label>
                <small style={{ color: '#666', display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  선택사항입니다.
                </small>
                <textarea
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  placeholder="English description"
                  rows={3}
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem', 
                    border: '1px solid #ddd', 
                    borderRadius: '0.25rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontWeight: 'bold' }}>
                경로 <span style={{ color: '#dc3545' }}>*</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isExternal}
                  onChange={(e) => {
                    setFormData({ ...formData, isExternal: e.target.checked, path: '' });
                    setPathError('');
                  }}
                  style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.9rem' }}>외부 링크</span>
              </label>
            </div>
            <small style={{ color: '#666', display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              {formData.isExternal 
                ? '외부 URL을 입력하세요. (예: https://docs.atsignal.io/ko/admin)' 
                : 'URL 경로입니다. 영문 소문자, 숫자, 하이픈(-), 언더스코어(_)만 사용하세요. 공백은 자동으로 하이픈으로 변환됩니다. (예: product 또는 product/log-collecting)'}
            </small>
            <input
              type="text"
              value={formData.path}
              onChange={(e) => handlePathChange(e.target.value)}
              required
              placeholder={formData.isExternal ? '예: https://docs.atsignal.io/ko/admin' : '예: product/log-collecting'}
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                border: `1px solid ${pathError ? '#dc3545' : '#ddd'}`, 
                borderRadius: '0.25rem' 
              }}
            />
            {pathError && (
              <small style={{ color: '#dc3545', display: 'block', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                {pathError}
              </small>
            )}
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
              disabled={!!pathError}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: pathError ? '#ccc' : '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: pathError ? 'not-allowed' : 'pointer',
                opacity: pathError ? 0.6 : 1
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

