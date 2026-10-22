# Stack — browser Tetris

A focused falling-block game for modern desktop browsers. This first increment provides classic movement, clockwise rotation, gravity, line clears, score/level progression, a next-piece preview, pause and restart. There is no server or account.

## Run locally

Use Node.js 24 or newer and npm. From the repository directory:

```sh
npm ci --ignore-scripts
npm run dev
```

Open the local URL printed by Vite. `npm run build` creates a static `dist/` directory with relative asset paths. Serve that directory over HTTP; opening index.html directly as a file is unsupported.

## Play

Click **Start game**. Left/right moves; Up or X rotates clockwise; Down soft-drops; P or Escape pauses/resumes; R starts a new round. Enter starts from Ready or Game over. Buttons and form controls keep their own keyboard behavior; click the board to return to gameplay. Losing window focus pauses a running game.

A grounded piece locks after one full gravity interval. Movement or rotation while continuously grounded preserves that deadline; leaving support cancels it, and new grounding starts a full interval. Soft drop cannot shorten it. A clear scores 100/300/500/800 for one/two/three/four simultaneous rows, multiplied by the level before the clear. Successful soft drop scores one point per row. Level increases every ten lines; gravity speeds up from 800 ms to a minimum of 80 ms.

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

[Development plan](docs/dev/PLAN.md), [behavior contracts](docs/dev/SPEC.md), [tasks and verified evidence](docs/dev/TASKS.md), and [handoff](docs/dev/HANDOFF.md) describe the accepted phased scope. Modern controls, penetrators and saved configuration are scheduled in later increments. See [AI disclosure](AI_DISCLOSURE.md) and [SDD Manager](SDD-MANAGER.md).
