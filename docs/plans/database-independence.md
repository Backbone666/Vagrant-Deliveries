# Plan: Database Independence (SQLite Implementation)

## Phase 1: Comparative Analysis & Decision

### Option A: In-Memory (JavaScript Objects/Maps)
*   **Pros:** Fastest execution, zero external dependencies.
*   **Cons:**
    *   **High Effort:** The project currently uses **Sequelize** (ORM). Implementing a pure in-memory store would require either:
        1.  Rewriting the entire data access layer to use the Repository pattern, abstracting Sequelize away completely.
        2.  Mocking the entire Sequelize API (`findAll`, `findOne`, `create`, `update`, complex `where` clauses, and `include` for joins). This is extremely brittle and error-prone.
    *   **Complexity:** Recreating relational logic (Foreign Keys, Cascading Deletes) for Characters, Corps, and Contracts in JavaScript is non-trivial.
    *   **Session Management:** Would require switching `connect-session-sequelize` to `memory-store`, creating a discrepancy between dev and prod.

### Option B: SQLite (via Sequelize)
*   **Pros:**
    *   **Native Compatibility:** Sequelize has built-in support for SQLite. Switching dialects requires minimal code changes.
    *   **ORM Reuse:** We can use the exact same Models, Migrations, and Query logic as production.
    *   **Relational Integrity:** SQLite handles joins and constraints, ensuring tests are accurate to the production data model.
    *   **Session Support:** `connect-session-sequelize` works seamlessly with a Sequelize instance backed by SQLite.
*   **Cons:**
    *   Requires `sqlite3` dependency.
    *   Minor differences in Date handling (Sequelize usually handles this abstraction well).

### Decision: **SQLite**
Given that the project relies heavily on **Sequelize** for relational data mapping (Characters -> Corporations -> Alliances) and Session storage, **SQLite is the superior choice**. It allows us to swap the database "engine" without rewriting the business logic or creating a complex mock-ORM layer.

---

## Phase 2: Implementation Plan

### 1. Dependencies
*   Install `sqlite3` as a dependency (needed for both dev and potentially portable deployments).
    ```bash
    npm install sqlite3
    ```

### 2. Database Abstraction (Configuration)
Modify `web/db.ts` to conditionally load the database configuration based on an environment variable (`DB_TYPE`).

*   **Logic:**
    *   If `DB_TYPE === 'mysql'`, use existing MySQL config.
    *   If `DB_TYPE === 'sqlite'`, configure Sequelize with:
        *   `dialect: 'sqlite'`
        *   `storage`:
            *   For **Development**: `data/database.sqlite` (Persists data between restarts).
            *   For **Testing**: `:memory:` (Wiped after every run).
        *   `logging`: `false` (to reduce noise).

### 3. Environment Configuration
Update `.env.example` and create a mechanism to load specific configs.

*   Add `DB_TYPE=sqlite` to `.env` for local development.
*   MySQL variables (`MYSQL_HOST`, etc.) become optional if `DB_TYPE=sqlite`.

### 4. Seed Data (Fixtures)
Since the SQLite database starts empty (or is wiped), we need a "Seeder" to make the app usable immediately without needing to login via EVE SSO (which requires a real API key).

*   **Create `web/seeders/dev.ts`:**
    *   **Characters:** Create a "Director" char and a "Freighter" char.
    *   **Destinations:** Seed common hubs (Jita, Amarr, Dodixie).
    *   **Contracts:** Create sample courier contracts (Pending, In Progress, Completed).
    *   **Settings:** Default system settings.

### 5. Development Scripts
Update `package.json` to support the new modes:

*   `"dev:sqlite"`: `cross-env DB_TYPE=sqlite nodemon ...`
*   `"test"`: `cross-env DB_TYPE=sqlite STORAGE=:memory: mocha ...`

### 6. Mock Authentication (Optional but Recommended)
To fully bypass EVE SSO for offline development:
*   Create a "Dev Login" route (only available if `NODE_ENV=development`).
*   This route sets `req.session.character` to one of the seeded characters immediately, bypassing the OAuth flow.

## Compatibility Report (MySQL vs SQLite)

| Feature | MySQL (Production) | SQLite (Dev/Test) | Handling Strategy |
| :--- | :--- | :--- | :--- |
| **Timestamps** | `DATETIME` / `TIMESTAMP` | `TEXT` / `INTEGER` | Sequelize handles conversion automatically. |
| **Booleans** | `TINYINT(1)` | `INTEGER` (0/1) | Sequelize handles conversion automatically. |
| **JSON Columns** | Native JSON | Text | Sequelize handles serialization/deserialization. |
| **Foreign Keys** | Enforced | Disabled by default | Enable via `PRAGMA foreign_keys = ON;` in `web/db.ts`. |

## Deliverables Checklist
- [ ] `npm install sqlite3`
- [ ] Refactor `web/db.ts` for dynamic dialect switching.
- [ ] Create `web/seeders/dev.ts`.
- [ ] Add `dev:sqlite` script to `package.json`.
- [ ] Verify `npm run dev:sqlite` spins up a working server with data.
