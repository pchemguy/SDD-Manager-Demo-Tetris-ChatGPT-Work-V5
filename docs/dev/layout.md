# Repository layout

This is the intended physical ownership map for the accepted design and PLAN. It does not claim the implementation files already exist.

| Location | Owner and contents |
| --- | --- |
| `src/model.ts` | Pure tetromino geometry, coordinate operations, collision and shared placement/landing helpers |
| `src/game.ts` | Game session, piece source, command transitions, scoring, bonuses and elapsed-time simulation |
| `src/settings.ts` | Typed settings, canonical value codec and persistence through a narrow injected browser adapter |
| `src/renderer.ts` | Canvas board and piece/ghost/preview drawing, consuming domain results |
| `src/main.ts`, `src/style.css`, `index.html` | Application composition, semantic HTML, native input, focus/lifecycle and visual presentation |
| `tests/unit/` | Deterministic Node test-runner suites for model, session and settings; no browser required |
| `tests/browser/` | Playwright application suites, controlled board fixtures and screenshot/Canvas assertions |
| `scripts/` | Browser setup/probe/runner utilities and reproducible local development support |
| Root package/TypeScript/Playwright configuration | Pinned development dependencies, lockfile, build/check/test entry points and browser projects |
| `.cache/`, `test-results/`, `playwright-report/`, `dist/` | Ignored owned browsers/state, generated test output and production build; excluded from source and runtime assets |
| `docs/dev/` | Governing documents, their adjacent QC reports, DOCS_TASKS, TASKS and HANDOFF |
| `docs/dev/reports/phases/<number>/` | Task evidence, milestone reports and PHASE-REPORT for that phase |
| `docs/dev/reports/IMPLEMENTATION-REPORT.md` | Final verified outcome and aggregated TODO dispositions |
| Root README and RELEASE-NOTES | Current setup/play guidance and the retained complete release message |

## Dependency and maintenance rules

Model and game import no browser resources. Settings accepts a small storage/URL port so unit checks can exercise failures without a DOM. Main composes the adapter and input lifecycle. Renderer consumes the session and placement result; it does not implement board mutation or another landing scan. Logical piece-source/timing units remain within game because they share the same session lifecycle; the public data/command boundary remains testable.

Tests sit outside production source. A deterministic fixture hook is available only in test mode and removed from production builds. Node test modules use explicit TypeScript module paths. Browser configuration and scripts share one absolute project-assigned managed-browser root. No personal/system browser discovery or global installation is permitted.

Preserve the existing `.agents` packages, root policies and disclosures. AGENTS gains project navigation and commands only after those commands are established and validated. Generated assets and token files remain ignored. Future coherent helper files may be introduced within the owning area when their responsibilities justify them; they do not change the module dependency direction.
