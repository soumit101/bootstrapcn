# Unreleased

Changes after the first public release will be recorded here.

# 0.3.0 — 2026-10-24

- First public release as **bootstrapcn**.
- Renamed distribution files to `bootstrapcn.css` and `bootstrapcn.js`, and the JavaScript API to `BootstrapCN`.
- Added a public documentation guide, PHP integration guidance, contributor setup, issue/PR templates, Code of Conduct and security policy.
- Added reproducible development dependencies, generated-file checks, portable browser-test runner, PHP integration checks and GitHub Actions CI.
- Retained the existing `.sc-*`, `data-sc-*`, `--sc-*` and `sc:*` markup/event conventions.

# 0.2.0

- Added ten independently persisted palettes: neutral, slate, stone, zinc, blue, green, rose, orange, violet and teal. Every palette supports light, dark and system modes.
- Expanded to 53 example groups with tracked coverage for 66 shadcn catalog patterns. Added calendars, date/range picker, OTP, carousel, bar chart, command search, context menu, client-side data table, resizable panels, sidebar, grouped controls, navigation, content and messaging primitives.
- Fixed documentation search links ignoring hidden state, restored mobile browsing, and prevented repeated copy actions leaving incorrect button labels.
- Fixed storage-blocked theme initialization ignoring the declared default. Added dynamic initialization and disposal, synchronized palette controls, and prevented disabled button-links navigating via keyboard.
- Fixed calendar form values being removed by Bootstrap's inline calendar rendering. Added an external ISO field adapter and reset handling for calendar, date picker, OTP and combobox. Disabled combobox fields are excluded from FormData.
- Fixed closed calendar popups retaining offscreen positions and creating horizontal overflow after viewport resizing. Added inline calendar width constraints.
- Fixed RTL switch direction and notification placement.
- Fixed Bootstrap's unlayered root tokens overriding theme variables, so native Bootstrap primary buttons also receive the selected palette.
- Applied a guarded Bootstrap 6 alpha.1 registry patch: Combobox composes Menu on the same element, but the upstream instance map rejects multiple types. Only the `bs.combobox`/`bs.menu` pair is allowed. All other registry guards stay intact, and an unexpected vendor source fails the build. Vendor originals are preserved.
- Added catalog coverage and duplicate-ID checks, interaction/form/lifecycle regressions, 20 palette/mode primary-text contrast checks and 320–1440px layout checks. Tested in Chromium/Edge; PHP runtime execution and other browser engines are not verified in this environment.

# 0.1.0

- Initial Bootstrap 6 alpha-based theme, common components, two-file distribution and raw PHP starter.
