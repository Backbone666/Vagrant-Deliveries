# Vagrant Logistics (VGLGI) - Project Context

## Current Project State
The application is a dockerised full-stack solution for EVE Online freighting. It features a Node.js/Express backend handling EVE SSO, ESI integration, and business logic, paired with a React 19/Vite frontend.

**Active Services:**
*   **App Service:** Node.js backend (serving API + static frontend in production).
*   **Database:** MySQL 8.0 (Sequelize ORM).
*   **Proxy:** Nginx (Reverse proxy, header management).

**Key Features Implemented:**
*   **Authentication:** EVE Online SSO (OAuth2).
*   **Pricing Engine:** Automated quote calculation based on Route Security, Volume, and Collateral (PushX-style).
*   **Contract Management:** Submission, Tracking, and History.
*   **Audit System:** Immutable logs for all contract actions.
*   **Notifications:** Discord Webhooks for contract events.
*   **Compliance:** GDPR/Privacy policy and CCP Legal Notices.

## Recent Changes
**Date:** 2026-01-12
1.  **CI Fixes**: Resolved significant linting failures in GitHub Actions related to indentation (2 spaces required), quote consistency (double quotes required), and explicit `any` types (forbidden by TS rules). This included fixing `web/helpers/discord.ts`, `web/models/eve/audit.ts`, and `web/controllers/eve.ts`.
2.  **Infrastructure**: Finalized GitHub Actions workflows for CI, Security, Docker Publishing, and Deployment.

**Date:** 2026-01-11
1.  **Compliance:** Added `LEGAL.md` and `PRIVACY.md` to satisfy CCP Games third-party requirements.
2.  **Audit Logs:** Implemented `EveContractAudit` model and logging hooks in `web/controllers/eve.ts` and `web/helpers/eve.ts`.
3.  **Discord Integration:** Added `web/helpers/discord.ts` and integrated webhook notifications for new contracts and status changes.
4.  **API Expansion:** Added `/history` endpoint for user contract history.

## Architecture Decisions
*   **Monolithic Docker Image:** We use a multi-stage build to compile both Frontend and Backend into a single Node.js container (`node:20-alpine`). **Rationale:** Simplifies deployment; Nginx handles public traffic, Node handles API + Static files.
*   **Sequelize for Audit Logs:** Chosen over a simple file logger or NoSQL to ensure relational integrity with the `Contracts` and `Characters` tables.
*   **Axios Migration:** Completely replaced `request-promise` to modernize the HTTP stack and improve type safety.

## Technical Details
*   **Dependencies:** Node.js v18+, React 19, TailwindCSS v3.
*   **Database Schema:**
    *   `eve_contracts`: Main contract data.
    *   `eve_contract_audits`: History of actions.
    *   `eve_characters`: User session data.
*   **Environment Variables:**
    *   `DISCORD_WEBHOOK_URL`: Required for notifications.
    *   `EVE_CALLBACK`: Must match the Docker ingress URL (e.g., `http://localhost/callback` or `https://domain.com/callback`).

## Known Issues & Limitations
*   **Frontend Calculator:** The UI component (`App.tsx`) currently calculates quotes via API but needs full form integration to pre-fill the submission page.
*   **Admin UI:** While the backend supports Director/Admin actions, a dedicated frontend for viewing Audit Logs is not yet implemented.
*   **Validation:** Input validation exists but could be strengthened with a dedicated schema library (Zod/Joi).

## Next Steps
1.  **Frontend Integration:** Connect the Calculator UI to the `/submit` endpoint logic more tightly.
2.  **Admin Dashboard:** Build the React view for Directors to see Audit Logs.
3.  **Production Hardening:** Review Nginx headers and SSL configuration (Certbot).

## Important Notes
*   **ESI Compliance:** We must ensure we do not cache ESI data longer than allowed headers permit.
*   **Security:** `EVE_DELIVERIES_SESSION_SECRET` must be rotated in production.
