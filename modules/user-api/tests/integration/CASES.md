# API Integration Test Cases: User Module

This module manages user identities, authentication, profiles, and administration. It provides endpoints for public registration, session management, administrative user oversight, self-management, and personal access tokens.

**Scope**:

- **Included**: Authentication (`login`, `logout`, `password/*`, `verify-email`), Registration, Invitation, User CRUD operations (`/api/users`), Profile management (`/api/users/me`), and Security settings (Sessions, Linked Accounts, Tokens).
- **Excluded**: OAuth callbacks, specific 3rd party provider logic.

## 0. Configuration & Prerequisites

Define the global system state required for these tests.

- **Database**: Cleaned and seeded via `Factory` before each test suite.
- **Roles**:
  - **Admin**: `role: "ADMIN"` (Full access).
  - **Employee**: `role: "EMPLOYEE"` (Standard user).
  - **Contractor**: `role: "CONTRACTOR"` (Limited user).
  - **Anonymous**: No session cookie.
- **System Config**: `AUTH_SECRET` must be set.
- **Factories**: `user` factory available with `hashPassword` utility.

---

## POST /api/login

**Description**: Authenticates a user using email/username and password, establishing a session.

### 1. Successful Login (Email)

**Goal**: Verify a user can log in with valid email credentials.
**Constraint**: None.

**Prerequisites (Factory Setup)**:

- User 'Alice' exists with password "password123".

**Request**:

- **Method**: `POST`
- **URL**: `/api/login`
- **Body**:
  ```json
  { "email": "alice@example.com", "password": "password123" }
  ```

**Expected Response**:

- **Status**: `200 OK`
- **Body**: `{ "success": true, "user": { "id": "...", "email": "alice@example.com" } }`
- **Headers**: `Set-Cookie` header present (session token).

**Side Effects**:

- **System State**: Subsequent requests with this cookie are authenticated.

### 2. Successful Login (Username)

**Goal**: Verify a user can log in using their username.

**Prerequisites**:

- User 'Bob' exists with username "builderbob" and password "password123".

**Request**:

- **Body**: `{ "email": "builderbob", "password": "password123" }`

**Expected Response**:

- **Status**: `200 OK`

### 3. Case Insensitive Email Login

**Goal**: Verify email login is case-insensitive.

**Prerequisites**:

- User exists with email "Alice@Example.com".

**Request**:

- **Body**: `{ "email": "alice@example.com", "password": "password123" }`

**Expected Response**:

- **Status**: `200 OK`

### 4. Invalid Credentials (Password)

**Goal**: Prevent login with incorrect password.

**Request**:

- **Body**: `{ "email": "alice@example.com", "password": "wrongpassword" }`

**Expected Response**:

- **Status**: `401 Unauthorized`
- **Body**: `{ "error": "Invalid credentials" }`

### 5. Login with Inactive Account

**Goal**: Prevent banned/inactive users from logging in.

**Prerequisites**:

- User 'BadActor' exists with `status: "INACTIVE"`.

**Request**:

- **Body**: `{ "email": "badactor@example.com", "password": "password123" }`

**Expected Response**:

- **Status**: `401 Unauthorized` (or 403 Forbidden).

---

## POST /api/logout

**Description**: Terminates the current session.

### 1. Successful Logout

**Goal**: Verify session cookie is cleared.

**Request**:

- **Method**: `POST`
- **URL**: `/api/logout`

**Expected Response**:

- **Status**: `200 OK`
- **Headers**: `Set-Cookie` clearing the session (expires in past).

---

## POST /api/auth/register

**Description**: Public endpoint for new users to create an account.

### 1. Successful Registration

**Goal**: Create a new user account with valid data.

**Request**:

- **Method**: `POST`
- **URL**: `/api/auth/register`
- **Body**:
  ```json
  {
    "email": "newuser@example.com",
    "username": "newuser",
    "name": "New User",
    "password": "StrongPassword123!",
    "confirmPassword": "StrongPassword123!"
  }
  ```

**Expected Response**:

- **Status**: `201 Created`
- **Body**: `{ "success": true, "userId": "...", "email": "..." }`

**Side Effects**:

- **Database**: User created. `role`="EMPLOYEE", `status`="ACTIVE".
- **Events**: `user.registered` dispatched.

### 2. Validation Failure - Duplicate Email

**Goal**: Prevent multiple accounts with the same email.

**Prerequisites**:

- User exists with email "existing@example.com".

**Request**:

- **Body**: `{ "email": "existing@example.com", ... }`

**Expected Response**:

- **Status**: `400 Bad Request`
- **Body**: `{ "error": "Email already exists" }`

### 3. Validation Failure - Duplicate Username

**Goal**: Prevent multiple accounts with the same username.

**Prerequisites**:

- User exists with username "taken_handle".

**Request**:

- **Body**: `{ "username": "taken_handle", ... }`

**Expected Response**:

- **Status**: `400 Bad Request`

### 4. Validation Failure - Password Mismatch

**Goal**: Ensure password and confirmation match.

**Request**:

- **Body**: `{ "password": "passA", "confirmPassword": "passB", ... }`

**Expected Response**:

- **Status**: `400 Bad Request`

### 5. XSS Prevention - Name Field

**Goal**: Ensure HTML in name field is sanitized or handled safely.

**Request**:

- **Body**: `{ "name": "<script>alert(1)</script>", ... }`

**Expected Response**:

- **Status**: `201 Created` (with sanitized input) OR `400`.

---

## POST /api/auth/invite

**Description**: Admin invites a new user via email.

### 1. Admin Send Invite

**Goal**: Admin invites a new employee.

**Prerequisites**:

- Caller is Admin.

**Request**:

- **Method**: `POST`
- **URL**: `/api/auth/invite`
- **Body**: `{ "email": "future@example.com", "role": "EMPLOYEE" }`

**Expected Response**:

- **Status**: `201 Created`

**Side Effects**:

- **Database**: `Invitation` record created.
- **Events**: `user.invited` dispatched.

### 2. Admin Invite with Custom Role

**Goal**: Admin invites a Contractor.

**Request**:

- **Body**: `{ "email": "contractor@example.com", "role": "CONTRACTOR" }`

**Expected Response**:

- **Status**: `201 Created`

### 3. Security - Non-Admin Invite

**Goal**: Prevent employees from inviting others.

**Prerequisites**:

- Caller is EMPLOYEE.

**Request**:

- **Body**: `{ "email": "rogue@example.com" }`

**Expected Response**:

- **Status**: `403 Forbidden`

### 4. Duplicate Invite (Already Member)

**Goal**: Prevent inviting an existing user.

**Prerequisites**:

- User 'Member' exists with email "member@example.com".

**Request**:

- **Body**: `{ "email": "member@example.com" }`

**Expected Response**:

- **Status**: `400 Bad Request`

---

## POST /api/auth/verify-email

**Description**: Verify a user's email address using a token.

### 1. Successful Verification

**Goal**: Verify a user's email.

**Prerequisites**:

- User exists with unverified email.
- Valid verification token exists for this user.

**Request**:

- **Method**: `POST`
- **URL**: `/api/auth/verify-email`
- **Body**: `{ "token": "valid_token" }`

**Expected Response**:

- **Status**: `200 OK` (or 201)
- **Body**: `{ "success": true }`

**Side Effects**:

- **Database**: User's `emailVerified` field is updated.
- **Events**: `auth.email.verified` dispatched.

### 2. Invalid Token

**Goal**: Prevent verification with invalid token.

**Request**:

- **Body**: `{ "token": "invalid_token" }`

**Expected Response**:

- **Status**: `400 Bad Request`

---

## POST /api/auth/password/request-reset

**Description**: Request a password reset link via email.

### 1. Request Reset - Existing User

**Goal**: User requests reset.

**Prerequisites**:

- User exists with email "forgot@example.com".

**Request**:

- **Method**: `POST`
- **URL**: `/api/auth/password/request-reset`
- **Body**: `{ "email": "forgot@example.com" }`

**Expected Response**:

- **Status**: `200 OK`

**Side Effects**:

- **Database**: `PasswordResetToken` created.
- **Email**: Reset email mock sent.

### 2. Request Reset - Non-Existent User

**Goal**: Prevent User Enumeration (Security).

**Request**:

- **Body**: `{ "email": "ghost@example.com" }`

**Expected Response**:

- **Status**: `200 OK` (Should pretend success).

---

## POST /api/auth/password/reset

**Description**: Reset password using a valid token.

### 1. Successful Password Reset

**Goal**: User sets a new password.

**Prerequisites**:

- Valid reset token exists.

**Request**:

- **Method**: `POST`
- **URL**: `/api/auth/password/reset`
- **Body**:
  ```json
  {
    "token": "valid_reset_token",
    "newPassword": "NewStrongPassword1!",
    "confirmPassword": "NewStrongPassword1!"
  }
  ```

**Expected Response**:

- **Status**: `200 OK`
- **Body**: `{ "success": true }`

**Side Effects**:

- **Database**: User password updated. Token consumed/deleted.

### 2. Password Mismatch

**Goal**: Prevent reset if passwords don't match.

**Request**:

- **Body**: `{ "token": "...", "newPassword": "A", "confirmPassword": "B" }`

**Expected Response**:

- **Status**: `400 Bad Request`

---

## GET /api/users

**Description**: Retrieve a paginated/filtered list of users. Admin only.

### 1. Admin List All Users

**Goal**: Admin retrieves user list.

**Prerequisites**:

- Caller is Admin.
- 5 users exist.

**Request**:

- **Method**: `GET`
- **URL**: `/api/users`

**Expected Response**:

- **Status**: `200 OK`
- **Body**: Array of users.

### 2. Search/Filter Users

**Goal**: Filter by name/email/role.

**Request**:

- **URL**: `/api/users?search=Zebra` or `/api/users?email=zebra@example.com`.

**Expected Response**:

- **Status**: `200 OK`
- **Body**: Array containing only matching users.

### 3. Security - Access Denied for Non-Admin

**Goal**: Prevent regular employees from listing users.

**Prerequisites**:

- Caller is `EMPLOYEE`.

**Request**:

- **URL**: `/api/users`

**Expected Response**:

- **Status**: `403 Forbidden`

---

## GET /api/users/[id]

**Description**: Get details of a specific user.

### 1. Admin View Any Profile

**Goal**: Admin inspects a user.

**Prerequisites**:

- Caller is Admin.
- Target is User B.

**Request**:

- **Method**: `GET`
- **URL**: `/api/users/[User B ID]`

**Expected Response**:

- **Status**: `200 OK`
- **Body**: User B details (including role, status).

### 2. Security - View Another User

**Goal**: Prevent unauthorized viewing.

**Prerequisites**:

- Caller is User A (Employee).
- Target is User B.

**Request**:

- **URL**: `/api/users/[User B ID]`

**Expected Response**:

- **Status**: `403 Forbidden`

### 3. View Non-Existent User

**Goal**: Handle Not Found.

**Prerequisites**:

- Caller is Admin.

**Request**:

- **URL**: `/api/users/non-existent-cuid`

**Expected Response**:

- **Status**: `404 Not Found`

---

## PUT /api/users/[id]

**Description**: Update user profile (Admin).

### 1. Admin Promotes User

**Goal**: Change user role.

**Prerequisites**:

- Caller is Admin.
- Target is User B (Employee).

**Request**:

- **Method**: `PUT`
- **URL**: `/api/users/[User B ID]`
- **Body**: `{ "role": "ADMIN" }`

**Expected Response**:

- **Status**: `200 OK`
- **Body**: `{ "success": true }`

**Side Effects**:

- **Database**: User B is ADMIN.

### 2. Admin Deactivates User

**Goal**: Ban a user.

**Request**:

- **Body**: `{ "status": "INACTIVE" }`

**Expected Response**:

- **Status**: `200 OK`

### 3. Security - Employee Updating Others

**Goal**: Prevent unauthorized updates.

**Prerequisites**:

- Caller is User A.
- Target is User B.

**Request**:

- **Body**: `{ "name": "Hacked" }`

**Expected Response**:

- **Status**: `403 Forbidden`

---

## DELETE /api/users/[id]

**Description**: Delete a user.

### 1. Admin Delete User

**Goal**: Admin removes a user.

**Prerequisites**:

- Caller is Admin.
- Target is User B.

**Request**:

- **Method**: `DELETE`
- **URL**: `/api/users/[User B ID]`

**Expected Response**:

- **Status**: `200 OK`

**Side Effects**:

- **Database**: User B deleted.

### 2. Security - Self Deletion

**Goal**: Verify if user can delete themselves via admin endpoint.

**Prerequisites**:

- Caller is User A (Employee).

**Request**:

- **URL**: `/api/users/[User A ID]`

**Expected Response**:

- **Status**: `403 Forbidden`

---

## GET /api/users/me

**Description**: Get current user's profile.

### 1. Get Own Profile

**Goal**: Retrieve session user data.

**Prerequisites**:

- Caller is User A.

**Request**:

- **Method**: `GET`
- **URL**: `/api/users/me`

**Expected Response**:

- **Status**: `200 OK`
- **Body**: User A details.

### 2. Unauthenticated Access

**Goal**: Ensure route is protected.

**Prerequisites**:

- Caller is Anonymous.

**Request**:

- **URL**: `/api/users/me`

**Expected Response**:

- **Status**: `401 Unauthorized`

---

## PUT /api/users/me

**Description**: Update current user's profile.

### 1. Update Own Name

**Goal**: User changes their display name.

**Prerequisites**:

- Caller is User A.

**Request**:

- **Method**: `PUT`
- **URL**: `/api/users/me`
- **Body**: `{ "name": "New Name" }`

**Expected Response**:

- **Status**: `200 OK`

**Side Effects**:

- **Database**: Name updated.

### 2. Security - Privilege Escalation

**Goal**: User tries to make themselves ADMIN via self-update.

**Request**:

- **Body**: `{ "role": "ADMIN" }`

**Expected Response**:

- **Status**: `403 Forbidden` (or 200 but role ignored/filtered out).

### 3. Security - Update Email to Existing

**Goal**: Prevent claiming another user's email.

**Prerequisites**:

- User B exists with "b@example.com".

**Request**:

- **Body**: `{ "email": "b@example.com" }`

**Expected Response**:

- **Status**: `400 Bad Request`

---

## GET /api/users/me/accounts

**Description**: List linked external accounts (e.g., OAuth).

### 1. List Accounts

**Goal**: Retrieve linked accounts.

**Prerequisites**:

- Caller is User A.
- User A has linked Google account.

**Request**:

- **Method**: `GET`
- **URL**: `/api/users/me/accounts`

**Expected Response**:

- **Status**: `200 OK`
- **Body**: List containing the Google account details.

---

## GET /api/users/me/sessions

**Description**: List active sessions for the current user.

### 1. List Sessions

**Goal**: See where else I am logged in.

**Prerequisites**:

- Caller is User A.

**Request**:

- **Method**: `GET`
- **URL**: `/api/users/me/sessions`

**Expected Response**:

- **Status**: `200 OK`
- **Body**: List of sessions (including current one).

### 2. Filter Sessions

**Goal**: Filter sessions by IP or User Agent.

**Request**:

- **URL**: `/api/users/me/sessions?ipAddress=127.0.0.1`

**Expected Response**:

- **Status**: `200 OK`
- **Body**: Filtered list.

---

## GET /api/users/me/tokens

**Description**: List Personal Access Tokens (PATs).

### 1. List Tokens

**Goal**: Retrieve created PATs.

**Prerequisites**:

- Caller is User A.
- User A has created a token "CI/CD".

**Request**:

- **Method**: `GET`
- **URL**: `/api/users/me/tokens`

**Expected Response**:

- **Status**: `200 OK`
- **Body**: List containing "CI/CD" token.

---

## POST /api/users/me/tokens

**Description**: Create a new Personal Access Token.

### 1. Create Token

**Goal**: Generate a new API key.

**Prerequisites**:

- Caller is User A.

**Request**:

- **Method**: `POST`
- **URL**: `/api/users/me/tokens`
- **Body**: `{ "name": "New Token" }`

**Expected Response**:

- **Status**: `201 Created`
- **Body**: `{ "token": { "id": "...", "name": "New Token" }, "rawKey": "..." }`

**Side Effects**:

- **Database**: Token created.
- **Security**: `rawKey` matches expected format.

### 2. Missing Name

**Goal**: Validate input.

**Request**:

- **Body**: `{}`

**Expected Response**:

- **Status**: `400 Bad Request`
