# Action Required: Secret Santa Application

Manual steps that must be completed by a human. These cannot be automated.

## Before Implementation

- [ ] **Ensure PostgreSQL database is running** - The application requires a PostgreSQL database. Verify your database connection string in `.env` is correct and the database is accessible.

- [ ] **Verify Google OAuth credentials are configured** - Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env` for authentication to work.

- [ ] **Ensure OpenRouter API key is configured** - The AI gift suggestions feature requires `OPENROUTER_API_KEY` in `.env`. Get one from https://openrouter.ai/settings/keys if not already set.

## During Implementation

No manual steps required during implementation.

## After Implementation

- [ ] **Test the Secret Santa draw with real users** - Create a test group with 3+ people to verify the assignment algorithm works correctly and maintains secrecy.

- [ ] **Verify currency formatting** - Test that prices display correctly for different currencies (USD, EUR, GBP, etc.) in the wishlist and group settings.

- [ ] **Check snowfall animation performance** - On lower-powered devices, verify the snowfall effect doesn't cause performance issues. The effect respects `prefers-reduced-motion` but should be tested.

---

> **Note:** These tasks are also listed in context within `implementation-plan.md`
