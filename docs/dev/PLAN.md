# Delivery plan

Deliver the complete [SPEC](SPEC.md) on a usable classic baseline. The [architecture](ARCHITECTURE.md) and [decomposition](DECOMPOSITION.md) supply stable state and placement seams; each phase preserves its predecessor's gameplay.

## Phase and milestone map

| Phase / release | Delivery milestones | Integrated outcome and scoped exits |
| --- | --- | --- |
| 1 — Classic baseline / v0.1.0 | 1.1 — Verified game foundation; 1.2 — Playable browser experience | R-01–02 classic movement, gravity, interval locking, line clearing, score/levels, next preview, pause/restart/game-over and real keyboard/Canvas play. Unit checks, both-browser execution, user setup guidance and production build pass. Modern commands and settings are excluded. |
| 2 — Modern controls / v0.2.0 | 2.1 — Modern play and session configuration | R-03–04 plus R-06: seven-bag, hold, wall kicks, shared ghost/drop landing, ghost modes, hard drop and all six live controls. Timing/policy/queue interactions and both-browser UI checks pass. Persistence and penetrator activation are excluded. |
| 3 — Penetrator play / v0.3.0 | 3.1 — Safe penetrators and bonus presentation | R-05 with R-03–04 interactions: safe occupied-cell traversal, lowest legal drop/ghost, one-way activation, retained hold flag, capped earning/spending, white pieces and live symbols. Dense-board, timing, hold and browser rendering checks pass. Persistence remains excluded. |
| 4 — Persistent configuration / v1.0.0 | 4.1 — Saved and shareable settings | R-07 and complete R-01–09 regression: six independent cookie/URL/default resolutions, explicit-default saves, omitted-value preservation, invalid/repeated values and unavailable storage. Reload/reopen checks in both browsers, production build, complete user guidance and final report pass. |

Each phase depends on its predecessor's verified integration and release. Phase 1 has no implementation predecessor; it depends on complete accepted preparation. The user authorized the entire range and preapproved human checkpoints. Required technical and hosted gates still apply.

## Milestone boundaries and evidence

Milestone 1.1 establishes the pinned TypeScript/build/test toolchain, isolated browser provisioning and capability proof, pure piece/placement behavior, and a deterministic classic session. It demonstrates reproducible rules rather than claiming a playable product. Its review examines domain ownership, timing boundaries, collision and clearing fixtures.

Milestone 1.2 integrates Canvas, status/previews, native keyboard input and round controls into the actual served application. Its end-to-end path is a useful classic game. Inspect screenshots and native interactions for legibility, focus and pause behavior; repair functional or usability blockers before release. Later capabilities are independently deferred rather than hidden inside the baseline.

Milestone 2.1 grows the existing piece lifecycle and placement seams, then exposes session controls. Review combined queue/hold, kick, ghost/drop and policy behavior so the increment is a coherent modern game. The phase is bounded to modern controls; bonus and persistence logic do not enter its exit claims.

Milestone 3.1 introduces the penetrator invariant through the shared placement component before wiring white rendering, input and bonus feedback. Fixtures prove traversal through blockers and rejection of candidates with no remaining legal landing. Hold and lock regressions are mandatory because they preserve the ability lifetime and safe final board.

Milestone 4.1 implements the settings codec/adapter and its actual UI integration, then proves independent precedence and reload behavior for all six values. It adds persistence to already playable controls without changing gameplay rules. Full regression and final TODO aggregation establish complete target coverage.

Every delivery milestone ends in a dedicated code review/testing/report task. Each phase then has a final review milestone: 1.3, 2.2, 3.2 or 4.2 respectively, containing exactly one phase code review/testing/report task. Phase review begins only after delivery milestones close. Reports identify actual source/checks, findings, repairs and a TODO section; the last phase also produces the final implementation report. HANDOFF is refreshed in each boundary review task's completion commit.

## Verification, integration and releases

Test changed behavior first with deterministic fixtures and observed RED/GREEN evidence; run affected regressions and keep documentation with the owning delivery task. Follow the central browser policy for proactive compatible provisioning and repeated isolated context/page execution. Use the actual project runner for acceptance; retain effective versions, modes, overrides, screenshots and limits in task evidence.

Publish each task's result, evidence and first owning checkbox in one commit, then verify its push before closing its issue. Close each reviewed delivery milestone before phase review; close the phase review milestone after its issue. Audit task persistence, explicitly merge the complete verified phase into main, verify the merged state and publish it.

After integration, prepare exact release notes and version changes, verify the production build, create/publish the release commit and matching tag, and publish/read back the GitHub release. Notes state that release's delivered scope. Source archives are sufficient release assets; a built static archive may additionally be supplied. Do not claim an earlier release implements future contracts. A failed required check, publication or hosted transition blocks advancement.

## Risk and scope assessment

Browser download/host limitations are addressed before dependent application testing under BROWSER_DEV_POLICY, without weakening the required matrix. Shared placement prevents divergent penetrator previews. Injected elapsed time prevents lock timing from depending on renderer scheduling. Typed validation and failure-isolated persistence prevent malformed URLs from changing unrelated settings.

The delivery milestone counts are 2, 1, 1 and 1, excluding one phase review milestone each. These small groups are intentional: the whole product is a small static game, and later phases each deliver one cohesive capability increment on an existing game. Splitting them into extra milestones would add report/hosting boundaries without independently useful handoffs. TASKS must still split substantial domain, UI and adapter changes into bounded units; these count exceptions do not justify a single whole-game task.
