import { useEffect, useState, type JSX } from "react";
import { Link as RouterLink, Navigate, useParams } from "react-router-dom";
import {
  Alert,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Grid,
  PageContent,
  PageTitle,
  Stack,
  Typography,
} from "@wso2/oxygen-ui";
import { motorClaimsApi } from "../api";
import type { components } from "../generated/motor-claims-api";
import { formatDate, formatDateTime } from "./format";

type Claim = components["schemas"]["Claim"];
type Field = { label: string; value: string | number | boolean | null | undefined };

const USAGE: Record<string, string> = {
  private: "Private",
  hire: "Hire",
  "self-drive": "Self-drive rental",
  tuition: "Driving tuition",
  other: "Other",
};
const ATTACHMENT_TYPE: Record<"driving-licence" | "bank-page", string> = { "driving-licence": "Driving licence", "bank-page": "Bank page" };

const yesNo = (v: boolean | undefined) => (v === undefined ? "" : v ? "Yes" : "No");

function DetailCard({ title, fields }: { title: string; fields: Field[] }): JSX.Element {
  return (
    <Card variant="outlined">
      <CardHeader title={title} />
      <CardContent>
        <Grid container spacing={2}>
          {fields.map((f) => (
            <Grid key={f.label} size={{ xs: 12, md: 6 }}>
              <Typography variant="overline" color="text.secondary" component="div">
                {f.label}
              </Typography>
              <Typography variant="body2">{f.value === null || f.value === undefined || f.value === "" ? "—" : String(f.value)}</Typography>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

function BackToDashboard(): JSX.Element {
  return (
    <Button variant="outlined" component={RouterLink} to="/dashboard" sx={{ alignSelf: "flex-start" }}>
      Back to My Claims
    </Button>
  );
}

export function ClaimDetailPage(): JSX.Element {
  const { claimId } = useParams();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!claimId) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setFailed(false);
    setClaim(null);
    motorClaimsApi
      .GET("/me/claims/{claimId}", { params: { path: { claimId } } })
      .then(({ data, response }) => {
        if (cancelled) return;
        if (data) setClaim(data);
        else if (response.status === 404) setNotFound(true);
        else setFailed(true);
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
  }, [claimId]);

  if (loading || !claim) {
    return (
      <PageContent>
        <PageTitle>
          <PageTitle.Header>Claim Detail</PageTitle.Header>
        </PageTitle>
        <Stack spacing={2}>
          {loading && <CircularProgress aria-label="Loading claim" />}
          {notFound && (
            <Alert severity="warning">
              <AlertTitle>Claim not found</AlertTitle>
              This claim does not exist or is not yours.
            </Alert>
          )}
          {failed && (
            <Alert severity="error">
              <AlertTitle>Claim unavailable</AlertTitle>
              We couldn't load this claim. Go back and try again.
            </Alert>
          )}
          <BackToDashboard />
        </Stack>
      </PageContent>
    );
  }

  // A draft is finished in the claim form, never shown read-only here.
  if (claim.status === "draft") return <Navigate to={`/claim-form/${claim.id}`} replace />;

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>{`Claim ${claim.claimNumber ?? claim.policyNumber}`}</PageTitle.Header>
        <PageTitle.Actions>
          <Chip size="small" color="success" label="Submitted" />
        </PageTitle.Actions>
      </PageTitle>
      <Stack spacing={2}>
        <DetailCard
          title="Summary"
          fields={[
            { label: "Policy No", value: claim.policyNumber },
            { label: "Vehicle Reg", value: claim.vehicleRegNumber },
            { label: "Submitted", value: formatDateTime(claim.submittedAt) },
            { label: "Claim No", value: claim.claimNumber },
          ]}
        />
        <DetailCard
          title="Insured"
          fields={[
            { label: "Name", value: claim.insuredName },
            { label: "Address", value: claim.insuredAddress },
            { label: "Phone", value: claim.insuredPhone },
            { label: "Fax", value: claim.insuredFax },
            { label: "Bank", value: claim.bankName },
            { label: "Account No", value: claim.bankAccountNumber },
          ]}
        />
        <DetailCard
          title="Vehicle owner"
          fields={[
            { label: "Name", value: claim.ownerName },
            { label: "Address", value: claim.ownerAddress },
            { label: "Finance institution", value: claim.financeInstitution },
          ]}
        />
        <DetailCard
          title="Driver"
          fields={[
            { label: "Name", value: claim.driverName },
            { label: "Age", value: claim.driverAge },
            { label: "Relationship", value: claim.driverRelationship },
            { label: "Licence No", value: claim.driverLicenceNumber },
          ]}
        />
        <DetailCard
          title="Accident"
          fields={[
            { label: "Date", value: formatDate(claim.accidentDate) },
            { label: "Time", value: claim.accidentTime },
            { label: "Location", value: claim.accidentLocation },
            { label: "Police station", value: claim.policeStation },
            { label: "What happened", value: claim.accidentDescription },
            { label: "Vehicle usage", value: claim.usage ? USAGE[claim.usage] : "" },
          ]}
        />
        <DetailCard
          title="Damage and injuries"
          fields={[
            { label: "Goods damaged", value: yesNo(claim.goodsDamaged) },
            { label: "Goods description", value: claim.goodsDescription },
            { label: "Goods value", value: claim.goodsValue },
            { label: "Passenger injured", value: yesNo(claim.passengerInjured) },
            { label: "Injured passenger details", value: claim.injuredPassengerDetails },
            { label: "Third party injured", value: yesNo(claim.thirdPartyInjured) },
            { label: "Third party injury details", value: claim.thirdPartyInjuryDetails },
            { label: "Third party property damaged", value: yesNo(claim.thirdPartyPropertyDamaged) },
            { label: "Third party property details", value: claim.thirdPartyPropertyDetails },
            { label: "Other insurance", value: yesNo(claim.otherInsurance) },
            { label: "Other insurance details", value: claim.otherInsuranceDetails },
          ]}
        />
        <DetailCard
          title="Documents and declaration"
          fields={[
            ...(claim.attachments ?? []).map((a) => ({ label: ATTACHMENT_TYPE[a.type], value: a.fileName })),
            { label: "Declaration confirmed", value: yesNo(claim.declarationAccepted) },
          ]}
        />
        <BackToDashboard />
      </Stack>
    </PageContent>
  );
}
