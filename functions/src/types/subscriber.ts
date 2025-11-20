import type { FieldValue, Timestamp } from "firebase-admin/firestore";

type FirestoreDateValue = Timestamp | FieldValue | null;

export interface SubscribeRequestPayload {
  name: string;
  company: string;
  email: string;
  phone: string;
  privacyConsent: boolean;
}

export type SubscriptionStatus = "pending" | "subscribed" | "error";

export interface SubscriberRecord extends SubscribeRequestPayload {
  status: SubscriptionStatus;
  phoneNormalized: string;
  emailNormalized: string;
  stibee: {
    listId: string;
    subscriberId?: string | null;
    lastSyncedAt?: FirestoreDateValue;
    lastResult?: {
      code: number;
      message: string;
    } | null;
  };
  consent: {
    agreedAt: FirestoreDateValue;
    source: string;
  };
  createdAt: FirestoreDateValue;
  updatedAt: FirestoreDateValue;
}

