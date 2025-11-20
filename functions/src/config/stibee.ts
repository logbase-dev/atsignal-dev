import * as functions from "firebase-functions";

const runtimeConfig = functions.config?.() ?? {};

export interface StibeeConfig {
  apiKey: string;
  listId: string;
  apiBaseUrl: string;
  subscribersCollection: string;
}

export const stibeeConfig: StibeeConfig = {
  apiKey:
    process.env.STIBEE_API_KEY ?? runtimeConfig.stibee?.api_key ?? "",
  listId:
    process.env.STIBEE_LIST_ID ?? runtimeConfig.stibee?.list_id ?? "",
  apiBaseUrl:
    process.env.STIBEE_API_BASE_URL ??
    runtimeConfig.stibee?.api_base_url ??
    "https://api.stibee.com/v2",
  subscribersCollection:
    process.env.SUBSCRIBERS_COLLECTION ?? "subscribers",
};

export const requireStibeeConfig = (): void => {
  if (!stibeeConfig.apiKey) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "STIBEE_API_KEY is not configured."
    );
  }

  if (!stibeeConfig.listId) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "STIBEE_LIST_ID is not configured."
    );
  }
};

