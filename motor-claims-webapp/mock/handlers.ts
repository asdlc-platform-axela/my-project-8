import { http, HttpResponse } from "msw";
import type { components } from "../src/generated/motor-claims-api";

type Claim = components["schemas"]["Claim"];
type ClaimSummary = components["schemas"]["ClaimSummary"];
type DraftInput = components["schemas"]["ClaimDraftInput"];
type Attachment = components["schemas"]["Attachment"];
type AttachmentInput = components["schemas"]["AttachmentInput"];

// The caller this mock speaks for. Every /me/ handler resolves rows through it.
export const mockCaller = { userId: "01a0ab00-0000-7000-8000-000000000001", username: "test-claimant" };
const SOMEONE_ELSE = "not-the-caller";

interface Row {
  owner: string;
  claim: Claim;
}

const maya = {
  insuredName: "Maya Perera",
  insuredAddress: "12 Lake Road, Colombo",
  insuredPhone: "0771234567",
  insuredFax: "",
  bankName: "Peoples Bank",
  bankAccountNumber: "000123456",
  ownerName: "Maya Perera",
  financeInstitution: "",
  driverLicenceNumber: "B1234567",
  usage: "private" as const,
  goodsDamaged: false,
  passengerInjured: false,
  thirdPartyInjured: false,
  thirdPartyPropertyDamaged: false,
  otherInsurance: false,
};

// State lives in the page: any full page load re-runs this module and restores
// the seed (these are the records of prototype.tsx, mapped onto the schema).
// In-app navigation carries changes forward.
let rows: Row[] = [
  {
    owner: mockCaller.userId,
    claim: {
      ...maya,
      id: "claim-1001",
      status: "draft",
      policyNumber: "POL-1006",
      vehicleRegNumber: "ABC-1234",
      driverName: "Maya Perera",
      driverAge: 34,
      driverRelationship: "Self",
      accidentDate: "2026-09-30",
      accidentTime: "14:15",
      accidentLocation: "Galle Road, Colombo",
      policeStation: "Colombo Fort",
      accidentDescription: "Rear-ended at a traffic light",
      declarationAccepted: false,
      attachments: [
        { id: "att-1", type: "driving-licence", fileName: "licence.pdf", contentType: "application/pdf" },
        { id: "att-2", type: "bank-page", fileName: "bank-page.pdf", contentType: "application/pdf" },
      ],
      updatedAt: "2026-10-06T09:00:00Z",
    },
  },
  {
    owner: mockCaller.userId,
    claim: {
      id: "claim-1002",
      status: "draft",
      policyNumber: "POL-1003",
      vehicleRegNumber: "DEF-9988",
      usage: "private",
      attachments: [],
      updatedAt: "2026-10-01T09:00:00Z",
    },
  },
  {
    owner: mockCaller.userId,
    claim: {
      ...maya,
      id: "claim-1003",
      status: "submitted",
      policyNumber: "POL-1002",
      vehicleRegNumber: "XYZ-5678",
      claimNumber: "CLM-2201",
      driverName: "Kasun Perera",
      driverAge: 34,
      driverRelationship: "Spouse",
      accidentDate: "2026-09-30",
      accidentTime: "14:15",
      accidentLocation: "Galle Road, Colombo",
      policeStation: "Colombo Fort",
      accidentDescription: "Rear-ended at a traffic light",
      declarationAccepted: true,
      attachments: [
        { id: "att-3", type: "driving-licence", fileName: "licence.pdf", contentType: "application/pdf" },
        { id: "att-4", type: "bank-page", fileName: "bank-page.pdf", contentType: "application/pdf" },
      ],
      submittedAt: "2026-09-01T09:00:00Z",
      updatedAt: "2026-09-01T09:00:00Z",
    },
  },
  {
    owner: mockCaller.userId,
    claim: {
      ...maya,
      id: "claim-1004",
      status: "submitted",
      policyNumber: "POL-1005",
      vehicleRegNumber: "DEF-7788",
      claimNumber: "CLM-2177",
      bankAccountNumber: "000987654",
      financeInstitution: "Peoples Leasing",
      driverName: "Maya Perera",
      driverAge: 34,
      driverRelationship: "Self",
      accidentDate: "2026-08-14",
      accidentTime: "09:40",
      accidentLocation: "Kandy Road, Kadawatha",
      policeStation: "",
      accidentDescription: "Side-swiped while changing lanes",
      goodsDamaged: true,
      goodsDescription: "Office laptop",
      goodsValue: 150000,
      thirdPartyPropertyDamaged: true,
      thirdPartyPropertyDetails: "Garden wall, owner Sunil Jayasuriya, insurer National Insurance Policy NI-556",
      declarationAccepted: true,
      attachments: [
        { id: "att-5", type: "driving-licence", fileName: "licence.pdf", contentType: "application/pdf" },
        { id: "att-6", type: "bank-page", fileName: "bank-page.pdf", contentType: "application/pdf" },
      ],
      submittedAt: "2026-08-14T09:00:00Z",
      updatedAt: "2026-08-14T09:00:00Z",
    },
  },
  {
    owner: SOMEONE_ELSE,
    claim: {
      id: "claim-9001",
      status: "draft",
      policyNumber: "POL-0001",
      vehicleRegNumber: "ZZZ-0001",
      attachments: [],
      updatedAt: "2026-10-02T09:00:00Z",
    },
  },
];
let nextId = 2001;

const mine = () => rows.filter((r) => r.owner === mockCaller.userId);
const find = (id: unknown) => mine().find((r) => r.claim.id === id);
const notFound = () => HttpResponse.json({ code: 404, message: "No such claim for this caller" }, { status: 404 });
const bad = (message: string) => HttpResponse.json({ code: 400, message }, { status: 400 });

const summary = (c: Claim): ClaimSummary => ({
  id: c.id,
  status: c.status,
  policyNumber: c.policyNumber,
  vehicleRegNumber: c.vehicleRegNumber,
  claimNumber: c.claimNumber ?? null,
  submittedAt: c.submittedAt ?? null,
  updatedAt: c.updatedAt ?? "",
});

export const handlers = [
  http.get("/api/me/claims", ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const limit = Number(url.searchParams.get("limit") ?? 20);
    const offset = Number(url.searchParams.get("offset") ?? 0);
    const all = mine()
      .map((r) => r.claim)
      .filter((c) => !status || c.status === status)
      .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
    return HttpResponse.json({
      count: all.length,
      next: offset + limit < all.length ? `/me/claims?offset=${offset + limit}&limit=${limit}` : null,
      previous: offset > 0 ? `/me/claims?offset=${Math.max(0, offset - limit)}&limit=${limit}` : null,
      data: all.slice(offset, offset + limit).map(summary),
    });
  }),

  http.post("/api/me/claims", async ({ request }) => {
    const input = (await request.json()) as DraftInput;
    const claim: Claim = {
      policyNumber: "",
      vehicleRegNumber: "",
      ...input,
      id: `claim-${nextId++}`,
      status: "draft",
      attachments: [],
      updatedAt: new Date().toISOString(),
    };
    rows = [...rows, { owner: mockCaller.userId, claim }];
    return HttpResponse.json(claim, { status: 201 });
  }),

  // Attachments and submit are registered before the bare {claimId} routes.
  http.post("/api/me/claims/:claimId/attachments", async ({ params, request }) => {
    const row = find(params.claimId);
    if (!row) return notFound();
    if (row.claim.status !== "draft") return bad("A submitted claim cannot change");
    const input = (await request.json()) as AttachmentInput;
    if (!input?.type || !input.fileName || !input.content) return bad("type, fileName, contentType and content are required");
    const attachment: Attachment = {
      id: `att-${Date.now()}`,
      type: input.type,
      fileName: input.fileName,
      contentType: input.contentType,
    };
    row.claim = {
      ...row.claim,
      attachments: [...(row.claim.attachments ?? []).filter((a) => a.type !== input.type), attachment],
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(attachment, { status: 201 });
  }),

  http.post("/api/me/claims/:claimId/submit", ({ params }) => {
    const row = find(params.claimId);
    if (!row) return notFound();
    const c = row.claim;
    if (c.status !== "draft") return bad("Claim is already submitted");
    if (!c.declarationAccepted) return bad("The declaration must be accepted before submitting");
    const types = (c.attachments ?? []).map((a) => a.type);
    if (!types.includes("driving-licence") || !types.includes("bank-page")) {
      return bad("A driving licence copy and a bank page copy must be attached before submitting");
    }
    const now = new Date().toISOString();
    row.claim = { ...c, status: "submitted", claimNumber: `CLM-${nextId++}`, submittedAt: now, updatedAt: now };
    return HttpResponse.json(row.claim);
  }),

  http.get("/api/me/claims/:claimId", ({ params }) => {
    const row = find(params.claimId);
    return row ? HttpResponse.json(row.claim) : notFound();
  }),

  http.put("/api/me/claims/:claimId", async ({ params, request }) => {
    const row = find(params.claimId);
    if (!row) return notFound();
    if (row.claim.status !== "draft") return bad("A submitted claim cannot change");
    const input = (await request.json()) as DraftInput;
    row.claim = { ...row.claim, ...input, updatedAt: new Date().toISOString() };
    return HttpResponse.json(row.claim);
  }),
];
