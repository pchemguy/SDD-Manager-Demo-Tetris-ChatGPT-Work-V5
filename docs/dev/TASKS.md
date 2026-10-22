# Implementation tasks

Derived from accepted [SPEC](SPEC.md), [PLAN](PLAN.md) and [layout](layout.md). The user authorized all phases and preapproved human checkpoints on 2026-10-22. Each task closes with its verified result/evidence in one commit, followed by verified push and issue closure. Phase integration and releases follow PLAN.

## Phase 1 — Classic baseline

- [ ] Phase 1 — Classic baseline
    - [ ] Milestone 1.1 — Verified game foundation
        - [x] T-001 — Establish pinned tooling and isolated browser capability
            Depends on: none.
            Scope and evidence: Root package/lock/TS/Playwright config and scripts; R-09. Verify locked installation, both managed browser versions, two isolated interaction/render/teardown cycles per browser, actual runner wiring and central-policy diagnostics. Record setup provenance and limits.
            Verified result: [T-001](reports/phases/1/T-001.md).
        - [x] T-002 — Implement tetromino geometry and normal placement
            Depends on: T-001.
            Scope and evidence: src/model.ts and focused unit checks; R-01/R-08. Observe RED/GREEN for seven four-cell types, rotations, bounds, collision and normal landing.
            Verified result: [T-002](reports/phases/1/T-002.md).
        - [ ] T-003 — Implement deterministic classic session and interval locking
            Depends on: T-002.
            Scope and evidence: src/game.ts and unit checks; R-01–02/R-08. Observe RED/GREEN for movement, gravity, exact grounding deadline, reset/pause, clear/scoring/level and blocked spawn.
        - [ ] T-004 — Review test and report milestone 1.1
            Depends on: T-001, T-002, T-003.
            Scope and evidence: Read-only domain/tooling code review, required unit/type checks, blocker repair, TODO assessment, docs/dev/reports/phases/1/1.1.md and HANDOFF refresh.
    - [ ] Milestone 1.2 — Playable browser experience
        - [ ] T-005 — Render a playable classic game with native controls
            Depends on: T-004.
            Scope and evidence: src/renderer.ts, src/main.ts, style and index; R-01–02/R-06 baseline. Browser RED/GREEN for start, real key movement, rotation, pause/restart, focus and Canvas output.
        - [ ] T-006 — Verify classic browser acceptance and document setup
            Depends on: T-005.
            Scope and evidence: tests/browser and README/AGENTS; R-09. Both-browser native interaction, game-over/line-clear fixtures, screenshot inspection, production build and validated setup commands.
        - [ ] T-007 — Review test and report milestone 1.2
            Depends on: T-005, T-006.
            Scope and evidence: Whole classic UI/integration code review, required regressions, docs/dev/reports/phases/1/1.2.md, TODO assessment and HANDOFF refresh.
    - [ ] Milestone 1.3 — Phase review
        - [ ] T-008 — Review test and report phase 1
            Depends on: Milestones 1.1 and 1.2 complete and closed.
            Scope and evidence: Review phase exits/code and all classic regressions, persistence audit, docs/dev/reports/phases/1/PHASE-REPORT.md and HANDOFF. No modern capability claim.

## Phase 2 — Modern controls

- [ ] Phase 2 — Modern controls
    - [ ] Milestone 2.1 — Modern play and session configuration
        - [ ] T-009 — Add seven bag and hold lifecycle
            Depends on: T-008 and phase 1 integrated/released.
            Scope and evidence: src/game.ts and unit checks; R-03. RED/GREEN for bag membership, queue consumption, one-hold-per-lock, swap/reset and disabled hold.
        - [ ] T-010 — Add wall kicks shared ghost and hard drop
            Depends on: T-009.
            Scope and evidence: src/model.ts, game, renderer and tests; R-02–04. RED/GREEN for ordered kicks, landing agreement, dynamic midline, drop scoring and both hard-drop lock policies.
        - [ ] T-011 — Expose six live session settings
            Depends on: T-010.
            Scope and evidence: src/settings.ts, main/style and tests; R-06. Validated defaults, controls, enablement/policy changes, form focus and both-browser modern interaction; update user guidance.
        - [ ] T-012 — Review test and report milestone 2.1
            Depends on: T-009, T-010, T-011.
            Scope and evidence: Modern-command/settings code review and regressions; docs/dev/reports/phases/2/2.1.md, TODO assessment and HANDOFF refresh.
    - [ ] Milestone 2.2 — Phase review
        - [ ] T-013 — Review test and report phase 2
            Depends on: Milestone 2.1 complete and closed.
            Scope and evidence: Cross-feature timing/hold/ghost/drop and both-browser review, persistence audit, docs/dev/reports/phases/2/PHASE-REPORT.md and HANDOFF. No persistence or penetrator claim.

## Phase 3 — Penetrator play

- [ ] Phase 3 — Penetrator play
    - [ ] Milestone 3.1 — Safe penetrators and bonus presentation
        - [ ] T-014 — Implement safe penetrator traversal and bonus lifecycle
            Depends on: T-013 and phase 2 integrated/released.
            Scope and evidence: src/model.ts, game and unit fixtures; R-05 with R-02–04. RED/GREEN for occupied traversal, lowest valid landing, rejected dead ends, inventory cap/spend, hold flag, activation/timing and non-overlap lock.
        - [ ] T-015 — Present penetrator controls white pieces and bonuses
            Depends on: T-014.
            Scope and evidence: renderer, main and browser checks; R-05/R-06. Real activation/hold/drop input, matching ghost, white active/held cells, lightning/numeric indicator updates and guidance in both browsers.
        - [ ] T-016 — Review test and report milestone 3.1
            Depends on: T-014, T-015.
            Scope and evidence: Penetrator/invariant code review and focused/full regressions; docs/dev/reports/phases/3/3.1.md, TODO assessment and HANDOFF refresh.
    - [ ] Milestone 3.2 — Phase review
        - [ ] T-017 — Review test and report phase 3
            Depends on: Milestone 3.1 complete and closed.
            Scope and evidence: Review all penetrator interactions and preserved play, persistence audit, docs/dev/reports/phases/3/PHASE-REPORT.md and HANDOFF. Persistence remains pending.

## Phase 4 — Persistent configuration

- [ ] Phase 4 — Persistent configuration
    - [ ] Milestone 4.1 — Saved and shareable settings
        - [ ] T-018 — Implement independent URL cookie settings persistence
            Depends on: T-017 and phase 3 integrated/released.
            Scope and evidence: src/settings.ts and controlled-adapter unit checks; R-07. RED/GREEN for all six precedence paths, explicit defaults, omitted/invalid/repeated values, change writes and storage/URL failures.
        - [ ] T-019 — Integrate reload persistence and complete user guidance
            Depends on: T-018.
            Scope and evidence: main, browser suites and README; R-07/R-09. Real cookies, parameter preservation, reload/reopen and six-setting controls in both browsers; complete regression and production build.
        - [ ] T-020 — Review test and report milestone 4.1
            Depends on: T-018, T-019.
            Scope and evidence: Persistence/UI code review, all contract regression, docs/dev/reports/phases/4/4.1.md, TODO assessment and HANDOFF refresh.
    - [ ] Milestone 4.2 — Phase review
        - [ ] T-021 — Review test and report phase 4 and full implementation
            Depends on: Milestone 4.1 complete and closed.
            Scope and evidence: Complete code/acceptance review, full tests/build, task persistence audit, docs/dev/reports/phases/4/PHASE-REPORT.md, docs/dev/reports/IMPLEMENTATION-REPORT.md with aggregated TODO dispositions and HANDOFF.

## Execution evidence

Implementation is progressing under the recorded full-range authority. Task-specific RED/GREEN commands, checks and outcome records belong under the owning phase report directory and are linked from completion entries. Review reports preserve findings, TODO sections and source scope.
