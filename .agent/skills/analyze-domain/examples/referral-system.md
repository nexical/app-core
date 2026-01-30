# Feature: Referral System

## Module Scope

- **Target Module**: `growth-api` (New Module)

## Data Model (`models.yaml`)

```yaml
config:
  test:
    roles:
      admin: { role: 'ADMIN' }
      authenticated: { role: 'MEMBER' }

models:
  ReferralCampaign:
    fields:
      id: { type: String, attributes: [' @id', ' @default(cuid())'] }
      name: { type: String }
      rewardAmount: { type: Int }
      status: { type: String }

  ReferralCode:
    fields:
      code: { type: String, attributes: [' @id'] }
      ownerId: { type: String }
      campaignId: { type: String }
      usageCount: { type: Int, attributes: [' @default(0)'] }

  ReferralLog:
    fields:
      id: { type: String, attributes: [' @id', ' @default(cuid())'] }
      codeId: { type: String }
      newUserId: { type: String }
      status: { type: String } # pending/verified
```

## Logic Layer

### Actions (Controllers)

- **`CreateCampaignGrowthAction`**:
  - **Logic**: Orchestrates `ReferralCampaignService.create` with business validation.
- **`GenerateCodeReferralAction`**:
  - **Logic**: Checks if user already has a code -> Generates unique code -> `ReferralCodeService.create`.
- **`RedeemReferralAction`**:
  - **Logic**: Validates referral code -> logs usage -> `ReferralLogService.create`.

### Services (System of Record - GENERATED)

- **`ReferralCampaignService`**: Standard CRUD.
- **`ReferralCodeService`**:
  - **Hooks**: `referralCode.beforeCreate` (Assign owner)
- **`ReferralLogService`**:
  - **Hooks**: `referralLog.afterCreate` (Dispatch verification event)

## API Specification (`api.yaml`)

- `POST /api/campaign/create`:
  - **Security**: `ApiGuard.protect(ctx, 'admin')`
  - **Handler**: `CreateCampaignGrowthAction`
- `GET /api/referral-code/my-code`:
  - **Security**: `ApiGuard.protect(ctx, 'member')`
  - **Handler**: `GenerateCodeReferralAction`
- `POST /api/referral/redeem`:
  - **Security**: `ApiGuard.protect(ctx, 'member')`
  - **Handler**: `RedeemReferralAction`

## Hooks (`src/hooks/`)

- **`GrowthHooks.init()`**: Registers all listeners.
- **Filters**: `campaign.read` (Mask sensitive details for non-admins)
- **Events**:
  - **Listener**: `user.created` -> Triggers `RedeemReferralAction`.
  - **Dispatcher**: `referral.verified` -> Triggered by `ReferralLogService`.

## Security (`src/roles/`)

- **`AdminPolicy`**: Required for campaign management.
- **`AuthenticatedPolicy`**: Basic user authentication check.
