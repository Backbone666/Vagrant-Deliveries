# Vagrant Logistics (VGLGI)
**Version:** 2.0.0
**Last Updated:** 2026-01-19

## About
Vagrant Logistics (VGLGI) is a modernised freighting platform for EVE Online, based on the Mango Deliveries project. "Neutral Space Trucking since YC117.06.19".

## Tech Stack
- **Backend:** Node.js, Express, Sequelize ORM (MySQL/SQLite)
- **Frontend:** React 19, Vite, TailwindCSS
- **Testing:** Jest, ts-jest
- **Linting:** ESLint 9 (Flat Config), typescript-eslint 8
- **Infrastructure:** Docker, Nginx, GitHub Actions
- **Typography:** Custom fonts (Shentox, Eve Sans Neue)

## Setup

### Standard Installation
1. Clone this repository.
2. Run `npm install` to install backend dependencies.
3. Run `cd client && npm install` to install frontend dependencies.
4. **Fonts:** Ensure the following font files are present in `client/public/fonts/`:
   - `Shentox-Regular.otf`
   - `Shentox-Bold.otf`
   - `evesansneue-regular.otf`
   - `evesansneue-bold.otf`
5. Go to https://developers.eveonline.com/ and create an application.
6. Set "Connection Type" to "Authentication Only" and "Callback URL" to the url that users will be redirected to after login (locally `http://localhost:5173/callback` for development).
7. Create a `.env` file at the root of the project (see `.env.example`).
8. Run `npm run dev` to run both the express back-end and Vite front-end.

### Testing
To run the backend test suite:
```bash
npm test
```

### Docker
1. Build the image:
   ```bash
   docker build -t vagrant-logistics .
   ```
2. Run the container:
   ```bash
   docker run -p 3000:3000 --env-file .env vagrant-logistics
   ```
   *Note: Ensure your `.env` file is properly configured with database credentials accessible from the container.*

### Deployment (Production)
For a complete production deployment using Docker Compose (App + Database + Nginx), please refer to the [Deployment Guide](GEMINI_DEPLOY.md).

## Environment variables
### Required
- `EVE_CALLBACK`: The URL to redirect to after the EVE SSO logs in the user (must match EVE Devs config).
- `EVE_DELIVERIES_SESSION_SECRET`: A cryptographically secure secret for the cookie system.
- `EVE_ID`: The Client ID from EVE Developers.
- `EVE_SECRET`: The Secret Key from EVE Developers.
- `MYSQL_DATABASE`: Name of the database (for MySQL).
- `MYSQL_PASSWORD`: The password of the MySQL user.
- `MYSQL_USER`: The MySQL user.

### Optional
- `DB_CONNECTION`: Database dialect to use. Options: `mysql` (default), `sqlite`.
- `DEBUG`: Set to `express-session` for debug output.
- `MYSQL_CONNECTION_LIMIT`: Max DB connections (Default: 10).
- `MYSQL_HOST`: Database hostname (Default: `localhost`).
- `MYSQL_PORT`: Database port (Default: 3306).
- `NODE_ENV`: Set to `dev` for development, `production` otherwise.
- `PORT`: Backend API port (Default: 3001).

## Front Page
![chrome_2ZLgNXFBtP](https://user-images.githubusercontent.com/10968691/129737164-52d5e8fc-2605-4a66-9cb3-3bb86e45fe0b.png)

## Contracts
![chrome_7uJ52AvTSK](https://user-images.githubusercontent.com/10968691/129737208-e37a1f5b-4972-463b-b00c-698b22eed163.png)

## Director Panel
![evedirectors](https://user-images.githubusercontent.com/10968691/129738840-081e2107-0f1b-47ce-b830-75e2d021cbaf.gif)
