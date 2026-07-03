[![Build](https://github.com/guitarrapc/CopyTabLink/actions/workflows/build.yml/badge.svg)](https://github.com/guitarrapc/CopyTabLink/actions/workflows/build.yml)

# CopyTabLink

Chrome extension that copies the current page title and URL.

## Development

```bash
npm install
npm run build
```

Load `dist/` from `chrome://extensions/` with Developer Mode enabled.

## Commands

| WHAT | Windows/Linux | macOS |
| --- | --- | --- |
| Copy plain format | `Alt+C` | `Command+Shift+C` |
| Copy markdown format | `Alt+M` | `Command+Shift+M` |

## Scripts

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run build`
