# Example: Referral System Feature Plan

## 1. Definitions (YAML)

- [MOD] `modules/referrals-api/models.yaml`
  - Add `Referral` model: `id, code, referrerId, refereeId, status, createdAt`.
- [NEW] `modules/referrals-api/api.yaml`
  - `POST /referrals/claim`: Claim a referral code.
  - `GET /referrals/me`: List my referrals.

## 2. Generate Code

- [EXEC] Run `nexical` to generate:
  - `modules/referrals-api/src/pages/api/referrals/claim.ts`
  - `modules/referrals-api/src/sdk/referrals-sdk.ts`
  - `modules/referrals-api/src/services/referral-service.ts` (Basic CRUD)

## 3. Implementation (Manual)

### Backend (API Module)

- [NEW] `modules/referrals-api/src/services/referral-service.ts`
  - **Authority**: Complex logic for validating codes and preventing self-referrals.
  - **Access**: Direct `db` access.
- [NEW] `modules/referrals-api/src/actions/claim-referral-action.ts`
  - **Orchestrator**: Check code (via Service), update user status (via Service), trigger rewards.
- [NEW] `modules/referrals-api/src/roles/referral-participant.ts`
  - RBAC policy for viewing personal referral data.
- [NEW] `modules/referrals-api/src/hooks/referral-hooks.ts`
  - Hook into `user.created` to auto-generate a referral code for new users.

### Frontend (UI Module)

- [NEW] `modules/referrals-ui/src/registry/dashboard-top/10-referral-banner.tsx`
  - Display the user's referral code on the dashboard.
- [NEW] `modules/referrals-ui/src/registry/settings-sections/50-referrals.tsx`
  - Detailed referral history in user settings.

## 4. Verification

- [NEW] `modules/referrals-api/tests/integration/referral-claim.test.ts`
  - Test successful claim, invalid code, and expired code scenarios.
