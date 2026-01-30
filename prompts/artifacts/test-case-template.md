# [Feature Name] Workflows & E2E Testing Strategy

[Brief Description: 1-2 sentences summarizing what this module allows the user to do.]

**Scope**:

- **Included**: [List the specific features, pages, and actions covered in this document.]
- **Excluded**: [Explicitly list related features that are handled in other test files to avoid overlap.]

## 0. Configuration & Prerequisites

[Define any global system states, environment variables, or database seeds required before testing these workflows.]

- **[Mode/State A]**: [Description of how the feature behaves in this state (e.g., "Public Registration Open")]
- **[Mode/State B]**: [Description of how the feature behaves in this state (e.g., "Invite Only")]
- **Roles**: [List relevant user roles that have distinct permissions here (e.g., "Owner vs Member")]

## 1. [Major Workflow Category]

### 1.1 [Action Name]

**Goal**: [The primary objective of the user (e.g., "Create a new Team")]
**Constraint**: [Blocking rules (e.g., "Requires 'Pro' License" or "User must be logged in")]

**Scenario A: [Standard / Happy Path]**
**Steps**:

1.  [Step 1: Navigation or Trigger]
2.  [Step 2: User Input Details]
3.  [Step 3: Submission]
    **Outcomes**:

- **Success**: [Observable results: Database change, Redirect URL, UI Toast Message, Email sent]
- **Failure**: [Expected error states: Validation messages, Forbidden access]

**Scenario B: [Alternate Flow / Edge Case]**
**Constraint**: [Specific condition (e.g., "User is already in max teams")]
**Steps**:

1.  [Step 1]
2.  [Step 2]
    **Outcomes**:

- **Success**: [If applicable]
- **Failure**: [Specific error message displayed]
- **System State**: [Ensure no partial data was written]

### 1.2 [Next Action Name]

...

## 2. [Next Major Workflow Category]

...
