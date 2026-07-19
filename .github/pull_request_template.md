## What this changes

<!-- One or two sentences. What does a user see or get that they didn't before? -->

## Why

<!-- The problem or request behind it. Link an issue if there is one. -->

## How it was verified

<!-- Delete what doesn't apply. Screenshots welcome for anything visual. -->

- [ ] `yarn type-check:ci --force` passes
- [ ] `yarn biome check --write .` clean
- [ ] `TZ=UTC yarn test` passes
- [ ] Exercised in the browser locally (which screens: … )
- [ ] Relevant section of [docs/TESTING.md](../docs/TESTING.md) run

## Truth check

- [ ] Any user-facing claim in this PR (marketing copy, docs, UI labels)
      describes functionality that **actually runs on this instance**, verified
      at runtime rather than by reading code.

## Notes for deploy

<!-- New env vars? A migration? Anything the VPS needs before or after this
     ships? Write "none" if none. -->
