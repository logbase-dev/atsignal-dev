import { stibeeConfig, requireStibeeConfig } from "../config/stibee";
import type {
  StibeeSyncResult,
  InternalSubscriberPayload,
} from "./types";
import { StibeeApiError } from "./types";

/**
 * Stibee 구독자 API에 단일 구독자를 추가한다.
 * - 구성된 payload는 `subscribers` 배열로 감싸 전송.
 * - 성공/실패 여부를 StibeeSyncResult 또는 StibeeApiError로 구분한다.
 */
export const syncSubscriber = async (
  payload: InternalSubscriberPayload
): Promise<StibeeSyncResult> => {
  requireStibeeConfig();

  const url = `${stibeeConfig.apiBaseUrl}/lists/${stibeeConfig.listId}/subscribers`;

  const requestBody = {
    subscribers: [
      {
        email: payload.email,
        name: payload.name,
        memo: payload.company,
        mobile: payload.phoneNormalized,
        fields: [
          {
            label: "company",
            value: payload.company,
          },
          {
            label: "phone",
            value: payload.phoneNormalized,
          },
        ],
      },
    ],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      AccessToken: stibeeConfig.apiKey,
    },
    body: JSON.stringify(requestBody),
  });

  const rawBody = await response.text();
  let parsedBody: unknown;

  try {
    parsedBody = rawBody ? JSON.parse(rawBody) : undefined;
  } catch {
    parsedBody = undefined;
  }

  if (!response.ok) {
    throw new StibeeApiError(response.status, rawBody);
  }

  return {
    status: response.status,
    data: parsedBody,
    rawBody,
  };
};

