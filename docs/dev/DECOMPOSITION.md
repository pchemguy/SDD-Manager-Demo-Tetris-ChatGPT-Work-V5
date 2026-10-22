# Component decomposition

The [architecture](ARCHITECTURE.md) separates domain rules, settings, presentation and application resources. These logical units own distinct concerns without requiring a general plugin or event framework.

| Component | Provides and owns | Requires / verification seam |
| --- | --- | --- |
| Piece geometry | Seven colored tetromino definitions, rotation states and occupied coordinates | Plain coordinates; table and rotation tests |
| Placement | Board bounds, normal collision, penetrator reachability, lowest legal landing and rotation candidates | Geometry and settled board; dense-board and boundary fixtures |
| Piece source | Independent baseline draws and a shuffled seven-piece bag | Injected random function; bag composition and reproducibility tests |
| Game session | Authoritative round state, command handling, queue/hold, scoring, bonus accounting, spawn, lock and clearing | Geometry, placement, source and validated settings; transition tests |
| Simulation timing | Gravity accumulation and continuous-grounding deadlines within the session | Supplied elapsed milliseconds; exact-boundary and pause tests |
| Settings codec | Six typed values, defaults, canonical tokens and validation | Strings only; exhaustive valid/invalid value cases |
| Persistence adapter | Per-setting URL/cookie precedence, explicit URL saves and change writes | Codec plus browser URL/cookie access; controlled adapters and reload tests |
| Renderer | Board, active/ghost pieces, previews and penetrator color treatment | Read-only session snapshot and shared placement result; Canvas pixel and screenshot checks |
| Interface | Semantic controls, status/bonus indicators, focus ownership and keyboard command translation | Session commands and settings values; real browser interaction |
| Application composition | One session, settings restoration, animation scheduling, pause on blur and cleanup | Browser resources plus the above units; full application tests |

## Collaboration and ownership

The session accepts commands such as move, rotate, drop, hold and activate, and an elapsed-time advance. Rejected commands leave state unchanged. It consumes piece-source values only when a new queued piece is needed. Hold stores piece type and penetrator flag; it does not own an independent timer. Session timing is discarded on replacement and initialized from the replacement's grounding state.

Placement owns the safety invariant for penetrators. A candidate may overlap settled cells only while at least one in-bounds, non-overlapping final position remains at or below it. A terminal landing result is always legal to lock. The renderer consumes that result rather than reproducing the scan. Repeated locking is prevented by replacing the active piece through the session's single lock path.

The codec owns value validity. The persistence adapter owns browser effects and catches unavailable cookie writes. The interface requests a validated change; the adapter updates memory, cookie and URL, then application composition passes the resulting configuration to the session and renderer. Browser storage failure cannot mutate the board or end the round.

The animation loop provides elapsed time; the session owns how much advances gravity and lock countdowns. Ready, paused and game-over states consume no simulation time. Event listeners and animation handles belong to application composition and are not created by domain objects.

## Boundary assessment

Each unit can be exercised through data or a small command interface. Geometry and placement have no browser dependency; the session has no storage dependency; rendering cannot settle cells; settings cannot select pieces. Timing remains inside the session because grounding and lock transitions are inseparable, while its pure elapsed-time input remains independently testable. Physical files and exact public contracts are assigned by layout and SPEC respectively.
