# Contributing to BookYourSlot

Thanks for helping. BookYourSlot is a deliberately smaller edition of Cal.com, so the best contributions make it more reliable or simpler for small businesses, rather than bringing removed features back.

## Before you start

- **Bugs:** open an issue with the bug template.
- **Features:** open a feature request first so we can agree on scope. Teams, organizations, payments, SMS and the enterprise features were removed on purpose (see the README).
- **Security issues:** never in a public issue. See [SECURITY.md](SECURITY.md).

## Set up

Node 20 and Yarn 4.12 or newer:

```bash
yarn
cp .env.example .env      # set DATABASE_URL, NEXTAUTH_SECRET, CALENDSO_ENCRYPTION_KEY
yarn workspace @calcom/prisma db-migrate
yarn dev
```

## Making a change

1. Branch from `main`.
2. Keep pull requests small: under about 500 lines and 10 code files. Split larger work by layer (schema, backend, UI).
3. Add or update tests for what you changed.
4. Run the checks:

   ```bash
   yarn type-check:ci --force
   TZ=UTC yarn test
   yarn biome check --write .
   ```

5. Use conventional commit titles: `feat(bookings): ...`, `fix: ...`, `docs: ...`.
6. Open the pull request as a draft and fill in the template.

The engineering rules (Prisma `select` over `include`, no `as any`, repository and service layers, DTOs at boundaries) are in [CLAUDE.md](CLAUDE.md) and [agents/rules/](agents/rules/). They apply to human contributors too.

## Ground rules

- No real customer data, secrets or `.env` files in code, tests, issues or screenshots.
- Don't describe a feature as working until it has been checked against a running system.

## License

BookYourSlot is MIT licensed. By contributing, you agree your contribution is licensed under the same terms.

## Conduct

Be respectful. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
