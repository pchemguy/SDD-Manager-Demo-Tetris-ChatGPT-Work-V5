# Full implementation report

Status: Ready for final integration and v1.0.0 publication. Reviewed source: phase/4-persistent-configuration at fd90f89b0737bf5ba3a46ad288f3c48ebafee7f0, plus the owning T-021 report/checklist result. This is the final implementation acceptance checkpoint; the owning task's publication, milestone closure, verified merge and release are subsequent observable effects.

## Outcome and acceptance

The complete accepted browser Tetris target is implemented. A playable classic baseline was delivered first, followed by bounded modern-control, penetrator and persistence increments. The project is a static TypeScript application with Canvas rendering, semantic controls, no application backend and current [player/setup guidance](../../../README.md).

| Contract | Supported behavior and evidence |
| --- | --- |
| R-01 | Ten-by-twenty board, seven nonwhite tetrominoes, legal movement/ordered clockwise kicks, simultaneous clears, literal scoring and level/gravity progression. Model/game/landing unit fixtures and classic browser play pass. |
| R-02 | Full gravity interval from grounding by default, continuously grounded deadline preservation, cancellation on leaving support, failed-attempt alternative, immediate/follow hard drop, chronological long frames, pause/restart/game-over. Exact-clock unit and real-input browser regressions pass, including slow persistence before policy change. |
| R-03 | Injected-source seven-bag reproducibility, one hold per lock, empty-hold queue consumption, nonempty exchange, fresh reception clocks and retained storage when disabled. Source/hold unit and native C/Space browser checks pass. |
| R-04 | Shared normal/penetrator landing for ghost and hard drop. Dynamic ghost hides only wholly upper projections and shows straddling/lower ones. Literal boundary/projection unit and Canvas pixel checks pass. |
| R-05 | Four-line bonus earning, three unspent maximum independent of held/active abilities, one-way E activation, safe occupied-cell traversal, lowest legal drop/ghost, retained hold flag, dead-end rejection and safe final lock. Entirely white active/held pieces, white ghost and live lightning/numeric indicators are verified. |
| R-06 | Six labeled settings, actual next/held previews, native keyboard/form focus, repeat suppression, enabled/disabled controls and accessible status. Both-browser interaction and desktop/narrow inspection pass. |
| R-07 | Independent URL > cookie > default precedence for all six settings, explicit-default cookie saves, omitted-cookie retention, invalid/repeated fallthrough and isolated failures. Real cookies, history/fragment preservation, reload and a new page without parameters pass; HTTPS attributes/failures have controlled-port evidence. |
| R-08 | Browser effects stay at the injected settings port and composition boundary; domain has no DOM/storage dependency. Shared placement guards traversal/landing/lock. Rejection and seeded simulation fixtures preserve queue, board and stock invariants. |
| R-09 | Source-identified task/milestone/phase evidence, independent milestone reviews, deterministic tests, owned managed browser execution, inspected screenshots and production build. Per-task publication and verified phase integration/release history are maintained; final lifecycle effects follow this checkpoint. |

Accepted decisions remain intact: straddling ghosts are visible; grounded motion does not restart the timer; hold preserves penetrator lifetime without refund; settled cells return to their regular type color after the ability ends at lock; exact invalid tokens fall through independently. Only settings persist, not an in-progress round.

## Verification

Fresh final commands pass: npm run check, npm run test:unit (99 tests), npm run build and npm run test:browser (40 checks). Node 24.19.0 on Linux; isolated managed headless Chromium 141.0.7390.37 and patched Firefox 142.0.1 run from the repository-owned .cache/browsers. Pinned setup and the runner share that path. The diagnosed current-host Firefox sandbox override is confined to trusted localhost tests, as recorded in T-001 and the browser policy.

The runner reports zero owned survivors and has actual SIGINT/SIGTERM cleanup and unexpected-child-signal regression checks. Browser fixtures are absent from the production bundle. Both-browser desktop/narrow screenshots were inspected on the final composed UI in T-019; all six controls and three bonus symbols remain legible. Tests observe native key/form delivery and modeled blur; they do not establish OS-window focus. HTTPS cookie attributes and unavailable-storage paths are controlled-adapter evidence, while reload/reopen use actual HTTP browser cookies. Independent reviewers inspected code and repairs without executing checks or independently inspecting screenshots.

## Aggregated findings and TODO dispositions

| Source | Finding and final disposition |
| --- | --- |
| [Milestone 1.1](phases/1/1.1.md) | Important F-01 runner cancellation/PID namespace cleanup and unexpected child-signal success repaired with observed failing/passing fixtures. Minor F-02 partial clear coverage extended with literal retained-row/scoring cases. Resolved. |
| [Milestone 1.2](phases/1/1.2.md) | Important UI-01 paused wall time and UI-02 repeated rotation scrolling repaired with native-input regressions. Minor UI-03 redundant announcements and UI-04 stale environment RAF repaired and rechecked. Resolved. |
| [Milestone 2.1](phases/2/2.1.md) | Minor 2.1-F01 randomness coverage strengthened with repeatable and differing injected sources. Resolved without production change. |
| [Milestone 3.1](phases/3/3.1.md) | Minor 3.1-F01 bonus-cap independence covered with active/held penetrators and retained held identity. Resolved without production change. |
| [Milestone 4.1](phases/4/4.1.md) | Important 4.1-F01 persistence effects preceded command timing. Both browsers reproduced premature lock; selection/configuration moved inside act(), then all 40 browser checks passed including a full-interval regression. Resolved. |
| Phase reviews 1–4 | Earlier reports' later-phase scope exclusions are now delivered. Every milestone/phase TODO section is None; no functional deferrals or unresolved findings remain. |

## Delivery provenance and remaining lifecycle

| Phase | Verified release before this checkpoint |
| --- | --- |
| Classic baseline | v0.1.0, source/tag a908861ba877a906f2bff32ba7a4bbcc5687d963, release 420598164 |
| Modern controls | v0.2.0, source/tag 5aed8ea95d94417030252e2bbf70ddde70def9fb, release 420629910 |
| Penetrator play | v0.3.0, source/tag 31309b51d6c3901f0a58c98f748bd6247ba731f0, release 420657753 |
| Persistent configuration/full target | v1.0.0 follows this final task's verified publication, native milestone 10 closure and required two-parent phase-4 integration/checks. |

All 20 preceding implementation tasks pass a whole-history audit for exactly one owning result/evidence/initial-checkbox commit; review tasks include HANDOFF. T-021 must satisfy the same audit after its closing commit. Native milestone 9 is closed; earlier preparation/phase milestones were verified closed at their boundaries. Transient GitHub read interruptions were reconciled against hosted state and recovered using original commits, with no duplicate completion or change to authorization. The user's all-phase/checkpoint preapproval remains recorded in HANDOFF.

Complete the final all-21 audit, close issue 30 and milestone 10 after readback, integrate phase 4 with exact two-parent provenance and merged unit/type/build/browser checks, publish main, assess the complete release range, then create/publish the version commit, matching tag and exact GitHub release notes. Source archives are the accepted release assets. Publication success must be established by GitHub readback; this report does not assert those future effects.

## TODO

None. All requested functionality and review repairs are complete at this acceptance checkpoint. Required final integration/release actions remain explicitly identified above.
