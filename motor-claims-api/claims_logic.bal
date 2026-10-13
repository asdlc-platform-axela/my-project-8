import ballerina/lang.array;
import ballerina/time;

const int MAX_TEXT_LENGTH = 5000;
const int MAX_ATTACHMENT_BYTES = 5242880;
final string[] & readonly ALLOWED_CONTENT_TYPES = ["application/pdf", "image/jpeg", "image/png"];

// Validates the fields present in a draft payload. Returns a message for the
// first problem, or () when the payload is acceptable. On create the policy
// number and vehicle registration are required.
function validateDraftInput(ClaimDraftInput input, boolean creating) returns string? {
    if creating {
        string? policy = input?.policyNumber;
        if policy is () || policy.trim() == "" {
            return "policyNumber is required";
        }
        string? reg = input?.vehicleRegNumber;
        if reg is () || reg.trim() == "" {
            return "vehicleRegNumber is required";
        }
    }
    string?[] nonBlank = [input?.policyNumber, input?.vehicleRegNumber];
    string[] nonBlankNames = ["policyNumber", "vehicleRegNumber"];
    foreach int i in 0 ..< nonBlank.length() {
        string? value = nonBlank[i];
        if value is string && value.trim() == "" {
            return nonBlankNames[i] + " must not be blank";
        }
    }
    string?[] texts = [input?.policyNumber, input?.vehicleRegNumber, input?.insuredName,
        input?.insuredAddress, input?.insuredPhone, input?.insuredFax, input?.bankName,
        input?.bankAccountNumber, input?.ownerName, input?.ownerAddress, input?.financeInstitution,
        input?.driverName, input?.driverRelationship, input?.driverLicenceNumber, input?.accidentTime,
        input?.accidentLocation, input?.policeStation, input?.accidentDescription,
        input?.goodsDescription, input?.injuredPassengerDetails, input?.thirdPartyInjuryDetails,
        input?.thirdPartyPropertyDetails, input?.otherInsuranceDetails];
    foreach string? text in texts {
        if text is string && text.length() > MAX_TEXT_LENGTH {
            return "text fields must be at most " + MAX_TEXT_LENGTH.toString() + " characters";
        }
    }
    int? age = input?.driverAge;
    if age is int && (age < 0 || age > 120) {
        return "driverAge must be between 0 and 120";
    }
    decimal? value = input?.goodsValue;
    if value is decimal && value < 0d {
        return "goodsValue must not be negative";
    }
    string? accidentDate = input?.accidentDate;
    if accidentDate is string {
        time:Civil|error parsed = time:civilFromString(accidentDate + "T00:00:00Z");
        if parsed is error {
            return "accidentDate must be a date in YYYY-MM-DD format";
        }
    }
    string? accidentTime = input?.accidentTime;
    if accidentTime is string && !re `([01][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?`.isFullMatch(accidentTime) {
        return "accidentTime must be a time in HH:MM format";
    }
    return ();
}

// Validates an attachment payload and decodes its content.
function decodeAttachment(AttachmentInput input) returns byte[]|string {
    if input.fileName.trim() == "" || input.fileName.length() > 255 {
        return "fileName must be between 1 and 255 characters";
    }
    if ALLOWED_CONTENT_TYPES.indexOf(input.contentType) is () {
        return "contentType must be one of application/pdf, image/jpeg, image/png";
    }
    byte[]|error bytes = array:fromBase64(input.content);
    if bytes is error {
        return "content must be base64 encoded";
    }
    if bytes.length() == 0 {
        return "content must not be empty";
    }
    if bytes.length() > MAX_ATTACHMENT_BYTES {
        return "content must be at most 5 MB";
    }
    return bytes;
}

function isBlank(string? value) returns boolean {
    return value is () || value.trim() == "";
}

// The fields a claim still needs before it can be submitted. A conditional
// section's detail fields are required only when its flag is true; the flag
// itself is always required. Empty when the claim is ready.
function missingForSubmit(Claim claim) returns string[] {
    string[] missing = [];
    if isBlank(claim.policyNumber) {
        missing.push("policyNumber");
    }
    if isBlank(claim.vehicleRegNumber) {
        missing.push("vehicleRegNumber");
    }
    if isBlank(claim?.insuredName) {
        missing.push("insuredName");
    }
    if isBlank(claim?.insuredAddress) {
        missing.push("insuredAddress");
    }
    if isBlank(claim?.insuredPhone) {
        missing.push("insuredPhone");
    }
    if isBlank(claim?.bankName) {
        missing.push("bankName");
    }
    if isBlank(claim?.bankAccountNumber) {
        missing.push("bankAccountNumber");
    }
    if isBlank(claim?.ownerName) {
        missing.push("ownerName");
    }
    if isBlank(claim?.ownerAddress) {
        missing.push("ownerAddress");
    }
    if isBlank(claim?.driverName) {
        missing.push("driverName");
    }
    if claim?.driverAge is () {
        missing.push("driverAge");
    }
    if isBlank(claim?.driverRelationship) {
        missing.push("driverRelationship");
    }
    if isBlank(claim?.driverLicenceNumber) {
        missing.push("driverLicenceNumber");
    }
    if isBlank(claim?.accidentDate) {
        missing.push("accidentDate");
    }
    if isBlank(claim?.accidentTime) {
        missing.push("accidentTime");
    }
    if isBlank(claim?.accidentLocation) {
        missing.push("accidentLocation");
    }
    if isBlank(claim?.accidentDescription) {
        missing.push("accidentDescription");
    }
    if claim?.usage is () {
        missing.push("usage");
    }
    boolean? goods = claim?.goodsDamaged;
    if goods is () {
        missing.push("goodsDamaged");
    } else if goods {
        if isBlank(claim?.goodsDescription) {
            missing.push("goodsDescription");
        }
        if claim?.goodsValue is () {
            missing.push("goodsValue");
        }
    }
    boolean? passenger = claim?.passengerInjured;
    if passenger is () {
        missing.push("passengerInjured");
    } else if passenger && isBlank(claim?.injuredPassengerDetails) {
        missing.push("injuredPassengerDetails");
    }
    boolean? thirdInjury = claim?.thirdPartyInjured;
    if thirdInjury is () {
        missing.push("thirdPartyInjured");
    } else if thirdInjury && isBlank(claim?.thirdPartyInjuryDetails) {
        missing.push("thirdPartyInjuryDetails");
    }
    boolean? thirdProperty = claim?.thirdPartyPropertyDamaged;
    if thirdProperty is () {
        missing.push("thirdPartyPropertyDamaged");
    } else if thirdProperty && isBlank(claim?.thirdPartyPropertyDetails) {
        missing.push("thirdPartyPropertyDetails");
    }
    boolean? other = claim?.otherInsurance;
    if other is () {
        missing.push("otherInsurance");
    } else if other && isBlank(claim?.otherInsuranceDetails) {
        missing.push("otherInsuranceDetails");
    }
    Attachment[] attachments = claim?.attachments ?: [];
    boolean hasLicence = false;
    boolean hasBankPage = false;
    foreach Attachment attachment in attachments {
        if attachment.'type == "driving-licence" {
            hasLicence = true;
        } else {
            hasBankPage = true;
        }
    }
    if !hasLicence {
        missing.push("attachment:driving-licence");
    }
    if !hasBankPage {
        missing.push("attachment:bank-page");
    }
    return missing;
}

const int DEFAULT_PAGE_SIZE = 20;
const int MAX_PAGE_SIZE = 100;

// Keeps the paging parameters inside the contract's bounds.
function clampPaging(int pageLimit, int pageOffset) returns [int, int] {
    int boundedLimit = pageLimit < 1 ? DEFAULT_PAGE_SIZE : (pageLimit > MAX_PAGE_SIZE ? MAX_PAGE_SIZE : pageLimit);
    int boundedOffset = pageOffset < 0 ? 0 : pageOffset;
    return [boundedLimit, boundedOffset];
}

function pageUri(string? status, int pageLimit, int pageOffset) returns string {
    string base = "/me/claims?";
    if status is string {
        base = base + "status=" + status + "&";
    }
    return base + "limit=" + pageLimit.toString() + "&offset=" + pageOffset.toString();
}

// Relative URIs of the neighbouring pages, or () when there is none.
function pageLinks(string? status, int pageLimit, int pageOffset, int total) returns [string?, string?] {
    string? next = pageOffset + pageLimit < total ? pageUri(status, pageLimit, pageOffset + pageLimit) : ();
    string? previous = pageOffset > 0 ? pageUri(status, pageLimit, pageOffset > pageLimit ? pageOffset - pageLimit : 0) : ();
    return [next, previous];
}
