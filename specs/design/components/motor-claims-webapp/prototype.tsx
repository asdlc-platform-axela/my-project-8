import { useState, type ReactNode } from "react";
import {
  Alert, AppShell, Badge, Button, Detail, EmptyState, Field, Form, Heading, Screen, Section,
  Stack, Stat, StatGroup, Table, ValidationSummary, defineApp, useCollection, useDisplayState,
  useNav, useParams, useToday,
} from "@wso2/prototype-kit";

interface ClaimRecord {
  id: string;
  status: "draft" | "submitted";
  policyNumber: string;
  vehicleRegNumber: string;
  claimNumber?: string;
  insuredName: string;
  insuredAddress: string;
  insuredPhone: string;
  insuredFax: string;
  bankName: string;
  bankAccountNumber: string;
  bankPageAttached: boolean;
  ownerName: string;
  financeInstitution: string;
  driverName: string;
  driverAge: string;
  driverRelationship: string;
  driverLicenceNumber: string;
  licenceAttached: boolean;
  accidentDate: string;
  accidentTime: string;
  accidentLocation: string;
  policeStation: string;
  accidentDescription: string;
  usage: string;
  goodsDamaged: boolean;
  goodsDescription: string;
  passengerInjured: boolean;
  injuredPassengerDetails: string;
  thirdPartyInjured: boolean;
  thirdPartyInjuryDetails: string;
  thirdPartyPropertyDamaged: boolean;
  thirdPartyPropertyDetails: string;
  otherInsurance: boolean;
  otherInsuranceDetails: string;
  declarationAccepted: boolean;
  submittedAt?: string;
  updatedAt: string;
}

const claims: ClaimRecord[] = [
  {
    id: "claim-1001",
    status: "draft",
    policyNumber: "POL-1006",
    vehicleRegNumber: "ABC-1234",
    insuredName: "Maya Perera",
    insuredAddress: "12 Lake Road, Colombo",
    insuredPhone: "0771234567",
    insuredFax: "",
    bankName: "Peoples Bank",
    bankAccountNumber: "000123456",
    bankPageAttached: true,
    ownerName: "Maya Perera",
    financeInstitution: "",
    driverName: "Maya Perera",
    driverAge: "34",
    driverRelationship: "Self",
    driverLicenceNumber: "B1234567",
    licenceAttached: true,
    accidentDate: "2026-09-30",
    accidentTime: "14:15",
    accidentLocation: "Galle Road, Colombo",
    policeStation: "Colombo Fort",
    accidentDescription: "Rear-ended at a traffic light",
    usage: "private",
    goodsDamaged: false,
    goodsDescription: "",
    passengerInjured: false,
    injuredPassengerDetails: "",
    thirdPartyInjured: false,
    thirdPartyInjuryDetails: "",
    thirdPartyPropertyDamaged: false,
    thirdPartyPropertyDetails: "",
    otherInsurance: false,
    otherInsuranceDetails: "",
    declarationAccepted: false,
    updatedAt: "2026-10-06",
  },
  {
    id: "claim-1002",
    status: "draft",
    policyNumber: "POL-1003",
    vehicleRegNumber: "DEF-9988",
    insuredName: "",
    insuredAddress: "",
    insuredPhone: "",
    insuredFax: "",
    bankName: "",
    bankAccountNumber: "",
    bankPageAttached: false,
    ownerName: "",
    financeInstitution: "",
    driverName: "",
    driverAge: "",
    driverRelationship: "",
    driverLicenceNumber: "",
    licenceAttached: false,
    accidentDate: "",
    accidentTime: "",
    accidentLocation: "",
    policeStation: "",
    accidentDescription: "",
    usage: "private",
    goodsDamaged: false,
    goodsDescription: "",
    passengerInjured: false,
    injuredPassengerDetails: "",
    thirdPartyInjured: false,
    thirdPartyInjuryDetails: "",
    thirdPartyPropertyDamaged: false,
    thirdPartyPropertyDetails: "",
    otherInsurance: false,
    otherInsuranceDetails: "",
    declarationAccepted: false,
    updatedAt: "2026-10-01",
  },
  {
    id: "claim-1003",
    status: "submitted",
    policyNumber: "POL-1002",
    vehicleRegNumber: "XYZ-5678",
    claimNumber: "CLM-2201",
    insuredName: "Maya Perera",
    insuredAddress: "12 Lake Road, Colombo",
    insuredPhone: "0771234567",
    insuredFax: "",
    bankName: "Peoples Bank",
    bankAccountNumber: "000123456",
    bankPageAttached: true,
    ownerName: "Maya Perera",
    financeInstitution: "",
    driverName: "Kasun Perera",
    driverAge: "34",
    driverRelationship: "Spouse",
    driverLicenceNumber: "B1234567",
    licenceAttached: true,
    accidentDate: "2026-09-30",
    accidentTime: "14:15",
    accidentLocation: "Galle Road, Colombo",
    policeStation: "Colombo Fort",
    accidentDescription: "Rear-ended at a traffic light",
    usage: "private",
    goodsDamaged: false,
    goodsDescription: "",
    passengerInjured: false,
    injuredPassengerDetails: "",
    thirdPartyInjured: false,
    thirdPartyInjuryDetails: "",
    thirdPartyPropertyDamaged: false,
    thirdPartyPropertyDetails: "",
    otherInsurance: false,
    otherInsuranceDetails: "",
    declarationAccepted: true,
    submittedAt: "2026-09-01",
    updatedAt: "2026-09-01",
  },
  {
    id: "claim-1004",
    status: "submitted",
    policyNumber: "POL-1005",
    vehicleRegNumber: "DEF-7788",
    claimNumber: "CLM-2177",
    insuredName: "Maya Perera",
    insuredAddress: "12 Lake Road, Colombo",
    insuredPhone: "0771234567",
    insuredFax: "",
    bankName: "Peoples Bank",
    bankAccountNumber: "000987654",
    bankPageAttached: true,
    ownerName: "Maya Perera",
    financeInstitution: "Peoples Leasing",
    driverName: "Maya Perera",
    driverAge: "34",
    driverRelationship: "Self",
    driverLicenceNumber: "B1234567",
    licenceAttached: true,
    accidentDate: "2026-08-14",
    accidentTime: "09:40",
    accidentLocation: "Kandy Road, Kadawatha",
    policeStation: "",
    accidentDescription: "Side-swiped while changing lanes",
    usage: "private",
    goodsDamaged: true,
    goodsDescription: "Office laptop, value 150000",
    passengerInjured: false,
    injuredPassengerDetails: "",
    thirdPartyInjured: false,
    thirdPartyInjuryDetails: "",
    thirdPartyPropertyDamaged: true,
    thirdPartyPropertyDetails: "Garden wall, owner Sunil Jayasuriya, insurer National Insurance Policy NI-556",
    otherInsurance: false,
    otherInsuranceDetails: "",
    declarationAccepted: true,
    submittedAt: "2026-08-14",
    updatedAt: "2026-08-14",
  },
];

const user = { name: "Maya Perera", email: "maya.perera@example.com" };

const blankClaim: ClaimRecord = {
  id: "",
  status: "draft",
  policyNumber: "",
  vehicleRegNumber: "",
  insuredName: "",
  insuredAddress: "",
  insuredPhone: "",
  insuredFax: "",
  bankName: "",
  bankAccountNumber: "",
  bankPageAttached: false,
  ownerName: "",
  financeInstitution: "",
  driverName: "",
  driverAge: "",
  driverRelationship: "",
  driverLicenceNumber: "",
  licenceAttached: false,
  accidentDate: "",
  accidentTime: "",
  accidentLocation: "",
  policeStation: "",
  accidentDescription: "",
  usage: "private",
  goodsDamaged: false,
  goodsDescription: "",
  passengerInjured: false,
  injuredPassengerDetails: "",
  thirdPartyInjured: false,
  thirdPartyInjuryDetails: "",
  thirdPartyPropertyDamaged: false,
  thirdPartyPropertyDetails: "",
  otherInsurance: false,
  otherInsuranceDetails: "",
  declarationAccepted: false,
  updatedAt: "",
};

function Shell({ children }: { children: ReactNode }) {
  return (
    <AppShell
      id="shell"
      user={user}
      nav={[{ id: "nav.dashboard", label: "My Claims", to: "screen.dashboard" }]}
      account="screen.account"
      settings="screen.settings"
      signOut="screen.signed-out"
    >
      {children}
    </AppShell>
  );
}

function Dashboard() {
  const state = useDisplayState();
  const all = useCollection<ClaimRecord>("claims");
  const drafts = state === "state.empty" ? [] : all.items.filter((c) => c.status === "draft");
  const submitted = (state === "state.empty" ? [] : all.items.filter((c) => c.status === "submitted"))
    .slice()
    .sort((a, b) => (b.submittedAt ?? "").localeCompare(a.submittedAt ?? ""));
  return (
    <Shell>
      <Heading
        id="heading.dashboard"
        text="My Claims"
        actions={<Button id="btn.new-claim" label="New Claim" emphasis="primary" to="screen.claim-form" />}
      />
      {state === "state.failed" && (
        <Alert
          id="alert.claims-failed"
          tone="error"
          title="Claims list unavailable"
          text="We couldn't refresh your claims. Showing the last known list."
        />
      )}
      <StatGroup>
        <Stat id="stat.drafts" label="Drafts" value={String(drafts.length)} hint="unfinished claims" icon="FileText" tone="warning" />
        <Stat id="stat.submitted" label="Submitted" value={String(submitted.length)} hint="sent to the insurer" icon="CircleCheck" tone="success" />
      </StatGroup>
      <Section id="section.drafts" title="Drafts" count={drafts.length} subtitle="Pick up where you left off.">
        <Table
          id="table.drafts"
          columns={["Policy No", "Vehicle Reg", "Last updated"]}
          rows={drafts.map((c) => ({
            id: `draft.${c.id}`,
            cells: [c.policyNumber || "(not set)", c.vehicleRegNumber || "(not set)", c.updatedAt],
            to: "screen.claim-form",
            params: { claim: c.id },
          }))}
          empty={<EmptyState id="empty.drafts" title="No drafts" text="Claims you save without submitting appear here." />}
        />
      </Section>
      <Section id="section.submitted" title="Submitted" count={submitted.length} subtitle="Newest first.">
        <Table
          id="table.submitted"
          columns={["Policy No", "Vehicle Reg", "Submitted", "Claim No"]}
          rows={submitted.map((c) => ({
            id: `submitted.${c.id}`,
            cells: [c.policyNumber, c.vehicleRegNumber, c.submittedAt ?? "", c.claimNumber ?? ""],
            to: "screen.claim-detail",
            params: { claim: c.id },
          }))}
          empty={<EmptyState id="empty.submitted" title="Nothing submitted yet" text="Claims you submit appear here." />}
        />
      </Section>
    </Shell>
  );
}

function ClaimForm() {
  const { claim: claimId } = useParams();
  const navigate = useNav();
  const all = useCollection<ClaimRecord>("claims");
  const today = useToday();
  const existing = claimId ? all.get(claimId) : undefined;
  const [form, setForm] = useState<ClaimRecord>(existing ?? blankClaim);
  const [error, setError] = useState(false);
  const displayState = useDisplayState();
  const showError = error || displayState === "state.validation-error";

  const set = <K extends keyof ClaimRecord>(key: K, value: ClaimRecord[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const saveDraft = () => {
    if (form.id) {
      all.update(form.id, { ...form, updatedAt: today });
    } else {
      const id = all.create({ ...form, status: "draft", updatedAt: today });
      setForm((f) => ({ ...f, id }));
    }
    navigate.go("screen.dashboard");
  };

  const submitClaim = () => {
    if (!form.declarationAccepted) {
      setError(true);
      return;
    }
    const payload: ClaimRecord = {
      ...form,
      status: "submitted",
      claimNumber: form.claimNumber ?? "CLM-3002",
      submittedAt: today,
      updatedAt: today,
    };
    if (form.id) {
      all.update(form.id, payload);
      navigate.go("screen.claim-detail", { claim: form.id });
    } else {
      const id = all.create(payload);
      navigate.go("screen.claim-detail", { claim: id });
    }
  };

  return (
    <Shell>
      <Heading id="heading.claim-form" text={existing ? `Claim ${form.policyNumber || "(draft)"}` : "New Motor Claim"} />
      {showError && (
        <ValidationSummary id="validation.declaration" issues={["Confirm the declaration before submitting"]} />
      )}
      <Form
        id="form.claim"
        actions={
          <Stack direction="row">
            <Button id="btn.save-draft" label="Save Draft" onPress={saveDraft} />
            <Button id="btn.submit-claim" label="Submit Claim" emphasis="primary" onPress={submitClaim} />
          </Stack>
        }
      >
        <Section id="section.policy" title="Policy & Vehicle">
          <Field id="field.policy-number" label="Policy Number" value={form.policyNumber} onChange={(v) => set("policyNumber", v)} required />
          <Field id="field.vehicle-reg" label="Vehicle Registration Number" value={form.vehicleRegNumber} onChange={(v) => set("vehicleRegNumber", v)} required />
        </Section>
        <Section id="section.insured" title="Insured">
          <Field id="field.insured-name" label="Full Name" value={form.insuredName} onChange={(v) => set("insuredName", v)} />
          <Field id="field.insured-address" label="Postal Address" value={form.insuredAddress} onChange={(v) => set("insuredAddress", v)} />
          <Field id="field.insured-phone" label="Contact Phone" value={form.insuredPhone} onChange={(v) => set("insuredPhone", v)} />
          <Field id="field.insured-fax" label="Fax Number" value={form.insuredFax} onChange={(v) => set("insuredFax", v)} />
        </Section>
        <Section id="section.bank" title="Bank Details">
          <Field id="field.bank-name" label="Bank Name" value={form.bankName} onChange={(v) => set("bankName", v)} />
          <Field id="field.bank-account" label="Account Number" value={form.bankAccountNumber} onChange={(v) => set("bankAccountNumber", v)} />
          <Stack direction="row">
            <Button
              id="btn.attach-bank-page"
              label={form.bankPageAttached ? "Bank page attached" : "Attach certified bank page copy"}
              onPress={() => set("bankPageAttached", true)}
            />
            {form.bankPageAttached && <Badge id="badge.bank-page" label="Attached" tone="success" />}
          </Stack>
        </Section>
        <Section id="section.ownership" title="Ownership">
          <Field id="field.owner-name" label="Legal Owner Name and Address" value={form.ownerName} onChange={(v) => set("ownerName", v)} />
          <Field id="field.finance-institution" label="Finance Institution (if leased or financed)" value={form.financeInstitution} onChange={(v) => set("financeInstitution", v)} />
        </Section>
        <Section id="section.driver" title="Driver">
          <Field id="field.driver-name" label="Full Name" value={form.driverName} onChange={(v) => set("driverName", v)} />
          <Field id="field.driver-age" label="Age" type="number" value={form.driverAge} onChange={(v) => set("driverAge", v)} />
          <Field id="field.driver-relationship" label="Relationship to Insured" value={form.driverRelationship} onChange={(v) => set("driverRelationship", v)} />
          <Field id="field.driver-licence" label="Driving Licence Number" value={form.driverLicenceNumber} onChange={(v) => set("driverLicenceNumber", v)} />
          <Stack direction="row">
            <Button
              id="btn.attach-licence"
              label={form.licenceAttached ? "Licence attached" : "Attach driving licence copy"}
              onPress={() => set("licenceAttached", true)}
            />
            {form.licenceAttached && <Badge id="badge.licence" label="Attached" tone="success" />}
          </Stack>
        </Section>
        <Section id="section.accident" title="Accident">
          <Field id="field.accident-date" label="Date" type="date" value={form.accidentDate} onChange={(v) => set("accidentDate", v)} />
          <Field id="field.accident-time" label="Time" value={form.accidentTime} onChange={(v) => set("accidentTime", v)} />
          <Field id="field.accident-location" label="Location" value={form.accidentLocation} onChange={(v) => set("accidentLocation", v)} />
          <Field id="field.police-station" label="Police Station (if reported)" value={form.policeStation} onChange={(v) => set("policeStation", v)} />
          <Field id="field.accident-description" label="Briefly describe what happened" type="textarea" value={form.accidentDescription} onChange={(v) => set("accidentDescription", v)} />
        </Section>
        <Section id="section.usage" title="Usage">
          <Field
            id="field.usage"
            label="What was the vehicle being used for?"
            type="select"
            options={["private", "hire", "self-drive", "tuition", "other"]}
            value={form.usage}
            onChange={(v) => set("usage", v)}
          />
        </Section>
        <Section id="section.goods" title="Goods Carried">
          <Field id="field.goods-damaged" label="Were goods carried in the vehicle damaged?" type="switch" value={form.goodsDamaged ? "on" : "off"} onChange={(v) => set("goodsDamaged", v === "on")} />
          {form.goodsDamaged && (
            <Field id="field.goods-description" label="Description and value of the damage" type="textarea" value={form.goodsDescription} onChange={(v) => set("goodsDescription", v)} />
          )}
        </Section>
        <Section id="section.passenger-injury" title="Injured Passenger or Driver">
          <Field id="field.passenger-injured" label="Was a passenger or the driver injured?" type="switch" value={form.passengerInjured ? "on" : "off"} onChange={(v) => set("passengerInjured", v === "on")} />
          {form.passengerInjured && (
            <Field id="field.passenger-injury-details" label="Name, address, age, occupation, injury details" type="textarea" value={form.injuredPassengerDetails} onChange={(v) => set("injuredPassengerDetails", v)} />
          )}
        </Section>
        <Section id="section.third-party-injury" title="Third-Party Injury">
          <Field id="field.third-party-injured" label="Was a third party injured?" type="switch" value={form.thirdPartyInjured ? "on" : "off"} onChange={(v) => set("thirdPartyInjured", v === "on")} />
          {form.thirdPartyInjured && (
            <Field id="field.third-party-injury-details" label="Name, address, age, occupation, injury details" type="textarea" value={form.thirdPartyInjuryDetails} onChange={(v) => set("thirdPartyInjuryDetails", v)} />
          )}
        </Section>
        <Section id="section.third-party-property" title="Third-Party Property Damage">
          <Field id="field.third-party-property-damaged" label="Was a third party's property damaged?" type="switch" value={form.thirdPartyPropertyDamaged ? "on" : "off"} onChange={(v) => set("thirdPartyPropertyDamaged", v === "on")} />
          {form.thirdPartyPropertyDamaged && (
            <Field id="field.third-party-property-details" label="Description, owner, other insurer and policy number" type="textarea" value={form.thirdPartyPropertyDetails} onChange={(v) => set("thirdPartyPropertyDetails", v)} />
          )}
        </Section>
        <Section id="section.other-insurance" title="Other Insurance">
          <Field id="field.other-insurance" label="Does another policy cover this vehicle or the goods carried?" type="switch" value={form.otherInsurance ? "on" : "off"} onChange={(v) => set("otherInsurance", v === "on")} />
          {form.otherInsurance && (
            <Field id="field.other-insurance-details" label="Details of the other policy" type="textarea" value={form.otherInsuranceDetails} onChange={(v) => set("otherInsuranceDetails", v)} />
          )}
        </Section>
        <Section id="section.declaration" title="Declaration">
          <Field
            id="field.declaration"
            label="I declare these particulars are true and agree to the Privacy Policy"
            type="switch"
            value={form.declarationAccepted ? "on" : "off"}
            onChange={(v) => set("declarationAccepted", v === "on")}
            error={showError ? "Confirm the declaration before submitting" : undefined}
          />
        </Section>
      </Form>
    </Shell>
  );
}

function ClaimDetail() {
  const { claim: claimId } = useParams();
  const all = useCollection<ClaimRecord>("claims");
  const claim = (claimId ? all.get(claimId) : undefined) ?? all.items.find((c) => c.status === "submitted") ?? all.items[0]!;
  return (
    <Shell>
      <Heading id="heading.claim-detail" text={`Claim ${claim.claimNumber ?? claim.policyNumber}`} />
      <Alert
        id="alert.email-sent"
        tone="success"
        title="Confirmation sent"
        text={`An email confirming this submission was sent to ${user.email}.`}
      />
      <Detail
        id="detail.summary"
        fields={[
          { label: "Policy No", value: claim.policyNumber },
          { label: "Vehicle Reg", value: claim.vehicleRegNumber },
          { label: "Submitted", value: claim.submittedAt ?? "" },
          { label: "Claim No", value: claim.claimNumber ?? "" },
        ]}
      />
      <Section id="section.detail-insured" title="Insured">
        <Detail
          id="detail.insured"
          fields={[
            { label: "Name", value: claim.insuredName },
            { label: "Address", value: claim.insuredAddress },
            { label: "Phone", value: claim.insuredPhone },
          ]}
        />
      </Section>
      <Section id="section.detail-driver" title="Driver">
        <Detail
          id="detail.driver"
          fields={[
            { label: "Name", value: claim.driverName },
            { label: "Age", value: claim.driverAge },
            { label: "Relationship", value: claim.driverRelationship },
            { label: "Licence No", value: claim.driverLicenceNumber },
          ]}
        />
      </Section>
      <Section id="section.detail-accident" title="Accident">
        <Detail
          id="detail.accident"
          fields={[
            { label: "Date", value: claim.accidentDate },
            { label: "Time", value: claim.accidentTime },
            { label: "Location", value: claim.accidentLocation },
            { label: "What happened", value: claim.accidentDescription },
          ]}
        />
      </Section>
      <Button id="btn.back-to-dashboard" label="Back to My Claims" to="screen.dashboard" />
    </Shell>
  );
}

function Account() {
  return (
    <Shell>
      <Heading id="heading.account" text="Account" />
      <Detail id="detail.account" fields={[{ label: "Name", value: user.name }, { label: "Email", value: user.email }]} />
    </Shell>
  );
}

function Settings() {
  const navigate = useNav();
  return (
    <Shell>
      <Heading id="heading.settings" text="Settings" />
      <Form
        id="form.settings"
        onSubmit={() => navigate.go("screen.dashboard")}
        actions={<Button id="btn.save-settings" label="Save settings" emphasis="primary" submit />}
      >
        <Field id="field.email-confirmations" label="Email me a confirmation when I submit a claim" type="switch" defaultValue="on" />
      </Form>
    </Shell>
  );
}

function SignedOut() {
  return (
    <Screen>
      <Heading id="heading.signed-out" text="You are signed out" />
      <Button id="btn.sign-in" label="Sign in" emphasis="primary" to="screen.dashboard" />
    </Screen>
  );
}

export default defineApp({
  screens: {
    "screen.dashboard": Dashboard,
    "screen.claim-form": ClaimForm,
    "screen.claim-detail": ClaimDetail,
    "screen.account": Account,
    "screen.settings": Settings,
    "screen.signed-out": SignedOut,
  },
  data: { claims },
});
