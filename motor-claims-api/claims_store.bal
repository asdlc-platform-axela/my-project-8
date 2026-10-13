import ballerina/sql;
import ballerina/uuid;
import ballerinax/postgresql;

// The claim is read back as one JSON document built in SQL: keys are the
// contract's camelCase names, nulls are stripped, and the attachments (without
// their content) are nested, so one row converts to the Claim record directly.
final sql:ParameterizedQuery claimDocSelect = `
    SELECT jsonb_strip_nulls(jsonb_build_object(
        'id', claims.id,
        'status', claims.status,
        'policyNumber', claims.policy_number,
        'vehicleRegNumber', claims.vehicle_reg_number,
        'claimNumber', claims.claim_number,
        'insuredName', claims.insured_name,
        'insuredAddress', claims.insured_address,
        'insuredPhone', claims.insured_phone,
        'insuredFax', claims.insured_fax,
        'bankName', claims.bank_name,
        'bankAccountNumber', claims.bank_account_number,
        'ownerName', claims.owner_name,
        'ownerAddress', claims.owner_address,
        'financeInstitution', claims.finance_institution,
        'driverName', claims.driver_name,
        'driverAge', claims.driver_age,
        'driverRelationship', claims.driver_relationship,
        'driverLicenceNumber', claims.driver_licence_number,
        'accidentDate', to_char(claims.accident_date, 'YYYY-MM-DD'),
        'accidentTime', claims.accident_time,
        'accidentLocation', claims.accident_location,
        'policeStation', claims.police_station,
        'accidentDescription', claims.accident_description,
        'usage', claims.usage,
        'goodsDamaged', claims.goods_damaged,
        'goodsDescription', claims.goods_description,
        'goodsValue', claims.goods_value,
        'passengerInjured', claims.passenger_injured,
        'injuredPassengerDetails', claims.injured_passenger_details,
        'thirdPartyInjured', claims.third_party_injured,
        'thirdPartyInjuryDetails', claims.third_party_injury_details,
        'thirdPartyPropertyDamaged', claims.third_party_property_damaged,
        'thirdPartyPropertyDetails', claims.third_party_property_details,
        'otherInsurance', claims.other_insurance,
        'otherInsuranceDetails', claims.other_insurance_details,
        'declarationAccepted', claims.declaration_accepted,
        'submittedAt', to_char(claims.submitted_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
        'updatedAt', to_char(claims.updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
        'attachments', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'id', a.id, 'type', a.type, 'fileName', a.file_name, 'contentType', a.content_type)
                ORDER BY a.created_at)
            FROM attachments a WHERE a.claim_id = claims.id), '[]'::jsonb)
    ))::text AS claim_doc `;

type DocRow record {|
    string claim_doc;
|};

type StatusRow record {|
    string status;
|};

type AttachmentRow record {|
    string id;
    string file_name;
    string content_type;
|};

// The claim does not exist for this caller (or belongs to someone else).
type NotFoundError distinct error;

// The request is well formed but the claim's state or content refuses it.
type RuleError distinct error;

type ClaimOutcome Claim|NotFoundError|RuleError|error;

function toClaim(DocRow row) returns Claim|error {
    return row.claim_doc.fromJsonStringWithType(Claim);
}

// Loads one claim owned by the caller, with its attachments.
function loadOwnClaim(postgresql:Client db, string ownerId, string claimId) returns ClaimOutcome {
    sql:ParameterizedQuery query = sql:queryConcat(claimDocSelect,
        `FROM claims WHERE claims.id = ${claimId} AND claims.owner_id = ${ownerId}`);
    DocRow|sql:Error row = db->queryRow(query);
    if row is sql:NoRowsError {
        return error NotFoundError("claim not found");
    }
    if row is sql:Error {
        return row;
    }
    return toClaim(row);
}

function createDraft(string ownerId, ClaimDraftInput input) returns ClaimOutcome {
    postgresql:Client db = check getDb();
    string claimId = uuid:createType4AsString();
    string policy = (input?.policyNumber ?: "").trim();
    string reg = (input?.vehicleRegNumber ?: "").trim();
    _ = check db->execute(`
        INSERT INTO claims (id, owner_id, status, policy_number, vehicle_reg_number,
            insured_name, insured_address, insured_phone, insured_fax, bank_name, bank_account_number,
            owner_name, owner_address, finance_institution, driver_name, driver_age, driver_relationship,
            driver_licence_number, accident_date, accident_time, accident_location, police_station,
            accident_description, usage, goods_damaged, goods_description, goods_value,
            passenger_injured, injured_passenger_details, third_party_injured, third_party_injury_details,
            third_party_property_damaged, third_party_property_details, other_insurance,
            other_insurance_details, declaration_accepted)
        VALUES (${claimId}, ${ownerId}, 'draft', ${policy}, ${reg},
            ${input?.insuredName}::text, ${input?.insuredAddress}::text, ${input?.insuredPhone}::text,
            ${input?.insuredFax}::text, ${input?.bankName}::text, ${input?.bankAccountNumber}::text,
            ${input?.ownerName}::text, ${input?.ownerAddress}::text, ${input?.financeInstitution}::text,
            ${input?.driverName}::text, ${input?.driverAge}::int, ${input?.driverRelationship}::text,
            ${input?.driverLicenceNumber}::text, ${input?.accidentDate}::date, ${input?.accidentTime}::text,
            ${input?.accidentLocation}::text, ${input?.policeStation}::text,
            ${input?.accidentDescription}::text, ${input?.usage}::text, ${input?.goodsDamaged}::boolean,
            ${input?.goodsDescription}::text, ${input?.goodsValue}::numeric,
            ${input?.passengerInjured}::boolean, ${input?.injuredPassengerDetails}::text,
            ${input?.thirdPartyInjured}::boolean, ${input?.thirdPartyInjuryDetails}::text,
            ${input?.thirdPartyPropertyDamaged}::boolean, ${input?.thirdPartyPropertyDetails}::text,
            ${input?.otherInsurance}::boolean, ${input?.otherInsuranceDetails}::text,
            ${input?.declarationAccepted}::boolean)`);
    return loadOwnClaim(db, ownerId, claimId);
}

// Applies the fields present in the payload to a draft the caller owns. A
// submitted claim is refused, and the status guard on the UPDATE keeps it
// immutable even when a submit lands between the check and the write.
function updateDraft(string ownerId, string claimId, ClaimDraftInput input) returns ClaimOutcome {
    postgresql:Client db = check getDb();
    ClaimOutcome current = loadOwnClaim(db, ownerId, claimId);
    if current !is Claim {
        return current;
    }
    if current.status != "draft" {
        return error RuleError("the claim has been submitted and can no longer be changed");
    }
    string? policy = input?.policyNumber;
    string? reg = input?.vehicleRegNumber;
    sql:ExecutionResult result = check db->execute(`
        UPDATE claims SET
            policy_number = COALESCE(${policy is string ? policy.trim() : ()}::text, policy_number),
            vehicle_reg_number = COALESCE(${reg is string ? reg.trim() : ()}::text, vehicle_reg_number),
            insured_name = COALESCE(${input?.insuredName}::text, insured_name),
            insured_address = COALESCE(${input?.insuredAddress}::text, insured_address),
            insured_phone = COALESCE(${input?.insuredPhone}::text, insured_phone),
            insured_fax = COALESCE(${input?.insuredFax}::text, insured_fax),
            bank_name = COALESCE(${input?.bankName}::text, bank_name),
            bank_account_number = COALESCE(${input?.bankAccountNumber}::text, bank_account_number),
            owner_name = COALESCE(${input?.ownerName}::text, owner_name),
            owner_address = COALESCE(${input?.ownerAddress}::text, owner_address),
            finance_institution = COALESCE(${input?.financeInstitution}::text, finance_institution),
            driver_name = COALESCE(${input?.driverName}::text, driver_name),
            driver_age = COALESCE(${input?.driverAge}::int, driver_age),
            driver_relationship = COALESCE(${input?.driverRelationship}::text, driver_relationship),
            driver_licence_number = COALESCE(${input?.driverLicenceNumber}::text, driver_licence_number),
            accident_date = COALESCE(${input?.accidentDate}::date, accident_date),
            accident_time = COALESCE(${input?.accidentTime}::text, accident_time),
            accident_location = COALESCE(${input?.accidentLocation}::text, accident_location),
            police_station = COALESCE(${input?.policeStation}::text, police_station),
            accident_description = COALESCE(${input?.accidentDescription}::text, accident_description),
            usage = COALESCE(${input?.usage}::text, usage),
            goods_damaged = COALESCE(${input?.goodsDamaged}::boolean, goods_damaged),
            goods_description = COALESCE(${input?.goodsDescription}::text, goods_description),
            goods_value = COALESCE(${input?.goodsValue}::numeric, goods_value),
            passenger_injured = COALESCE(${input?.passengerInjured}::boolean, passenger_injured),
            injured_passenger_details = COALESCE(${input?.injuredPassengerDetails}::text, injured_passenger_details),
            third_party_injured = COALESCE(${input?.thirdPartyInjured}::boolean, third_party_injured),
            third_party_injury_details = COALESCE(${input?.thirdPartyInjuryDetails}::text, third_party_injury_details),
            third_party_property_damaged = COALESCE(${input?.thirdPartyPropertyDamaged}::boolean, third_party_property_damaged),
            third_party_property_details = COALESCE(${input?.thirdPartyPropertyDetails}::text, third_party_property_details),
            other_insurance = COALESCE(${input?.otherInsurance}::boolean, other_insurance),
            other_insurance_details = COALESCE(${input?.otherInsuranceDetails}::text, other_insurance_details),
            declaration_accepted = COALESCE(${input?.declarationAccepted}::boolean, declaration_accepted),
            updated_at = now()
        WHERE id = ${claimId} AND owner_id = ${ownerId} AND status = 'draft'`);
    if result.affectedRowCount == 0 {
        return error RuleError("the claim has been submitted and can no longer be changed");
    }
    return loadOwnClaim(db, ownerId, claimId);
}

// Stores an attachment on a draft the caller owns. One attachment per type:
// a new one replaces the previous. The claim row is locked for the duration so
// a concurrent submit cannot slip between the status check and the insert.
function addAttachment(string ownerId, string claimId, AttachmentInput input, byte[] content)
        returns Attachment|NotFoundError|RuleError|error {
    postgresql:Client db = check getDb();
    transaction {
        StatusRow|sql:Error status = db->queryRow(`
            SELECT status FROM claims WHERE id = ${claimId} AND owner_id = ${ownerId} FOR UPDATE`);
        if status is sql:NoRowsError {
            fail error NotFoundError("claim not found");
        }
        if status is sql:Error {
            fail status;
        }
        if status.status != "draft" {
            fail error RuleError("the claim has been submitted and can no longer be changed");
        }
        string attachmentId = uuid:createType4AsString();
        _ = check db->execute(`
            DELETE FROM attachments WHERE claim_id = ${claimId} AND type = ${input.'type}`);
        _ = check db->execute(`
            INSERT INTO attachments (id, claim_id, type, file_name, content_type, content)
            VALUES (${attachmentId}, ${claimId}, ${input.'type}, ${input.fileName}, ${input.contentType}, ${content})`);
        _ = check db->execute(`UPDATE claims SET updated_at = now() WHERE id = ${claimId}`);
        check commit;
        return {id: attachmentId, 'type: input.'type, fileName: input.fileName, contentType: input.contentType};
    } on fail error failure {
        return failure;
    }
}

// Submits a draft the caller owns. The row is locked while the declaration and
// required fields are checked, then the claim becomes submitted with a claim
// number; nothing can change it afterwards.
function submitDraft(string ownerId, string claimId) returns ClaimOutcome {
    postgresql:Client db = check getDb();
    transaction {
        sql:ParameterizedQuery query = sql:queryConcat(claimDocSelect,
            `FROM claims WHERE claims.id = ${claimId} AND claims.owner_id = ${ownerId} FOR UPDATE OF claims`);
        DocRow|sql:Error row = db->queryRow(query);
        if row is sql:NoRowsError {
            fail error NotFoundError("claim not found");
        }
        if row is sql:Error {
            fail row;
        }
        Claim claim = check toClaim(row);
        if claim.status != "draft" {
            fail error RuleError("the claim has already been submitted");
        }
        if claim?.declarationAccepted != true {
            fail error RuleError("the declaration must be confirmed before the claim is submitted");
        }
        string[] missing = missingForSubmit(claim);
        if missing.length() > 0 {
            fail error RuleError("required fields are missing: " + string:'join(", ", ...missing));
        }
        _ = check db->execute(`
            UPDATE claims SET status = 'submitted',
                claim_number = 'MC-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('claim_number_seq')::text, 6, '0'),
                submitted_at = now(), updated_at = now()
            WHERE id = ${claimId} AND owner_id = ${ownerId} AND status = 'draft'`);
        ClaimOutcome submitted = loadOwnClaim(db, ownerId, claimId);
        if submitted !is Claim {
            fail submitted;
        }
        check commit;
        return submitted;
    } on fail error failure {
        return failure;
    }
}
