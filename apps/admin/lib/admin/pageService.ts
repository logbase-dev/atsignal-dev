'use client';

import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { LocalizedField, Page, Site } from './types';

function getDb() {
  if (!db) {
    throw new Error('Firestore가 초기화되지 않았습니다. Firebase 환경 변수를 확인하세요.');
  }
  return db;
}

const EMPTY_LOCALIZED: LocalizedField = { ko: '', en: '' };

function normalizeLocalizedField(field?: { ko?: string; en?: string }): LocalizedField {
  if (!field) {
    return { ...EMPTY_LOCALIZED };
  }
  return {
    ko: field.ko ?? '',
    ...(field.en ? { en: field.en } : {}),
  };
}

function normalizeTimestamp(value: any) {
  return value?.toDate?.() || value || undefined;
}

function mapPageData(snapshot: any): Page {
  const data = snapshot.data();
  const labelsLive = normalizeLocalizedField(data.labelsLive ?? data.labels);
  const contentLive = normalizeLocalizedField(data.contentLive ?? data.content);
  const labelsDraft = data.labelsDraft ? normalizeLocalizedField(data.labelsDraft) : undefined;
  const contentDraft = data.contentDraft ? normalizeLocalizedField(data.contentDraft) : undefined;

  return {
    id: snapshot.id,
    site: data.site,
    menuId: data.menuId,
    slug: data.slug,
    labelsLive,
    contentLive,
    labelsDraft,
    contentDraft,
    createdAt: normalizeTimestamp(data.createdAt),
    updatedAt: normalizeTimestamp(data.updatedAt),
    draftUpdatedAt: normalizeTimestamp(data.draftUpdatedAt),
  };
}

export async function getPages(site: Site): Promise<Page[]> {
  const database = getDb();
  const pagesRef = collection(database, 'pages');
  const q = query(pagesRef, where('site', '==', site));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(mapPageData);
}

export async function getPageById(id: string): Promise<Page | null> {
  const database = getDb();
  const pageRef = doc(database, 'pages', id);
  const pageSnap = await getDoc(pageRef);

  if (!pageSnap.exists()) {
    return null;
  }

  return mapPageData(pageSnap);
}

export interface PageDraftPayload {
  menuId: string;
  slug: string;
  labels: LocalizedField;
  content: LocalizedField;
}

export async function savePageDraft(
  site: Site,
  payload: PageDraftPayload,
  pageId?: string,
): Promise<string> {
  const database = getDb();
  const normalizedLabels = normalizeLocalizedField(payload.labels);
  const normalizedContent = normalizeLocalizedField(payload.content);
  const now = new Date();

  if (pageId) {
    const pageRef = doc(database, 'pages', pageId);
    await updateDoc(pageRef, {
      site,
      menuId: payload.menuId,
      slug: payload.slug,
      labelsDraft: normalizedLabels,
      contentDraft: normalizedContent,
      draftUpdatedAt: now,
    });
    return pageId;
  }

  const pagesRef = collection(database, 'pages');
  const docRef = await addDoc(pagesRef, {
    site,
    menuId: payload.menuId,
    slug: payload.slug,
    labelsLive: { ...EMPTY_LOCALIZED },
    contentLive: { ...EMPTY_LOCALIZED },
    labelsDraft: normalizedLabels,
    contentDraft: normalizedContent,
    createdAt: now,
    updatedAt: null,
    draftUpdatedAt: now,
  });
  return docRef.id;
}

export async function publishPage(
  pageId: string,
  payload: PageDraftPayload,
): Promise<void> {
  const database = getDb();
  const pageRef = doc(database, 'pages', pageId);
  const normalizedLabels = normalizeLocalizedField(payload.labels);
  const normalizedContent = normalizeLocalizedField(payload.content);
  const now = new Date();

  await updateDoc(pageRef, {
    menuId: payload.menuId,
    slug: payload.slug,
    labelsLive: normalizedLabels,
    contentLive: normalizedContent,
    labelsDraft: normalizedLabels,
    contentDraft: normalizedContent,
    updatedAt: now,
    draftUpdatedAt: now,
  });
}

export async function deletePage(id: string): Promise<void> {
  const database = getDb();
  const pageRef = doc(database, 'pages', id);
  await deleteDoc(pageRef);
}

