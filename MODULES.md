# ArcNexus Modular Extension Guide

Welcome to the ArcNexus Plug-in System. This guide is designed to help you build powerful, self-contained modules that extend every layer of the platform.

If you are coming from a framework like Next.js or a traditional monolithic architecture, this system might feel different. In those worlds, you usually have "one place" for everything—one `pages` folder, one `components` folder, and one `schema.prisma`. While that is simple to start, it becomes a bottleneck as the application grows. Features become potential "spaghetti code," tightly coupled to the core.

ArcNexus takes a different approach. It uses **Astro's** unique build-time capabilities to create a fully **Modular Monolith**. This means you develop features in completely isolated "Modules" (folders), but when you build the app, they are chemically bonded into a single, high-performance application. There is no runtime performance penalty; the modularity creates a better Developer Experience (DX) and a more maintainable codebase.

---

## 1. UI Modularization (The Registry)

### The Problem it Solves

In a standard React/Next.js app, if you want to add a link to the sidebar or a widget to the dashboard, you have to find the `Sidebar.tsx` or `Dashboard.tsx` file and manually edit it. This means `Sidebar.tsx` eventually becomes a massive file importing components from 20 different features. It becomes a central point of failure and merge conflicts.

### The ArcNexus Solution

We invert this dependency using a **Registry System**. Think of the Sidebar not as a hardcoded list of links, but as an empty "magnetic board." Modules can "pin" their own components to this board from a distance.

When you create a module (e.g., `modules/crm`), you simply place a file in `src/registry/nav-main/`. The core application, unaware of what "CRM" is, scans the registry at runtime and renders whatever it finds. This means you can delete the entire `modules/crm` folder, and the link disappears from the sidebar automatically—no dead code, no broken imports.

### Definition: How to Define It

You define a registry component by placing a React component file in a directory named after the target shell zone (e.g., `header-end`, `nav-main`) within your module's `src/registry`. The render order and internal name are derived from the filename using the `{order}-{kebab-name}.tsx` pattern.

> **Note**: While the core engine uses `src/components/shell/registry`, modules must strictly use `modules/{name}/src/registry/{zone}/`.

**CRITICAL STANDARDS**:

- **Hydration**: All interactive registry components MUST include the `'use client';` directive at the top of the file to ensure proper hydration in the Astro/Shell environment.
- **Layout**: Components SHOULD wrap content in a layout container (e.g., `<div className="flex items-center">`) to respect shell zone constraints.
- **Exports**: Components MUST be exported as the `default` export.

```tsx
// modules/user-ui/src/registry/header-end/20-user-menu.tsx
'use client';

import React from 'react';

// The '20' prefix in the filename tells the shell where to place this link.
// A lower number puts it earlier in the list. This is the authoritative render order.

export default function UserMenu() {
  return <div>My Menu</div>;
}
```

### Standardized UI Manifest (ui.yaml)

Every UI module must contain a `ui.yaml` manifest in its root. This file acts as the source of truth for the module's visual integration.

- **Routes**: Defines virtual pages and their layout associations.
- **Shells**: Defines custom shells and their activation patterns.
- **Registry**: Configures the high-level metadata for registry injections.
- **Tables**: Configures generated TanStack Tables for models.
- **Forms**: Configures generated React Hook Forms for models.

```yaml
# modules/user-ui/ui.yaml
routes:
  /profile:
    page: src/pages/profile.astro
    shell: default

registry:
  header-end:
    - name: user-menu
      component: src/registry/header-end/20-user-menu.tsx
      order: 20
```

### Usage: How It Is Used

The core application's `RegistryLoader` component scans these files at runtime and renders them dynamically.

```tsx
// src/components/shell/Header.tsx
import { RegistryLoader } from '@/components/shell/registry-loader';

// Usage: The shell simply asks for all components in the 'header-end' zone.
// It doesn't know "UserMenu" exists specifically, just that it needs to render that zone.
<div className="shell-header-actions">
  <RegistryLoader zone="header-end" />
</div>;
```

---

## 2. Backend Logic (Modular API & SDK)

### The Problem it Solves

Traditionally, connecting a frontend to a backend required "three-hop" boilerplate:

1.  Create a database function.
2.  Create an API route.
3.  Write a frontend fetch wrapper.

This often leads to untyped `fetch()` calls, scattered documentation, and no clear contract between client and server.

### ArcNexus Solution

We use a **Modular API + Federated SDK** architecture.

1.  **Modular API**: You define standard REST endpoints using `api.yaml` (OpenAPI) and `models.yaml` in your module. The generator (`nexical gen api`) automatically produces the server-side handlers and Prisma services.
2.  **Infrastructure Abstraction**: Manual endpoints are wrapped with `defineApi` for consistent formatting. List endpoints use `parseQuery` for Prisma-compatible filtering.
3.  **Federated SDK**: The generator also produces a type-safe SDK client for your module in `src/sdk/`.
4.  **Aggregator**: The build system binds all these module SDKs into a single, global `api` client.

**CRITICAL**: `src/sdk/` and `src/pages/api/` are **STRICTLY GENERATED**. Do not edit them manually.
**MIXED DIRECTORIES**: `src/services/` and `src/actions/` are **MIXED** directories. While the generator may output boilerplate, custom domain logic MUST be implemented in manual files within these folders. These manual files are preserved during regeneration.

**ACTION-SERVICE-GATEWAY SPLIT**:

- **Endpoints** (`src/pages/api`) MUST call **Actions**.
- **Actions** (`src/actions`) MUST orchestrate logic, verify actor context, and delegate to **Services**.
- **Actions** MUST NOT access `db` directly.
- **Services** (`src/services`) MUST NOT import other Services directly. Use Actions to orchestrate multi-service workflows.

**MODULE INITIALIZATION**:
Every API module MUST include a `src/server-init.ts` file to register its own roles, hooks, and providers. The core platform discovers these files automatically.

```typescript
// src/server-init.ts
export const init = async () => {
  // Register module roles and hooks
  import.meta.glob('./roles/*.ts', { eager: true });
  import.meta.glob('./hooks/*.ts', { eager: true });
};
```

### Definition: How to Define It

**Step 1: The API Specification**
Define your operations in `api.yaml` and `models.yaml`. This is the source of truth for the SDK and Handlers.

```yaml
# modules/user/api.yaml
User:
  - path: /list
    verb: GET
    method: listUsers
    role: admin
    summary: 'List Users'
    action: list-users
    response: ServiceResponse<User[]>
```

**Step 2: Generate Code**
Run the generator to create the SDK, Services, Actions, and API Pages.

```bash
nexical gen api user
```

### Usage: How It Is Used

Frontend components import the global `api` client. They don't need to know _where_ the endpoint lives or _how_ to authenticate.

```tsx
// modules/dashboard/src/registry/widgets/UserCount.tsx
import { api } from '@/lib/api';

export default function UserCount() {
  const loadData = async () => {
    // Usage: Fully typed, autocompleted method generated from api.yaml.
    const users = await api.user.listUsers();
  };
  return <button onClick={loadData}>Refresh</button>;
}
```

---

## 3. Data Layer (Schema Ontology)

### The Problem it Solves

In a monolithic Prism/Postgres app, you have one `schema.prisma` file. If you have a modular app, how do you handle data?

- If the "CRM" module wants to add a `vipStatus` column to the `User` table, it can't, because the `User` model belongs to the Core.
- If it edits the core file, it's no longer modular.

### The ArcNexus Solution

We use a **Schema Ontology** system that allows for _Additive Schema Design_. We define data models in lightweight `models.yaml` files inside each module. A build-time compiler reads all these fragments and "deep merges" them.

This means a module can say "I exist, and I want to add these 3 fields to the User table, and create 2 new tables of my own." The core system accepts these changes and generates a single, unified database schema. This allows modules to be deeply integrated at the data layer without conflict.

### Definition: How to Define It

You create a `models.yaml` file in your module root. You can define new Enums, Models, or extend existing ones.

```yaml
# modules/user/models.yaml
enums:
  SiteRole:
    values:
      - ADMIN
      - MEMBER

models:
  User:
    fields:
      id:
        type: String
        attributes:
          - '@id'
          - '@default(cuid())'
      role:
        type: SiteRole
        attributes:
          - '@default(MEMBER)'
```

### Usage: How It Is Used

The system generates a unified Prisma Client that includes all your models. You access this client via `src/lib/core/db.ts`.

```ts
// src/lib/core/db.ts
import { PrismaClient } from '@prisma/client';
export const db = new PrismaClient();

// Usage: Access the model as if it were natively defined in a single file.
// All extensions from all modules are merged into this client.
const users = await db.user.findMany({
  where: { role: 'ADMIN' },
});
```

---

## 4. Routing (Astro Integration)

### The Problem it Solves

Next.js and Astro are file-system based (e.g., `src/pages/about.astro` becomes `/about`). This is great, until you want a module to provide pages. You can't put a module inside `src/pages` without breaking the isolation.

### The ArcNexus Solution

We use Astro's **Route Injection API**. When the application starts up, it scans every module for a `src/pages` directory. It essentially "virtualizes" the file system, telling Astro: "Hey, pretend these files from `modules/crm/src/pages` are actually inside the main `src/pages` folder."

This allows a module to contain its own full routing tree—API routes, dynamic routes (like `[id].astro`), and standard pages—completely self-contained. You can drop a module in, and suddenly 10 new pages appear on your site.

### Definition: How to Define It

Place a `.astro` (or `.md`, `.ts`) file in your module's `src/pages` directory. The folder structure dictates the URL.

```astro
---
// modules/user/src/pages/login.astro
import Layout from '@/layouts/Layout.astro';
---
<Layout>
  <h1 class="auth-title">Login Page</h1>
</Layout>
```

### Usage: How It Is Used

The page is automatically available at the corresponding URL path. No manual configuration is required in the core app.

```html
<!-- Usage: Link to the page as if it were in the core src/pages folder -->
<a href="/login">Go to Login</a>
```

---

## 5. State Management (Zustand & Context)

### The Problem it Solves

In complex apps, "Global State" is tricky. You often need data available everywhere (like the current user, or active workspace). In a standard Redux/Context setup, you define one giant store. But in a modular app, the Core doesn't know that the "CRM" module needs to store a "Lead Count" in the global header.

### The ArcNexus Solution

We implement **Relaxed Contexts**. We use a `NavContext` that is strictly typed for Core features but has an "Open Key" policy for extensions. Middleware (see below) can inject data into this context during the server-side request.

When the page renders, this data is hydrated into a React Context/Zustand store. This allows a module to "piggyback" on the global state, injecting its own data that can then be consumed by its own registry components (like that "Lead Count" badge in the header).

### Definition: How to Define It

You inject data into the context via Middleware (see Section 6). This effectively "hydrates" the global state for the current request.

```ts
// modules/user/src/middleware.ts
context.locals.navData = {
  context: {
    // Inject user data so it's globally available
    user: { name: 'Alice', email: 'alice@example.com' },
  },
};
```

### Usage: How It Is Used

Components consume the data using the `useNavData` hook.

```tsx
// modules/user/src/registry/header-end/20-user-menu.tsx
import { useNavData } from '@/lib/ui/nav-context';

export default function UserMenu() {
  const { context } = useNavData();

  // Usage: Access the data injected by the middleware.
  // This works anywhere in the component tree, regardless of module boundaries.
  return <div>Hello, {context.user.name}</div>;
}
```

---

## 6. Middleware and Security

### The Problem it Solves

Middleware usually resides in a single `middleware.ts` file. In a modular system, you don't want to edit that file every time you add a feature. You also don't want the core middleware to know about specific permission rules for the "Inventory" module.

### The ArcNexus Solution

We implement a **Chained Middleware Pipeline**. The core application acts as a "Host," but it delegates request processing to modules. Each module can export a helper definitions object that outlines public routes and request logic.

When a request comes in, it flows through the modules sequentially. The "Auth" module might check if you're logged in. The "CRM" module might then check if you have a "Sales" license. This keeps security logic co-located with the feature it protects.

### Definition: How to Define It

Export a configuration object from `src/middleware.ts` in your module root.

```ts
// modules/user/src/middleware.ts
export default {
  // Define routes that bypass security checks
  // This allows modules to expose public landing pages or callbacks
  publicRoutes: ['/login', '/register'],

  // Logic that runs on every request
  onRequest: async (context, next) => {
    // Definition: Check logic before page load
    if (context.url.pathname.startsWith('/admin')) {
      return context.redirect('/login');
    }
    return next();
  },
};
```

### Usage: How It Is Used

The core application `src/middleware.ts` automatically chains these middleware functions. You don't need to manually import them.

```ts
// src/middleware.ts (System Internal)
// Usage: The system iterates over all module middlewares and executes them in sequence.
```

### Security: Role Registry

Beyond middleware, granular permissions are handled by the **Role Registry**.

- **Location**: `src/lib/registries/role-registry.ts`
- **Usage**: Modules register `RolePolicy` classes to define authorization logic. Roles in `src/roles/*.ts` are auto-discovered.
- **Registration**: Initialize via a static `init()` method in `src/server-init.ts`.

```typescript
// modules/team/src/roles/team-admin.ts
import { RolePolicy } from '@/lib/registries/role-registry';
import type { APIContext, AstroGlobal } from 'astro';

export class TeamAdminPolicy implements RolePolicy {
  async check(context: APIContext | AstroGlobal, input: any) {
    // Note: APIContext is imported from 'astro'
    if (!(context as APIContext).user) throw new Error('Unauthorized');
  }
}
```

---

## 7. Services (Domain Logic)

### The Problem it Solves

Business logic often gets tangled in Controllers (Actions) or UI code. We need a dedicated layer for "System of Record" operations (Database, Transactional Email, etc.) that is reusable and testable.

### The ArcNexus Solution

We use **Static Service Classes**. Services are pure, stateless collections of domain methods. All public service methods must return a `ServiceResponse<T>` wrapper to ensure consistent error handling across the modular monolith.

**MIXED DIRECTORIES**: Plain CRUD Services are **GENERATED**. Custom domain logic MUST be implemented in manual Service classes. These manual classes should reside in `src/services/` and are preserved during generation.

### Definition: How to Define It

Services are defined by the `models.yaml` and generated by `arc gen api`.

```yaml
# Generated Service logic (Internals)
# Access via src/services/{entity}-service.ts
```

### Usage: How It Is Used

Actions or Endpoints import and call Services directly.

```ts
// modules/user/src/actions/create-user.ts
import { UserService } from '@modules/user/src/services/user-service';
import type { APIContext } from 'astro';

export class CreateUserAction {
  static async run(input: InputDto, ctx: APIContext) {
    // Business logic orchestrator
    return await UserService.create(input);
  }
}
```

---

## 8. Global Styling (Astro Integration)

### The Problem it Solves

CSS is notorious for being "Global by default," which causes conflicts. Conversely, CSS Modules are "Local by default," making it hard to share themes or enforce consistency. We need a middle ground: Modules need to define their own semantic styles (describing _what_ an element is, not _how_ it looks) that allow for global theming and easy overrides.

### The ArcNexus Solution

We use a **Build-Time Style Injector** combined with **Tailwind Layers**. Each module defines a `styles.css`. When the application starts, our integration automatically finds these files and injects them.

Inside these files, we define default styles using the `@layer components` directive. This assigns the styles a low specificity. This is crucial because it allows "Theme Modules" to be installed later that can override these styles without using `!important` or complex specificity hacks. It essentially allows the structure to be defined by the feature module (`.user-card`), while the aesthetic can be completely swapped by a theme module.

### Definition: How to Define It

Create a `styles.css` in your module root and use `@layer components`.

```css
/* modules/user/styles.css */
@layer components {
  /* Definition: Define semantic classes using Tailwind @apply */
  .user-profile-card {
    @apply p-6 rounded-xl border border-border bg-card text-card-foreground shadow-sm;
  }

  .user-profile-title {
    @apply text-2xl font-semibold tracking-tight;
  }
}
```

### Usage: How It Is Used

The styles are automatically available. Components use the semantic class names instead of raw Tailwind utilities.

```tsx
// Usage: Use the semantic class names.
// This allows the design to be updated centrally or via themes.
<div className="user-profile-card">
  <h3 className="user-profile-title">User Profile</h3>
</div>
```

---

## 9. Package Management (NPM Workspaces)

### The Problem it Solves

In a monolithic `package.json`, you end up with 100+ dependencies. It's unclear which library belongs to which feature. If you delete the "Charts" feature, you might forget to remove the `d3` library dependency, leaving bloat.

### The ArcNexus Solution

We treat every module as a **Workspace**. Each module has its own `package.json`. If the CRM module needs `chart.js`, you install it _only_ in `modules/crm`.

This creates strict boundaries. It prevents "leakage" where one feature accidentally relies on a library installed by another feature. It also makes it trivial to extract a module into a standalone library later, because all its dependencies are explicitly listed in its own manifest.

### Definition: How to Define It

Create a `package.json` for your module.

```json
// modules/user/package.json
{
  "name": "@module/user",
  "version": "1.0.0",
  "dependencies": {
    "bcryptjs": "^2.4.3"
  }
}
```

### Usage: How It Is Used

Import code from other modules using standard package syntax.

```ts
// Usage: Import types or utilities from the module package
import { UserType } from '@module/user';
```

---

## 10. Cross-Module Events (Hook System)

### The Problem it Solves

Features often effect each other. When a user registers, you might want to:

1. Send a welcome email (Marketing Module).
2. Create a Stripe customer (Billing Module).
3. Notify the Slack channel (Notifications Module).

If you write this imperatively (`marketing.sendEmail(); billing.createCustomer();`), the Registration code becomes coupled to everything. If you remove the Billing module, the Registration code breaks.

### The ArcNexus Solution

We use a **Hook System (Event Bus)** implemented as a static registry class. The Registration code simply "announces" what happened: `dispatch('user.registered')`. It doesn't care who is listening.

Other modules "subscribe" to this event. This allows purely additive behavior. You can drop in a "Gamification" module that listens for `user.registered` and awards 10 points. You didn't touch the original user code, but you successfully extended its behavior.

### Definition: How to Define It (Listening)

Subscribe to an event OR a filter in your initialization file (`server-init.ts`).

#### 1. Event Listeners (Parallel/Side-effects)

**CRITICAL**: All hook handlers MUST use generics for data (`T`) and optional context (`C`). The use of `any` is strictly forbidden.

```ts
// modules/marketing/src/server-init.ts
import { HookSystem } from '@/lib/modules/hooks';

interface UserRegisteredPayload {
  userId: string;
  email: string;
}

// Definition: Define what happens when the event fires.
// Explicitly type the hook signature to avoid the forbidden 'any'.
// The second generic C defaults to 'unknown' if omitted.
HookSystem.on<UserRegisteredPayload, { source: string }>(
  'user.registered',
  async (data, context) => {
    // Use context to access request-level metadata
    console.info(`User registered from ${context?.source ?? 'unknown source'}`);
    await sendWelcomeEmail(data.email);
  },
);
```

#### 2. Filters (Sequential/Pipeline)

Filters allow you to modify data before it is used. They run **sequentially** in a serial chain where the output of one handler becomes the input of the next.

```ts
// modules/access/src/server-init.ts
HookSystem.on<UserData, { isAdmin: boolean }>('user.read', async (user, context) => {
  // Add a field to the user object if context allows
  if (context?.isAdmin) {
    return { ...user, canAccessPro: true };
  }
  return undefined; // Return undefined to skip modification
});
```

### Usage: How It Is Used (Dispatching)

#### 1. Dispatch (Event)

**MANDATORY**: Use `dispatch` for parallel, non-blocking side-effects. The system uses `Promise.allSettled` to ensure **Listener Error Isolation**—if one module fails, the others still execute.

```ts
// Usage: Fire the event in parallel.
HookSystem.dispatch<UserRegisteredPayload>('user.registered', {
  userId: '123',
  email: 'user @example.com',
});
```

#### 2. Filter (Data Modification)

**MANDATORY**: Use `filter` for serial data transformations where the return value is required for the next step in the pipeline.

```ts
// Usage: Pass data through the serial filter chain.
const enrichedUser = await HookSystem.filter<UserData>('user.read', rawUser);
```

---

## 11. Swappable Shells (The UX Kernel)

### The Problem it Solves

Most apps have a single `Layout.tsx` that wraps every page. But real-world platforms often need distinct "modes." An Admin might need a dense data-heavy sidebar. A Kiosk user needs a button-free full-screen UI. A public user needs a marketing header. Managing this with `if/else` statements in one layout file is messy.

### The ArcNexus Solution

We use a **Shell Registry**. Modules can register entire Layout components (Shells) and define the rules for when they should be used.

The system acts as a "UX Kernel" that evaluates the current request (URL, user role, device type) and selects the best matching shell. This allows a specific module (like "Kiosk Mode") to completely hijack the user interface wrapper without rewriting the pages inside it.

### Definition: How to Define It

Register the shell and a predicate function in your `init.ts`.

```ts
// modules/kiosk/src/init.ts
import { ShellRegistry } from '@/lib/registries/shell-registry';
import KioskShell from './components/KioskShell';

// Definition: Use this shell if the URL has ?mode=kiosk
ShellRegistry.register('kiosk', KioskShell, (ctx) => ctx.url.searchParams.has('kiosk'));
```

### Usage: How It Is Used

The application chooses the active shell at runtime.

```tsx
// src/components/shell/master-shell.tsx
// Usage: The system evaluates predicates and automatically renders the matching shell.
<ActiveShell>
  <slot />
</ActiveShell>
```

---

## 12. Astro Configuration & Integrations

### The Problem it Solves

Astro is powerful because of its Integrations (Tailwind, React, MDX, etc.). But typically, these are configured in a single `astro.config.mjs` file. If a module needs a specific integration (like an MDX compiler for a Blog module), you have to modify the core config.

### The ArcNexus Solution

We utilize a **Configuration Aggregator**. Each module can export its own configuration fragment (`module.config.mjs`). During the build process, our system detects these and merges them into the main pipeline.

This means a module can fundamentally alter how the site is built. It can add new file type support, inject environment variables, or add build plugins, all while keeping the core configuration file simple and clean.

### Definition: How to Define It

Export a config object with integrations or Vite plugins from `module.config.mjs`.

```js
// modules/search/module.config.mjs
import pagefind from 'astro-pagefind';

export default {
  integrations: [pagefind()],
};
```

### Usage: How It Is Used

The core config merges these changes during the build.

```js
// astro.config.mjs
// Usage: The integration is active during the build process, affecting the final output.
```

---

## 13. Dynamic Type Declarations

### The Problem it Solves

In a TypeScript project, you want global types (like `User` or `Config`) to be available everywhere without manual imports. Usually, you create a `src/types.d.ts`. But in a modular project, the "CRM" module shouldn't be editing the core type definitions.

### The ArcNexus Solution

We configure TypeScript to implicitly trust any `types.d.ts` file found within `modules/**`. This creates a **Federated Type System**.

A module simply declares `interface Lead { ... }`, and instantly, VS Code knows about `Lead`. It appears in autocomplete for every developer on the team. This lowers the friction of using modular code—it feels just as integrated as if it were all in one file.

### Definition: How to Define It

Declare global interfaces in `src/types.d.ts` in your module root.

```ts
// modules/user/src/types.d.ts
declare interface UserProfile {
  bio: string;
}
```

### Usage: How It Is Used

Use the types globally without imports.

```ts
// Usage: The type is available automatically throughout the codebase.
const profile: UserProfile = { bio: 'Hello' };
```

---

## 14. Modular Database Migrations

### The Problem it Solves

Databases need initial data. "Seeds" are scripts that populate the DB with defaults (like an 'Admin' user or a valid 'Country' list). Usually, this is one giant `seed.ts` file. As the app grows, this file becomes unmaintainable.

### The ArcNexus Solution

We use **Distributed Seeding**. Each module can own a `prisma/seed.ts`. When you run the seed command, the system crawls all modules and executes their seed scripts in order.

This ensures that the "Countries" module is responsible for populating the country list, and the "User" module is responsible for creating the admin. If you remove the Countries module, you don't have to go clean up the main seed file—it just stops seeding countries.

### Definition: How to Define It

Export a `seed` function from `prisma/seed.ts` in your module.

```ts
// modules/user/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

export async function seed(prisma: PrismaClient) {
  // Definition: Create default data
  await prisma.user.create({ data: { name: 'Admin' } });
}
```

### Usage: How It Is Used

Run the seed command.

```bash
# Usage: The CLI runs all module seed functions in sequence.
npx prisma db seed
```

---

## 15. Modular Hooks & Logic

### The Problem it Solves

Registry Components are great for UI, but what about sharing logic? What if the CRM module has a complex algorithm for calculating "User Health Score" that you want to use in the User Profile header? You shouldn't have to copy-paste that logic.

### The ArcNexus Solution

We encourage **Shared Hooks/Libraries**. Modules can export standard TypeScript functions or React Hooks. Because modules are also NPM Workspaces (Section 9), you can import them cleanly.

This promotes the "Don't Repeat Yourself" (DRY) principle across module boundaries. It turns your modules into a library of reusable business capabilities that can be composed together.

### Definition: How to Define It

Export the hook from a library file in your module.

```ts
// modules/user/lib/hooks.ts
import { useNavData } from '@/lib/ui/nav-context';

export function useUser() {
  const { context } = useNavData();
  return context.user;
}
```

### Usage: How It Is Used

Import and use the hook in any component.

```tsx
// Usage:
import { useUser } from '@/modules/user/src/lib/hooks';

// Use the hook to get data/logic
const user = useUser();
```

---

## 16. Pluggable Email Templates & Overrides

### The Problem it Solves

Transactional emails (Welcome, Password Reset) are typically hardcoded imports in backend services. This creates two problems:

1.  **Coupling**: The "User Service" depends on a specific fancy React component, dragging in UI dependencies.
2.  **Rigidity**: A "Theme" module cannot easily replace the "Welcome Email" without patching the User Service code.

### The ArcNexus Solution

We implementation an **Email Template Registry**. We decouple the _Intent_ ("Send the user invitation") from the _Implementation_ (The React Component).

Modules register templates effectively as "plugins" using a string ID (e.g., `user:invite`). The backend service simply renders whatever component is currently registered for that ID. This allows a "Theme" or "Enterprise" module to overwrite the registration with a completely different generic template, and the User Service will use it automatically.

### Definition: How to Define It

Register a React-Email component in your `src/emails/init.ts`. This file should be imported by your module's main `src/init.ts` to ensure it runs at startup.

```ts
// modules/user/src/emails/init.ts
import { EmailRegistry } from '@/lib/email/email-registry';
import InviteEmail from './invite-user';

// Definition: Register the component as the default handler for 'user:invite'
EmailRegistry.register('user:invite', InviteEmail);
```

### Usage: How It Is Used

The service renders the template by ID, then sends the resulting HTML.

```ts
// modules/user/src/lib/user-service.ts
import { EmailRegistry } from '@/lib/email/email-registry';
import { sendEmail } from '@/lib/email/email-sender';

// Usage: Ask the registry to render the current component for 'user:invite'
// We don't import the component class directly.
const html = await EmailRegistry.render('user:invite', {
  name: 'Alice',
  itemCount: 5,
});

await sendEmail({ to: 'alice@example.com', subject: 'Welcome', html });
```

### Overriding a Template

To replace the standard "Welcome Email" with a branded version, simply register a new component with the **same ID** in complete separate module. As long as your module loads _after_ the User module (or essentially just runs), it will overwrite the entry in the registry.

```ts
// modules/theme-enterprise/src/init.ts
import { EmailRegistry } from '@/lib/email/email-registry';
import BrandedInvite from './emails/BrandedInvite';

// Override: Replace the default template with our branded version
// Any subsequent call to render('user:invite') will use this new component.
EmailRegistry.register('user:invite', BrandedInvite);
```

---

## 17. Module & Actor Configuration

### The Problem it Solves

The core Generator needs to create sophisticated Integration Tests and SDKs. However, it cannot "guess" which model represents the User, or what specific field value corresponds to an "Admin" role in your custom permission system. Hardcoding `role === 'ADMIN'` in the generator would break flexibility.

### The ArcNexus Solution

We allow **Metadata Configuration** directly within `models.yaml`. This provides hints to the compiler about how to treat your models during test generation and authentication scoping.

### 1. Actor Configuration

On the model that represents your principal (e.g., `User` or `ServiceAccount`), add an `actor` block.

```yaml
models:
  User:
    actor:
      name: user # The logical name for test helpers (e.g., client.as('user'))
      status: active # Default status for new actors
      strategy: bearer # Auth strategy: 'bearer' | 'api-key'
      fields:
        tokenModel: PersonalAccessToken # Related model for parsing tokens
        ownerField: userId # The field on other models that links to this actor
```

### 2. Configurable Test Roles

When generating tests, the system needs to emulate different permission levels (Admin vs. Member). You define these mappings in a global `config` block at the top of `models.yaml`.

```yaml
# modules/user/models.yaml
config:
  test:
    roles:
      # Logical Role : Actual DB/Context Value
      admin: { role: 'ADMIN' }
      member: { role: 'EMPLOYEE' }
      guest: { role: 'GUEST' }

models:
  User: ...
```

**Usage in Tests:**
The generator reads this config and produces test code that injects these exact values into the mock client.

```typescript
// Generated Code
it('should allow admin to delete', async () => {
  // The generator injects the configuration you defined above
  await client.as('user', { role: 'ADMIN' });
  await client.delete('/api/resource/1');
});
```

This ensures that even if you change your Enum values from `ADMIN` to `SUPER_USER`, you only need to update `models.yaml`, and all your integration tests will regenerate with the correct logic.

---

## 18. Advanced Pattern: Micro-Modules

### The Problem

Some features introduce heavy dependencies that you don't want to burden your main API or UI bundles with. For example, `react-email` brings in a lot of React rendering logic that isn't needed for your API routes.

### The ArcNexus Solution

We use **Micro-Modules** (Split Modules) to isolate these concerns and follow a strict naming convention:

- **`*-api`**: Core domain logic, models, services, and REST endpoints.
- **`*-ui`**: Presentation layer, registry components, and routing.
- **`*-email`**: Transactional email templates using React-Email.

#### The "Email Split" Pattern

Instead of putting email templates in `modules/user`, create `modules/user-email`.

1.  **`modules/user-api`**: Core logic. Triggers the email.
2.  **`modules/user-email`**: Contains `src/emails/` templates. Depends on `react-email`.
    - **Registry**: Registers templates in `server-init.ts`.
3.  **Mechanism**: The `user-email` module registers its templates to the `EmailRegistry`. The `user-api` module simply asks the registry to render "user:welcome". They are decoupled.

---

## 19. Agentic Modules (Autonomous Actors)

### The Problem

Traditional modules are passive; they only react to HTTP requests. AI-Native apps need **Autonomous Actors** that can run in the background, process queues, or react to complex environmental changes.

### The ArcNexus Solution

We utilize a dedicated Agent Runtime (`packages/agent`) that provides standard base classes. Modules extend this system by adhering to a **Directory Convention**.

### Definition: How to Define It

Create a `src/agent/` directory in your module. The system auto-discovers and loads these files.

#### 1. Job Processor (`JobProcessor<T>`)

Use this for discrete, async tasks (e.g., "Scrape URL", "Generate Summary").

- **Base Class**: `JobProcessor` from `@nexical/agent/src/core/processor.js`.

- **Requirements**: Must handle `ServiceResponse` when calling services. Throwing an error triggers the queue's retry logic. Direct `db` access is permitted for pragmatic implementation.

```typescript
// modules/scraper/src/agent/scrape-processor.ts

import { JobProcessor, type AgentJob } from '@nexical/agent/src/core/processor.js';

import { ScrapeService } from '@modules/scraper/src/services/scrape-service';

import { HookSystem } from '@/lib/modules/hooks';

import { db } from '@/lib/core/db';

export class ScrapeProcessor extends JobProcessor<ScrapeInput> {
  jobType = 'scrape.url';

  async process(job: AgentJob<ScrapeInput>) {
    // 1. Pragmatic DB access or Service delegation
    const { success, error, data } = await ScrapeService.scrape(job.data.url);

    // 2. Handle failure for queue retries
    if (!success) {
      throw new Error(`Scrape failed: ${error?.message}`);
    }

    // 3. Dispatch events for side effects
    await HookSystem.dispatch('scrape.completed', { url: job.data.url });
  }
}
```

#### 2. Persistent Agent (`PersistentAgent`)

Use this for long-running background listeners (e.g., "System Monitor", "Discord Bot").

- **Base Class**: `PersistentAgent` from ` @nexical/agent/src/core/persistent.js`.

- **Requirements**: Must handle `ServiceResponse` for all calls to Services or the Federated SDK. Direct `db` access is permitted.

```typescript
// modules/monitor/src/agent/sys-monitor.ts

import { PersistentAgent } from '@nexical/agent/src/core/persistent.js';

import { MonitorService } from '@modules/monitor/src/services/monitor-service';

import { api } from '@/lib/api/api';

import { db } from '@/lib/core/db';

export class SystemMonitor extends PersistentAgent {
  name = 'sys-monitor';

  protected async tick() {
    // Use Services, Federated SDK, or direct DB access
    const { success, error } = await MonitorService.checkHealth();

    if (!success) {
      await api.log.error({ message: `Health check failed: ${error?.message}` });
    }
  }
}
```

#### 3. Job Triggering

To initiate an asynchronous task, use the `api.orchestrator.job.create` method (or equivalent provided by the Orchestrator module). This ensures that jobs are properly queued, persisted, and tracked through the system's management interface.

```typescript
import { api } from '@/lib/api';

// Enqueue a job via the Federated SDK
const response = await api.orchestrator.job.create({
  type: 'scrape.url',
  payload: { url: 'https://example.com' },
});

if (!response.success) {
  // Handle error
}
```

---

## 20. Backend Development Workflow

### The Standard Process

We enforce a "Design First, Code Later" workflow for `*-api` modules to ensure strict contract adherence.

1.  **Design**: Create `models.yaml` (Data Schema) and `api.yaml` (OpenAPI Spec) in your module root.
2.  **Scaffold**: Run the generator to build the boilerplate.
    ```bash
    nexical gen api user
    ```
    This creates the `src/services`, `src/sdk`, and `src/pages/api` structure based on your YAML definitions.
3.  **Implement**: Fill in the blanks.
    - **Actions**, **Services**, and **SDKs** are **GENERATED CODE**. Do NOT edit `src/actions/`, `src/services/`, or `src/sdk/` manually. Manual changes will be overwritten by `arc gen api`.
    - Implement manual business logic and side-effects in **Hooks** (`src/hooks/`). Ensure they have a `static init()` method.
    - Add **Roles** in `src/roles/`. Implement the `RolePolicy` interface.

### Validation & Auditing

The compiler provides tools to verify your module matches the standard.

- **Audit Module Structure**:

  ```bash
  nexical audit api user
  ```

  Checks for missing files, circular dependencies, or illegal imports (e.g. importing `db` in an Action).

- **Audit Schemas**:
  ```bash
  nexical audit api user --schema
  ```
  Validates that `models.yaml` is valid Prisma syntax and `api.yaml` is valid OpenAPI 3.0.

---

## 21. Standard Module Structures

To maintain consistency, broadly refer to the `user-*` modules as the "Gold Standard".

### 1. The API Module (`*-api`)

Focus: Backend Logic, DB, Security.

```text
modules/my-feature-api/
├── package.json          # @module/my-feature-api
├── models.yaml           # Data Schema
├── api.yaml              # REST API Definition
├── access.yaml           # [OPTIONAL] RBAC Policy
├── module.config.mjs     # [OPTIONAL] Build & Runtime Config
├── src/
│   ├── actions/          # Orchestration Layer (MIXED - Manual & Generated)
│   ├── services/         # Domain Logic (MIXED - Manual & Generated)
│   ├── agent/            # Background Processors (MANUAL)
│   ├── hooks/            # Event Listeners (MANUAL)
│   ├── roles/            # Permission Policies (MANUAL)
│   ├── pages/
│   │   ├── api/          # REST Endpoints (GENERATED)
│   │   └── custom/       # Custom Endpoints (MANUAL)
│   ├── sdk/              # Type-safe Client Definition (GENERATED)
│   └── server-init.ts    # Role/Hook Registration Entry Point
```

### 2. The UI Module (`*-ui`)

Focus: Frontend, Registry, Components.

```text
modules/my-feature-ui/
├── package.json          # @module/my-feature-ui
├── styles.css            # Tailwind Layers
├── src/
│   ├── registry/         # "Pins" for the Shell (Sidebar, Header)
│   ├── components/       # React Components (Organized by feature)
│   ├── pages/            # Astro Pages (Routing)
│   ├── server-init.ts    # Role/Hook Registration Entry Point (Manual or Generated)
│   └── middleware.ts     # Module-specific middleware
```

### 3. The Email Module (`*-email`)

Focus: Templates.

```text
modules/my-feature-email/
├── package.json          # @module/my-feature-email
├── src/
│   ├── emails/           # React-Email .tsx files
│   └── server-init.ts    # EmailRegistry.register calls
```

---

## 22. Integrated Multi-Level Testing

### The Problem it Solves

In a plugin-based architecture, the biggest fear is regression: "I updated the Calendar module and it broke the Sidebar." If modules are developed in isolation, how do you verify the whole system works?

### The ArcNexus Solution

We implement **Distributed Testing** with a unified runner. Tests live _inside_ the module validation folders (`modules/crm/tests`). But the test runner operates _globally_.

This means your CI/CD pipeline runs every test from every module against the fully integrated application. It proves that despite being modular, code is compatible. It gives you the confidence of a Monolith with the organization of Microservices.

### Definition: How to Define It

Create test files in the module's `tests` folder.

```ts
// modules/user/tests/unit/register.test.ts
import { describe, it, expect } from 'vitest';

describe('User Registration', () => {
  it('should validate email', () => {
    // Test logic...
  });
});
```

### Usage: How It Is Used

Run the test runner to execute all modular tests.

```bash
# Usage:
npm run test
```

---

## 23. Ordered Module Loading Phases

### The Problem it Solves

In a modular system, the order in which modules load is critical. A "Theme" module must load _after_ a "User" module to successfully override its styles or email templates. A "Service Provider" must load _before_ the features that consume it. Relying on filesystem order (alphabetical) is brittle and unpredictable.

### The ArcNexus Solution

We implement a **Phased Module Loading** system using the `ModuleDiscovery` utility. Every module can define its `type` (Phase) and `order` (Priority) in `module.config.mjs`. The system guarantees that modules are loaded in the correct modification-safe sequence:

1.  **Core (0)**: Infrastructure (DB, Auth).
2.  **Provider (10)**: Service implementations (Email Providers, Payment Gateways).
3.  **Feature (20)**: Standard functional modules (User, Dashboard, Landing). _Default._
4.  **Integration (30)**: Third-party connectors.
5.  **Theme (40)**: Visual overrides.

### Definition: How to Define It

Add `type` and `order` to your `module.config.mjs`.

**MANDATORY**: Use the `unknown` type for any dynamic or custom configuration properties. The `any` type is strictly forbidden.

```js
// modules/theme-dark/module.config.mjs
/** @type {import('@/lib/modules/module-discovery').ModuleConfig} */
export default {
    type: 'theme',   // Loads late (Phase 40)
    order: 10,       // Sorts within the Theme phase
    theme: { ... }
};
```

### Usage: How It Is Used

The `ModuleDiscovery.loadModules()` method sorts modules before they are processed by core integrations. This ensures:

- **Configurations**: Merged using "Last Wins" strategy (Theme overrides Feature).
- **Integrations**: Executed in order.
- **Routes**: Injected in order (though Astro routing specificity also applies).

This ensures you can safely build a "White Label" module that completely reskins the application without touching the core code.

---

## 24. Localization (i18n)

### The Problem it Solves

Defining text strings hardcoded in components (e.g., `<button>Submit</button>`) makes it impossible to support multiple languages. Traditional monolithic apps use a single huge `locales/en.json` file. In a modular system, the "User" module should own its own text, and the "CRM" module should own its own text. We need a way to merge these distributed strings.

### The ArcNexus Solution

We integrate **i18next** with a custom **Module Aggregator**. You can place `locales/{lang}.json` files inside any module (or the core). At runtime (and build time), the system deep-merges these files.

This allows a "Theme" module to override specific strings of a "Feature" module just by defining the same JSON key path in its own locale file. It also supports real-time language switching without reloading the page.

### Definition: How to Define It

Create a `locales` folder in your module and add JSON files for each language (e.g., `en.json`, `es.json`, `fr.json`).

```json
// modules/user/locales/en.json
{
  "user": {
    "welcome": "Welcome back, {{name}}",
    "actions": {
      "logout": "Log out"
    }
  }
}
```

### Usage: How It Is Used

Use the standard `useTranslation` hook from `react-i18next` in your components.

```tsx
// modules/user/src/components/UserMenu.tsx
import { useTranslation } from 'react-i18next';

export function UserMenu() {
  const { t } = useTranslation();

  return <button>{t('user.actions.logout')}</button>;
}
```

### Configuration

You can define the default language and restrict supported languages in `.env`:

```bash
DEFAULT_LANGUAGE="en"
SUPPORTED_LANGUAGES="en,es,fr"
```

---

## 25. Environment Configuration

### The Problem it Solves

In a typical application, environment variables (`API_KEY`, `DB_HOST`) are often accessed directly (`process.env.API_KEY`) or defined in a central `src/env.d.ts` schema. This creates a hidden coupling: if the "Payments" module needs a `STRIPE_KEY`, the core application has to know about it. It breaks the modular boundary.

### The ArcNexus Solution

We use **Decentralized Configuration**. Each module defines its own configuration schema in `src/lib/config.ts`. A shared helper, `createConfig`, handles the parsing and validation (using Zod) against the global environment.

This allows a module to independently assert its own requirements. If you install the "Payments" module, it will throw an error at startup if `STRIPE_KEY` is missing, without you ever having to edit a core file.

### Definition: How to Define It

Create a `src/lib/config.ts` in your module. Import the `createConfig` helper from the core library.

```ts
// modules/payments/src/lib/config.ts
import { z } from 'astro:schema';
import { createConfig } from '@/lib/config';

// Definition: Define the schema for this specific module
const paymentSchema = z.object({
  STRIPE_PUBLIC_KEY: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  // Set defaults or make optional as needed
  CURRENCY: z.string().default('USD'),
});

// Create the validated config object
// This will throw an error if required env vars are missing
const config = createConfig(paymentSchema);

// Export a clean, typed object (and helpers) for the rest of the module to use
export const paymentConfig = {
  stripe: {
    public: config.STRIPE_PUBLIC_KEY,
    secret: config.STRIPE_SECRET_KEY,
  },
  currency: config.CURRENCY,
};

// Export helpers for common logic
export const isProduction = () => process.env.NODE_ENV === 'production';
```

### Usage: How It Is Used

#### Inside the Module

Import your specific config object. Do **not** access `process.env` directly in your business logic.

```ts
// modules/payments/src/actions/charge.ts
import { paymentConfig } from '@modules/payments/src/lib/config';

export const chargeCard = async (amount: number) => {
  // Usage: Access typed configuration
  const stripe = new Stripe(paymentConfig.stripe.secret);
  // ...
};
```

#### From Other Modules

If another module needs to read this configuration (e.g., the "Checkout" UI needs the public key), it can import it via the module's public API or direct relative import if within the same monorepo context.

```tsx
// modules/checkout/src/components/PaymentForm.tsx
// Usage: Import from the specific module's config
import { paymentConfig } from '@/modules/payments/src/lib/config';

export function PaymentForm() {
  return <StripeProvider apiKey={paymentConfig.stripe.public} />;
}
```

---

## 26. Developer Tools (The Arc CLI)

The **ArcNexus CLI** (`arc`) is the primary interface for building and maintaining modules. It automates the boilerplate and ensures your modules adhere to the strict architectural standards.

### Core Commands

#### 1. Generate (`gen`)

Scaffolds new components based on your design files.

- `nexical gen api {module-name}`
  - **Input**: `modules/{name}/models.yaml` and `api.yaml`.
  - **Output**: Generates `src/pages/api`, `src/services`, and `src/sdk`.
  - **Use Case**: Run this whenever you change your data model or API spec.

#### 2. Audit (`audit`)

Verifies that your module follows the architectural rules.

- `nexical audit api {module-name}`
  - **Checks**:
    - No circular dependencies.
    - Actions do NOT import `db` directly.
    - Services do NOT import other Services directly.
  - **Use Case**: Run this in CI/CD before merging.

- `nexical audit --schema`
  - **Checks**: Validates `models.yaml` syntax and ensures no conflicts between modules (e.g., two modules trying to add the same field).

### Workflow Example

1.  **Create**: Create module folder.
2.  **Design**: Edit `modules/billing/models.yaml` to add `Invoice` model.
3.  **Build**: `nexical gen api billing` (Scaffolds the InvoiceService).
4.  **Verify**: `nexical audit api billing` (Ensures you didn't break the rules).
