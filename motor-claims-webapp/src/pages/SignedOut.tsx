import type { JSX } from "react";
import { Box, Button, Stack, Typography } from "@wso2/oxygen-ui";
import { signIn } from "../authz/session";

export function SignedOutPage(): JSX.Element {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
      <Stack spacing={2} alignItems="center">
        <Typography variant="h4" component="h1">
          You are signed out
        </Typography>
        <Button variant="contained" onClick={() => void signIn()}>
          Sign in
        </Button>
      </Stack>
    </Box>
  );
}
