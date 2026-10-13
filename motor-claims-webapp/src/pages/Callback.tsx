import { useEffect, useRef, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@wso2/oxygen-ui";
import { handleCallback } from "../authz/session";

/** The OIDC redirect target. Processes the response once, then lands on the app root. */
export function CallbackPage(): JSX.Element {
  const navigate = useNavigate();
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void handleCallback()
      .then(() => {
        // The silent renew's hidden iframe also lands here; only the top window navigates on.
        if (window.parent === window) navigate("/", { replace: true });
      })
      .catch((err: unknown) => {
        console.error("sign-in callback failed", err);
        navigate("/signed-out", { replace: true });
      });
  }, [navigate]);
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="body1">Signing you in…</Typography>
    </Box>
  );
}
