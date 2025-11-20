import * as functions from "firebase-functions";

// API 핸들러
export const api = functions.https.onRequest((request, response) => {
  response.json({ message: "API endpoint" });
});

// CMS 관련 함수들
// TODO: CMS 함수 구현

// Jira 연동 함수들
// TODO: Jira 연동 함수 구현

