import * as functions from "firebase-functions";
import type { Request, Response } from "express";
import {
  createPendingSubscription,
  markSubscriptionFailed,
  markSubscriptionSynced,
  normalizePhone,
  parseSubscribeRequest,
} from "../services/subscriptionStore";
import { syncSubscriber } from "./client";
import { StibeeApiError } from "./types";

/**
 * 뉴스레터 구독 HTTP 엔드포인트.
 *  1. 요청 값을 검증하여 Firestore에 pending 문서를 생성
 *  2. Stibee API 호출 후 성공/실패 결과를 Firestore에 반영
 *  3. 상황에 맞는 HTTP 상태코드와 메시지를 클라이언트에 응답
 */
const subscribeNewsletter = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
    return;
  }

  try {
    // 1) 요청 검증 + Firestore에 pending 상태 문서 작성
    const payload = parseSubscribeRequest(req.body);
    const { ref, id } = await createPendingSubscription(payload);

    try {
      // 2) Stibee API로 구독자 등록 시도
      const result = await syncSubscriber({
        email: payload.email,
        name: payload.name,
        company: payload.company,
        phoneNormalized: normalizePhone(payload.phone),
      });

      const subscriberId =
        (result.data as Record<string, any> | undefined)?.data?.[0]
          ?.subscriberId ?? null;

      // 3) 성공 시 Firestore 상태 갱신
      await markSubscriptionSynced(ref, {
        subscriberId,
        statusCode: result.status,
        message: "OK",
      });

      res.status(201).json({
        id,
        status: "subscribed",
      });
    } catch (error) {
      if (error instanceof StibeeApiError) {
        // 외부 API 오류는 그대로 클라이언트에 전달
        await markSubscriptionFailed(ref, {
          statusCode: error.status,
          message: error.body,
        });
        res.status(502).json({
          error: "STIBEE_SYNC_FAILED",
          statusCode: error.status,
          detail: error.body,
        });
        return;
      }

      await markSubscriptionFailed(ref, {
        statusCode: 500,
        message:
          error instanceof Error ? error.message : "Unknown error",
      });
      res.status(500).json({
        error: "UNEXPECTED_ERROR",
      });
    }
  } catch (error) {
    if (error instanceof functions.https.HttpsError) {
      res.status(400).json({
        error: error.code,
        message: error.message,
      });
      return;
    }

    functions.logger.error("subscribeNewsletter", error);
    res.status(500).json({
      error: "INTERNAL_ERROR",
    });
  }
};

/**
 * Stibee 뉴스레터 구독 API 엔드포인트
 */
export const subscribeNewsletterApi = functions.https.onRequest(
  subscribeNewsletter
);

