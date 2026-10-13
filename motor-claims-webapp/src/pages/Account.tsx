import type { JSX } from "react";
import { Card, CardContent, CardHeader, Grid, PageContent, PageTitle, Typography } from "@wso2/oxygen-ui";
import { useProfile } from "../shell/useProfile";

export function AccountPage(): JSX.Element {
  const profile = useProfile();
  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Account</PageTitle.Header>
      </PageTitle>
      <Card variant="outlined">
        <CardHeader title="Your details" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="overline">Name</Typography>
              <Typography variant="body2">{profile.name}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="overline">Email</Typography>
              <Typography variant="body2">{profile.email}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </PageContent>
  );
}
