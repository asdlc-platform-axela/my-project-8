screen Dashboard "My Claims: submitted claims and saved drafts"
  navbar "Motor Claim Portal"
  heading "My Claims"
  row
    text "Review what you've submitted, or finish a saved draft"
    right
    button "New Claim" primary -> ClaimForm
  heading "Drafts"
  table "Policy No | Vehicle Reg | Last updated" -> ClaimForm
    row "POL-1006 | ABC-1234 | 2 days ago"
  heading "Submitted"
  table "Policy No | Vehicle Reg | Submitted | Claim No" -> ClaimDetail
    row "POL-1002 | XYZ-5678 | 2026-09-01 | CLM-2201"
    row "POL-1005 | DEF-7788 | 2026-08-14 | CLM-2177"

screen ClaimForm "Fill in, save or submit a motor claim"
  navbar "Motor Claim Portal"
  heading "Motor Claim"
  row
    input "Policy Number"
    input "Vehicle Registration Number"
  card "Insured"
    input "Full Name"
    input "Postal Address"
    row
      input "Contact Phone"
      input "Fax Number"
  card "Bank Details"
    input "Bank Name"
    input "Account Number"
    button "Upload certified bank page copy"
  card "Ownership"
    input "Legal Owner Name and Address"
    input "Finance Institution (if leased or financed)"
  card "Driver"
    row
      input "Full Name"
      input "Age"
    input "Relationship to Insured"
    input "Driving Licence Number"
    button "Upload driving licence copy"
  card "Accident"
    row
      input "Date"
      input "Time"
    input "Location"
    input "Police Station (if reported)"
    textarea "Briefly describe what happened"
  card "Usage"
    select "What was the vehicle being used for?"
  card "Goods Carried"
    toggle "Were goods carried in the vehicle damaged?"
    textarea "Description and value of the damage"
  card "Injured Passenger or Driver"
    toggle "Was a passenger or the driver injured?"
    textarea "Name, address, age, occupation, injury details"
  card "Third-Party Injury"
    toggle "Was a third party injured?"
    textarea "Name, address, age, occupation, injury details"
  card "Third-Party Property Damage"
    toggle "Was a third party's property damaged?"
    textarea "Description, owner, other insurer and policy number"
  card "Other Insurance"
    toggle "Does another policy cover this vehicle or the goods carried?"
    textarea "Details of the other policy"
  card "Declaration"
    checkbox "I declare these particulars are true and agree to the Privacy Policy"
  row
    button "Save Draft" -> Dashboard
    right
    button "Submit Claim" primary -> ClaimDetail

screen ClaimDetail "A claim's full details, read-only"
  navbar "Motor Claim Portal"
  row
    heading "Claim CLM-2201"
    badge "Submitted" success
  text "Policy No: POL-1002  ·  Vehicle Reg: XYZ-5678"
  card "Insured"
    text "Maya Perera, 12 Lake Road, Colombo"
    text "Phone: 0771234567"
  card "Driver"
    text "Kasun Perera, age 34, spouse"
    text "Driving Licence: B1234567"
  card "Accident"
    text "2026-09-30 14:15, Galle Road, Colombo"
    text "Rear-ended at a traffic light"
  button "Back to My Claims" -> Dashboard

flow "Claimant journey"
  role "Claimant"
  description "A claimant submits a motor claim and reviews their past ones"
  Dashboard
  ClaimForm
  ClaimDetail
