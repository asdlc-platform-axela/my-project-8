# Motor Claim Portal

## Problem Statement

A policyholder reporting a vehicle accident today fills in a long paper claim form by hand, gathers certified copies of supporting documents, and mails or hand-delivers the whole packet to the insurer within a 14-day deadline. There is no way for the policyholder to submit the form online or to check, afterwards, what they already sent in.

## Solution

A single web app where a signed-in policyholder fills in the motor claim form online — insured, driver, accident, usage and third-party details — attaches the required documents, submits the claim (receiving an email confirmation), and sees every claim they have submitted on a simple dashboard.

## Actors

- Claimant — the policyholder (or the insured vehicle's owner) who signs in, submits motor claims, and views their own submission history. This build has no other actor: nobody at the insurer processes claims inside this app.

## Features

- F1 [Submit Motor Claim](features/F1-submit-motor-claim.md)
- F2 [My Claims Dashboard](features/F2-my-claims-dashboard.md)

## Product-wide

Cross-cutting rules — sign-in — are in [Product-wide](product-wide.md).

## Out of Scope

- Claims processing, review, or approval by insurer staff — no staff-facing screens in this app.
- The Letter of Indemnity and Discharge Receipt — settlement-stage documents the insurer handles once a claim is approved, outside this self-service submission.
- Payment or settlement processing.

