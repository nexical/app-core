# Module Specification: user-api

## 1. Overview

The `user-api` module is the foundational Identity and Access Management (IAM) service for the Nexical Ecosystem. It provides a robust, API-first backend for user authentication, profile management, and administrative oversight. Designed for maximum flexibility, it supports multiple registration modes, session-based auth, and Personal Access Tokens (PATs) for programmatic access.

The module is strictly backend-only, ensuring it can serve various frontend consumers (web, mobile, CLI). It leverages an event-driven architecture via the `HookSystem` for side effects like password hashing and transactional emails.

## 2. User Stories

### Authentication & Registration

- [ ] **Public Registration**: Guests can create accounts with email/username when `userMode` is `PUBLIC`.
- [ ] **Invite-Only Flow**: Users can register via secure tokens sent by admins, bypassing public restrictions.
- [ ] **Secure Login**: Users can authenticate via credentials to establish a secure session.
- [ ] **Password Recovery**: Users can request a reset link, validate a recovery token, and securely update their password.
- [ ] **Email Verification**: The system ensures email validity via verification tokens dispatched upon registration.

### Identity Management

- [ ] **Profile Self-Service**: Users can update their display name, username, and profile image.
- [ ] **Credential Management**: Users can update their passwords or manage their linked accounts (for future Social Login).
- [ ] **Account Deletion**: Users can request the permanent removal of their account and associated data.

### Programmatic & Security Control

- [ ] **Personal Access Tokens (PATs)**: Users can generate, list, and revoke prefixed tokens (`ne_pat_`) for CLI or API integrations.
- [ ] **Session Management**: Users can view active sessions and revoke specific ones to secure their account.

### Administration

- [ ] **User Oversight**: Admins can list, filter, and search through all users in the system.
- [ ] **Access Control**: Admins can promote/demote users (RBAC) and update user statuses (Active, Inactive, Banned).
- [ ] **Invitations**: Admins can invite new members to the system with predefined roles.

## 3. Architecture

- **Patterns**:
  - **Service Layer**: Business logic is encapsulated in Services (e.g., `UserService`, `AuthService`) to remain independent of the transport layer.
  - **Action Pattern**: Manual API logic is implemented in `actions/` for high-level orchestration.
  - **Event-Driven Hooks**: Uses `HookSystem` for `beforeCreate` (hashing), `afterCreate` (emails), and `filter` (data sanitization).
  - **PAT Auth**: A dedicated middleware handles Bearer tokens prefixed with `ne_pat_`.
- **Segmentation Strategy**: While not multi-tenant, the data model includes `userId` on resources to support future team-based segmentation and resource ownership checks.
- **Dependencies**: This is a leaf module in the core but is consumed by `user-ui`.

## 4. Data Model (models.yaml)

- `User`
  - `id`: String (CUID, PK)
  - `username`: String (Unique, Optional)
  - `email`: String (Unique, Optional)
  - `password`: String (Private)
  - `role`: SiteRole (ADMIN, EMPLOYEE, CONTRACTOR)
  - `status`: UserStatus (ACTIVE, INACTIVE, BANNED)
  - `emailVerified`: DateTime
- `PersonalAccessToken`
  - `name`: String
  - `hashedKey`: String (SHA-256)
  - `prefix`: String (`ne_pat_`)
  - `userId`: String (FK to User)
- `Account` (Future Social Login)
  - `provider`: String
  - `providerAccountId`: String
- `Invitation`
  - `email`: String
  - `token`: String (Unique)
  - `role`: SiteRole
- `VerificationToken` / `PasswordResetToken`
  - `identifier/email`: String
  - `token`: String
  - `expires`: DateTime

## 5. API Interface (api.yaml)

### Auth Surface

- `POST /register`: Account creation.
- `POST /login`: Session establishment.
- `POST /logout`: Session termination.
- `POST /verify-email`: Token-based verification.
- `POST /password/request-reset`: Initiation of recovery.
- `POST /password/reset`: Finalization of recovery.

### User Surface

- `GET /me`: Retrieve current profile.
- `PUT /me`: Update own profile.
- `DELETE /me`: Self-deletion.
- `GET /me/tokens`: List PATs.
- `POST /me/tokens`: Create new PAT.
- `DELETE /me/tokens/[id]`: Revoke PAT.

### Admin Surface (Generated CRUD)

- `GET /user`: List/Search users.
- `GET /user/[id]`: View specific user.
- `PUT /user/[id]`: Administrative update (Role/Status).
- `DELETE /user/[id]`: Administrative deletion.
- `POST /invite`: Send invitation.

## 6. Security & Permissions

- **RBAC Policy**:
  - `ADMIN`: Full CRUD on all users and invitations.
  - `EMPLOYEE`: Access to `/me` and standard profile features.
  - `CONTRACTOR`: Read-only access to own profile.
  - `anonymous`: Access to login, registration, and recovery flows.
- **Protection**: All routes are protected by `ApiGuard` using role-based policies (`IsMember`, `IsAdmin`, `IsMyself`).
- **Validation**: Strict Zod validation on all input DTOs.
