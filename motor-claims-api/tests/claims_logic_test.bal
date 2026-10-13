import ballerina/test;

function readyClaim() returns Claim => {
    id: "c1",
    status: "draft",
    policyNumber: "P-1",
    vehicleRegNumber: "CAB-1234",
    insuredName: "A Person",
    insuredAddress: "1 Road",
    insuredPhone: "0711234567",
    bankName: "Bank",
    bankAccountNumber: "123",
    ownerName: "Owner",
    ownerAddress: "2 Road",
    driverName: "Driver",
    driverAge: 40,
    driverRelationship: "self",
    driverLicenceNumber: "B123",
    accidentDate: "2026-01-02",
    accidentTime: "14:30",
    accidentLocation: "Colombo",
    accidentDescription: "Rear-ended",
    usage: "private",
    goodsDamaged: false,
    passengerInjured: false,
    thirdPartyInjured: false,
    thirdPartyPropertyDamaged: false,
    otherInsurance: false,
    declarationAccepted: true,
    attachments: [
        {id: "a1", 'type: "driving-licence", fileName: "l.pdf"},
        {id: "a2", 'type: "bank-page", fileName: "b.pdf"}
    ]
};

@test:Config {}
function completeClaimIsReady() {
    test:assertEquals(missingForSubmit(readyClaim()), []);
}

@test:Config {}
function conditionalDetailsRequiredOnlyWhenFlagTrue() {
    Claim claim = readyClaim();
    claim.goodsDamaged = true;
    claim.thirdPartyPropertyDamaged = true;
    string[] missing = missingForSubmit(claim);
    test:assertEquals(missing, ["goodsDescription", "goodsValue", "thirdPartyPropertyDetails"]);
    claim.goodsDescription = "Boxes";
    claim.goodsValue = 100d;
    claim.thirdPartyPropertyDetails = "Wall";
    test:assertEquals(missingForSubmit(claim), []);
}

@test:Config {}
function flagsAndAttachmentsAreRequired() {
    Claim claim = {id: "c2", status: "draft", policyNumber: "P", vehicleRegNumber: "R"};
    string[] missing = missingForSubmit(claim);
    test:assertTrue(missing.indexOf("goodsDamaged") !is ());
    test:assertTrue(missing.indexOf("otherInsurance") !is ());
    test:assertTrue(missing.indexOf("attachment:driving-licence") !is ());
    test:assertTrue(missing.indexOf("attachment:bank-page") !is ());
}

@test:Config {}
function createRequiresPolicyAndRegistration() {
    test:assertTrue(validateDraftInput({}, true) is string);
    test:assertTrue(validateDraftInput({policyNumber: "P"}, true) is string);
    test:assertTrue(validateDraftInput({policyNumber: " ", vehicleRegNumber: "R"}, true) is string);
    test:assertEquals(validateDraftInput({policyNumber: "P", vehicleRegNumber: "R"}, true), ());
}

@test:Config {}
function updateAcceptsSubsetButRejectsBadValues() {
    test:assertEquals(validateDraftInput({insuredName: "X"}, false), ());
    test:assertTrue(validateDraftInput({policyNumber: ""}, false) is string);
    test:assertTrue(validateDraftInput({accidentDate: "2026-13-40"}, false) is string);
    test:assertTrue(validateDraftInput({accidentDate: "not a date"}, false) is string);
    test:assertEquals(validateDraftInput({accidentDate: "2026-02-03", accidentTime: "09:05"}, false), ());
    test:assertTrue(validateDraftInput({accidentTime: "25:00"}, false) is string);
    test:assertTrue(validateDraftInput({driverAge: -1}, false) is string);
    test:assertTrue(validateDraftInput({goodsValue: -5d}, false) is string);
}

@test:Config {}
function attachmentDecoding() {
    AttachmentInput ok = {'type: "bank-page", fileName: "b.pdf", contentType: "application/pdf", content: "aGVsbG8="};
    test:assertEquals(decodeAttachment(ok), "hello".toBytes());
    test:assertTrue(decodeAttachment({'type: "bank-page", fileName: "b.exe", contentType: "application/x-msdownload", content: "aGVsbG8="}) is string);
    test:assertTrue(decodeAttachment({'type: "bank-page", fileName: "b.pdf", contentType: "application/pdf", content: "!!!"}) is string);
    test:assertTrue(decodeAttachment({'type: "bank-page", fileName: "", contentType: "application/pdf", content: "aGVsbG8="}) is string);
}

@test:Config {}
function clampPagingBounds() {
    test:assertEquals(clampPaging(500, -3), [100, 0]);
    test:assertEquals(clampPaging(0, 5), [20, 5]);
    test:assertEquals(clampPaging(10, 0), [10, 0]);
}

@test:Config {}
function pageLinksMiddleAndEdges() {
    test:assertEquals(pageLinks((), 20, 0, 20), [(), ()]);
    test:assertEquals(pageLinks("submitted", 20, 0, 45),
        ["/me/claims?status=submitted&limit=20&offset=20", ()]);
    test:assertEquals(pageLinks((), 20, 20, 45),
        ["/me/claims?limit=20&offset=40", "/me/claims?limit=20&offset=0"]);
    test:assertEquals(pageLinks((), 20, 40, 45), [(), "/me/claims?limit=20&offset=20"]);
    test:assertEquals(pageLinks((), 20, 5, 100), ["/me/claims?limit=20&offset=25", "/me/claims?limit=20&offset=0"]);
}
