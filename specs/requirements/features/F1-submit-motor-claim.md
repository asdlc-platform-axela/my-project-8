# Submit Motor Claim

## Purpose

Lets the signed-in claimant fill in and submit a motor insurance claim — insured, ownership, driver, accident, usage, goods, injured-party and other-insurance details, each with a signed declaration — attaching a copy of the driver's licence and a certified copy of the bank account page, and submit it to the insurer.

## User Stories

- F1.1 As a claimant, I start a new claim by entering my policy number and the vehicle's registration number. \[2025-motor-claim-form.pdf · p.1\]
- F1.2 As a claimant, I enter my (the insured's) full name, postal address, and contact phone/fax numbers. \[2025-motor-claim-form.pdf · p.1 §01\]
- F1.3 As a claimant, I enter the bank name and account number to receive the approved claim, and attach a certified copy of the bank account page. \[2025-motor-claim-form.pdf · p.1 §01\]
- F1.4 As a claimant, I enter the legal owner's name and address, and the financing institution's name if the vehicle is under lease, hire-purchase or loan. \[2025-motor-claim-form.pdf · p.1 §02\]
- F1.5 As a claimant, I enter the driver's full name, age, and relationship to me, with their driving-licence number and a copy of the licence. \[2025-motor-claim-form.pdf · p.1 §03\]
- F1.6 As a claimant, I enter the accident's date, time, location, the police station it was reported to (if any), and a description of what happened. \[2025-motor-claim-form.pdf · p.1 §04\]
- F1.7 As a claimant, I state what the vehicle was being used for at the time — private, hire, self-drive rental, driving tuition, or other. \[2025-motor-claim-form.pdf · p.2 §05\]
- F1.8 As a claimant, I say whether goods carried in the vehicle were damaged, and if so describe them and their value. \[2025-motor-claim-form.pdf · p.2 §06\]
- F1.9 As a claimant, I say whether a passenger or the driver was injured, and if so give their name, address, age, occupation and injury details. \[2025-motor-claim-form.pdf · p.2 §07\]
- F1.10 As a claimant, I say whether a third party was injured, and if so give their name, address, age, occupation and injury details. \[2025-motor-claim-form.pdf · p.2 §08\]
- F1.11 As a claimant, I say whether a third party's property was damaged, and if so describe the property and the damage, the owner, and the other party's insurer and policy number. \[2025-motor-claim-form.pdf · p.2 §08\]
- F1.12 As a claimant, I say whether another policy also covers this vehicle or the goods carried, and if so give its details. \[2025-motor-claim-form.pdf · p.2 §09\]
- F1.13 As a claimant, I confirm the declaration that my particulars are true and agree to the insurer's privacy policy before I can submit. \[2025-motor-claim-form.pdf · p.2 Declaration\]
- F1.14 As a claimant, I save an incomplete claim as a draft and come back to finish it later.
- F1.15 As a claimant, once I submit a claim I can no longer change it myself.

## Decisions

- Policy number and vehicle registration are typed in manually; the Claim No. is assigned by the insurer after submission, not entered by the claimant.
- Each conditional section (goods carried, injured passengers, third-party injury, third-party property damage, other insurance) opens with a yes/no question; its detail fields only appear when the answer is yes.
- A submitted claim is final — the claimant cannot edit or withdraw it themselves; any further change goes through the insurer directly.
- A claim can be saved as a draft before submission and resumed later.

## Out of Scope

- Looking up the claimant's policy or vehicle against the insurer's own records — policy number and vehicle registration are entered by hand.
- Editing or withdrawing a claim once it has been submitted.

## Retired

- F1.16 dropped — the email confirmation is removed for now.

