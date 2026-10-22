# System specification

The [approved brief](PROJECT.md), [architecture](ARCHITECTURE.md) and [components](DECOMPOSITION.md) govern this static TypeScript browser game. These contracts cover the complete target; PLAN assigns delivery increments. Desktop keyboard play, isolated Chromium and managed Firefox are required. No backend or saved in-progress round is required.

## R-01: Board, pieces and progression

The visible board is 10 columns by 20 rows, indexed from the upper left. All occupied piece cells stay within it. The seven tetrominoes each contain four cells; regular pieces use distinct non-white colors. A piece spawns centered at row zero. A blocked normal spawn ends the game without overwriting settled cells.

Horizontal movement and quarter-turn clockwise rotation reject illegal positions. Basic rotation uses the same anchor; enhanced wall kicks try offsets in this order: `(0,0), (-1,0), (1,0), (-2,0), (2,0), (0,-1)`, accepting the first legal result. Failed commands preserve the current state.

Locking writes exactly four non-overlapping cells, removes every full row simultaneously, and fills emptied upper rows. Clearing 1/2/3/4 rows scores 100/300/500/800 times the level before that clear. Successful soft-drop rows score one each; hard-drop rows score two each. Level is `1 + floor(total cleared rows / 10)`. Gravity interval is `max(80, round(800 × 0.8^(level − 1)))` milliseconds.

## R-02: Simulation, locking and lifecycle

Ready, running, paused and game-over states are distinguishable. Start begins a round; pause freezes gravity and lock countdowns; resume excludes paused wall time. Restart clears score, rows, held piece, queue, bonuses and timers, retains settings, and starts a fresh round. Focus loss pauses a running game. Movement commands affect only running games; Enter starts a ready or finished game.

Gravity advances one row per interval. Soft drop attempts one row without shortening the general lock delay. With `interval` locking, the countdown starts immediately on becoming grounded and lasts one full gravity interval. Moves that remain grounded preserve elapsed lock time. Leaving the ground cancels it; later grounding starts a fresh interval. A lock occurs exactly at the deadline, without requiring another failed movement. Elapsed-time processing preserves event order across a long frame.

With `failed` locking, a failed downward movement attempt locks a legally grounded piece. A hard drop following that policy places the piece at its landing and waits for the next failed downward attempt. An `instant` hard-drop policy locks immediately. Under interval/follow, dropping an airborne piece starts its grounding interval; repeatedly hard-dropping an already grounded piece does not restart it. A policy change alone never locks: switching to interval while grounded starts a fresh interval; switching to failed waits for the next failed attempt.

## R-03: Modern piece controls

The final randomizer shuffles each complete seven-piece bag with the injected random source; every consecutive bag contains each type once. Baseline independent draws are permitted until that increment. The next preview reflects the actual next queue item and disabling its display never consumes a piece.

Hold exchanges the active and held piece or consumes the next piece when hold was empty. Only one successful hold is permitted between locks. Hold stores type and penetrator status, resets the received piece's rotation/spawn position and timing, and does not refund bonuses. A held penetrator retains its ability until its eventual lock. Disabling hold preserves the stored piece and rejects the command. Disabling hard drop rejects its command. Movement, rotation and activation preserve the queue unless a documented spawn/hold/lock consumes it.

## R-04: Landing and ghost visibility

Normal landing is the final position before the first obstruction. A penetrator's landing is the lowest in-bounds, non-overlapping position at or below its current anchor, including positions beyond occupied rows. Hard drop and ghost use the same placement result.

`show` displays the available projection; `hide` suppresses it. `dynamic` hides it only if every occupied projected cell has row index below 10, and shows it when any projected cell has row index 10 or greater. A straddling projection is therefore visible. Recompute after relevant movement, rotation, hold, activation and settings changes. Regular ghosts use their piece color; penetrator ghosts are white.

## R-05: Penetrators and bonuses

Clearing exactly four rows in one lock awards one bonus, capped at three unspent bonuses. One activation spends one bonus immediately and marks the active piece as a penetrator. Activation with no bonus or on an existing penetrator is a no-op. Activation is one-way until lock or restart. Holding preserves the flag without further charge; a newly queued piece is regular.

Penetrators may overlap settled cells during movement and rotation without modifying them, but a candidate is accepted only if a legal terminal landing exists at or below it. Gravity and soft drop move stepwise, including occupied intermediate positions, and stop at that lowest landing. Locking never overlaps or leaves the board. A penetrator received from hold with no legal landing at or below spawn ends the round. Activation recomputes grounding; the continuous-grounding rules determine whether a pending timer is preserved or cancelled.

Draw all active and held penetrator cells white, and regular cells in their assigned non-white colors. Show one lightning symbol per available bonus, plus accessible numeric text. Update both when spending, earning or restarting. The bonus cap applies to unspent inventory, independently of active or held penetrator pieces.

## R-06: Controls and settings

Arrow Left/Right move; Arrow Up or X rotates clockwise; Arrow Down soft-drops; Space hard-drops; C holds; E activates a penetrator; P or Escape pauses/resumes; R restarts; Enter starts from ready/game-over. Prevent scrolling for handled game keys. Focused form controls and buttons retain their native keyboard behavior and do not trigger gameplay commands. Rotation, hold, hard drop and activation ignore key-repeat events; movement and soft drop accept repeats.

Provide labeled side-panel controls for every row below. Validated changes take effect immediately. Next/ghost changes affect display only; hold and hard-drop enablement do not discard state. Hard-drop policy changes apply to future commands.

| URL key / cookie suffix | Accepted values | Default |
| --- | --- | --- |
| `ghost` | `hide`, `dynamic`, `show` | `show` |
| `hardDrop` | `on`, `off` | `on` |
| `next` | `on`, `off` | `on` |
| `dropLock` | `follow`, `instant` | `follow` |
| `lock` | `interval`, `failed` | `interval` |
| `hold` | `on`, `off` | `on` |

Status exposes score, rows, level, current round state, next and held pieces where enabled, and bonuses. Canvas output, state feedback and control labels must remain legible at desktop viewport sizes; the page may scroll vertically on shorter screens.

## R-07: Settings persistence

Resolve each key independently: one valid explicit URL value, otherwise a valid saved cookie, otherwise its default. Values are case-sensitive exact tokens. Missing, invalid, empty or repeated URL keys fall through for that key. Invalid or malformed cookie values fall through to defaults without affecting other keys. Ignore unknown URL keys and cookies.

Cookie names are `tetris_` plus the exact key above. Write each valid explicit URL value to its cookie, including default values; do not write defaults over cookies merely because their URL keys are omitted. Initialization leaves the URL intact. A user change writes that key's cookie and uses history replacement to update its URL value, preserving unrelated keys and the fragment. Cookie attributes are Path=/, SameSite=Lax and a one-year maximum age; use Secure on HTTPS.

Cookie read/write failure preserves usable session settings. A URL update failure preserves the selected in-memory value and successful cookie write. No invalid value is persisted. Session-only settings are permitted before this persistence increment.

## R-08: Ownership and failure invariants

Domain geometry, placement, source and session implement R-01–05 without browser imports. Settings codec/adapter own R-06 values and R-07 effects. Interface, renderer and application compose those contracts under DECOMPOSITION. A shared landing authority prevents ghost/drop disagreement. Board writes occur only at lock/clear/restart. Input rejection never spends a bonus or consumes a queue item. Simulation accepts finite nonnegative elapsed time; invalid elapsed input is rejected without state change.

## R-09: Acceptance and delivery evidence

Acceptance requires deterministic geometry/transition/timing/scoring checks, queue/hold/kick/drop/ghost cases, penetrator traversal/landing/inventory/hold fixtures, and all six independent persistence precedence and failure cases. Browser evidence exercises the real served application with native keyboard/form input, readable Canvas output and screenshots, and reload/reopen persistence in both required browsers. Rare board states may be supplied through a test-only fixture seam excluded from production builds.

Follow [BROWSER_DEV_POLICY](../../BROWSER_DEV_POLICY.md) for compatible isolated provisioning, proactive diagnostics, repeated context/page lifecycle checks and whole-process deadlines. Record browser versions, paths, modes and environment-specific overrides. Required missing evidence blocks acceptance; synthetic environment checks alone do not prove application behavior.

Each completed phase passes code review and appropriate regressions, updates user guidance, integrates by an explicit verified merge, and publishes a versioned GitHub release. Release notes describe delivered scope and limits; the version tag targets the verified release commit. The first playable release is v0.1.0; modern controls and penetrators use minor increments; full scope is v1.0.0.
