# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IGV-Web App is a pure-client genome browser application built on [igv.js](https://github.com/igvteam/igv.js). It is developed by the IGV team at UC San Diego and Broad Institute. Hosted at https://igv.org/app.

## Build

There is only one npm script. No test or lint commands are configured.

```bash
npm run build
```

This runs a pipeline: `updateVersion.js` → `clean.js` → `rollup -c` → `copyArtifacts.js`. Output goes to `dist/` as ES module bundles (`app_bundle-{version}.esm.js` and minified variant).

For local development, serve the project root with any HTTP server and open `index.html` directly (it loads `js/app.js` as an ES module). The `dist/` build is for production deployment.

## Architecture

**Entry point:** `js/app.js` — `main()` runs on DOMContentLoaded, initializes igv.js browser, all widgets, and optional integrations (Google, Dropbox, circular view).

**Configuration:** `igvwebConfig.js` is loaded as a global script variable. It configures genomes, track registry, optional API keys (Google, Dropbox, tinyURL), and igv.js settings. A `igvwebConfig-private.js` variant (not in git) holds credentials.

**Widget pattern:** Each feature area lives in `js/widgets/` and exports a `create[Feature]Widgets(igvMain, browser, config)` function called from `app.js`. Key widget modules:
- `trackWidgets.js` — Track menu and loading (rebuilds on genome change)
- `genomeWidgets.js` — Genome menu and loading
- `sessionWidgets.js` — Session save/load
- `trackSelectionModal.js` / `trackSelectionListModal.js` — Grouped vs. list-style track selection UIs

**Global state:** `js/globals.js` stores the igv.js browser instance. Local storage persists genome ID and recent genomes.

**Key dependencies (from npm):**
- `igv` — The core genome browser engine (imported from `node_modules/igv/dist/igv.esm.js`)
- `igv-utils` — Shared utilities (GoogleAuth, igvxhr) imported at source level from `node_modules/igv-utils/src/`
- `infinite-table` — Modal table component for track/genome selection (replaces former `data-modal` package)

**CDN dependencies (loaded in index.html):**
- Bootstrap 5, JBrowse Circular Genome View, Google APIs

**Track registry:** `resources/tracks/trackRegistry.json` maps genome IDs to track list files in `resources/tracks/`.

## Rollup Build

`rollup.config.js` bundles `js/app.js` into ES module format. The `strip` plugin removes `console.log`, `assert.*`, and `debugger` statements from production builds. `copyArtifacts.js` copies CSS, images, fonts, config, and `index.html` into `dist/`.

## Code Style

- ES6 modules throughout (`import`/`export`)
- ESLint configured for ES2018, browser environment (`.eslintrc.json`)
- Bootstrap modals for dialogs
- SCSS source in `css/` (compiled to `app.css`)
