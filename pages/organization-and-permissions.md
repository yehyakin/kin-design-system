# Organization and permissions page

Status: normative

Use this page family for members, invitations, roles, groups, service accounts, ownership, domains, and organization-wide access policy.

## User job

Understand who has access, through which role or group, what will change, and how to reverse or review a sensitive permission action.

## Contract

- Members, pending invitations, groups, service accounts, and external guests remain distinguishable.
- Invitation rows identify recipient, inviter, proposed role, created time, expiry, delivery state, and resend or cancel action.
- Role changes show current and proposed scope, inherited access, downstream effect, and whether recent authentication or another approver is required.
- Removing a member states ownership transfer, active sessions, assigned work, retained history, and integration impact where applicable.
- The current user and final owner MUST NOT be removed through an ambiguous generic action.
- Client-side role visibility MUST NOT replace server authorization.
- Failed invitations and partial role changes remain visible with retry or rollback.
- Seat or quota effects appear only when the product actually enforces them.

## Candidate gap

KIN still requires a runnable member/invitation reference, role-change review, ownership transfer, narrow-screen behavior, and automated permission-state checks.
