import * as admin from "firebase-admin";

/**
 * Functions 환경에서 Firebase Admin SDK는 싱글턴으로
 * 초기화해야 하므로 중복 호출을 방지한다.
 */
if (admin.apps.length === 0) {
  admin.initializeApp();
}

export { admin };
export const firestore = admin.firestore();

