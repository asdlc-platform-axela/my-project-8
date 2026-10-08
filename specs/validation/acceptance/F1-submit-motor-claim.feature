Feature: F1 Submit Motor Claim

  @story-F1.1
  Rule: A claim starts with the policyholder's policy number and vehicle registration

    Scenario: Starting a new claim
      Given Maya is signed in as a claimant
      When she starts a new claim with policy number "POL-1001" and vehicle registration "ABC-1234"
      Then a new draft claim exists for policy "POL-1001" and vehicle "ABC-1234"

  @story-F1.2 @story-F1.3
  Rule: The insured's contact and payment details are captured

    Scenario: Entering insured and bank details
      Given Maya has started a draft claim for policy "POL-1001"
      When she enters her name "Maya Perera", postal address "12 Lake Road, Colombo", phone "0771234567", bank name "Peoples Bank", account number "000123456", and attaches a certified copy of the bank account page
      Then the draft claim shows those insured and bank details

  @story-F1.4
  Rule: Ownership details are captured when the vehicle is financed

    Scenario: Recording a financed vehicle's owner
      Given Maya has started a draft claim
      When she enters legal owner "Maya Perera" and finance institution "Peoples Leasing"
      Then the draft claim records the owner and the finance institution

  @story-F1.5
  Rule: Driver details, including the licence, are captured

    Scenario: Entering driver details
      Given Maya has started a draft claim
      When she enters driver "Kasun Perera", age "34", relationship "spouse", driving licence number "B1234567", and attaches a copy of the licence
      Then the draft claim records the driver's details and the licence copy

  @story-F1.6
  Rule: Accident details are captured

    Scenario: Describing the accident
      Given Maya has started a draft claim
      When she enters the accident date "2026-09-30", time "14:15", location "Galle Road, Colombo", police station "Colombo Fort", and describes what happened as "Rear-ended at a traffic light"
      Then the draft claim records the accident details she entered

  @story-F1.7
  Rule: The vehicle's usage at the time of the accident is captured

    Scenario: Recording the vehicle's usage
      Given Maya has started a draft claim
      When she selects "Private" as what the vehicle was being used for
      Then the draft claim records the usage as "Private"

  @story-F1.8
  Rule: Damage to goods carried is captured only when it happened

    Scenario: Recording damaged goods
      Given Maya has started a draft claim
      When she says goods were damaged and describes "Office laptop" worth "150000"
      Then the draft claim records that description and value

    @negative
    Scenario: No goods carried
      Given Maya has started a draft claim
      When she says no goods were damaged
      Then the draft claim records no goods-damage description or value

  @story-F1.9
  Rule: Passenger or driver injuries are captured only when they happened

    Scenario: Recording an injured passenger
      Given Maya has started a draft claim
      When she says a passenger was injured and gives their name "Nimal Silva", age "40", occupation "Teacher", and injury details "Fractured arm"
      Then the draft claim records the injured passenger's details

  @story-F1.10
  Rule: Third-party injuries are captured only when they happened

    Scenario: Recording a third party's injury
      Given Maya has started a draft claim
      When she says a third party was injured and gives their name "Ruwan Fernando", age "29", occupation "Driver", and injury details "Whiplash"
      Then the draft claim records the third party's injury details

  @story-F1.11
  Rule: Third-party property damage is captured only when it happened

    Scenario: Recording third-party property damage
      Given Maya has started a draft claim
      When she says a third party's property was damaged, describing "Garden wall", owner "Sunil Jayasuriya", and the other insurer "National Insurance, Policy NI-556"
      Then the draft claim records the third-party property damage details

  @story-F1.12
  Rule: Other insurance covering the same vehicle or goods is captured

    Scenario: Recording another policy
      Given Maya has started a draft claim
      When she says another policy covers the vehicle, naming "Union Assurance, Policy UA-889"
      Then the draft claim records the other insurance details

    @negative
    Scenario: No other insurance
      Given Maya has started a draft claim
      When she says no other policy covers the vehicle
      Then the draft claim records no other insurance details

  @story-F1.13
  Rule: A claim cannot be submitted without the claimant's declaration

    @negative
    Scenario: Submitting without the declaration
      Given Maya has filled in a draft claim but has not confirmed the declaration
      When she tries to submit the claim
      Then the claim is still a draft

    Scenario: Submitting with the declaration confirmed
      Given Maya has filled in a draft claim and confirmed the declaration
      When she submits the claim
      Then the claim's status becomes submitted

  @story-F1.14
  Rule: An incomplete claim can be saved and finished later

    Scenario: Saving a draft and resuming it
      Given Maya has started a claim for policy "POL-1003" but has not finished it
      When she saves it as a draft and later resumes that same draft
      Then she sees the details she had already entered

  @story-F1.15
  Rule: A submitted claim can no longer be changed by the claimant

    @negative
    Scenario: Trying to change a submitted claim
      Given Maya has submitted a claim for policy "POL-1004"
      When she tries to change a detail on that claim
      Then the claim's details remain as they were when it was submitted
