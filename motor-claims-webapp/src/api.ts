import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./generated/motor-claims-api";
import { authorizationHeader, classifyResponse } from "./authz/client";

// Same-origin: nginx strips /api and proxies to motor-claims-api through the
// API gateway. Authorization rules live in src/authz/client.ts, not here.
const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const bearer = await authorizationHeader();
    if (bearer) request.headers.set("Authorization", bearer);
    return request;
  },
  async onResponse({ response }) {
    await classifyResponse(response.status);
    return response;
  },
};

export const motorClaimsApi = createClient<paths>({ baseUrl: "/api" });
motorClaimsApi.use(authMiddleware);
