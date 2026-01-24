# Mango Deliveries: Modernization Initiative

This unified plan combines the strategies for **Database Independence** (Dev Experience) and **Production Readiness** (Scalability/Modernization). 

**Strategy:**
- **Development:** Use **SQLite** for a lightweight, zero-dependency local environment.
- **Production:** Use **Postgres** (via **Neon**) for serverless scalability, robust data integrity, and Netlify compatibility.

## Phase 1: Foundation (Database Hybridization)
*Goal: Decouple the application from a single database dialect. Enable SQLite for local dev and Postgres for production.*

- [ ] **Dependencies:**
    - [ ] Remove `mysql2`.
    - [ ] Install `sqlite3` (Development driver).
    - [ ] Install `pg` and `pg-hstore` (Production drivers).
- [ ] **Database Abstraction (`web/db.ts`):**
    - [ ] Refactor `init()` to support dynamic dialect switching based on `NODE_ENV` or `DB_TYPE`.
    - [ ] **SQLite Config:** Storage at `data/database.sqlite` (dev) and `:memory:` (test).
    - [ ] **Postgres Config:** Connection string support (`DATABASE_URL`) with SSL requirements for Neon.
- [ ] **Seeding (`web/seeders/dev.ts`):**
    - [ ] Create seed script to populate Characters (Director/Freighter), Destinations, and Contracts.
    - [ ] Ensure seed data aligns with new schema requirements (see Phase 2).
- [ ] **Dev Scripts:** 
    - [ ] Add `dev:sqlite` to `package.json`.
    - [ ] Add `build` script verification for Postgres types.
- [ ] **Mock Auth:** Create a dev-only route (`/dev/login/:id`) to simulate login without hitting EVE SSO (requires SQLite environment).

## Phase 2: Data Layer & Schema Updates
*Goal: Update the database schema to support modern EVE SSO tokens and ensure cross-database compatibility.*

- [ ] **Modify `EveCharacters` Model:**
    - [ ] Change `token` column to `TEXT` (support ~800+ byte JWTs).
    - [ ] Add `refreshToken` column (`DataTypes.TEXT`) for session renewal.
    - [ ] **Compatibility Check:** Ensure `DataTypes.BIGINT` is handled correctly in JS (serialized as string) for both Postgres and SQLite.
- [ ] **Fix Logical Bugs:**
    - [ ] Update `getByName` in `web/models/eve/character.ts` to use `characterName`.
- [ ] **Verification:**
    - [ ] Run `dev:sqlite` and verify migrations/sync work.
    - [ ] (Optional) Run against a local Postgres container or Neon dev branch to verify Postgres compatibility.

## Phase 3: Authentication Overhaul (SSO v2)
*Goal: Replace deprecated v1 SSO with modern v2 JWT flow.*

- [ ] **Update Authorization Flow:**
    - [ ] Switch to `https://login.eveonline.com/v2/oauth/authorize`.
    - [ ] Add scopes: `esi-contracts.read_character_contracts.v1`, `esi-universe.read_structures.v1`.
- [ ] **JWT Validation:**
    - [ ] Remove `/oauth/verify` call.
    - [ ] Implement local JWT signature validation using EVE JWKS.
- [ ] **Session Renewal:**
    - [ ] Store `refresh_token` in the new DB column.
    - [ ] Implement background logic to refresh access tokens every 20 minutes.

## Phase 4: Janice Integration (Appraisal Service)
*Goal: Replace the defunct Evepraisal service with the Janice API for contract appraisal.*

- [ ] **API Integration (`web/helpers/janice.ts`):**
    - [ ] Create helper to interact with `https://janice.e-351.com/api/rest`.
    - [ ] Implement appraisal logic (Market: Jita 4-4).
    - [ ] Add `JANICE_API_KEY` to environment variables.
- [ ] **Controller Updates:**
    - [ ] Replace `evepraisal` calls with `Janice` helper calls in `web/controllers/eve.ts`.
- [ ] **Validation:**
    - [ ] Update input validation to accept Janice links/data.

## Phase 5: Security & Infrastructure
*Goal: Harden the application for production deployment.*

- [ ] **ESI Protection:**
    - [ ] Add Axios interceptor for `X-ESI-Error-Limit-Remain` back-off.
- [ ] **Content Security Policy (CSP):**
    - [ ] Enable blocking mode (`reportOnly: false`).
    - [ ] Whitelist `images.evetech.net`.
- [ ] **Session Security:**
    - [ ] Audit `cookie.secure` settings.

## Phase 6: Production Migration (Neon/Postgres)
*Goal: Deploy the modernized application to a production environment backed by Neon.*

- [ ] **Neon Setup:**
    - [ ] Create Neon project.
    - [ ] Provision `DATABASE_URL`.
- [ ] **Netlify/Hosting Config:**
    - [ ] Set `DB_TYPE=postgres`.
    - [ ] Set `DATABASE_URL` secret.
- [ ] **Migration:**
    - [ ] (If preserving data) Export current MySQL data and use `pgloader` or similar tool to migrate to Postgres.
    - [ ] (If fresh start) Run Sequelize `sync()` on first deploy.

## Verification & Success Criteria
- [ ] **Dev Environment:** Developer can run `npm run dev:sqlite` and interact with the full app (mock auth, contracts) without external DB.
- [ ] **Prod Environment:** App connects to Neon Postgres successfully using `DATABASE_URL`.
- [ ] **Auth Persistence:** User remains logged in >20 mins (Refresh Token works).
- [ ] **Data Integrity:** Long JWTs are stored correctly in both SQLite and Postgres.