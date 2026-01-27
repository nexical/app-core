# User Module Workflows & E2E Testing Strategy

This module handles the core identity and access management for the application. It includes authentication (login/register), profile management, security settings (passwords, tokens), and administrative user control.

**Scope**:
* **Included**: Registration, Login, Logout, Password Recovery, Profile Updates (Name, Email, Password), API Token Management, Session Management, Admin User Management (Invite, Promote, Deactivate).
* **Excluded**: Team management, Billing/Subscriptions, Application-specific logic (e.g., Landing page content).

## 0. Configuration & Prerequisites

* **Database**: Clean state with seeded roles (ADMIN, EMPLOYEE) or specific user fixtures.
* **Environment Variables**: `AUTH_SECRET`, `EMAIL_FROM`, `PUBLIC_SITE_URL`.
* **[Mode: Public Registration]**: `userConfig.userMode` allows open registration.
* **[Mode: Invite Only]**: `userConfig.userMode` restricted (ADMIN mode) where registration requires a token.
* **[Mode: Single User]**: `userConfig.userMode = SINGLE` (Registration disabled).
* **Roles**:
    * **Admin**: Full access to system-wide user management.
    * **User (Employee)**: Access to own profile and standard features.
    * **Banned/Inactive**: User exists but cannot log in.

## 1. Authentication

### 1.1 User Registration (Public Mode)
**Goal**: Create a new account without an invitation.
**Constraint**: `userConfig.userMode` permits public registration.

**Scenario A: Standard Registration**
**Steps**:
1.  Navigate to `/register`.
2.  Enter valid Email, Username, Password, and Confirm Password.
3.  Submit form.
**Outcomes**:
* **Success**: User created in DB with `ACTIVE` status. Redirect to Dashboard or "Verify Email" page. `user.registered` hook dispatched.
* **System State**: Verification email sent (mocked).

**Scenario B: Registration Validation Failures**
**Constraint**: Invalid inputs.
**Steps**:
1.  Navigate to `/register`.
2.  Attempt submitting with:
    *   Mismatched passwords.
    *   Existing email.
    *   Existing username.
    *   Weak password (if policy exists).
**Outcomes**:
* **Failure**: Form validation errors displayed inline. No DB record created.

**Scenario C: Registration Disabled (Single/Invite Mode)**
**Constraint**: System configured to block public sign-ups.
**Steps**:
1.  Navigate to `/register`.
2.  Attempt to submit valid details.
**Outcomes**:
* **Failure**: Error message "Registration restricted" or similar.

### 1.2 User Registration (Invite Flow)
**Goal**: Register using a secure invitation link.
**Constraint**: Valid `Invitation` record exists in DB.

**Scenario A: Valid Invitation**
**Steps**:
1.  Navigate to `/register?token=[VALID_TOKEN]`.
2.  Fill out registration form (Email should be pre-filled or locked).
3.  Submit.
**Outcomes**:
* **Success**: Account created with role specified in Invitation. Invitation record deleted. Auto-verified email (optional but common).

**Scenario B: Expired/Invalid Token**
**Steps**:
1.  Navigate to `/register?token=[EXPIRED_OR_INVALID]`.
**Outcomes**:
* **Failure**: Error message "Invalid or expired invitation". User cannot proceed with that token.

### 1.3 Login & Session
**Goal**: Authenticate and establish a session.

**Scenario A: Standard Login (Credentials)**
**Steps**:
1.  Navigate to `/login`.
2.  Enter valid Email/Username and Password.
3.  Submit.
**Outcomes**:
* **Success**: Redirect to App Home. Session created in DB. `user.login` hook dispatched.

**Scenario B: Login as Inactive User**
**Constraint**: User exists but `status = INACTIVE`.
**Steps**:
1.  Attempt login with correct credentials.
**Outcomes**:
* **Failure**: Access denied. Generic error or "Account deactivated".

**Scenario C: Invalid Credentials**
**Steps**:
1.  Attempt login with wrong password or non-existent user.
**Outcomes**:
* **Failure**: Generic "Invalid credentials" error. No info leakage (e.g., "User not found").

### 1.4 Password Recovery
**Goal**: Reset access when password is forgotten.

**Scenario A: Request Reset Link**
**Steps**:
1.  Navigate to `/forgot-password`.
2.  Enter registered email.
3.  Submit.
**Outcomes**:
* **Success**: UI confirms "If account exists, email sent". `PasswordResetToken` created in DB. Email sent.

**Scenario B: Complete Reset**
**Constraint**: Valid reset token.
**Steps**:
1.  Navigate to `/reset-password/[TOKEN]`.
2.  Enter new password and confirmation.
3.  Submit.
**Outcomes**:
* **Success**: Password updated in DB. Token consumed/deleted. User can login with new password.

**Scenario C: Invalid/Expired Link**
**Steps**:
1.  Navigate to `/reset-password/[BAD_TOKEN]`.
**Outcomes**:
* **Failure**: Error message indicating link is invalid.

## 2. Profile & Security Management

### 2.1 Update Profile
**Goal**: User updates their own information.

**Scenario A: Update Basic Info**
**Steps**:
1.  Navigate to Settings (via UI or API call to `/api/users/me`).
2.  Change Name and Username.
3.  Submit.
**Outcomes**:
* **Success**: Data updated in DB. UI reflects changes. `user.profile.updated` hook dispatched.

**Scenario B: Update Password**
**Steps**:
1.  Navigate to Security Settings.
2.  Enter New Password.
3.  Submit.
**Outcomes**:
* **Success**: Password hash updated in DB. `passwordUpdatedAt` timestamp refreshed.

**Scenario C: Email Change Conflict**
**Steps**:
1.  Try to update email to one that belongs to another user.
**Outcomes**:
* **Failure**: Validation error "Email already in use".

### 2.2 Manage Sessions
**Goal**: Review and revoke active sessions.

**Scenario A: List Sessions**
**Steps**:
1.  Fetch sessions from `/api/users/me/sessions`.
**Outcomes**:
* **Success**: Returns list of active sessions (IP, User Agent, Last Active).

**Scenario B: Revoke Session**
**Steps**:
1.  Request deletion of a specific session ID (not current).
**Outcomes**:
* **Success**: Session record removed from DB. Target client forced to re-login.

### 2.3 API Tokens
**Goal**: Create/Delete Personal Access Tokens.

**Scenario A: Create Token**
**Steps**:
1.  Navigate to Token Settings.
2.  Create new token with name "Test Token".
**Outcomes**:
* **Success**: Token secret displayed ONCE. Hashed version stored in DB.

**Scenario B: Delete Token**
**Steps**:
1.  Revoke an existing token.
**Outcomes**:
* **Success**: Token removed from DB. API calls using that token immediately fail (401).

## 3. Admin User Management

### 3.1 User List & Filters
**Goal**: Admin views all users in system.
**Constraint**: Actor has `ADMIN` role.

**Scenario A: View All Users**
**Steps**:
1.  Navigate to Admin Users page (`/admin/users`).
**Outcomes**:
* **Success**: List displayed with Name, Email, Role, Status.

**Scenario B: Unauthorized Access**
**Constraint**: Actor is `EMPLOYEE`.
**Steps**:
1.  Attempt to access `/admin/users` or fetch `UserService.getAllUsers`.
**Outcomes**:
* **Failure**: 403 Forbidden or Redirect to home.

### 3.2 Invite User
**Goal**: Admin invites a new member.

**Scenario A: Send Invitation**
**Steps**:
1.  Admin triggers Invite action.
2.  Enters Email and Role (e.g., ADMIN).
3.  Submits.
**Outcomes**:
* **Success**: `Invitation` record created. Email sent to target.
* **Failure**: Error if email already belongs to a registered user.

### 3.3 Manage User State
**Goal**: Control access for existing users.

**Scenario A: Deactivate User**
**Steps**:
1.  Admin selects "Deactivate" for a specific user.
**Outcomes**:
* **Success**: User status becomes `INACTIVE`. All User Sessions deleted (immediate logout).

**Scenario B: Promote User**
**Steps**:
1.  Admin changes user role from EMPLOYEE to ADMIN.
**Outcomes**:
* **Success**: DB role updated. User gains admin privileges.

**Scenario C: Delete User**
**Steps**:
1.  Admin selects "Delete" for a user.
**Outcomes**:
* **Success**: User record and all associated data (accounts, sessions) removed.