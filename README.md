# Tidy Hollow

A cozy, installable iPhone web app that turns small cleaning tasks into coins and decorations for an original 3D sample room.

**Status: frontend live at https://jarredksmith.github.io/tidy-hollow/. OpenAI backend code ready; account setup required.** The checklist, rewards, procedural 3D room and local progress are implemented. Camera and AI behavior still need validation on a physical iPhone. Live AI requires deployment of the included backend and an OpenAI API key. The current room is an original sample, not a reconstruction of your home.

## What works without AI

- Installable PWA with relative paths for GitHub Pages project sites.
- Dependency-free WebGL room: rotate by dragging, reset the view, or use arrow keys and +/- with a keyboard.
- Four sample chores, custom chores, skipping, and points awarded once per task.
- Five-, ten-, or fifteen-minute timers, optional spoken feedback, a reward shop, and a local activity history.
- Purchases appear in the sample room. Sample clutter disappears as the matching sample tasks are completed. Custom/AI tasks do not claim to map individual real objects to the sample model.
- Local progress plus export/restore. No account or cross-device synchronization yet.
- Camera preview, without saving photos or recording video.
- Offline checklist/rewards after a successful online load and service-worker installation.

## What the AI integration implements

The optional Cloudflare Worker analyzes JPEG frames using OpenAI's Responses API with image input and strict JSON results. It is periodic visual analysis, not a continuous video stream.

- Scan one area and review up to five suggested tasks before replacing the current checklist.
- Household notes such as “cereal belongs in the pantry.”
- Live checks no faster than once every 15 seconds plus processing time; maximum 40 checks per run.
- Compare a starting reference image with the current image.
- Require two consecutive clear, high-confidence observations before suggesting completion.
- Manual confirmation by default. Optional automatic points only for outcomes the model classifies as directly visible. Off-camera storage still needs confirmation.
- Stop requests and release the camera when the app is hidden, the camera is turned off, or the session ends.
- Missing credentials, provider errors, interrupted camera access and uncertain views have visible states; there is no simulated “AI success.”

AI judgments are estimates. Overlapping objects, small labels, occlusions, and camera movement reduce reliability. A messy counter should be approached in small visible layers: wrappers, then cups, then the newly exposed surface. Never treat an unfamiliar item as trash. This is a cooperative household tool, not a verification or surveillance system.

## GitHub deployment

1. Create `tidy-hollow` in your GitHub account. Initialize it with a README so file-writing tools can work against an existing branch.
2. Upload this project's contents into the repository root, preserving `docs/`, `backend/`, `tests/`, and `.github/workflows/pages.yml`.
3. In the repository, open **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. Push to `main`, or run **Validate and deploy Tidy Hollow** from Actions. Tests run before publishing.
5. The expected project URL is `https://jarredksmith.github.io/tidy-hollow/`; use the actual deployment URL GitHub returns.
6. On iPhone, open the URL in Safari, then **Share → Add to Home Screen**. Enable **Open as Web App** if shown.

Alternative without Actions: choose **Deploy from a branch**, `main`, `/docs` in Pages settings. The included workflow can be removed if using that alternative.

GitHub Pages availability for private repositories depends on your plan. GitHub Free normally requires a public repository for Pages. Only generic app code and the sample room are included. Do not commit API keys, household access tokens or personal room photos. GitHub Pages serves assets publicly; a future real-house model needs an explicit privacy decision or protected asset hosting.

## Connect live AI

Follow the [browser-only OpenAI setup guide](backend/SETUP.md), including the Cloudflare deployment link. Settings now includes **Generate household token**, **Copy token**, and **Test connection**. The browser never receives the provider API key. A separate household access token protects the backend. You enter that token into Settings; it stays in browser memory and is cleared on reload. Changing the token on the server revokes previous access.

## Local development

Requires Node 22+ for tests; Python 3 for the simple static development server. No package installation is needed for the frontend.

```sh
npm run check
npm test
npm start
```

Open `http://localhost:8080` on the development computer. A phone opening an ordinary LAN HTTP address cannot use the camera; use the HTTPS deployment for device testing. No Xcode or Apple developer account is required for the web-app route.

## Structure

- `docs/` — deployable static app; all runtime assets are included.
- `docs/room.js` — original procedural 3D geometry, lighting and camera controls.
- `docs/core.js` — scoring, rewards and confidence rules.
- `docs/app.js` — UI, camera lifecycle, timers, speech and AI requests.
- `backend/` — authenticated, rate-limited Worker and deployment configuration.
- `tests/` — scoring, observation, request validation, backend authorization, output normalization, packaging and geometry checks.

## Validation performed

24 automated tests pass under Node 24; JavaScript syntax checks pass. The backend integration test uses a mocked AI provider. A software rendering of the actual 3D mesh was inspected and framing was checked at desktop and phone dimensions. Full browser layout, iPhone camera permission/recovery, wake lock, speech playback, home-screen installation and a paid live OpenAI call have **not** been verified in this environment.

## Next steps after deployment

1. Test a five-minute session on the intended iPhone, first without AI.
2. Connect the backend and test one visible counter with three tasks.
3. Tune visual feedback based on actual false positives and misses.
4. Build the house model from walkthrough reference and selected photos.
5. Add private household accounts/sync, recurring chores and push reminders. These are not included in v0.1.
