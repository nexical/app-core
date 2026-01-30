---
title: Theming System
description: Guide to the styling architecture and component vocabulary.
sidebar:
  order: 1
---

The Nexical styling system is a **Semantic Abstraction Layer** built on top of Tailwind CSS. It decouples design intent from visual implementation.

## Architectural Overview

1.  **Strict Separation**: Components **MUST NOT** define colors/borders locally. Use semantic utilities (e.g., `surface-panel`).
2.  **Single Source of Truth**: `src/styles/theme.base.css`.
3.  **Theme Modules**: Customize by overriding CSS variables, not utility classes.

## CSS Variable Reference

Themes control the look by modifying properties like:

- `--primary`: Core brand color.
- `--background`: Main page background.
- `--surface-panel`: Card background.

## Utility Class Vocabulary

AI Models and Developers must use these standardized utilities:

### Typography

- `text-heading-xl`: Main titles.
- `text-body`: Standard text.
- `text-subtle`: Muted metadata.

### Surfaces

- `surface-panel`: Standard card/panel.
- `container-page-content`: Main content wrapper.

### Actions

- `btn-primary`: Main CTA.
- `btn-ghost`: Minimal interaction.
- `btn-icon`: Standard icon button.

### Feedback

- `feedback-error-card`: Error alerts.
- `badge-primary`: Important indicators.
