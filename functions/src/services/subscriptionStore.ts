import * as functions from "firebase-functions";
import { admin, firestore } from "../firebase";
import { stibeeConfig } from "../config/stibee";
import type {
  SubscribeRequestPayload,
  SubscriberRecord,
  SubscriptionStatus,
} from "../types/subscriber";
type SubscriberDocRef = FirebaseFirestore.DocumentReference;

const EMAIL_REGEX =
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const PHONE_REGEX =
  /^010-?\d{4}-?\d{4}$/;

export const normalizeEmail = (value: string): string =>
  value.trim().toLowerCase();

export const normalizePhone = (value: string): string =>
  value.replace(/[^\d]/g, "");

export const parseSubscribeRequest = (
  body: any
): SubscribeRequestPayload => {
  if (!body || typeof body !== "object") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "요청 본문이 올바르지 않습니다."
    );
  }

  const { name, company, email, phone, privacyConsent } =
    body;

  if (typeof name !== "string" || name.trim().length < 2) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "성함을 정확히 입력해 주세요."
    );
  }

  if (
    typeof company !== "string" ||
    company.trim().length < 2
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "소속/회사명을 정확히 입력해 주세요."
    );
  }

  if (
    typeof email !== "string" ||
    !EMAIL_REGEX.test(email)
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "이메일 형식이 올바르지 않습니다."
    );
  }

  if (
    typeof phone !== "string" ||
    !PHONE_REGEX.test(phone)
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "휴대폰 번호 형식이 올바르지 않습니다."
    );
  }

  if (privacyConsent !== true) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "개인정보 처리방침에 동의해야 합니다."
    );
  }

  return {
    name: name.trim(),
    company: company.trim(),
    email: normalizeEmail(email),
    phone,
    privacyConsent: true,
  };
};

export const createPendingSubscription = async (
  payload: SubscribeRequestPayload
): Promise<{
  id: string;
  ref: SubscriberDocRef;
}> => {
  const docRef = firestore
    .collection(stibeeConfig.subscribersCollection)
    .doc();

  const now = admin.firestore.FieldValue.serverTimestamp();

  await docRef.set({
    ...payload,
    emailNormalized: payload.email,
    phoneNormalized: normalizePhone(payload.phone),
    status: "pending",
    stibee: {
      listId: stibeeConfig.listId,
      subscriberId: null,
      lastSyncedAt: null,
      lastResult: null,
    },
    consent: {
      agreedAt: now as FirebaseFirestore.Timestamp | null,
      source: "website:newsletter",
    },
    createdAt: now,
    updatedAt: now,
  } as SubscriberRecord);

  return { id: docRef.id, ref: docRef };
};

export const updateSubscriptionStatus = async (
  docRef: SubscriberDocRef,
  status: SubscriptionStatus,
  data: Partial<SubscriberRecord>
): Promise<void> => {
  await docRef.update({
    status,
    ...data,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
};

export const markSubscriptionSynced = async (
  docRef: SubscriberDocRef,
  options: {
    subscriberId?: string | null;
    statusCode: number;
    message?: string;
  }
): Promise<void> => {
  await updateSubscriptionStatus(docRef, "subscribed", {
    stibee: {
      listId: stibeeConfig.listId,
      subscriberId: options.subscriberId ?? null,
      lastSyncedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastResult: {
        code: options.statusCode,
        message: options.message ?? "OK",
      },
    },
  } as Partial<SubscriberRecord>);
};

export const markSubscriptionFailed = async (
  docRef: SubscriberDocRef,
  options: {
    statusCode: number;
    message: string;
  }
): Promise<void> => {
  await updateSubscriptionStatus(docRef, "error", {
    stibee: {
      listId: stibeeConfig.listId,
      subscriberId: null,
      lastSyncedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastResult: {
        code: options.statusCode,
        message: options.message,
      },
    },
  } as Partial<SubscriberRecord>);
};

