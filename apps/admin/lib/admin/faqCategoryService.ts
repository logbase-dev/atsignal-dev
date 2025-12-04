'use client';

import { collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, getDocs, getDoc, Timestamp, where, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { FAQCategory, LocalizedField } from './types';

// 타임아웃 헬퍼 함수
function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
    })
  ]);
}

// Timestamp를 Date로 변환하는 헬퍼 함수
function convertTimestamp(value: any): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  return undefined;
}

// LocalizedField 정규화 함수
function normalizeLocalizedField(field?: { ko?: string; en?: string }): LocalizedField {
  if (!field) {
    return { ko: '' };
  }
  return {
    ko: field.ko ?? '',
    ...(field.en ? { en: field.en } : {}),
  };
}

// 카테고리 목록 조회
export async function getFAQCategories(): Promise<FAQCategory[]> {
  if (!db) {
    console.error('Firestore가 초기화되지 않았습니다. Firebase 환경 변수를 확인하세요.');
    return [];
  }

  try {
    const categoriesRef = collection(db, 'faqCategories');
    
    // order 기준으로 정렬
    let q;
    try {
      q = query(categoriesRef, orderBy('order', 'asc'));
    } catch (error) {
      console.warn('orderBy failed, fetching without order:', error);
      q = query(categoriesRef);
    }
    
    const querySnapshot = await withTimeout(getDocs(q), 5000);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data() as Record<string, any>;
      const category: FAQCategory = {
        id: doc.id,
        name: normalizeLocalizedField(data.name),
        description: data.description ? normalizeLocalizedField(data.description) : undefined,
        order: Number(data.order ?? 0),
        enabled: {
          ko: Boolean(data.enabled?.ko ?? true),
          en: Boolean(data.enabled?.en ?? true),
        },
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      };
      return category;
    });
  } catch (error: any) {
    console.error('Error fetching FAQ categories:', error);
    
    if (error.message?.includes('timed out')) {
      console.error('Firestore 쿼리 타임아웃 - Firebase 환경 변수 또는 네트워크 연결을 확인하세요.');
    }
    
    return [];
  }
}

// 카테고리 단건 조회
export async function getFAQCategoryById(id: string): Promise<FAQCategory | null> {
  if (!db) {
    console.error('Firestore가 초기화되지 않았습니다.');
    return null;
  }

  try {
    const categoryRef = doc(db, 'faqCategories', id);
    const categorySnap = await withTimeout(getDoc(categoryRef), 5000);
    
    if (!categorySnap.exists()) {
      return null;
    }
    
    const data = categorySnap.data() as Record<string, any>;
    const category: FAQCategory = {
      id: categorySnap.id,
      name: normalizeLocalizedField(data.name),
      description: data.description ? normalizeLocalizedField(data.description) : undefined,
      order: Number(data.order ?? 0),
      enabled: {
        ko: Boolean(data.enabled?.ko ?? true),
        en: Boolean(data.enabled?.en ?? true),
      },
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
    };
    return category;
  } catch (error) {
    console.error('Error fetching FAQ category:', error);
    return null;
  }
}

// 카테고리 생성
export async function createFAQCategory(category: Omit<FAQCategory, 'id'>): Promise<string> {
  if (!db) {
    throw new Error('Firestore가 초기화되지 않았습니다.');
  }

  const categoriesRef = collection(db, 'faqCategories');
  const docRef = await withTimeout(addDoc(categoriesRef, {
    ...category,
    createdAt: new Date(),
    updatedAt: new Date(),
  }), 5000);
  return docRef.id;
}

// 카테고리 수정 (순서 재조정 포함)
export async function updateFAQCategory(id: string, category: Partial<FAQCategory>): Promise<void> {
  if (!db) {
    throw new Error('Firestore가 초기화되지 않았습니다.');
  }

  const categoryRef = doc(db, 'faqCategories', id);
  
  // 순서가 변경되는 경우 다른 카테고리들의 순서도 재조정
  if (category.order !== undefined) {
    // 현재 카테고리 정보 가져오기
    const currentCategorySnap = await getDoc(categoryRef);
    if (!currentCategorySnap.exists()) {
      throw new Error('카테고리를 찾을 수 없습니다.');
    }
    
    const currentData = currentCategorySnap.data();
    const oldOrder = currentData.order;
    const newOrder = category.order;
    
    // 순서가 실제로 변경된 경우에만 재조정
    if (oldOrder !== newOrder) {
      // 모든 카테고리 가져오기
      const allCategoriesRef = collection(db, 'faqCategories');
      const allCategoriesSnap = await getDocs(allCategoriesRef);
      
      const batch = writeBatch(db);
      
      if (newOrder > oldOrder) {
        // 순서가 증가한 경우 (4 → 8): 5~8번이 4~7번으로 당겨짐
        allCategoriesSnap.docs.forEach((docSnap) => {
          if (docSnap.id === id) return; // 현재 수정 중인 카테고리는 제외
          
          const data = docSnap.data();
          const order = data.order;
          
          if (order > oldOrder && order <= newOrder) {
            // oldOrder < order <= newOrder 범위의 카테고리들을 1씩 감소
            batch.update(docSnap.ref, { order: order - 1 });
          }
        });
      } else {
        // 순서가 감소한 경우 (8 → 4): 4~7번이 5~8번으로 밀려남
        allCategoriesSnap.docs.forEach((docSnap) => {
          if (docSnap.id === id) return; // 현재 수정 중인 카테고리는 제외
          
          const data = docSnap.data();
          const order = data.order;
          
          if (order >= newOrder && order < oldOrder) {
            // newOrder <= order < oldOrder 범위의 카테고리들을 1씩 증가
            batch.update(docSnap.ref, { order: order + 1 });
          }
        });
      }
      
      // 배치 업데이트 실행
      await batch.commit();
    }
  }
  
  // 카테고리 정보 업데이트
  await withTimeout(updateDoc(categoryRef, {
    ...category,
    updatedAt: new Date(),
  }), 5000);
}

// 카테고리 삭제
export async function deleteFAQCategory(id: string): Promise<void> {
  if (!db) {
    throw new Error('Firestore가 초기화되지 않았습니다.');
  }

  const categoryRef = doc(db, 'faqCategories', id);
  await withTimeout(deleteDoc(categoryRef), 5000);
}

// 카테고리 사용 여부 확인 (FAQ에서 사용 중인지)
export async function isCategoryInUse(categoryId: string): Promise<boolean> {
  if (!db) {
    console.error('Firestore가 초기화되지 않았습니다.');
    return false;
  }

  try {
    const faqsRef = collection(db, 'faqs');
    const q = query(faqsRef, where('categoryId', '==', categoryId));
    const querySnapshot = await withTimeout(getDocs(q), 5000);
    
    return querySnapshot.size > 0;
  } catch (error) {
    console.error('Error checking if category is in use:', error);
    return false;
  }
}

