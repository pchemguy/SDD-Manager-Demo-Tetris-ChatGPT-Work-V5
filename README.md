# Stack — browser Tetris

A focused falling-block game for modern desktop browsers. Play with seven-bag randomization, hold, ghost projection, ordered wall kicks, hard drop, configurable locking, scoring and level progression. It runs entirely in your browser with no account or application backend.

## Run locally

Use Node.js 24 or newer and npm. From the repository directory:

```sh
npm ci --ignore-scripts
npm run dev
```

Open the local URL printed by Vite. `npm run build` creates a static `dist/` directory with relative asset paths. Serve that directory over HTTP; opening index.html directly as a file is unsupported.

## Play

Click **Start game**. Left/right moves; Up or X rotates clockwise; Down soft-drops; Space hard-drops; C holds; P or Escape pauses/resumes; R starts a new round. Enter starts from Ready or Game over. Buttons and form controls keep their own keyboard behavior; click the board to return to gameplay. Losing window focus pauses a running game.

A grounded piece locks after one full gravity interval. Movement or rotation while continuously grounded preserves that deadline; leaving support cancels it, and new grounding starts a full interval. Soft drop cannot shorten it. A clear scores 100/300/500/800 for one/two/three/four simultaneous rows, multiplied by the level before the clear. Successful soft drop scores one point per row; hard drop scores two per row traveled. Level increases every ten lines; gravity speeds up from 800 ms to a minimum of 80 ms.

Hold is available once between locks. A swap resets the received piece to its spawn position/rotation with fresh timing. Turning hold off keeps its stored piece. Every complete bag contains each of the seven types once. Clockwise wall kicks try the current position, one cell left/right, two cells left/right, then one cell upward; this is the specified simple kick system.

The ghost and hard drop use the same landing. Dynamic ghost mode hides a projection only when all of its occupied cells are above row 10; a projection straddling that midline remains visible.

## Configure this session

The side panel controls ghost visibility (hide/dynamic/show), hard drop, next preview, hard-drop locking, general locking and hold. Defaults show the ghost and preview, enable hold/hard drop, and give grounded pieces a full gravity interval; hard drop follows that policy.

Select failed-attempt locking to lock on the next unsuccessful downward move. Hard drop following it lands first and waits for such an attempt. Select immediate hard-drop locking to lock as soon as it lands. Changing a policy alone never locks a piece; switching to interval while grounded starts a fresh interval. Display-only changes preserve the queue and deadline. Settings apply immediately and survive a new round within this session. Saved/shareable settings arrive in the persistence increment.

## Verify

```sh
npm run check
npm run test:unit
npm run setup:browsers
npm run test:browser
npm run build
```

Setup installs only the pinned Playwright managed headless Chromium and patched Firefox into the repository's ignored `.cache/browsers`. It requires compatible host libraries. To copy an already verified compatible contained distribution, set `TETRIS_BROWSER_SOURCE` to its managed-browser root before setup. Do not point it to personal/system browsers or profiles.

Tests launch the real Vite application in isolated contexts. The browser runner applies a whole-process deadline, handles cancellation, and checks owned descendant teardown. A Linux host exposing Firefox `uid_map: EPERM` during page creation can use the narrowly gated `TETRIS_FIREFOX_SANDBOX=1` override for trusted localhost tests after diagnosis; see [browser policy](BROWSER_DEV_POLICY.md). Current-host task evidence records provisioning and this workaround. Headless tests cover native key delivery and modeled blur handling, not OS-window focus. Browser fixtures are exposed only in Vite test mode and excluded from production output.

## Project records

[Development plan](docs/dev/PLAN.md), [behavior contracts](docs/dev/SPEC.md), [tasks and verified evidence](docs/dev/TASKS.md), and [handoff](docs/dev/HANDOFF.md) describe the accepted phased scope. Penetrators and saved configuration are scheduled in later increments. See [AI disclosure](AI_DISCLOSURE.md) and [SDD Manager](SDD-MANAGER.md).
