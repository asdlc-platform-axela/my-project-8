# Product-wide

Rules that apply to more than one feature.

## Requirements

- P1 Every claimant signs in via the organization's single sign-on before using the app. Applies to: all. \[org default\]

## Decisions

- Single actor: the claimant. No insurer-staff or admin features in this build.
- Login is direct, with no email-based verification step for signing in.

