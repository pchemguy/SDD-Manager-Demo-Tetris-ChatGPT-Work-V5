# Architecture

The [project brief](PROJECT.md) defines a static TypeScript browser game with a Canvas board and HTML controls. The design separates deterministic rules from browser resources so gameplay can be verified without timing or rendering dependencies.

## Blocks and dependency direction

| Block | Owns | Depends on |
| --- | --- | --- |
| Domain | Board, tetromino geometry, legal placements, randomization, game state, scoring, lock timing and penetrator invariants | Plain data and injected random source |
| Settings | Typed configuration, defaults, validation and URL/cookie resolution | Browser storage adapters at its boundary |
| Presentation | Canvas drawing, status, previews, configuration controls and keyboard translation | Read-only domain state and typed settings |
| Application | Lifecycle, input dispatch, elapsed-time scheduling and composition | Domain, settings and presentation |

Domain code imports no DOM, storage, clocks or rendering modules. Presentation cannot edit board cells or implement a second landing algorithm. Application dispatches commands to the domain and renders the resulting state. Settings changes flow through validation before reaching either consumer. These dependencies have no cycles.

## State and interaction

One game session owns the settled board, active piece, held piece, queue, score, level, available bonuses, pause/game-over state and timing. Piece identity includes penetrator status so hold preserves its lifetime. A fresh game resets round state while retaining selected settings.

A shared placement component answers collision, reachability and landing questions. Normal pieces stop before the first obstruction. Penetrators may traverse occupied cells, but every accepted position admits a legal landing at or below it. Gravity, hard drop, ghost rendering and locking consume the same answers. Only a lock operation writes piece cells and clears rows; a traversal never mutates settled cells.

The application supplies elapsed milliseconds to deterministic simulation. The domain owns gravity and continuous-grounding timers, including cancellation, pause and lock-policy changes. Rendering frequency cannot shorten a lock interval. Browser focus loss pauses play to prevent unseen time progression or stuck input.

## Persistence and failures

Settings are the only persistent application data. The adapter reads each URL key and cookie independently, validates values, and writes only valid explicit overrides or player changes. Cookie failures preserve usable in-memory settings and URL sharing. Invalid input does not enter game state. No backend, personal browser profile or remote service participates in gameplay.

## Design rationale and verification seams

Canvas fits the spatial board; semantic HTML gives controls labels, focus behavior and status text. A small functional rules layer plus one session object avoids a component framework and a general event bus. Injected randomness and elapsed time make edge cases reproducible. Typed settings provide a single vocabulary across the domain, UI and persistence.

Unit checks cover geometry, state transitions and persistence through controlled adapters. Browser checks exercise the actual application, keyboard input, controls, Canvas output and isolated page lifecycles in Chromium and Firefox under the central browser policy. Dependency versions and generated browser assets are tooling concerns, separate from production code.

Detailed logical responsibilities are defined in [DECOMPOSITION](DECOMPOSITION.md) when prepared; SPEC supplies behavioral contracts and layout supplies physical ownership.
