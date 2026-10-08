Feature: F2 My Claims Dashboard

  @story-F2.1
  Rule: Submitted claims are listed together, each with its date

    Scenario: Viewing submitted claims
      Given Maya has submitted claims for policies "POL-1002" and "POL-1005"
      When she opens her claims dashboard
      Then she sees both submitted claims listed with the date each was submitted, newest first

  @story-F2.2
  Rule: Draft claims are listed separately from submitted claims

    Scenario: Viewing drafts apart from submitted claims
      Given Maya has a draft claim for policy "POL-1006" and a submitted claim for policy "POL-1002"
      When she opens her claims dashboard
      Then the draft for "POL-1006" appears in a different list than the submitted claim for "POL-1002"

  @story-F2.3
  Rule: A draft claim can be resumed from the dashboard

    Scenario: Resuming a draft from the dashboard
      Given Maya has a draft claim for policy "POL-1006"
      When she opens that draft from her dashboard
      Then she can continue filling it in from where she left off

  @story-F2.4
  Rule: A submitted claim's full details can be reviewed, read-only

    Scenario: Reviewing a submitted claim
      Given Maya has submitted a claim for policy "POL-1002"
      When she opens that claim from her dashboard
      Then she sees every detail she submitted and no control lets her change it
