export const mockEnv = {
  THUNDER_AUTH_CLIENT_ID: "mock-client",
  THUNDER_AUTH_ISSUER: "https://mock-idp.test",
  // No THUNDER_AUTH_JWKS_URL: the platform emits it but src/env.ts does not read it.
  THUNDER_AUTH_SCOPES: "openid profile email group ou claims:read claims:save claims:submit",
  THUNDER_AUTH_RESOURCE: "https://mock-idp.test/resources/mock-project",
};
