import type { JSX } from "react";
import { PageContent, PageTitle, Typography } from "@wso2/oxygen-ui";

// The portal has no user-configurable settings yet; the page and route stay so
// the user menu and the prototype's Settings screen remain consistent.
export function SettingsPage(): JSX.Element {
  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Settings</PageTitle.Header>
      </PageTitle>
      <Typography variant="body2" color="text.secondary">
        There are no settings to configure yet.
      </Typography>
    </PageContent>
  );
}
