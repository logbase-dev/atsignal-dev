import * as functions from "firebase-functions";
import { subscribeNewsletter } from "./handlers/subscribeNewsletter";

export const api = functions.https.onRequest(
  (request, response) => {
    response.json({ message: "API endpoint" });
  }
);

export const subscribeNewsletterApi =
  functions.https.onRequest(subscribeNewsletter);
