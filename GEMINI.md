# Vagrant Logistics (VGLGI) - Project Context

## Project Overview
**Vagrant Logistics** (formerly Mango Deliveries) is a full-stack web application designed for EVE Online freighting services. It provides a platform for users to calculate shipping quotes (similar to PushX) and manage freight contracts. The application is tailored for "Neutral Space Trucking" services covering HighSec, LowSec, Providence, Zarzakh, and Thera routes.

The project consists of a **Node.js/Express backend** that handles EVE SSO authentication, ESI API integration, and pricing logic, coupled with a modern **React/Vite frontend** for the user interface.

## Tech Stack

### Frontend (`/client`)
*   **Framework:** React 19 + TypeScript
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS (v3) + PostCSS
*   **Key Dependencies:** `react-dom`

### Backend (`/`)
*   **Runtime:** Node.js (>=18.0.0)
*   **Framework:** Express.js
*   **Database:** MySQL (via Sequelize ORM)
*   **External APIs:**
    *   **EVE SSO:** Authentication (OAuth2)
    *   **EVE ESI:** Universe data (System IDs, Route calculation)
*   **Key Dependencies:** `axios` (HTTP requests), `moment-timezone`, `helmet`, `morgan`

## Project Structure

```text
├── bin/                # Server entry point (www.ts)
├── client/             # Frontend React Application
│   ├── public/         # Static assets
│   ├── src/            # Frontend source code
│   │   ├── components/ # React components
│   │   └── App.tsx     # Main application component (Calculator UI)
│   └── vite.config.ts  # Vite configuration (includes API proxy)
├── web/                # Backend Source Code
│   ├── controllers/    # Route handlers (Auth, Quotes, Contracts)
│   ├── env/            # Environment variable configuration
│   ├── helpers/        # Utility logic (ESI, Pricing, Validation)
│   ├── middlewares/    # Express middlewares (Auth check)
│   └── models/         # Sequelize Database Models
├── package.json        # Root dependencies & scripts
└── .env                # Environment variables (EVE_ID, EVE_SECRET, DB config)
```

## Building and Running

### Prerequisites
*   Node.js v18+
*   MySQL Database

### Installation
1.  **Install Root Dependencies:**
    ```bash
    npm install
    ```
2.  **Install Client Dependencies:**
    ```bash
    cd client && npm install
    ```

### Development
To run both the Backend (port 3001) and Frontend (port 5173) concurrently:
```bash
npm run dev
```
*   The Frontend proxies API requests (`/quote`, `/login`, etc.) to `http://localhost:3001`.

### Production Build
To compile TypeScript for the backend and build the React frontend:
```bash
npm run build
```

## Key Logic & Conventions

### Pricing Engine (`web/helpers/pricing.ts`)
*   **Route Calculation:** Uses EVE ESI to calculate jumps between Origin and Destination.
*   **Security Logic:**
    *   `HighSec`: Rate based on volume (DST vs Freighter vs JF).
    *   `Providence`: Special flat rate per jump + 2% collateral.
    *   `LowSec/Thera/Zarzakh`: Higher risk rates + 3% collateral.
*   **Minimum Reward:** 4,500,000 ISK.

### Authentication (`web/controllers/eve.ts`)
*   Uses EVE Online SSO.
*   Flow: User clicks Login -> Redirects to EVE -> Callback receives code -> Backend exchanges code for token -> Creates Session.
*   **Note:** Legacy `request-promise` has been replaced with `axios`.

### Database
*   Uses Sequelize ORM.
*   Models are defined in `web/models/eve/`.
*   Session storage is handled via `connect-session-sequelize`.

## Contribution Guidelines
*   **Style:** Follow the existing TypeScript conventions (Strict typing preferred).
*   **Frontend:** Use Tailwind CSS for styling; avoid plain CSS files where possible.
*   **API:** All backend API calls should be typed and use `axios`.
