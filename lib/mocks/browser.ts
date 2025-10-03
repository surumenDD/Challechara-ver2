import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

// Service Worker をブラウザで動かす
export const worker = setupWorker(...handlers);
