# Domain model

A claim belongs to the claimant who started it and moves from `draft` to
`submitted`; once submitted it is immutable. Its sections mirror the paper
motor claim form, and each attachment (a driving-licence copy, a certified
bank-page copy) belongs to one claim.

```mermaid
erDiagram
    CLAIM ||--o{ ATTACHMENT : has

    CLAIM {
        string id
        string claimantId "the signed-in owner"
        string status "draft or submitted"
        string policyNumber
        string vehicleRegNumber
        string claimNumber "assigned by the insurer on submission"
        string insuredName
        string insuredAddress
        string insuredPhone
        string insuredFax
        string bankName
        string bankAccountNumber
        string ownerName
        string ownerAddress
        string financeInstitution
        string driverName
        int driverAge
        string driverRelationship
        string driverLicenceNumber
        date accidentDate
        string accidentTime
        string accidentLocation
        string policeStation
        string accidentDescription
        string usage "private, hire, self-drive, tuition, other"
        boolean goodsDamaged
        string goodsDescription
        decimal goodsValue
        boolean passengerInjured
        string injuredPassengerDetails
        boolean thirdPartyInjured
        string thirdPartyInjuryDetails
        boolean thirdPartyPropertyDamaged
        string thirdPartyPropertyDetails
        boolean otherInsurance
        string otherInsuranceDetails
        boolean declarationAccepted
        datetime submittedAt
        datetime updatedAt
    }

    ATTACHMENT {
        string id
        string claimId
        string type "driving-licence or bank-page"
        string fileName
        string contentType
        bytes content
    }
```

A claim's conditional sections (goods, injured passenger, third-party injury,
third-party property, other insurance) each carry their own yes/no flag; their
detail fields are only meaningful when that flag is true.