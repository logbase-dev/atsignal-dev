import * as functions from "firebase-functions";
import { subscribeNewsletterApi } from "../stibee";

/**
 * 통합 API 라우터
 * 모든 API 엔드포인트를 여기서 라우팅합니다.
 */
export const api = functions.https.onRequest((request, response) => {
  // 경로에 따라 적절한 핸들러로 라우팅
  const path = request.path;

  if (path.startsWith("/stibee/subscribe")) {
    // Stibee 구독 API는 별도 함수로 분리되어 있음
    // subscribeNewsletterApi 함수를 직접 호출
    return subscribeNewsletterApi(request, response);
  }

  // 기본 응답
  response.json({
    message: "API endpoint",
    availableEndpoints: ["/stibee/subscribe"],
  });
});
