# User API Module

The `user-api` module manages the core user identity, authentication, and profile data in the Nexical Ecosystem.

## Features

- **Authentication**: Registration, Login, and Password Reset flows.
- **User Management**: Profile updates and role management (RBAC).
- **Session Handling**: Secure session management integration.

## API Endpoints

This module provides the following backend operations:

- `POST /api/auth/login`: Authenticate a user.
- `POST /api/auth/register`: Create a new account.
- `GET /api/user/me`: Retrieve current user profile.

## Usage

This module is typically consumed by the `user-ui` module for frontend interactions.
