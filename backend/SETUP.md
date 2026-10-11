# Private camera-coach backend

GitHub Pages serves the app. This Worker holds the AI key and checks the app's requests. Cloudflare and Gemini credentials are not configured in this package.

## Deploy from a computer

You need a Cloudflare account, a Google Gemini API key, and a currently available vision model that supports structured JSON output. Use a model enabled for your own project; do not assume every model is available to every key.

1. Install Node 22+ on your computer if needed.
2. In a terminal, enter this `backend` directory.
3. Sign in:

   ```sh
   npx wrangler@4 login
   ```

4. In `wrangler.jsonc`, set `GEMINI_MODEL` to your enabled model ID. The placeholder deliberately prevents live requests until configured. `ALLOWED_ORIGIN` must be the exact HTTPS origin of the frontend, without a path or trailing slash. For `https://jarredksmith.github.io/tidy-hollow/`, the origin is `https://jarredksmith.github.io`.
5. Generate a long, random household access token (at least 32 characters), and save it in your password manager. This is separate from the Gemini API key.
6. Add secrets through the interactive prompts, not into source files:

   ```sh
   npx wrangler@4 secret put GEMINI_API_KEY
   npx wrangler@4 secret put APP_TOKEN
   ```

   If Wrangler asks whether to create the Worker because it does not exist yet, use the configured name `tidy-hollow-coach`.
7. Deploy:

   ```sh
   npx wrangler@4 deploy
   ```

8. In Tidy Hollow Settings, enter the returned `https://...workers.dev` URL and your household token. Do not enter the Gemini API key into the web app.
9. Enter optional storage notes, enable the camera, then consent to image analysis. Try **Find tasks in this room** first. Review the suggestions before **Start live feedback**.

If commands or model availability change, use the provider documentation linked below. A Cloudflare Git integration can automate later backend deployment, but this package does not configure or provision your Cloudflare account.

## Defaults and boundaries

- One household token, no user account system.
- Exact-origin CORS plus authorization on every analysis request. CORS alone is not authentication.
- Rate limiter: 6 requests per 60 seconds, shared by this household endpoint in a Cloudflare location. Namespace `10421011` should be changed if it conflicts with another Worker in your account.
- This rate limit is not a global spending cap. Configure provider quotas/billing controls separately; the frontend's 40-check pause can be restarted.
- Only bounded JPEG inputs and a fixed AI-provider hostname; callers cannot provide an upstream URL, API key, model, or system instructions.
- Five tasks maximum per scan; 20 pending tasks maximum per check.
- Server-calculated 5/10/15-point suggestions. Unknown AI task IDs are discarded.
- No frame persistence, request-body logging, or transcripts in this application. The cloud AI provider processes the submitted frames under its own account and data terms.
- Images and the baseline live briefly in the browser and request memory. The app sends no audio.
- Automated judgments are fallible. Automatic awards are off by default; family members can always complete tasks manually.

## First iPhone acceptance check

- Open from the home-screen icon. Allow the rear camera. Verify the preview is upright.
- Start a timer and lock the phone: the app should pause and release the camera. Unlock and restart explicitly.
- Switch to another app during analysis: no stale completion should be applied after returning.
- Check a visible cleared surface twice; leave automatic rewards off initially.
- Carry clothes outside the frame: the app should ask for confirmation, not certify their destination.
- Stand in front of the counter: no completion should be inferred from the obstruction.
- Disable network access: manual tasks and saved progress should remain usable; AI should pause.
- Complete a task twice: points should only be added once. Buy a reward and confirm it appears in the sample room.

## Documentation

- [Gemini content generation](https://ai.google.dev/api/generate-content)
- [Gemini structured output](https://ai.google.dev/gemini-api/docs/structured-output)
- [Cloudflare Worker secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Cloudflare rate limits](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
- [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
