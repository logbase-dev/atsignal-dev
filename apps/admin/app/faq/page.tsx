'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getFAQs, deleteFAQ, getAllTags } from '@/lib/admin/faqService';
import { getFAQCategories } from '@/lib/admin/faqCategoryService';
import { FAQCategoryModal } from '@/components/faq/FAQCategoryModal';
import type { FAQ, FAQCategory } from '@/lib/admin/types';
import { markdownToHtml } from '@/lib/utils/markdown';

export default function FAQPage() {
  const router = useRouter();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [searchInput, setSearchInput] = useState(''); // 입력값
  const [searchQuery, setSearchQuery] = useState(''); // 실제 검색에 사용할 값
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [hoveredFAQId, setHoveredFAQId] = useState<string | null>(null); // 추가
  // searchTimeoutRef 제거

  useEffect(() => {
    loadCategories();
    loadAllTags();
  }, []);

  // debounce useEffect 제거

  // 실제 검색 실행 (searchQuery가 변경될 때)
  useEffect(() => {
    loadFAQs();
    loadAllTags();
  }, [selectedCategoryId, searchQuery, selectedTags]);

  const loadCategories = async () => {
    try {
      const data = await getFAQCategories();
      setCategories(data);
    } catch (error: any) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadAllTags = async () => {
    try {
      const tags = await getAllTags();
      setAllTags(tags);
    } catch (error: any) {
      console.error('Failed to load tags:', error);
    }
  };

  const loadFAQs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFAQs({
        categoryId: selectedCategoryId === '__no_category__' ? '__no_category__' : (selectedCategoryId || undefined),
        search: searchQuery || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });
      setFaqs(data);
    } catch (error: any) {
      console.error('Failed to load FAQs:', error);
      setError(error.message || 'FAQ를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }
    try {
      await deleteFAQ(id);
      await loadFAQs();
      await loadAllTags(); // 추가: 태그 목록도 새로고침
    } catch (error) {
      console.error('Failed to delete FAQ:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleEdit = (faq: FAQ) => {
    if (faq.id) {
      router.push(`/faq/${faq.id}`);
    }
  };

  const handleCreate = () => {
    router.push('/faq/new');
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const clearTagFilter = () => {
    setSelectedTags([]);
  };

  // 검색 실행 함수 추가
  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  // 검색 초기화 함수 추가
  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
  };

  // 엔터 키 핸들러 추가
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  if (loading && faqs.length === 0) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1500px' }}>
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1500px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>FAQ 관리</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setShowCategoryModal(true)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#8b5cf6', // 회색(#6c757d)에서 보라색으로 변경
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
            }}
          >
            카테고리 관리
          </button>
          <button
            onClick={handleCreate}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
            }}
          >
            FAQ 추가
          </button>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>카테고리 필터</label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '0.25rem',
              }}
            >
              <option value="">전체</option>
              <option value="__no_category__">미분류</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name.ko}
                  {category.name.en && ` / ${category.name.en}`}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 2 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>검색</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="질문 또는 답변 내용 검색..."
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '0.25rem',
                }}
              />
              <button
                onClick={handleSearch}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#0070f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                검색
              </button>
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  초기화
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 해시태그 필터 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 'bold' }}>해시태그 필터</label>
            {selectedTags.length > 0 && (
              <button
                onClick={clearTagFilter}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  color: '#666',
                }}
              >
                필터 초기화
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.25rem', border: '1px solid #e5e7eb' }}>
            {allTags.length === 0 ? (
              <span style={{ color: '#666', fontSize: '0.875rem' }}>등록된 해시태그가 없습니다.</span>
            ) : (
              allTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: isSelected ? '#3b82f6' : '#fff',
                      color: isSelected ? '#fff' : '#374151',
                      border: `1px solid ${isSelected ? '#3b82f6' : '#d1d5db'}`,
                      borderRadius: '999px',
                      fontSize: '0.875rem',
                      fontWeight: isSelected ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    #{tag}
                  </button>
                );
              })
            )}
          </div>
          {selectedTags.length > 0 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
              선택된 태그: {selectedTags.map((tag) => `#${tag}`).join(', ')}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '0.25rem',
            marginBottom: '1rem',
            color: '#856404',
          }}
        >
          <strong>경고:</strong> {error}
        </div>
      )}

      {faqs.length === 0 && !loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
          <p>
            {searchQuery
              ? '검색된 글이 없습니다.'
              : 'FAQ가 없습니다. 위의 "FAQ 추가" 버튼으로 새 FAQ를 생성하세요.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq) => {
            const category = categories.find((c) => c.id === faq.categoryId);
            return (
              <div
                key={faq.id}
                style={{
                  padding: '1.5rem',
                  backgroundColor: '#fff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '0.5rem',
                  boxShadow: faq.isTop ? '0 0 0 2px #ffc107' : 'none',
                }}
              >
                {/* 질문과 답변 영역 */}
                <div 
                  style={{ marginBottom: '1rem' }}
                  onMouseEnter={() => setHoveredFAQId(faq.id || null)}
                  onMouseLeave={() => setHoveredFAQId(null)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {faq.isTop && (
                      <span
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#ffc107',
                          color: '#000',
                          borderRadius: '0.25rem',
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                        }}
                      >
                        ⭐ 맨 상위
                      </span>
                    )}
                    {/* 화살표 아이콘 */}
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '24px',
                        height: '24px',
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        transition: 'transform 0.2s ease',
                        transform: hoveredFAQId === faq.id ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    >
                      ▼
                    </span>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, cursor: 'pointer', flex: 1 }}>
                      {faq.question.ko}
                      {faq.question.en && (
                        <span style={{ color: '#666', marginLeft: '0.5rem', fontSize: '1rem', fontWeight: 'normal' }}>
                          / {faq.question.en}
                        </span>
                      )}
                    </h3>
                  </div>
                  {/* 답변 영역 - 기본적으로 숨김, 질문 hover 시 표시 */}
                  <div
                    data-answer
                    style={{
                      display: hoveredFAQId === faq.id ? 'block' : 'none',
                      marginTop: '0.75rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid #e5e5e5',
                      color: '#666',
                      lineHeight: '1.6',
                      transition: 'opacity 0.2s ease',
                      opacity: hoveredFAQId === faq.id ? 1 : 0,
                    }}
                    dangerouslySetInnerHTML={{
                      __html: faq.saveFormat === 'markdown' 
                        ? markdownToHtml(faq.answer.ko || faq.answer.en || '')
                        : (faq.answer.ko || faq.answer.en || ''),
                    }}
                  />
                </div>

                {/* 정보 및 버튼 영역 */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #e5e5e5',
                  }}
                >
                  {/* 좌측: 정보 영역 */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      fontSize: '0.875rem',
                      color: '#666',
                      alignItems: 'center',
                      flex: 1,
                    }}
                  >
                    <span>
                      카테고리: <strong>{category?.name.ko || '미분류'}</strong>
                    </span>
                    <span>
                      Level: <strong>{faq.level}</strong>
                    </span>
                    <span>
                      활성화:{' '}
                      {faq.enabled.ko && <span style={{ color: '#28a745' }}>KO</span>}
                      {faq.enabled.ko && faq.enabled.en && <span style={{ margin: '0 0.25rem' }}>/</span>}
                      {faq.enabled.en && <span style={{ color: '#28a745' }}>EN</span>}
                      {!faq.enabled.ko && !faq.enabled.en && <span style={{ color: '#dc3545' }}>비활성화</span>}
                    </span>
                    {faq.tags && faq.tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', alignItems: 'center' }}>
                        <span style={{ marginRight: '0.25rem' }}>태그:</span>
                        {faq.tags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              backgroundColor: '#3b82f6',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'opacity 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = '0.8';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = '1';
                            }}
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 우측: 버튼 영역 */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button
                      onClick={() => handleEdit(faq)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        fontSize: '0.875rem',
                      }}
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id!)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        fontSize: '0.875rem',
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 카테고리 관리 모달 */}
      <FAQCategoryModal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          loadCategories(); // 카테고리 목록 새로고침
          loadFAQs(); // FAQ 목록 새로고침 (카테고리 변경 반영)
          loadAllTags(); // 추가: 태그 목록도 새로고침
        }}
      />
    </div>
  );
}

