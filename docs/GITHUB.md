# GitHub policies

How this repository is run: what goes in, how it gets reviewed, and how it
reaches production. Repo: `github.com/squid-beast/bookyourslot`.

## Repository settings to apply once

Do these in the GitHub UI; they are the guardrails everything else assumes.

**Settings → General**

- Default branch: `main`
- Disable "Allow merge commits"; keep **Squash merging** only, so `main` stays
  one commit per change.
- Enable "Automatically delete head branches" after merge.

**Settings → Branches → Add branch protection rule for `main`**

- Require a pull request before merging (1 approval; you can approve your own
  in a solo repo by using a second account or leaving approvals at 0 while
  still requiring the PR).
- Require status checks to pass: select **CI / Types, lint, tests** once it has
  run at least once.
- Require branches to be up to date before merging.
- Do not allow force pushes; do not allow deletions.

**Settings → Actions → General**

- Workflow permissions: **Read repository contents** only. Nothing in this repo
  needs write access from CI.

**Settings → Secrets and variables**

- Nothing is required today. CI runs on placeholder env values by design.
- When a workflow eventually needs a real value (for example a deploy key), add
  it as a repository **secret**, never as a variable and never in a file.

## Visibility

The repo can stay private or go public; both are safe **because** every secret
lives in `.env` files that are gitignored. Before flipping to public, run the
secret sweep in the next section once more.

## Branching and commits

- Branch off `main`: `feat/short-name`, `fix/short-name`, `chore/short-name`.
- Conventional Commits, matching the existing history:
  `feat(marketing): …`, `fix(auth): …`, `chore(brand): …`, `docs: …`.
- Keep a PR under ~500 changed lines and ~10 code files where you can. Split by
  layer (data → backend → UI) when it grows past that.
- Never force-push `main`. Never rebase a branch someone else has pulled.

## The rule that matters most here

**No user-facing claim ships without runtime proof.** Marketing copy, docs, UI
labels, and schema all describe what the product *does*, and this codebase is a
Cal.diy fork with whole feature areas stripped out (teams, workflows, billing,
SSO routes, impersonation all 404 or 500). Reading the source is not evidence
that a feature works. Load the route, click the button, watch the email arrive,
then write the sentence. Every PR carries this as a checkbox.

## Secrets policy

- `.env`, `.env.appStore`, `deploy/production/.env`, and every font binary are
  gitignored. Keep it that way.
- Real credentials belong in three places only: your local `.env`, the VPS
  `deploy/production/.env`, and your password manager.
- If a secret is ever committed, treat it as burned: rotate it at the provider
  first, then rewrite history. Rotating `CALENDSO_ENCRYPTION_KEY` also breaks
  every stored calendar connection, so that one needs a planned reconnect.
- Sweep before making the repo public or after a messy merge:

```bash
git log --all -p | grep -nE "GOCSPX-|client_secret|BEGIN .*PRIVATE KEY|NEXTAUTH_SECRET=." | head
git ls-files | grep -E "^\.env($|\.)" # should print nothing but .env.example files
```

## How a change reaches production

```
branch  →  PR  →  CI green  →  squash merge to main  →  ssh VPS  →  ./deploy.sh  →  Part B tests
```

1. Work on a branch, run the local gates in [TESTING.md](TESTING.md) Part A.
2. Open the PR; CI runs type-check, lint, and unit tests.
3. Squash merge once green.
4. On the VPS: `cd /opt/bookyourslot/deploy/production && ./deploy.sh`.
5. Run [TESTING.md](TESTING.md) Part B against the live site.

Deploys are manual on purpose: the server builds the image itself, and a bad
auto-deploy would take the booking page down while it rebuilds. Automate it
later only with a staging target in front.

## Issues and planning

- Use issues for anything you will not finish the same day; reference them in
  the PR body.
- The roadmap of intentionally-absent features lives in
  [deploy/production/CHECKLIST.md](../deploy/production/CHECKLIST.md). Anything
  listed there needs porting work before it can be claimed anywhere.

## If CI fails

- **Type check**: run `yarn type-check:ci --force` locally; run
  `yarn prisma generate` first if the errors mention missing Prisma types.
- **Biome**: `yarn biome check --write .` fixes most of it, then commit.
- **Tests**: `TZ=UTC yarn test` locally; the timezone prefix is required or
  date assertions drift.
