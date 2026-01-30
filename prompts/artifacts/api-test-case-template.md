# API Integration Test Cases: [Module Name]

[Brief Description: 1-2 sentences summarizing what this module's API capabilities are.]

**Scope**:

- **Included**: [List specific API endpoints, resources, and methods covered.]
- **Excluded**: [Explicitly list related APIs handled elsewhere.]

## 0. Configuration & Prerequisites

[Define any global system states, environment variables, or database seeds required before testing these endpoints.]

- **[Mode/State A]**: [e.g., "Public Registration Open" - impacts /register endpoint]
- **[Mode/State B]**: [e.g., "Invite Only" - impacts /register endpoint]
- **Roles**: [List relevant user roles with distinct API permissions (e.g., "Owner", "Member", "Anonymous")]

---

## [Endpoint Method] [Endpoint Path]

**Description**: [Brief summary of what this endpoint does]

### 1. [Scenario Name e.g., Successful Creation]

**Goal**: [One sentence objective, e.g., "Create a new team via API"]
**Constraint**: [Any blocking rules, e.g., "Requires arbitrary authentication"]

**Prerequisites (Factory Setup)**:

- [e.g., User 'Alice' exists]
- [e.g., Team 'Alpha' exists]

**Request**:

- **Method**: `POST`
- **URL**: `/api/teams`
- **Headers**: `Cookie: session=alice_session`
- **Body**:
  ```json
  { "name": "Beta Team" }
  ```

**Expected Response**:

- **Status**: `201 Created`
- **Body**: Contains `{ "id": "...", "name": "Beta Team" }`

**Side Effects (Verification)**:

- **Database**: [e.g., New Team record found in DB with name "Beta Team"]
- **System State**: [e.g., User 'Alice' is marked as OWNER of new team]
- **Emails**: [e.g., 'Welcome' email sent to user]

---

### 2. [Scenario Name e.g., Validation Failure - Missing Name]

**Goal**: Verify error handling for invalid input.
**Constraint**: Validation rules.

**Request**:
...

**Expected Response**:

- **Status**: `400 Bad Request`
- **Body**: `{ "error": "Name is required" }`

**Side Effects (Verification)**:

- **System State**: Ensure NO new team was created.

---
