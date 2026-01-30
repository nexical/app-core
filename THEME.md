# Nexical Ecosystem Theme System (`THEME.md`)

**Target Audience:** AI Models & Developers
**Purpose:** Definitive guide to the styling architecture, vocabulary, and overriding mechanisms.

---

## 1. Architectural Overview

The Nexical styling system is a **Semantic Abstraction Layer** built on top of Tailwind CSS. It decouples _design intent_ (Semantics) from _visual implementation_ (Primitives).

### Core Concepts

1.  **Strict Separation**: Components (React/JSX) **MUST NOT** define colors, borders, or specific dimensions locally (e.g., `bg-white`, `border-gray-200`). They **MUST** use semantic utility classes (e.g., `surface-panel`, `border-divider`).
2.  **Single Source of Truth**: All semantic utilities are defined in `src/styles/theme.base.css`.
3.  **Theme Modules**: Visual customization (Glassmorphism, Flat, Neumorphism) is achieved by **overriding CSS Variables** in module theme files (e.g., `modules/glassmorphism/theme.css`), NOT by redefining utility classes.

### The Cascade

1.  `theme.base.css`: Defines the _structure_ (utilities) and _default values_ (variables).
2.  `modules/{theme}/theme.css`: Overrides _values_ (variables) to change the look.
3.  `styles.css`: Imports both, resolving to the final visual output.

---

## 2. CSS Variable Reference (The "DNA")

Themes control the look by modifying these variables in `:root` (Light Mode) and `.dark` (Dark Mode).

### Base Colors (Primitives)

| Variable               | Description                      | Ideal Usage                                                  |
| :--------------------- | :------------------------------- | :----------------------------------------------------------- |
| `--background`         | Main page background color.      | Do not use directly; use `bg-background` or `surface-panel`. |
| `--foreground`         | Main text color.                 | Default text color.                                          |
| `--card`               | Background for cards/panels.     | underlying color for `surface-panel`.                        |
| `--card-foreground`    | Text on cards.                   | Text inside panels.                                          |
| `--popover`            | Background for dropdowns/modals. | Menus, Select dropdowns.                                     |
| `--primary`            | Core brand color.                | Main actions (Submit, CTA).                                  |
| `--primary-foreground` | Text on primary color.           | Text inside primary buttons.                                 |
| `--secondary`          | Alternative background/action.   | Secondary buttons, subtle highlights.                        |
| `--muted`              | De-emphasized background.        | Disabled states, subtle backgrounds.                         |
| `--muted-foreground`   | De-emphasized text.              | Metadata, timestamps, placeholders.                          |
| `--accent`             | Interactive highlight color.     | Hover states, active list items.                             |
| `--destructive`        | Error/Danger color.              | Delete buttons, error messages.                              |
| `--border`             | Default border color.            | Separators, inputs, card borders.                            |
| `--input`              | Input field border/bg.           | Text inputs, checkboxes.                                     |
| `--ring`               | Focus ring color.                | Accessibility focus rings.                                   |

### Layout Variables

| Variable                  | Description                        | Default                        |
| :------------------------ | :--------------------------------- | :----------------------------- |
| `--radius`                | Base border radius for components. | `0.5rem`                       |
| `--header-height`         | Height of the top navigation bar.  | `3.5rem`                       |
| `--sidebar-width`         | Width of the primary sidebar.      | `16rem`                        |
| `--page-background-image` | CSS background-image property.     | `none` (or gradient in themes) |

---

## 3. Utility Class Vocabulary (The "Lego Blocks")

**CRITICAL RULE**: AI Models must **ALWAYS** use these utility classes instead of raw Tailwind classes for structural elements.

### Typography

| Utility                | Description                       | Ideal Usage                              |
| :--------------------- | :-------------------------------- | :--------------------------------------- |
| `text-heading-xl`      | Extra large heading (3xl, bold).  | Main page titles, Hero section headers.  |
| `text-heading-lg`      | Large heading (2xl, bold).        | Modal titles, major section headers.     |
| `text-heading-md`      | Medium heading (lg, semibold).    | Card titles, subsection headers.         |
| `text-body`            | Standard body text (base).        | Default text for paragraphs and content. |
| `text-body-sm`         | Small body text (sm, medium).     | Dense content, labels, secondary info.   |
| `text-subtle`          | Muted text (sm, muted-color).     | Metadata, descriptions, help text.       |
| `text-subtle-xs`       | Extra small muted text (xs).      | Timestamps, footnotes, legal text.       |
| `text-link`            | Interactive link style.           | Anchor tags or navigational elements.    |
| `text-link-subtle`     | Subtle link style (muted).        | Fooers, less important links.            |
| `text-code`            | Monospace code style.             | Inline values, IDs, technical data.      |
| `text-highlight`       | Highlighted text (medium weight). | Emphasizing keywords within body text.   |
| `text-meta`            | Meta information text.            | Auxiliary data like "Created by...".     |
| `text-nav-item`        | Navigation item text.             | Sidebar or menu links (inactive).        |
| `text-nav-item-active` | Active navigation item text.      | Sidebar or menu links (current page).    |

### Surfaces & Containers

| Utility                   | Description                | Ideal Usage                                      |
| :------------------------ | :------------------------- | :----------------------------------------------- |
| `container-sidebar`       | Sidebar container styles.  | Wrapper for the main application sidebar.        |
| `container-header`        | Header container styles.   | Wrapper for the top navigation bar.              |
| `container-page-content`  | Main content area wrapper. | The central scrollable area of the page.         |
| `surface-panel`           | Standard panel/card.       | **Primary building block** for grouping content. |
| `surface-overlay`         | Overlay surface.           | Modals, dialogs, drawers, popovers.              |
| `surface-item`            | Interactive list item.     | Rows in a list, menu items (hover effects).      |
| `surface-item-bordered`   | Bordered item variant.     | discrete sections or separated list items.       |
| `container-admin-table`   | Data table wrapper.        | Container for dense data grids.                  |
| `container-admin-toolbar` | Toolbar container.         | Action bar above a data table.                   |

### Inputs & Forms

| Utility                | Description                   | Ideal Usage                                 |
| :--------------------- | :---------------------------- | :------------------------------------------ |
| `input-field`          | Standard input style.         | Text inputs, selects, password fields.      |
| `input-field-lg`       | Large input style.            | Prominent search bars or main entry fields. |
| `input-label`          | Input label style.            | Text label describing an input.             |
| `form-container`       | Form wrapper (spacing).       | Wrapper for a standard form (gap-4).        |
| `form-group`           | Field group (spacing).        | Wrapper for Label + Input pair (gap-2).     |
| `min-w-select-trigger` | Minimum width for selects.    | Ensuring dropdowns aren't too narrow.       |
| `max-h-select-content` | Max height for dropdowns.     | Scrollable area for select options.         |
| `min-h-textarea`       | Minimum height for textareas. | default size for multiline inputs.          |
| `px-input-base`        | X-axis padding for inputs.    | Standard horizontal padding.                |
| `py-input-base`        | Y-axis padding for inputs.    | Standard vertical padding.                  |
| `py-input-sm`          | Small Y-axis padding.         | Compact inputs.                             |
| `px-select-label`      | Padding for select labels.    | Labels inside a select dropdown.            |

### Actions (Buttons)

| Utility            | Description                | Ideal Usage                                 |
| :----------------- | :------------------------- | :------------------------------------------ |
| `btn-base`         | Base button styles.        | **Internal use only**. Do not use directly. |
| `btn-primary`      | Primary action button.     | Submit, Save, Create (Brand color).         |
| `btn-secondary`    | Secondary action button.   | Cancel, Back, Edit (Neutral).               |
| `btn-danger`       | Destructive action button. | Delete, Remove, Ban (Red).                  |
| `btn-success`      | Positive action button.    | Confirm, Approve, Mark Done (Green).        |
| `btn-ghost`        | Ghost interaction button.  | Icon buttons, clickable text, minimal UI.   |
| `btn-link`         | Link-styled button.        | Actions that should look like links.        |
| `btn-icon`         | Standard icon button.      | Square layout for icons (h-9 w-9).          |
| `btn-icon-sm`      | Small icon button.         | Compact icon buttons (h-8 w-8).             |
| `gap-btn-icon`     | Gap for button icons.      | Spacing between text and icon in a button.  |
| `px-btn-icon`      | Padding for icon buttons.  | Internal padding.                           |
| `px-btn-icon-sm`   | Small padding for icons.   | Internal padding.                           |
| `px-btn-icon-lg`   | Large padding for icons.   | Internal padding.                           |
| `btn-dims-default` | Default button dimensions. | Standard size (h-9).                        |
| `btn-dims-sm`      | Small button dimensions.   | Compact size (h-8).                         |
| `btn-dims-lg`      | Large button dimensions.   | Prominent size (h-10).                      |

### Feedback & Badges

| Utility                 | Description          | Ideal Usage                          |
| :---------------------- | :------------------- | :----------------------------------- |
| `badge-base`            | Base badge styles.   | Internal use only.                   |
| `badge-primary`         | Primary badge/tag.   | Important indicators, new items.     |
| `badge-secondary`       | Secondary badge/tag. | Categories, filters, metadata.       |
| `badge-outline`         | Outlined badge.      | Neutral status indicators.           |
| `feedback-success-card` | Success message box. | "Saved Successfully" inline banners. |
| `feedback-error-card`   | Error message box.   | Form validation errors, alerts.      |
| `feedback-error-text`   | Inline error text.   | Field-level validation messages.     |

### Layout & Spacing Helpers

| Utility             | Description                | Ideal Usage                                 |
| :------------------ | :------------------------- | :------------------------------------------ |
| `layout-centered`   | Flex center-center.        | Centering content (spinners, empty states). |
| `layout-between`    | Flex justify-between.      | Headers with title left, actions right.     |
| `layout-stack`      | Flex column.               | Stacking elements vertically.               |
| `gap-xs`            | Extra small gap (4px).     | Tight groupings (tags).                     |
| `gap-sm`            | Small gap (8px).           | Related items (icon + text).                |
| `gap-md`            | Medium gap (16px).         | Standard component spacing.                 |
| `gap-lg`            | Large gap (24px).          | Section spacing.                            |
| `gap-xl`            | Extra large gap (32px).    | Major layout divisions.                     |
| `p-container-xxs`   | 4px padding.               | Very tight containers.                      |
| `p-container-xs`    | 8px padding.               | Compact containers.                         |
| `p-container-sm`    | 16px padding.              | Small cards.                                |
| `p-container-base`  | 16px padding.              | **Default** component padding.              |
| `p-container-md`    | 24px padding.              | Medium panels.                              |
| `p-container-lg`    | 32px padding.              | Large content areas.                        |
| `px-header`         | Header X-padding.          | Internal header spacing.                    |
| `px-header-outer`   | Outer Header X-padding.    | Spacing for the header shell.               |
| `px-sidebar`        | Sidebar X-padding.         | Internal sidebar spacing.                   |
| `py-sidebar`        | Sidebar Y-padding.         | Internal sidebar spacing.                   |
| `m-page-title`      | Page title margin.         | Spacing below page titles.                  |
| `m-section`         | Section margin.            | Spacing between page sections.              |
| `m-component`       | Component margin.          | Spacing between isolated components.        |
| `m-item`            | Item margin.               | Spacing between list items.                 |
| `space-y-nav`       | Vertical nav spacing.      | Spacing for navigation lists.               |
| `space-y-content`   | Vertical content spacing.  | Spacing for text blocks.                    |
| `space-y-group`     | Vertical group spacing.    | Spacing for related form elements.          |
| `mx-separator`      | Separator negative margin. | Pulling separators to edges.                |
| `my-separator`      | Separator vertical margin. | Spacing around separators.                  |
| `scroll-my-select`  | Select scroll margin.      | UX improvement for select scrolling.        |
| `w-dialog-sm`       | Small dialog width.        | Confirmation dialogs.                       |
| `w-dialog-md`       | Medium dialog width.       | Standard forms in dialogs.                  |
| `w-dialog-lg`       | Large dialog width.        | Complex content in dialogs.                 |
| `w-sidebar-details` | Details panel width.       | Width of the right-side detail panel.       |
| `w-lang-select`     | Language select width.     | Fixed width for language picker.            |

### Component Internals (Shell, Drawers, etc.)

| Utility                 | Description                 | Ideal Usage                             |
| :---------------------- | :-------------------------- | :-------------------------------------- |
| `shell-sidebar-base`    | Base sidebar shell style.   | Structural style for sidebar.           |
| `shell-nav-item`        | Shell navigation item.      | Main nav links in the app shell.        |
| `shell-bg-root`         | Shell root background.      | Main application background.            |
| `admin-header-bg`       | Admin header background.    | Blurred/Translucent header backgrounds. |
| `drawer-top-base`       | Top drawer styles.          | Mobile drawers from top.                |
| `drawer-bottom-base`    | Bottom drawer styles.       | Mobile drawers from bottom.             |
| `drawer-handle-base`    | Drawer pull handle.         | Drag handle visual.                     |
| `toast-root`            | Toast container style.      | Notification toast wrapper.             |
| `toast-btn-primary`     | Toast primary action.       | Action button inside toast.             |
| `toast-btn-cancel`      | Toast cancel action.        | Dismiss button inside toast.            |
| `scroll-bar-vertical`   | Vertical scrollbar style.   | Custom scrollbar styling.               |
| `scroll-bar-horizontal` | Horizontal scrollbar style. | Custom scrollbar styling.               |

### Decorations & Effects

| Utility                | Description              | Ideal Usage                   |
| :--------------------- | :----------------------- | :---------------------------- |
| `decoration-orb`       | Base orb style.          | Background ambient gradients. |
| `orb-primary`          | Primary color orb.       | Accent background.            |
| `orb-secondary`        | Secondary color orb.     | Accent background.            |
| `decoration-divider`   | Divider line.            | Section separator.            |
| `border-divider-b`     | Bottom border divider.   | Headers, list items.          |
| `border-divider-t`     | Top border divider.      | Footers.                      |
| `border-divider-base`  | Full border divider.     | Cards, bounded areas.         |
| `border-transparent-l` | Transparent left border. | Scrollbar hacks / alignment.  |
| `border-transparent-t` | Transparent top border.  | Scrollbar hacks / alignment.  |
| `shape-rounded-md`     | Medium rounding.         | Default radius.               |
| `shape-rounded-full`   | Full rounding.           | Pills, circles.               |
| `shape-rounded-xl`     | Extra large rounding.    | Large panels.                 |
| `state-hover-bg`       | Hover background effect. | Interactive rows.             |
| `state-hover-text`     | Hover text effect.       | Interactive links.            |

### Icons & Avatars

| Utility          | Description           | Ideal Usage                      |
| :--------------- | :-------------------- | :------------------------------- |
| `icon-xs`        | size-3 (12px).        | Tiny indicators.                 |
| `icon-sm`        | size-4 (16px).        | Button icons, standard UI icons. |
| `icon-md`        | size-6 (24px).        | Feature icons.                   |
| `icon-lg`        | size-8 (32px).        | Large illustrations.             |
| `icon-xl`        | size-10 (40px).       | Hero icons.                      |
| `icon-muted`     | Muted icon color.     | Inactive/Decorative icons.       |
| `avatar-sm`      | Small avatar (32px).  | Lists, comments.                 |
| `avatar-md`      | Medium avatar (40px). | Headers, user profiles.          |
| `avatar-lg`      | Large avatar (64px).  | Profile pages.                   |
| `avatar-xl`      | XL avatar (96px).     | Hero profile sections.           |
| `size-indicator` | Indicator size (8px). | Status dots.                     |

### Extending the Vocabulary (Domain-Specific Styles)

If a specific feature area needs unique styling (e.g., a larger input for login), do **NOT** use raw Tailwind classes in the component.

1.  **Create a new utility** in your module's `theme.css`: `@utility auth-input`.
2.  **Compose the base utility**: `@apply input-field`.
3.  **Add your specific overrides**: `@apply h-12 text-lg`.

**Correct Pattern:**

```css
/* modules/{theme-module-name}/theme.css */
@utility auth-input {
  @apply input-field h-12 text-lg;
}
```

**Incorrect Pattern:**

```tsx
// Component
<input className="input-field h-12 text-lg" />
```
