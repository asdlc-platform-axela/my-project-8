import type { JSX } from "react";
import { PageContent, PageTitle, Typography } from "@wso2/oxygen-ui";

/** Shell-only stand-in for a feature screen that a later item builds. */
export function Placeholder({ title, note }: { title: string; note: string }): JSX.Element {
  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>{title}</PageTitle.Header>
      </PageTitle>
      <Typography variant="body2" color="text.secondary">
        {note}
      </Typography>
    </PageContent>
  );
}
