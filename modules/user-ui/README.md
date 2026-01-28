# User UI Module

The `user-ui` module provides the frontend interfaces for user management.

## Components
- **Login Form**: Standard credential login.
- **Register Form**: New user signup.
- **Profile Settings**: Interface for updating user details.

## Registry Injections
This module injects components into the App Shell:
- **User Menu**: Injected into `header-end` (Avatar dropdown).
- **Profile Link**: Injected into `nav-main`.

## Dependencies
- Depends on `user-api` for backend data.
