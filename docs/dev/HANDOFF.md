# Project handoff

Checkpoint: T-007 verified before its closing commit/publication. Recover later effects from Git, TASKS and hosted readback.

## Workflow and sources

Main development under sdd-implement; all four phases remain within accepted scope. Governing [SPEC](SPEC.md), [PLAN](PLAN.md), [TASKS](TASKS.md), [layout](layout.md), root [AGENTS](../../AGENTS.md) and [browser policy](../../BROWSER_DEV_POLICY.md). Installed SDD Manager 0.15.2; bundled package 0.15.1. Host Linux/Node 24; managed isolated headless Chromium 141.0.7390.37 and patched Firefox 142.0.1. Host-specific Firefox sandbox recovery is confined to trusted localhost tests; see T-001 and policy. No personal/system browser or OS-window focus evidence.

## Authority and decisions

- The user approved PROJECT c34c0b17401fb45541244cd33d6be0fa2663d738 on 2026-10-22 and preapproved all remaining human checkpoints, requesting fully autonomous continuation through the complete agreed project. The grant was published with DOCS-002 and governs later documents, implementation, integration and phase releases.
- Authorized range: all TASKS phases 1–4, ending with full-scope v1.0.0 and verified GitHub release. Stop only on a genuine unresolved technical/authority blocker. QC, tracking, one task per result/evidence/initial-checkbox commit, per-commit publication and explicit integration remain required.
- Tracking is enabled by root AGENTS; reporting is Standard. GitHub app reads work, but app issue writes were denied; supplied repository-token API access completed authorized tracking. Credentials are excluded and supplied separately on a fresh clone.


## Branch and source

Current branch `phase/1-classic-baseline` targets main; branch-off `0dcd660c68c22717617f4f931f2be9f96d3c5add`. Reviewed published source `52d8bd75592341f9a8b7446ca5145b7d7535eac7` plus identified repairs in this closing result. Existing phase task issues/milestones are projected and read back; no successor phase is activated before predecessor release. Preparation is integrated and its milestone closed.

## Current boundary and next action

Independent UI review and repair recheck resolved two clock/input blockers and two accessibility/test-harness findings. All 28 unit, 18 browser, type/build checks pass; final environment adjustment separately reran type and both-browser checks. Native keys, controlled-time pause, repeat default prevention, unchanged status and page-error assertions are covered. No TODO; HANDOFF refreshed.

Boundary report: [1.2.md](reports/phases/1/1.2.md).

Publish/read back T-007 and close issue 16, then close native milestone 3. Execute T-008 phase review after milestones 2 and 3 are confirmed closed; phase 1 integration/release remains pending.

Publish/read back each commit before further task work; task result, evidence and initial completion checkbox stay together. Close task issue after publication, then eligible native milestone after all associated issues close. Integrate a complete phase with an explicit two-parent merge, required merged checks and remote readback; publish matching version/tag/release notes before successor activation. This handoff cannot prove its own subsequent publication.
