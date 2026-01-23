# Mango Deliveries: Modernization Task Breakdown

This document breaks down the [Modernization Initiative](./modernization-initiative.md) into smaller, actionable tasks for execution.

---

## Phase 1: Foundation (Database Independence)

### Task 1.1: Install Dependencies & Setup Database Abstraction
**Objective:** Implement SQLite support for database independence.
- Install `sqlite3` as a dependency.
- Modify `web/db.ts`:
  - Refactor `init()` to accept a `DB_TYPE` environment variable.
  - If `DB_TYPE` is 'sqlite', configure Sequelize to use `sqlite` dialect.
  - Set storage to `data/database.sqlite` for development and `:memory:` for testing.
  - Preserve existing MySQL configuration as the default.

### Task 1.2: Implement Development Seeder
**Objective:** Create a development seeder for SQLite.
- Create `web/seeders/dev.ts`.
- Implement a function to seed:
  - Two characters: One Director, one Freighter.
  - Sample Destinations (Jita, Amarr).
  - Sample Contracts (Pending, Ongoing, Completed).
- Ensure data aligns with the Phase 2 schema requirements.

### Task 1.3: Configure Dev Scripts & Environment
**Objective:** Add development scripts and environment configuration.
- Modify `package.json`:
  - Add `"dev:sqlite"`: `cross-env DB_TYPE=sqlite nodemon ...`
  - Add `"test"`: `cross-env DB_TYPE=sqlite STORAGE=:memory: mocha ...`
- Update `.env.example` to include `DB_TYPE` and `STORAGE`.

### Task 1.4: Implement Mock Authentication Route
**Objective:** Create a mock authentication route for development.
- Add `GET /dev/login/:id` in `web/controllers/eve.ts`.
- Only active if `NODE_ENV === 'development'`.
- Logic: Manually set `req.session.character` to the selected character, bypassing OAuth.

---

## Phase 2: Data Layer & Schema Updates

### Task 2.1: Update EveCharacters Model
**Objective:** Modernize the EveCharacters database model.
- Modify `web/models/eve/character.ts`:
  - Change `token` type to `TEXT` (support ~800+ byte JWTs).
  - Add `refreshToken` column (`DataTypes.TEXT`).

### Task 2.2: Fix Character Lookup Logic
**Objective:** Fix logical bug in character lookup.
- In `web/models/eve/character.ts`, update `getByName`:
  - Change `where: { [name]: name }` to `where: { characterName: name }`.

### Task 2.3: Verify & Update Seeder
**Objective:** Verify schema changes and update seeder.
- Update `web/seeders/dev.ts` to include dummy `refreshToken` values.
- Run `npm run dev:sqlite` to verify initialization.

---

## Phase 3: Authentication Overhaul (SSO v2)

### Task 3.1: Update Authorization Flow & Scopes
**Objective:** Switch to EVE SSO v2 Authorization.
- Update authorization URL to `https://login.eveonline.com/v2/oauth/authorize`.
- Update requested scopes: `esi-contracts.read_character_contracts.v1`, `esi-universe.read_structures.v1`, `esi-assets.read_assets.v1`.

### Task 3.2: Implement Local JWT Validation
**Objective:** Implement local JWT validation and remove deprecated verify call.
- Remove call to `https://login.eveonline.com/oauth/verify`.
- Implement logic to decode/verify `access_token` signature using EVE's JWKS.

### Task 3.3: Implement Token Refresh Logic
**Objective:** Implement Session Renewal with Refresh Tokens.
- Save `refresh_token` to the database on callback.
- Create helper to refresh `access_token` when expired.
- Integrate into `eveAuth` middleware.

---

## Phase 4: Security & Infrastructure

### Task 4.1: Implement ESI Error Handling
**Objective:** Add ESI Rate Limit Protection.
- Add Axios interceptor for `X-ESI-Error-Limit-Remain`.
- Implement back-off logic if limit is low.

### Task 4.2: Harden Content Security Policy (CSP)
**Objective:** Enforce strict Content Security Policy.
- Update `helmet` config in `web/app.ts`.
- Set `reportOnly: false`.
- Whitelist `images.evetech.net` and `evepraisal.com`.

### Task 4.3: Audit Session Security
**Objective:** Verify Session Security Settings.
- Ensure `cookie.secure: true` in production.
