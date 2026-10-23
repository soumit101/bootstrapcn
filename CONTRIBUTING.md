# Contributing to bootstrapcn

Thank you for helping make good UI easier to use in PHP and plain HTML. Bug reports, documentation fixes, accessibility improvements, component examples and code contributions are welcome. Small, focused pull requests are easiest to review.

## Start here

- Check [open issues](https://github.com/soumit101/bootstrapcn/issues) before reporting a bug or proposing a feature.
- Use the issue templates for reproducible bugs and component requests. Include the browser, viewport, theme, markup and expected behavior.
- For larger changes, open an issue first so we can agree on the behavior and scope.
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md). For security issues, use [private reporting](SECURITY.md).

## Local setup

1. Fork the repository and clone your fork.
2. Install **Node.js 22 or newer**. Node is a development tool; applications using the library do not need it.
3. Run `npm ci` to install the pinned browser-test dependency.
4. Run `npm run serve` and open `http://127.0.0.1:8080/`.
5. For PHP examples, use PHP 8.2+ and run `php -S 127.0.0.1:8081 -t .`, then open `/examples/starter.php` on that port.

```sh
git checkout -b fix/short-description
npm run build
npm test
```

Install a test browser once with `npx playwright install chromium --with-deps`, then run `npm run test:browser`. Windows defaults to installed Microsoft Edge; set `BROWSER_CHANNEL=chromium` to use Playwright's Chromium instead. Set environment variables using your shell's syntax. `npm run test:php` runs PHP integration tests when PHP is on PATH.

## Project structure

| Location | Purpose |
| --- | --- |
| `src/bootstrapcn.css` | Core component styles |
| `src/themes.css` | Palettes and Bootstrap token bridges |
| `src/components.css` | Additional component styles |
| `src/bootstrapcn.js` | Public `BootstrapCN` API and delegated actions |
| `src/components.js` | Component controllers and lifecycle |
| `scripts/gallery.mjs` | Extended copyable gallery examples |
| `index.html` | Main gallery and foundational examples |
| `docs/coverage.json` | Component names mapped to example IDs |
| `dist/` | Committed, ready-to-use distribution files |
| `vendor/` | Pinned Bootstrap assets and licenses |
| `tests/` | Distribution, browser and PHP checks |

## Design and implementation expectations

- Preserve the two-file, no-compilation consumer experience. Avoid adding runtime CDN dependencies or framework requirements.
- Use Bootstrap 6 and native HTML controls where they provide the required behavior. Keep `.sc-*`, `data-sc-*`, `--sc-*` and `sc:*` naming consistent with the existing markup API.
- Give controls labels, keyboard behavior, visible focus and correct disabled states. Respect RTL and reduced motion where relevant.
- Check all ten palettes in light and dark modes, plus narrow mobile layouts.
- Use text-safe DOM APIs for user-supplied content. Keep server-side validation in PHP examples.
- Ensure `BootstrapCN.init(root)` is idempotent and `BootstrapCN.dispose(root)` releases added listeners and resources.
- Add a copyable example and update the coverage map for new patterns. State limitations clearly rather than claiming complete parity with a React component.
- Preserve third-party notices. Do not hand-edit the minified vendor files. Bootstrap's known alpha compatibility patch is guarded in `scripts/build.mjs`; changes need a focused explanation and regression coverage.

## Before opening a pull request

```sh
npm run build
npm test
npm run check:generated
npm run test:browser
npm run test:php
```

Run the checks relevant to your change; CI runs all of them. Add meaningful regression coverage for behavior changes. Update the documentation and Unreleased changelog section. Include generated `dist/` and gallery changes produced by `npm run build`. Do not commit screenshots, ZIPs, node_modules, credentials or local environment files.

Your PR description should explain the problem, resulting behavior and verification. Include screenshots for visual changes and note any checks you could not run. Maintainers review contributions before merging; a report or PR is welcome even if you do not yet have a complete fix.

## License

By submitting a contribution, you agree that it is licensed under this project's [MIT license](LICENSE). No CLA is required. Preserve existing authorship and third-party attribution.
