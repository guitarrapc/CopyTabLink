# CopyTabLink Copy Specification

## 1. Overview

**CopyTabLink Copy** is a Chrome extension that copies information about the currently active page to the clipboard.

The extension is optimized for quick referencing while writing blog posts, technical notes, issues, pull requests, chat messages, and documentation.

## 2. Extension Name

- Official name: `CopyTabLink Copy`
- Short name: `CopyTabLink`
- Description: `Copy the current page title and URL.`

## 3. Target Browsers

The initial implementation targets the following browsers:

- Google Chrome
- Chromium-based browsers

The initial verification and support baseline is Google Chrome.

## 4. Manifest Version and Runtime

- Manifest V3
- Background execution uses a service worker
- Clipboard writing is delegated to an offscreen document

## 5. Main Features

### 5.1 Retrieve Current Page Information

The extension retrieves the following information from the active tab:

- Page URL
- Page title

### 5.2 Title Retrieval Rules

- The title is read from `document.title`.
- Leading and trailing whitespace is removed.
- Empty titles are treated as valid but should still produce output.

### 5.3 Copy Formats

The extension supports two copy formats:

- Plain text
- Markdown link

#### Plain text format

```text
<title> <url>
```

#### Markdown format

```markdown
[<title>](<url>)
```

### 5.4 Copy Triggers

The extension supports copying via:

- Toolbar icon click
- Keyboard shortcuts
- Context menu

## 6. Commands and Keyboard Shortcuts

The initial commands are:

- `copy-plain`
  - Windows / Linux: `Alt+C`
  - macOS: `Command+Shift+C`
- `copy-markdown`
  - Windows / Linux: `Alt+M`
  - macOS: `Command+Shift+M`

Users can review and change assignments from:

```text
chrome://extensions/shortcuts
```

Shortcuts may conflict with Chrome, OS-level shortcuts, page-level shortcuts, or other extensions.

## 7. Permissions

The initial implementation uses:

```json
{
  "permissions": [
    "activeTab",
    "scripting",
    "tabs",
    "offscreen",
    "clipboardWrite",
    "contextMenus"
  ]
}
```

### 7.1 `activeTab`

Provides temporary access to the active tab after explicit user invocation.

### 7.2 `scripting`

Used for injected page-context read operations (`document.title`, `location.href`).

### 7.3 `tabs`

Used to resolve the current active tab and tab ID.

### 7.4 `offscreen`

Required to create an offscreen document used for clipboard writes in MV3.

### 7.5 `clipboardWrite`

Required for writing text to the clipboard.

### 7.6 `contextMenus`

Required to provide page context-menu entries for plain/markdown copy.

## 8. Host Permissions

The initial implementation does not define `host_permissions`.

Rationale:

- Minimize default permissions
- Access only the active tab through `activeTab` during explicit user actions

If `activeTab` becomes insufficient for keyboard-triggered scenarios on some pages, broader `host_permissions` may be considered as an explicit follow-up decision.

## 9. Architecture

To reduce the impact of browser API and manifest changes, the implementation is separated into layers:

- `src/core/`
  - Pure functions for formatting, normalization, and validation
  - No direct dependency on `chrome.*`
- `src/adapters/chrome/`
  - Browser-specific calls (`tabs`, `scripting`, `commands`, `offscreen`, messaging)
- `src/background/`
  - Entrypoint that maps command/action events to core use cases

Design goal: Changes in Chrome APIs or MV behavior should primarily affect adapters, while core logic and tests remain stable.

## 10. Unsupported Pages and Error Handling

Page information retrieval may fail on:

- `chrome://` pages
- Chrome Web Store pages
- Extension internal pages
- Pages with script execution restrictions
- PDF and other special viewer pages

Error behavior in v1:

- Log with `console.error`
- Do not crash extension runtime
- Show success toast (`Copied to clipboard`) when copy succeeds
- Show error toast (`Failed to copy`) when copy fails (best effort on restricted pages)

## 11. Testing Strategy

### 11.1 Unit Tests

Unit tests target core logic:

- Plain formatter output
- Markdown formatter output
- URL normalization behavior
- Title/site deduplication logic (if enabled by core rules)

### 11.2 E2E Tests

E2E tests run with Playwright and load the unpacked extension in Chromium.

Minimum E2E coverage:

- Background trigger for plain format returns expected plain output
- Background trigger for markdown format returns expected markdown output

## 12. CI Requirements

Pull request CI must run:

- `lint`
- `typecheck`
- `unit test`
- `e2e test` (Playwright extension tests)

The branch is merge-ready only when all required checks pass.

## 13. Release and Deployment

Release policy for v1:

- Update package.json version and tag with `<version>` (e.g., `1.0.0`)
- Create tag locally and verify tag/version consistency (`package.json` version must match tag without `v` prefix)
- Trigger release workflow by `v*` tag push, or `workflow_dispatch` with tag input
- Build extension bundle and create unsigned zip artifact in CI
- Generate and collect SLSA attestation (`*.sigstore.jsonl`) for the zip package
- Create draft GitHub Release with zip and attestation as release assets
- Submit artifact to Chrome Web Store manually and publish after review approval

This keeps publishing auditable while removing manual packaging work.

## 14. Lessons Learned

- `activeTab` + content-script execution can fail on restricted pages, so copy flow must degrade gracefully without breaking the extension runtime.
- In MV3, clipboard write stability is improved by delegating writes to an offscreen document instead of writing directly from the service worker.
- Usability improved by adding context-menu triggers in addition to action/shortcut paths, because keyboard shortcuts can conflict with OS or browser bindings.
- Release safety improved by enforcing tag/version consistency before packaging, preventing accidental mismatches between published tag and extension metadata.

## 15. Manifest Evolution Policy

When Chrome changes MV requirements or APIs:

1. Update adapter layer contracts first.
2. Keep `src/core/` API stable unless product behavior changes.
3. Update integration tests for adapter behavior.
4. Re-run unit and E2E tests before release.

Expected outcome: MV upgrades remain mostly adapter-focused, reducing broad rewrites.

## 16. Initial Release Completion Criteria

Initial implementation is complete when:

- Toolbar click copies active page information
- `Alt+C` copies plain text format
- `Alt+M` copies markdown format
- Commands are visible in `chrome://extensions/shortcuts`
- Context menu entries can trigger copy
- CI required checks pass (`lint`, `typecheck`, `unit`, `e2e`)
- Unsupported pages do not cause fatal extension failure
