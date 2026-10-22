# Project handoff

Checkpoint: T-020 verified before its closing commit/publication. Recover later effects from Git, TASKS and hosted readback.

## Workflow and sources

Main development under sdd-implement; all four phases remain within accepted scope. Governing [SPEC](SPEC.md), [PLAN](PLAN.md), [TASKS](TASKS.md), [layout](layout.md), root [AGENTS](../../AGENTS.md) and [browser policy](../../BROWSER_DEV_POLICY.md). Installed SDD Manager 0.15.2; bundled package 0.15.1. Host Linux/Node 24; managed isolated headless Chromium 141.0.7390.37 and patched Firefox 142.0.1. Host-specific Firefox sandbox recovery is confined to trusted localhost tests; see T-001 and policy. No personal/system browser or OS-window focus evidence.

## Authority and decisions

- The user approved PROJECT c34c0b17401fb45541244cd33d6be0fa2663d738 on 2026-10-22 and preapproved all remaining human checkpoints, requesting fully autonomous continuation through the complete agreed project. The grant was published with DOCS-002 and governs later documents, implementation, integration and phase releases.
- Authorized range: all TASKS phases 1–4, ending with full-scope v1.0.0 and verified GitHub release. Stop only on a genuine unresolved technical/authority blocker. QC, tracking, one task per result/evidence/initial-checkbox commit, per-commit publication and explicit integration remain required.
- Tracking is enabled by root AGENTS; reporting is Standard. GitHub app reads work, but app issue writes were denied; supplied repository-token API access completed authorized tracking. Credentials are excluded and supplied separately on a fresh clone.

## Branch and source

Current branch `phase/4-persistent-configuration` targets main; branch-off `31309b51d6c3901f0a58c98f748bd6247ba731f0`. Reviewed published source `6feac3b8bd9097d594ae19a6deb622d85a99f89c` plus identified repairs in this closing result. Existing phase task issues/milestones are projected and read back; no successor phase is activated before predecessor release. Preparation is integrated and its milestone closed.

## Current boundary and next action

Milestone 4.1 Ready after independent review and repair of Important 4.1-F01. Both browsers reproduced a slow persistence effect locking a piece before policy change; selection/configuration now share act() command timing, and both verify a fresh full interval. All 99 unit, 40 Chromium/Firefox, TypeScript and production-build checks pass after repair with zero owned browser survivors. Six-setting precedence, defaults, failures, cookies, reload/reopen and documentation are covered. TODO: None.

Boundary report: [4.1.md](reports/phases/4/4.1.md).

After this owning result is published and issue 29 closes, close native milestone 9 after all three issues read back closed. Execute T-021 whole-project/phase review with full regression, task persistence audit and aggregated TODO report. Then close milestone 10, integrate phase 4 with required merged checks, and publish/read back full-scope v1.0.0; the authorized range ends there.

Publish/read back each commit before further task work; task result, evidence and initial completion checkbox stay together. Close task issue after publication, then eligible native milestone after all associated issues close. Integrate a complete phase with an explicit two-parent merge, required merged checks and remote readback; publish matching version/tag/release notes before successor activation. This handoff cannot prove its own subsequent publication.
