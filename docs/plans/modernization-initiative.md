# Mango Deliveries: Modernization Initiative

This unified plan combines the strategies for **Database Independence** (Dev Experience) and **Production Readiness** (Security/Modernization). By executing these together, we ensure a stable testing environment is available to safely verify the critical authentication and schema changes.

## Phase 1: Foundation (Database Independence)
*Goal: Create a stable, local development environment without external MySQL dependencies. This sandbox is required to safely test the subsequent schema and auth changes.*

- [ ] **Dependencies:** Install `sqlite3`.
- [ ] **Database Abstraction (`web/db.ts`):**
    - [ ] Refactor `init()` to support dynamic dialect switching (`mysql` vs `sqlite`) via `DB_TYPE` env var.
    - [ ] Configure SQLite storage: `data/database.sqlite` (dev) and `:memory:` (test).
- [ ] **Seeding (`web/seeders/dev.ts`):**
    - [ ] Create seed script to populate Characters (Director/Freighter), Destinations, and Contracts.
    - [ ] **Crucial:** Ensure seed data aligns with the *new* schema requirements (see Phase 2).
- [ ] **Dev Scripts:** Add `dev:sqlite` and `test` scripts to `package.json`.
- [ ] **Mock Auth:** Create a dev-only route (`/dev/login/:id`) to simulate login without hitting EVE SSO.

## Phase 2: Data Layer & Schema Updates
*Goal: Update the database schema to support modern EVE SSO tokens. Verify these changes using the SQLite environment from Phase 1.*

- [ ] **Modify `EveCharacters` Model:**
    - [ ] Change `token` column to `TEXT` (support ~800+ byte JWTs).
    - [ ] Add `refreshToken` column (`DataTypes.TEXT`) for session renewal.
- [ ] **Fix Logical Bugs:**
    - [ ] Update `getByName` in `web/models/eve/character.ts` to use `characterName`.
- [ ] **Verification:**
    - [ ] Run `dev:sqlite` and verify the database initializes with the new columns.
    - [ ] Update Seeders to include dummy refresh tokens.

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

## Phase 6: Verification & Success Criteria
- [ ] **Dev Environment:** Developer can run `npm run dev:sqlite` and interact with the full app (mock auth, contracts) without MySQL.
- [ ] **Auth Persistence:** User remains logged in >20 mins (Refresh Token works).
- [ ] **Data Integrity:** Long JWTs are stored correctly in both SQLite (Dev) and MySQL (Prod).
- [ ] **Appraisals:** Contract prices are correctly calculated using Janice API.
