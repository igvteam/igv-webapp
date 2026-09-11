    
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

IGV-Web is a pure-client genome browser app that wraps [igv.js](https://github.com/igvteam/igv.js) with a Bootstrap
menu bar (genome, track, session, sample-info, share, and tools menus). There is no server side: the app is a static
`index.html` plus ES modules under `js/`, and all state lives in the igv.js `Browser` instance, the URL, or
`localStorage`.

## No-packaging-tools principle

All igvteam projects hold to this: **the source must run in a browser as-is, with no packaging or transpile step.**
`index.html` loads `js/app.js` directly as a module and that is the normal way to run the app; rollup exists only to
produce a distribution bundle, not to make the code work.

The visible consequence is that dependencies are imported by explicit relative path
(`../node_modules/igv/dist/igv.esm.js`, `../../node_modules/igv-utils/src/index.js`), because a bare specifier
(`import igv from 'igv'`) is not resolvable by a browser. Keep that convention, and do not introduce anything that
requires a build to run: no bare-specifier imports, no JSX, no TypeScript, no syntax a current browser cannot execute.

## Commands

```bash
npm install          # also fetches igv, igv-utils, and data-modal (the latter two from git tags)
npm run build        # updateVersion -> clean dist -> rollup -> copyArtifacts
```

There is no test runner, no lint script, and no dev server script. To run the app during development, serve the repo
root with any static file server and open `index.html` — it loads `js/app.js` directly as a module, so source changes
need only a reload, no build step. `npm run build` is only for producing `dist/`.

`test/` holds fixture data (genomes, sessions, track JSON) used for manual testing, not automated tests.
`test/server/noResponseServer.js` (`node test/server/noResponseServer.js`) simulates a hung server on port 9999.

`scripts/devIGV.js` rewrites `package.json` to point the `igv` dependency at igv.js `master` — used for test builds
against unreleased igv.js. Do not commit the result.

## Build pipeline

`npm run build` runs four steps (see `package.json` and `scripts/`):

1. `updateVersion.js` — rewrites the `const _version` line in `js/version.js` from `package.json`. Never edit
   `js/version.js` by hand; bump `package.json` instead.
2. `clean.js` — empties `dist/`.
3. `rollup -c` — bundles `js/app.js` into `dist/app_bundle-<version>.esm.js` (+ minified).
   `@rollup/plugin-strip` removes `console.log`, `assert.*`, `debug`, and `debugger` from the bundle, so those are not
   usable for production diagnostics. `console.error`/`console.warn` survive.
4. `copyArtifacts.js` — copies `igvwebConfig.js`, `css/`, `img/`, `resources/`, `favicon.ico` into `dist/` and writes a
   `dist/index.html` whose `js/app.js` script tag is rewritten to the versioned bundle.

Third-party libraries loaded from CDN in `index.html` (Bootstrap 5, jQuery slim, DataTables, React + JBrowse circular
view, Google auth) are **not** bundled. jQuery (`$`) is a global used by a few widgets alongside plain DOM code.

## Configuration

`igvwebConfig.js` defines a global `igvwebConfig` object loaded by a plain script tag before `js/app.js`. It is
deployment configuration, not source: genome list URL, track registry path, optional Dropbox/Google/URL-shortener
credentials, `enableCircularView`, `restoreLastGenome`, and a nested `igvConfig` passed through to
`igv.createBrowser`. `igvwebConfig-private.js` is a gitignored local copy holding real API keys.

Feature availability is derived from which keys are present (`config.dropboxAPIKey`, `config.clientId`,
`config.googleDriveEnabled`); `configureCloudButtons` in `js/app.js` hides the corresponding menu items when absent.

`resources/tracks/trackRegistry.json` maps a genome id to a list of track-menu entries — local JSON track lists, remote
UCSC/NCBI `hub.txt` URLs, or `"---"` for a menu separator. `resources/sessions/sessionRegistry.json` similarly drives
the example-session menu.

## Architecture

`js/app.js` is the whole application lifecycle: it reads `igvwebConfig`, initializes Google auth, resolves the genome
list, creates the igv.js `Browser`, and then calls one `create*Widgets(igvMain, browser, config)` factory per menu
(`js/widgets/genomeWidgets.js`, `trackWidgets.js`, `sessionWidgets.js`, `toolsWidgets.js`, `sampleInfoWidgets.js`,
`saveImageWidgets.js`, and `js/shareWidgets.js`). Widgets are not classes with a shared base — each factory wires
listeners onto markup that already exists in `index.html` by element id (`igv-app-*`). Adding a menu item means editing
both `index.html` and the corresponding widget module.

Key points that span files:

- **Browser handle.** `js/globals.js` is a one-property module (`Globals.browser`) used by code that runs outside the
  widget factories (e.g. `shareHelper.js`). Prefer passing `browser` explicitly; `Globals` is the escape hatch.
- **Startup error recovery.** `igv.createBrowser` inserts the browser into the DOM *before* loading session/genome/
  tracks, so a failure leaves an orphaned instance. `main()` calls `igv.removeAllBrowsers()` and retries once with the
  session and genome stripped and `queryParametersSupported: false` (so parameters are not re-applied). Preserve this
  when touching startup.
- **Locus vs. session.** igv.js gives a session's own locus precedence over the `locus` query parameter, so
  `loadSessionWithLocusOverride` pre-loads the session named by `sessionURL`/`session`/`hubURL`, patches the locus, and
  hands the merged config to `createBrowser`. XML sessions additionally need `restoreXMLSessionGenome`, because without
  igv.js's genome registry an XML `genome` attribute is misread as a FASTA URL. When pre-loading is not possible, the
  fallback is `applyLocusParameter` (a `browser.search` after creation, which visibly jumps).
- **localStorage keys.** `genomeID` (last genome, restored when `restoreLastGenome`), `recentGenomes` (custom genomes
  loaded by URL), `note_<key>` (dismissed notifications). All read in `app.js`/`genomeWidgets.js`.
- **File loading.** `widgets/fileLoad.js` is the base for `sessionFileLoad.js` and `genomeFileLoad.js`, unifying local
  file input, Dropbox chooser, and Google Drive picker into one `loadFiles([{path, name}])` call.
  `multipleTrackLoadHelper.js` and `urlLoadWidget.js` cover track loading; `trackSelectionModal.js` /
  `trackSelectionListModal.js` and the `data-modal` `ModalTable` render hub and registry track pickers.
- **Sharing.** `shareHelper.js` builds `?sessionURL=blob:<compressedSession>` URLs from
  `browser.compressedSession()`, optionally shortened via the `urlShortener` config (`urlShortener.js` supports tinyURL
  and bitly).
- **Alerts.** Use the `alertSingleton` module (`widgets/alertSingleton.js`), initialized once against `#igv-main`.
  Avoid `alert()`/`confirm()` — the app uses Bootstrap modals throughout.

## Conventions

Source is ES2018+ modules, no framework, no transpile step (`.babelrc` and `.eslintrc.json` are vestigial — neither
babel nor eslint is installed as a dependency). Semicolons are largely omitted in newer files; match the file you are
editing.

## Git commit messages

- Keep commit messages extremely concise.
- A single short subject line (under 50 characters) whenever possible; no body.
- No bulleted lists, no recaps of what changed file-by-file, no explanation of the reasoning.
- Add a body only when the *why* is genuinely non-obvious from the diff — then one or two sentences, not a summary of the change.

