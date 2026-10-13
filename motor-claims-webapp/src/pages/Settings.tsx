import { useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  FormControlLabel,
  PageContent,
  PageTitle,
  Stack,
  Switch,
} from "@wso2/oxygen-ui";

// Contract gap: motor-claims-api has no preferences operation, so this setting
// is held in the page only and is not persisted.
export function SettingsPage(): JSX.Element {
  const navigate = useNavigate();
  const [confirmations, setConfirmations] = useState(true);
  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Settings</PageTitle.Header>
      </PageTitle>
      <Card variant="outlined">
        <CardContent>
          <Stack
            component="form"
            spacing={2}
            onSubmit={(e) => {
              e.preventDefault();
              navigate("/dashboard");
            }}
          >
            <FormControlLabel
              control={<Switch checked={confirmations} onChange={(e) => setConfirmations(e.target.checked)} />}
              label="Email me a confirmation when I submit a claim"
            />
            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button type="submit" variant="contained">
                Save settings
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </PageContent>
  );
}
