import { useEffect, useState, type ChangeEvent, type JSX } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControlLabel,
  Grid,
  MenuItem,
  PageContent,
  PageTitle,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@wso2/oxygen-ui";
import { motorClaimsApi } from "../api";
import { Can } from "../authz/gates";
import type { components } from "../generated/motor-claims-api";

type Claim = components["schemas"]["Claim"];
type DraftInput = components["schemas"]["ClaimDraftInput"];
type AttachmentType = components["schemas"]["Attachment"]["type"];
type Attachment = components["schemas"]["Attachment"];

const USAGE_OPTIONS = [
  { value: "private", label: "Private" },
  { value: "hire", label: "Hire" },
  { value: "self-drive", label: "Self-drive rental" },
  { value: "tuition", label: "Driving tuition" },
  { value: "other", label: "Other" },
] as const;

// Form state: text inputs are strings, yes/no questions are booleans.
interface FormState {
  policyNumber: string;
  vehicleRegNumber: string;
  insuredName: string;
  insuredAddress: string;
  insuredPhone: string;
  insuredFax: string;
  bankName: string;
  bankAccountNumber: string;
  ownerName: string;
  ownerAddress: string;
  financeInstitution: string;
  driverName: string;
  driverAge: string;
  driverRelationship: string;
  driverLicenceNumber: string;
  accidentDate: string;
  accidentTime: string;
  accidentLocation: string;
  policeStation: string;
  accidentDescription: string;
  usage: string;
  goodsDamaged: boolean;
  goodsDescription: string;
  goodsValue: string;
  passengerInjured: boolean;
  injuredPassengerDetails: string;
  thirdPartyInjured: boolean;
  thirdPartyInjuryDetails: string;
  thirdPartyPropertyDamaged: boolean;
  thirdPartyPropertyDetails: string;
  otherInsurance: boolean;
  otherInsuranceDetails: string;
  declarationAccepted: boolean;
}

const BLANK: FormState = {
  policyNumber: "",
  vehicleRegNumber: "",
  insuredName: "",
  insuredAddress: "",
  insuredPhone: "",
  insuredFax: "",
  bankName: "",
  bankAccountNumber: "",
  ownerName: "",
  ownerAddress: "",
  financeInstitution: "",
  driverName: "",
  driverAge: "",
  driverRelationship: "",
  driverLicenceNumber: "",
  accidentDate: "",
  accidentTime: "",
  accidentLocation: "",
  policeStation: "",
  accidentDescription: "",
  usage: "",
  goodsDamaged: false,
  goodsDescription: "",
  goodsValue: "",
  passengerInjured: false,
  injuredPassengerDetails: "",
  thirdPartyInjured: false,
  thirdPartyInjuryDetails: "",
  thirdPartyPropertyDamaged: false,
  thirdPartyPropertyDetails: "",
  otherInsurance: false,
  otherInsuranceDetails: "",
  declarationAccepted: false,
};

function fromClaim(c: Claim): FormState {
  return {
    policyNumber: c.policyNumber,
    vehicleRegNumber: c.vehicleRegNumber,
    insuredName: c.insuredName ?? "",
    insuredAddress: c.insuredAddress ?? "",
    insuredPhone: c.insuredPhone ?? "",
    insuredFax: c.insuredFax ?? "",
    bankName: c.bankName ?? "",
    bankAccountNumber: c.bankAccountNumber ?? "",
    ownerName: c.ownerName ?? "",
    ownerAddress: c.ownerAddress ?? "",
    financeInstitution: c.financeInstitution ?? "",
    driverName: c.driverName ?? "",
    driverAge: c.driverAge === undefined ? "" : String(c.driverAge),
    driverRelationship: c.driverRelationship ?? "",
    driverLicenceNumber: c.driverLicenceNumber ?? "",
    accidentDate: c.accidentDate ?? "",
    accidentTime: c.accidentTime ?? "",
    accidentLocation: c.accidentLocation ?? "",
    policeStation: c.policeStation ?? "",
    accidentDescription: c.accidentDescription ?? "",
    usage: c.usage ?? "",
    goodsDamaged: c.goodsDamaged ?? false,
    goodsDescription: c.goodsDescription ?? "",
    goodsValue: c.goodsValue === undefined ? "" : String(c.goodsValue),
    passengerInjured: c.passengerInjured ?? false,
    injuredPassengerDetails: c.injuredPassengerDetails ?? "",
    thirdPartyInjured: c.thirdPartyInjured ?? false,
    thirdPartyInjuryDetails: c.thirdPartyInjuryDetails ?? "",
    thirdPartyPropertyDamaged: c.thirdPartyPropertyDamaged ?? false,
    thirdPartyPropertyDetails: c.thirdPartyPropertyDetails ?? "",
    otherInsurance: c.otherInsurance ?? false,
    otherInsuranceDetails: c.otherInsuranceDetails ?? "",
    declarationAccepted: c.declarationAccepted ?? false,
  };
}

// The conditional sections: the detail fields are sent only while the flag is true.
function toInput(f: FormState): DraftInput {
  const input: DraftInput = {
    policyNumber: f.policyNumber.trim(),
    vehicleRegNumber: f.vehicleRegNumber.trim(),
    insuredName: f.insuredName,
    insuredAddress: f.insuredAddress,
    insuredPhone: f.insuredPhone,
    insuredFax: f.insuredFax,
    bankName: f.bankName,
    bankAccountNumber: f.bankAccountNumber,
    ownerName: f.ownerName,
    ownerAddress: f.ownerAddress,
    financeInstitution: f.financeInstitution,
    driverName: f.driverName,
    driverRelationship: f.driverRelationship,
    driverLicenceNumber: f.driverLicenceNumber,
    accidentTime: f.accidentTime,
    accidentLocation: f.accidentLocation,
    policeStation: f.policeStation,
    accidentDescription: f.accidentDescription,
    goodsDamaged: f.goodsDamaged,
    passengerInjured: f.passengerInjured,
    thirdPartyInjured: f.thirdPartyInjured,
    thirdPartyPropertyDamaged: f.thirdPartyPropertyDamaged,
    otherInsurance: f.otherInsurance,
    declarationAccepted: f.declarationAccepted,
  };
  if (f.driverAge.trim() !== "") input.driverAge = Number(f.driverAge);
  if (f.accidentDate) input.accidentDate = f.accidentDate;
  if (f.usage) input.usage = f.usage as DraftInput["usage"];
  if (f.goodsDamaged) {
    input.goodsDescription = f.goodsDescription;
    if (f.goodsValue.trim() !== "") input.goodsValue = Number(f.goodsValue);
  }
  if (f.passengerInjured) input.injuredPassengerDetails = f.injuredPassengerDetails;
  if (f.thirdPartyInjured) input.thirdPartyInjuryDetails = f.thirdPartyInjuryDetails;
  if (f.thirdPartyPropertyDamaged) input.thirdPartyPropertyDetails = f.thirdPartyPropertyDetails;
  if (f.otherInsurance) input.otherInsuranceDetails = f.otherInsuranceDetails;
  return input;
}

type AttachmentErrorKey = "drivingLicenceAttachment" | "bankPageAttachment";
type Errors = Partial<Record<keyof FormState | AttachmentErrorKey, string>>;

const ATTACHMENT_ERROR_KEY: Record<AttachmentType, AttachmentErrorKey> = {
  "driving-licence": "drivingLicenceAttachment",
  "bank-page": "bankPageAttachment",
};

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const REQUIRED_MSG = "This field is required";

// Rules shared by Save draft (identity of the claim only) and Submit (everything).
function validate(f: FormState, forSubmit: boolean, attached: Attachment[] = []): Errors {
  const e: Errors = {};
  if (!f.policyNumber.trim()) e.policyNumber = REQUIRED_MSG;
  if (!f.vehicleRegNumber.trim()) e.vehicleRegNumber = REQUIRED_MSG;
  if (f.driverAge.trim() !== "" && !/^\d{1,3}$/.test(f.driverAge.trim())) {
    e.driverAge = "Enter the age in whole years";
  }
  if (f.goodsValue.trim() !== "" && !(Number(f.goodsValue) >= 0)) {
    e.goodsValue = "Enter a value of zero or more";
  }
  if (forSubmit) {
    if (!attached.some((a) => a.type === "driving-licence")) {
      e.drivingLicenceAttachment = "Attach a copy of the driving licence before submitting";
    }
    if (!attached.some((a) => a.type === "bank-page")) {
      e.bankPageAttachment = "Attach a certified copy of the bank page before submitting";
    }
    if (f.goodsDamaged && !f.goodsDescription.trim()) e.goodsDescription = REQUIRED_MSG;
    if (f.passengerInjured && !f.injuredPassengerDetails.trim()) e.injuredPassengerDetails = REQUIRED_MSG;
    if (f.thirdPartyInjured && !f.thirdPartyInjuryDetails.trim()) e.thirdPartyInjuryDetails = REQUIRED_MSG;
    if (f.thirdPartyPropertyDamaged && !f.thirdPartyPropertyDetails.trim()) {
      e.thirdPartyPropertyDetails = REQUIRED_MSG;
    }
    if (f.otherInsurance && !f.otherInsuranceDetails.trim()) e.otherInsuranceDetails = REQUIRED_MSG;
    if (!f.declarationAccepted) {
      e.declarationAccepted = "Confirm the declaration before submitting";
    }
  }
  return e;
}

function readBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Could not read the file"));
    reader.onload = () => {
      const text = String(reader.result ?? "");
      resolve(text.slice(text.indexOf(",") + 1));
    };
    reader.readAsDataURL(file);
  });
}

function apiMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "message" in error) {
    const e = error as { message?: unknown; description?: unknown };
    const parts = [e.message, e.description].filter((p): p is string => typeof p === "string" && p !== "");
    if (parts.length > 0) return parts.join(": ");
  }
  return fallback;
}

export function ClaimFormPage(): JSX.Element {
  const { claim: routeClaimId } = useParams();
  const navigate = useNavigate();
  const [claimId, setClaimId] = useState<string | undefined>(routeClaimId);
  const [status, setStatus] = useState<Claim["status"]>("draft");
  const [form, setForm] = useState<FormState>(BLANK);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [loading, setLoading] = useState(routeClaimId !== undefined);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  // Resume a draft (or open a submitted claim read-only) from the route.
  useEffect(() => {
    setClaimId(routeClaimId);
    if (routeClaimId === undefined) {
      setForm(BLANK);
      setAttachments([]);
      setStatus("draft");
      setNotFound(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setFailure(null);
    motorClaimsApi
      .GET("/me/claims/{claimId}", { params: { path: { claimId: routeClaimId } } })
      .then(({ data, response }) => {
        if (cancelled) return;
        if (data) {
          setForm(fromClaim(data));
          setAttachments(data.attachments ?? []);
          setStatus(data.status);
        } else if (response.status === 404) {
          setNotFound(true);
        } else {
          setFailure("The claim could not be loaded. Try again.");
        }
      })
      .catch(() => {
        if (!cancelled) setFailure("The claim could not be loaded. Check your connection and try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [routeClaimId]);

  const readOnly = status === "submitted";
  const disabled = readOnly || busy !== null;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]): void => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  // Creates the draft on first save, updates it afterwards. Returns the claim id.
  async function persist(): Promise<string | null> {
    const body = toInput(form);
    if (claimId === undefined) {
      const { data, error } = await motorClaimsApi.POST("/me/claims", { body });
      if (!data) {
        setFailure(apiMessage(error, "The draft could not be saved."));
        return null;
      }
      setClaimId(data.id);
      return data.id;
    }
    const { data, error } = await motorClaimsApi.PUT("/me/claims/{claimId}", {
      params: { path: { claimId } },
      body,
    });
    if (!data) {
      setFailure(apiMessage(error, "The draft could not be saved."));
      return null;
    }
    return claimId;
  }

  async function run(label: string, work: () => Promise<void>): Promise<void> {
    setBusy(label);
    setFailure(null);
    try {
      await work();
    } catch {
      setFailure("The request failed. Check your connection and try again.");
    } finally {
      setBusy(null);
    }
  }

  const saveDraft = (): Promise<void> =>
    run("save", async () => {
      const found = validate(form, false);
      setErrors(found);
      if (Object.keys(found).length > 0) return;
      const id = await persist();
      if (id) navigate("/dashboard");
    });

  const submit = (): Promise<void> =>
    run("submit", async () => {
      const found = validate(form, true, attachments);
      setErrors(found);
      if (Object.keys(found).length > 0) return;
      const id = await persist();
      if (!id) return;
      const { data, error } = await motorClaimsApi.POST("/me/claims/{claimId}/submit", {
        params: { path: { claimId: id } },
      });
      if (!data) {
        setFailure(apiMessage(error, "The claim could not be submitted."));
        return;
      }
      navigate(`/claim-detail/${data.id}`);
    });

  const attach = (type: AttachmentType) => async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const key = ATTACHMENT_ERROR_KEY[type];
    // Feedback goes next to the control the user pressed, not only at the top of a long form.
    const fail = (message: string): void => setErrors((e) => ({ ...e, [key]: message }));
    if (file.size > MAX_ATTACHMENT_BYTES) {
      fail("The file is larger than 5 MB. Choose a smaller PDF or image.");
      return;
    }
    await run("attach", async () => {
      const found = validate(form, false);
      if (Object.keys(found).length > 0) {
        setErrors((e) => ({ ...e, ...found }));
        fail("Enter the policy number and vehicle registration number before attaching a document.");
        return;
      }
      const id = await persist();
      if (!id) {
        fail("The draft could not be saved, so the document was not attached.");
        return;
      }
      const { data, error } = await motorClaimsApi.POST("/me/claims/{claimId}/attachments", {
        params: { path: { claimId: id } },
        body: {
          type,
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          content: await readBase64(file),
        },
      });
      if (!data) {
        fail(apiMessage(error, "The document could not be attached."));
        return;
      }
      setAttachments((list) => [...list.filter((a) => a.type !== type), data]);
      setErrors((e) => ({ ...e, [key]: undefined }));
    });
  };

  const text = (
    key: keyof FormState,
    label: string,
    opts: { required?: boolean; type?: string; multiline?: boolean; slot?: boolean } = {},
  ): JSX.Element => (
    <TextField
      label={label}
      value={String(form[key])}
      onChange={(e) => set(key, e.target.value as FormState[typeof key])}
      required={opts.required}
      type={opts.type}
      multiline={opts.multiline}
      minRows={opts.multiline ? 3 : undefined}
      disabled={disabled}
      error={Boolean(errors[key])}
      helperText={errors[key]}
      fullWidth
      slotProps={opts.type === "date" || opts.type === "time" ? { inputLabel: { shrink: true } } : undefined}
    />
  );

  const toggle = (key: keyof FormState, label: string, error?: string): JSX.Element => (
    <Box>
      <FormControlLabel
        control={
          <Switch
            checked={Boolean(form[key])}
            onChange={(e) => set(key, e.target.checked as FormState[typeof key])}
            disabled={disabled}
          />
        }
        label={label}
      />
      {error && (
        <Typography variant="caption" color="error" display="block">
          {error}
        </Typography>
      )}
    </Box>
  );

  const attachment = (type: AttachmentType, attachLabel: string, doneLabel: string): JSX.Element => {
    const current = attachments.find((a) => a.type === type);
    const attachError = errors[ATTACHMENT_ERROR_KEY[type]];
    return (
      <Box>
        <Stack direction="row" spacing={2} alignItems="center">
          {!readOnly && (
            <Button variant="outlined" component="label" disabled={disabled} color={attachError ? "error" : "primary"}>
              {current ? doneLabel : attachLabel}
              <input
                hidden
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => void attach(type)(e)}
              />
            </Button>
          )}
          {current && <Chip size="small" color="success" label={readOnly ? current.fileName : `Attached: ${current.fileName}`} />}
          {!current && readOnly && <Chip size="small" variant="outlined" label="Not attached" />}
        </Stack>
        {attachError && (
          <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>
            {attachError}
          </Typography>
        )}
      </Box>
    );
  };

  const section = (title: string, children: JSX.Element[]): JSX.Element => (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
          {children.map((child, i) => (
            <Box key={i}>{child}</Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <PageContent>
        <PageTitle>
          <PageTitle.Header>Motor Claim Form</PageTitle.Header>
        </PageTitle>
        <CircularProgress aria-label="Loading claim" />
      </PageContent>
    );
  }

  if (notFound) {
    return (
      <PageContent>
        <PageTitle>
          <PageTitle.Header>Motor Claim Form</PageTitle.Header>
        </PageTitle>
        <Alert severity="warning">
          <AlertTitle>Claim not found</AlertTitle>
          This claim does not exist or is not yours.
        </Alert>
      </PageContent>
    );
  }

  const issues = Object.values(errors).filter((m): m is string => Boolean(m));
  const title = claimId ? `Claim ${form.policyNumber || "(draft)"}` : "New Motor Claim";

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>{title}</PageTitle.Header>
      </PageTitle>

      <Stack
        component="form"
        spacing={2}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (!readOnly) void submit();
        }}
      >
        {readOnly && (
          <Alert severity="info">
            This claim has been submitted and can no longer be changed here. Contact the insurer for any further change.
          </Alert>
        )}
        {failure && <Alert severity="error">{failure}</Alert>}
        {issues.length > 0 && (
          <Alert severity="error">
            <AlertTitle>Fix the following before continuing</AlertTitle>
            <Box component="ul" sx={{ m: 0, pl: 3 }}>
              {[...new Set(issues)].map((m) => (
                <li key={m}>{m}</li>
              ))}
            </Box>
          </Alert>
        )}

        {section("Policy & Vehicle", [
          text("policyNumber", "Policy Number", { required: true }),
          text("vehicleRegNumber", "Vehicle Registration Number", { required: true }),
        ])}
        {section("Insured", [
          text("insuredName", "Full Name"),
          text("insuredAddress", "Postal Address"),
          text("insuredPhone", "Contact Phone"),
          text("insuredFax", "Fax Number"),
        ])}
        {section("Bank Details", [
          text("bankName", "Bank Name"),
          text("bankAccountNumber", "Account Number"),
          attachment("bank-page", "Attach certified bank page copy", "Replace bank page copy"),
        ])}
        {section("Ownership", [
          text("ownerName", "Legal Owner Name"),
          text("ownerAddress", "Legal Owner Address"),
          text("financeInstitution", "Finance Institution (if leased or financed)"),
        ])}
        {section("Driver", [
          text("driverName", "Full Name"),
          text("driverAge", "Age", { type: "number" }),
          text("driverRelationship", "Relationship to Insured"),
          text("driverLicenceNumber", "Driving Licence Number"),
          attachment("driving-licence", "Attach driving licence copy", "Replace driving licence copy"),
        ])}
        {section("Accident", [
          text("accidentDate", "Date", { type: "date" }),
          text("accidentTime", "Time", { type: "time" }),
          text("accidentLocation", "Location"),
          text("policeStation", "Police Station (if reported)"),
          text("accidentDescription", "Briefly describe what happened", { multiline: true }),
        ])}
        {section("Usage", [
          <TextField
            select
            fullWidth
            label="What was the vehicle being used for?"
            value={form.usage}
            onChange={(e) => set("usage", e.target.value)}
            disabled={disabled}
          >
            {USAGE_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>,
        ])}
        {section(
          "Goods Carried",
          [
            toggle("goodsDamaged", "Were goods carried in the vehicle damaged?"),
            ...(form.goodsDamaged
              ? [
                  text("goodsDescription", "Description of the damaged goods", { multiline: true }),
                  text("goodsValue", "Value of the damaged goods", { type: "number" }),
                ]
              : []),
          ],
        )}
        {section("Injured Passenger or Driver", [
          toggle("passengerInjured", "Was a passenger or the driver injured?"),
          ...(form.passengerInjured
            ? [text("injuredPassengerDetails", "Name, address, age, occupation, injury details", { multiline: true })]
            : []),
        ])}
        {section("Third-Party Injury", [
          toggle("thirdPartyInjured", "Was a third party injured?"),
          ...(form.thirdPartyInjured
            ? [text("thirdPartyInjuryDetails", "Name, address, age, occupation, injury details", { multiline: true })]
            : []),
        ])}
        {section("Third-Party Property Damage", [
          toggle("thirdPartyPropertyDamaged", "Was a third party's property damaged?"),
          ...(form.thirdPartyPropertyDamaged
            ? [
                text("thirdPartyPropertyDetails", "Description, owner, other insurer and policy number", {
                  multiline: true,
                }),
              ]
            : []),
        ])}
        {section("Other Insurance", [
          toggle("otherInsurance", "Does another policy cover this vehicle or the goods carried?"),
          ...(form.otherInsurance
            ? [text("otherInsuranceDetails", "Details of the other policy", { multiline: true })]
            : []),
        ])}
        {section("Declaration", [
          toggle(
            "declarationAccepted",
            "I declare these particulars are true and agree to the Privacy Policy",
            errors.declarationAccepted,
          ),
        ])}

        {!readOnly && (
          <Grid container justifyContent="flex-end">
            <Stack direction="row" spacing={2}>
              <Can op="PUT /me/claims/{claimId}">
                <Button variant="outlined" disabled={disabled} onClick={() => void saveDraft()}>
                  Save Draft
                </Button>
              </Can>
              <Can op="POST /me/claims/{claimId}/submit">
                <Button type="submit" variant="contained" disabled={disabled}>
                  Submit Claim
                </Button>
              </Can>
            </Stack>
          </Grid>
        )}
      </Stack>
    </PageContent>
  );
}
