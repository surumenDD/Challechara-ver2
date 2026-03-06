import { http, HttpResponse } from "msw";

export const handlers = [
  // 例: ユーザー API
  http.get("/api/user", () => {
    return HttpResponse.json({
      username: "mocked-user",
      email: "mock@example.com",
    });
  }),
];
