# Mango Deliveries: Production Readiness & Modernization Plan

This plan addresses critical security flaws, deprecated API implementations, and architectural issues identified in the 2026 audit.

## Phase 1: Data Layer & Persistence
- [ ] **Modify `EveCharacters` Model (`web/models/eve/character.ts`):**
    - [ ] Change `token` column from `TEXT({length: "tiny"})` to `TEXT` (to support ~800+ byte JWTs).
    - [ ] Add `refreshToken` column (`DataTypes.TEXT`) for background session renewal.
- [ ] **Fix Logical Bug:**
    - [ ] In `getByName`, change `where: { [name]: name }` to `where: { characterName: name }`.
- [ ] **Migration:** Update `database.sqlite` and provide SQL for production MySQL.

## Phase 2: Authentication Overhaul (SSO v2)
- [ ] **Update Authorization Flow (`web/controllers/eve.ts`):**
    - [ ] Switch base URL to `https://login.eveonline.com/v2/oauth/authorize`.
    - [ ] Append required scopes: `esi-contracts.read_character_contracts.v1`, `esi-universe.read_structures.v1`.
- [ ] **JWT Validation:**
    - [ ] Remove deprecated `https://login.eveonline.com/oauth/verify` call.
    - [ ] Implement local JWT validation (signature check) using EVE JWKS.
- [ ] **Session Renewal:**
    - [ ] Modify `/callback` to store `refresh_token`.
    - [ ] Implement token refresh logic to prevent session expiry every 20 minutes.

## Phase 3: ESI Integration & Reliability
- [ ] **ESI Error Handling:**
    - [ ] Add Axios interceptor to monitor `X-ESI-Error-Limit-Remain`.
    - [ ] Implement back-off logic to prevent IP bans from ESI.
- [ ] **Caching:**
    - [ ] Add response caching (respecting `Expires` headers) for high-frequency ESI endpoints.

## Phase 4: Security & Hardening
- [ ] **CSP Hardening (`web/app.ts`):**
    - [ ] Switch `helmet` CSP `reportOnly` to `false`.
    - [ ] Whitelist `images.evetech.net` and `evepraisal.com`.
- [ ] **Session Security:**
    - [ ] Verify `cookie.secure: true` in production.
    - [ ] Ensure `EVE_DELIVERIES_SESSION_SECRET` is stored as a secure secret.

## Phase 5: Verification
- [ ] Test login persistence beyond 20 minutes.
- [ ] Verify contract data retrieval with new scopes.
- [ ] Audit MySQL connection pool metrics under load.
