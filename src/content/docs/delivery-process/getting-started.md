---
title: 'Getting Started'
description: 'Install and configure @libar-dev/delivery-process in your project'
sidebar:
  order: 1
---

## Installation

```bash
npm install @libar-dev/delivery-process
```

## Quick Setup

### 1. Create a configuration file

```typescript
// delivery-process.config.ts
import { defineConfig } from '@libar-dev/delivery-process/config';

export default defineConfig({
  preset: 'generic',
});
```

### 2. Annotate your source files

Add the `@docs` opt-in marker to any TypeScript file you want to include:

```typescript
/**
 * @docs
 * @docs-category core
 * @docs-extract-shapes UserSchema
 *
 * ## User Management
 *
 * Handles user creation and validation.
 */
```

### 3. Generate documentation

```bash
npx generate-docs
```

### 4. Query delivery state

```bash
npx process-api overview
npx process-api context MyPattern --session implement
```

## Next Steps

- Follow the [Tutorial](/delivery-process/tutorial/) for a complete hands-on walkthrough
- Read the [Methodology](/delivery-process/guides/methodology/) to understand the core thesis
- Explore the [Configuration Guide](/delivery-process/guides/configuration/) for preset options
- Check the [Data API Reference](/delivery-process/reference/process-api/) for all CLI commands
