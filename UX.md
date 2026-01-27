# UX Implementation Specification

This document defines the UX/UI contract for all pages identified in `UI.md`.

---

# Module: User UI (`modules/user-ui`)

## Page: Login

### 1. Meta Information
* **Target Route:** `/login`
* **Shell:** `AuthShell`
* **Access Control:** `PageGuard.protect(Astro, "anonymous")`
* **Module Context:** `modules/user-ui`

### 2. Visual Structure (Text Wireframe)
```
[ Centered Layout ]
+-------------------------------------------------------+
| [ LoginForm ]                                         |
+-------------------------------------------------------+
```

### 3. Component Composition
#### A. Registry Components
* *None active in `AuthShell` context.*

#### B. Feature Components (Used as Registry)
* **`LoginForm`**:
    * **Visual**: Card with "Sign In" header, Email/Pass inputs.
    * **Interactivity**: Client-side validation, error toasts.

### 4. Data & State Contract
* **Write**: `api.user.auth.login({ email, password })`.

---

## Page: Register

### 1. Meta Information
* **Target Route:** `/register`
* **Shell:** `AuthShell`
* **Access Control:** `PageGuard.protect(Astro, "anonymous")`
* **Module Context:** `modules/user-ui`

### 2. Visual Structure (Text Wireframe)
```
[ Centered Layout ]
+-------------------------------------------------------+
| [ RegisterForm ]                                      |
+-------------------------------------------------------+
```

### 3. Component Composition
#### A. Registry Components
* *None active in `AuthShell` context.*

#### B. Feature Components
* **`RegisterForm`**: Registration form.

### 4. Data & State Contract
* **Write**: `api.user.auth.register({ name, email, password })`.

---

## Page: Profile Settings

### 1. Meta Information
* **Target Route:** `/settings/profile`
* **Shell:** `MasterShell`
* **Access Control:** `PageGuard.protect(Astro, "member")`
* **Module Context:** `modules/user-ui`

### 2. Visual Structure (Text Wireframe)
```
[ Header (Shell Provided) ]              [ Zone: Header-End ]
|                                        [ UserMenu ]
+-------------------------------------------------------+
| [ Zone: Nav-Main (Sidebar) ] | [ Zone: Main-Content ] |
| [ UserMenu ]                 | [ Header: Profile ]    |
| ...                          | [ ProfileForm ]        |
|                              | [ PasswordForm ]       |
+-------------------------------------------------------+
| [ Zone: Mobile-Bottom ]                               |
| [ ThemeToggle ] [ UserMenu ]                          |
+-------------------------------------------------------+
| [ Zone: Details-Panel (Right) ]                       |
| [ UserProfileForm (Registry Component) ]              |
+-------------------------------------------------------+
```

### 3. Component Composition
#### A. Registry Components
* **`Details-Panel` / `UserProfileForm`** (`user-ui`):
    * **Visual**: Form with "Identity" and "Security" sections, Profile Avatar.
    * **Inputs**: Name, Email (Read-only if SSO), New Password, Confirm Password.
    * **Danger Zone**: Delete Account button (if public mode).
* **`Header-End` / `UserMenu`** (`user-ui`): Avatar with dropdown.
* **`Mobile-Bottom` / `ThemeToggle` & `UserMenu`** (`user-ui`): Mobile controls.

#### B. Feature Components
* **`ProfileForm`**: Update name/email (Feature version).
* **`PasswordForm`**: Change password (Feature version).

### 4. Data & State Contract
* **Read**: `api.user.getMe()`.
* **Write**: `api.user.profile.update()`, `api.user.auth.changePassword()`.

---

## Page: Personal Access Tokens

### 1. Meta Information
* **Target Route:** `/settings/tokens`
* **Shell:** `MasterShell`
* **Access Control:** `PageGuard.protect(Astro, "member")`
* **Module Context:** `modules/user-ui`

### 2. Visual Structure (Text Wireframe)
```
[ Header (Shell Provided) ]              [ Zone: Header-End ]
|                                        [ UserMenu ]
+-------------------------------------------------------+
| [ Zone: Nav-Main (Sidebar) ] | [ Zone: Main-Content ] |
| [ UserMenu ]                 | [ Header: Tokens ]     |
| ...                          | [ TokenList ]          |
+-------------------------------------------------------+
| [ Zone: Mobile-Bottom ]                               |
| [ ThemeToggle ] [ UserMenu ]                          |
+-------------------------------------------------------+
| [ Zone: Details-Panel (Right) ]                       |
| [ TokenManagement (Registry Component) ]              |
+-------------------------------------------------------+
```

### 3. Component Composition
#### A. Registry Components
* **`Details-Panel` / `TokenManagement`** (`user-ui`):
    * **Visual**: Wrapper around `TokenList`.
    * **Props**: `i18nData`.
* **`Header-End` / `UserMenu`** (`user-ui`): Avatar with dropdown.
* **`Mobile-Bottom` / `ThemeToggle` & `UserMenu`** (`user-ui`): Mobile controls.

#### B. Feature Components
* **`TokenList`**: Manage personal API keys.

### 4. Data & State Contract
* **Read**: `api.user.token.list()`.
* **Write**: `api.user.token.create()`, `delete()`.

---

## Page: Admin Users

### 1. Meta Information
* **Target Route:** `/admin/users`
* **Shell:** `MasterShell`
* **Access Control:** `PageGuard.protect(Astro, "admin")`
* **Module Context:** `modules/user-ui`

### 2. Visual Structure (Text Wireframe)
```
[ Header (Shell Provided) ]              [ Zone: Header-End ]
|                                        [ UserMenu ]
+-------------------------------------------------------+
| [ Zone: Nav-Main (Sidebar) ] | [ Zone: Main-Content ] |
| [ AdminNav ]                 | [ AdminUserManagement ]|
+-------------------------------------------------------+
| [ Zone: Mobile-Bottom ]                               |
| [ ThemeToggle ] [ UserMenu ]                          |
+-------------------------------------------------------+
| [ Zone: Details-Panel (Right) ]                       |
| [ Contextual: UserDetails / Impersonate ]             |
+-------------------------------------------------------+
```

### 3. Component Composition
#### A. Registry Components
* **`Header-End` / `UserMenu`** (`user-ui`): Avatar with dropdown.
* **`Mobile-Bottom` / `ThemeToggle` & `UserMenu`** (`user-ui`): Mobile controls.

#### B. Feature Components
* **`AdminUserManagement`**: Full CRUD for users.

### 4. Data & State Contract
* **Read**: `api.user.admin.listUsers()`.
* **Write**: `api.user.admin.updateUserRole()`, `deleteUser()`.
