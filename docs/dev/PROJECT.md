# Browser Tetris project brief

Status: approved under DOCS-002; ongoing preparation is authorized by the user's remaining-checkpoint preapproval.
Source: the user's complete project request of 2026-10-22.

## Purpose and intended outcome

Develop a responsive, single-player browser Tetris game for keyboard play. Deliver a simple, useful classic baseline first, then expand it through bounded playable increments until the complete scope below is available. Each completed implementation phase receives a verified, integrated GitHub release.

Desktop keyboard use and the technical direction below are accepted project assumptions. The repository currently contains development guidance and skills; no game implementation exists.

## Complete target scope

- Classic play: a proposed 10-column by 20-row board, the seven tetrominoes, movement and rotation, gravity and soft drop, line clearing, score and level feedback, pause/resume, restart and game over.
- Modern play: hold, ghost projection, 7-bag randomization, wall kicks and hard drop. The default lock policy waits one full gravity interval from grounding; hard drop follows that policy unless its immediate-lock option is selected.
- Conditional ghost visibility: optionally hide a projection in the board's upper half and show it again in the lower half.
- Penetrators: a hotkey spends one available bonus to transform the falling piece. It can traverse occupied cells without destroying them, remains a penetrator until it locks, and must finish entirely inside the board without overlap. Hard drop finds its lowest legal landing and the visible ghost previews the same position. Penetrators are entirely white; regular pieces use other colors.
- Bonuses: clearing four lines simultaneously earns one activation, with at most three unspent bonuses. The side panel displays one symbol per bonus and updates when a bonus is earned or spent.
- Configuration: side-panel controls cover ghost visibility, hard-drop enablement, next preview, hard-drop locking policy, general locking policy and hold enablement. Ghost modes are hidden, dynamically hidden above the midline, or always visible. General locking offers failed downward attempt or full grounded interval; hard drop either follows it or locks immediately.
- Persistence: resolve each setting independently from explicit URL value, then saved cookie, then default. A control change updates both its cookie and URL parameter. Save valid explicit URL values to cookies even when they equal defaults. Omitted URL parameters preserve saved cookies. Session-only settings may precede persistence as an intermediate increment.

These requirements describe the complete product. PLAN will determine phase and milestone boundaries; detailed contracts and acceptance belong to SPEC.

## Technical direction and scope limits

Use TypeScript, HTML Canvas for the board, and ordinary HTML controls for configuration and status. This suits the small interface and allows explicit game-state contracts without a UI framework. Plain JavaScript with Canvas is a viable alternative if avoiding a compilation step is more important than static checks; TypeScript is recommended here.

Distribute a static web application served over HTTP(S), with gameplay and settings handled in the browser. A backend, accounts, network multiplayer, online leaderboards, touch controls and saved in-progress games are outside the project scope. These exclusions preserve the requested focus; settings persistence remains included.

Use deterministic gameplay checks and automated application interaction and rendering checks. The existing [browser policy](../../BROWSER_DEV_POLICY.md) governs isolated Chromium and Firefox environments. Playwright with Chromium headless shell and its managed Firefox is the proposed automation route; document-only preparation requires no browser installation. Browser provisioning and actual runner execution must be evidenced before dependent acceptance claims.

## Gameplay decisions

The approved choices below resolve material ambiguities in the request. SPEC develops their precise contracts before implementation.

| Interaction | Proposed rule and reason |
| --- | --- |
| Ghost straddles the midline | Hide dynamically only when every occupied projection cell is above the midline. Show a projection touching or crossing into the lower half. This gives a clear boundary without depending on a shape's anchor. |
| Lock timing and resets | Start a full gravity interval when a piece becomes grounded. Movement or rotation that remains grounded does not restart it; leaving the ground cancels it and later grounding starts a fresh interval. Pause freezes the countdown. Soft drop and default hard drop do not shorten it. |
| Penetrator traversal and safe locking | Permit intermediate overlap while respecting board boundaries. Accept movement or rotation only if a legal final placement remains at or below the resulting position. Gravity and soft drop move stepwise through occupied positions and stop at the lowest legal landing. Hard drop jumps there; the ghost previews it. |
| Penetrators and hold | Hold stores the penetrator state with the piece, preserving the requested lifetime until lock. Swapping neither spends another bonus nor refunds one. Permit one hold action per turn, restored after lock; a received piece starts at its spawn position with fresh timing. |
| Activation and round reset | Activation is one-way for the piece and spends one bonus immediately; repeated activation has no effect. Restart clears the round, held piece and bonuses while retaining configuration. A blocked regular spawn, or a penetrator replacement with no legal landing at or below spawn, ends the game. |
| Live setting changes | Apply controls immediately. Disabling hold retains the stored piece. Switching a grounded piece to interval locking starts a fresh interval; switching to failed-attempt locking waits for the next failed downward attempt. A setting change alone does not lock a piece. |
| Invalid configuration | Ignore an invalid URL value for that setting and fall back to a valid cookie, then default. Do not persist invalid URL values. Ignore invalid cookies. Keep the game usable with session settings and URL updates if browser cookie storage is unavailable. |

Defaults: ghost always visible; hard drop, next preview and hold enabled; full gravity interval general locking; hard drop follows general locking. Configuration names, validation syntax, key bindings, scoring, speed progression and rotation details will be specified during preparation.

## Delivery and versioning

The user requests managed versioning and a published GitHub release after every implementation phase has completed, passed verification and been integrated. Each release must have the corresponding version tag and notes describing delivered behavior and material limits.

Use `v0.1.0` for the first playable baseline, minor-version increases for subsequent capability increments, patch increases for corrective releases, and `v1.0.0` when the complete requested scope is verified and integrated. Documentation preparation produces no playable release.

## Review boundary

This accepted brief guides architecture, component design, SPEC, PLAN, layout and TASKS. The user's 2026-10-22 preapproval covers the remaining human checkpoints; their technical QC and publication gates remain required.
