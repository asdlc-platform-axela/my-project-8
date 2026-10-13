import { useCallback, useEffect, useState, type JSX } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Alert,
  AlertTitle,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  ListingTable,
  PageContent,
  PageTitle,
  Stack,
  Typography,
} from "@wso2/oxygen-ui";
import { CircleCheck, FileText } from "@wso2/oxygen-ui-icons-react";
import { motorClaimsApi } from "../api";
import { Can } from "../authz/gates";
import type { components } from "../generated/motor-claims-api";
import { formatDateTime } from "./format";

type ClaimSummary = components["schemas"]["ClaimSummary"];

const PAGE_SIZE = 100;

/** Every claim of one status, following the list's paging. */
async function loadAll(status: ClaimSummary["status"]): Promise<ClaimSummary[]> {
  const items: ClaimSummary[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data } = await motorClaimsApi.GET("/me/claims", {
      params: { query: { status, limit: PAGE_SIZE, offset } },
    });
    if (!data) throw new Error("claims list failed");
    items.push(...data.data);
    if (data.data.length === 0 || items.length >= data.count) return items;
  }
}

function StatTile(props: { label: string; value: number; hint: string; icon: JSX.Element; color: "warning" | "success" }): JSX.Element {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ color: `${props.color}.main` }}>
          {props.icon}
          <Typography variant="overline">{props.label}</Typography>
        </Stack>
        <Typography variant="h4">{props.value}</Typography>
        <Typography variant="caption" color="text.secondary">
          {props.hint}
        </Typography>
      </CardContent>
    </Card>
  );
}

function SectionHeader(props: { title: string; count: number; subtitle: string }): JSX.Element {
  return (
    <Stack spacing={0.5}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="h6" component="h2">
          {props.title}
        </Typography>
        <Chip size="small" label={props.count} />
      </Stack>
      <Typography variant="body2" color="text.secondary">
        {props.subtitle}
      </Typography>
    </Stack>
  );
}

export function DashboardPage(): JSX.Element {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<ClaimSummary[]>([]);
  const [submitted, setSubmitted] = useState<ClaimSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    Promise.all([loadAll("draft"), loadAll("submitted")])
      .then(([d, s]) => {
        if (cancelled) return;
        setDrafts(d.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
        setSubmitted(s.slice().sort((a, b) => (b.submittedAt ?? "").localeCompare(a.submittedAt ?? "")));
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => load(), [load]);

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>My Claims</PageTitle.Header>
        <PageTitle.Actions>
          <Can op="POST /me/claims">
            <Button variant="contained" component={RouterLink} to="/claim-form">
              New Claim
            </Button>
          </Can>
        </PageTitle.Actions>
      </PageTitle>

      {loading && <CircularProgress aria-label="Loading claims" />}

      {!loading && failed && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={load}>
              Try again
            </Button>
          }
        >
          <AlertTitle>Claims list unavailable</AlertTitle>
          We couldn't load your claims.
        </Alert>
      )}

      {!loading && !failed && (
        <Stack spacing={3}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <StatTile label="Drafts" value={drafts.length} hint="unfinished claims" icon={<FileText size={18} />} color="warning" />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <StatTile label="Submitted" value={submitted.length} hint="sent to the insurer" icon={<CircleCheck size={18} />} color="success" />
            </Grid>
          </Grid>

          <Stack spacing={1}>
            <SectionHeader title="Drafts" count={drafts.length} subtitle="Pick up where you left off." />
            <ListingTable.Container>
              <ListingTable aria-label="Draft claims">
                <ListingTable.Head>
                  <ListingTable.Row>
                    <ListingTable.Cell>Policy No</ListingTable.Cell>
                    <ListingTable.Cell>Vehicle Reg</ListingTable.Cell>
                    <ListingTable.Cell>Last updated</ListingTable.Cell>
                  </ListingTable.Row>
                </ListingTable.Head>
                <ListingTable.Body>
                  {drafts.length === 0 ? (
                    <ListingTable.Row>
                      <ListingTable.Cell colSpan={3}>
                        <ListingTable.EmptyState title="No drafts" description="Claims you save without submitting appear here." />
                      </ListingTable.Cell>
                    </ListingTable.Row>
                  ) : (
                    drafts.map((c) => (
                      <ListingTable.Row key={c.id} clickable hover onClick={() => navigate(`/claim-form/${c.id}`)}>
                        <ListingTable.Cell>{c.policyNumber || "(not set)"}</ListingTable.Cell>
                        <ListingTable.Cell>{c.vehicleRegNumber || "(not set)"}</ListingTable.Cell>
                        <ListingTable.Cell>{formatDateTime(c.updatedAt)}</ListingTable.Cell>
                      </ListingTable.Row>
                    ))
                  )}
                </ListingTable.Body>
              </ListingTable>
            </ListingTable.Container>
          </Stack>

          <Stack spacing={1}>
            <SectionHeader title="Submitted" count={submitted.length} subtitle="Newest first." />
            <ListingTable.Container>
              <ListingTable aria-label="Submitted claims">
                <ListingTable.Head>
                  <ListingTable.Row>
                    <ListingTable.Cell>Policy No</ListingTable.Cell>
                    <ListingTable.Cell>Vehicle Reg</ListingTable.Cell>
                    <ListingTable.Cell>Submitted</ListingTable.Cell>
                    <ListingTable.Cell>Claim No</ListingTable.Cell>
                  </ListingTable.Row>
                </ListingTable.Head>
                <ListingTable.Body>
                  {submitted.length === 0 ? (
                    <ListingTable.Row>
                      <ListingTable.Cell colSpan={4}>
                        <ListingTable.EmptyState title="Nothing submitted yet" description="Claims you submit appear here." />
                      </ListingTable.Cell>
                    </ListingTable.Row>
                  ) : (
                    submitted.map((c) => (
                      <ListingTable.Row key={c.id} clickable hover onClick={() => navigate(`/claim-detail/${c.id}`)}>
                        <ListingTable.Cell>{c.policyNumber}</ListingTable.Cell>
                        <ListingTable.Cell>{c.vehicleRegNumber}</ListingTable.Cell>
                        <ListingTable.Cell>{formatDateTime(c.submittedAt)}</ListingTable.Cell>
                        <ListingTable.Cell>{c.claimNumber ?? ""}</ListingTable.Cell>
                      </ListingTable.Row>
                    ))
                  )}
                </ListingTable.Body>
              </ListingTable>
            </ListingTable.Container>
          </Stack>
        </Stack>
      )}
    </PageContent>
  );
}
