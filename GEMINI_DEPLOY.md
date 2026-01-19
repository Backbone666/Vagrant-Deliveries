# Vagrant Logistics (VGLGI) - Deployment Guide

This guide details how to deploy the Vagrant Logistics application using Docker Compose.

## Prerequisites
*   Docker Engine (v20.10+)
*   Docker Compose (v2.0+)
*   A registered EVE Online Application (Developers Portal)

## Initial Setup

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd Vagrant-Deliveries
    ```

2.  **Configure Environment**
    Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
    Edit `.env` and fill in your details:
    *   `EVE_ID` & `EVE_SECRET`: From EVE Developers Portal.
    *   `EVE_CALLBACK`: Set to your public URL + `/callback` (e.g., `http://localhost/callback` or `https://vglgi.space/callback`).
    *   `MYSQL_PASSWORD` & `MYSQL_ROOT_PASSWORD`: Generate strong passwords.
    *   `EVE_DELIVERIES_SESSION_SECRET`: Generate a random string.

3.  **EVE Online Application Config**
    In the EVE Developers Portal:
    *   **Callback URL:** Must match `EVE_CALLBACK` exactly.
    *   **Scopes:** `publicData` (and any others required by specific features, though currently mainly auth).

## Deployment

1.  **Start Services**
    ```bash
    docker compose up -d --build
    ```
    This will:
    *   Build the combined Frontend/Backend image.
    *   Start the MySQL database.
    *   Start the Nginx reverse proxy.

2.  **Verify Status**
    ```bash
    docker compose ps
    ```
    All services (`vglgi-app`, `vglgi-db`, `vglgi-nginx`) should be `Up (healthy)`.

3.  **Access Application**
    Open your browser and navigate to `http://localhost` (or your VPS IP/Domain).

## Maintenance

*   **View Logs:**
    ```bash
    docker compose logs -f
    ```

*   **Update Application:**
    ```bash
    git pull
    docker compose up -d --build
    ```

*   **Database Backup:**
    ```bash
    docker exec vglgi-db mysqldump -u root -p<ROOT_PASSWORD> vagrant_deliveries > backup.sql
    ```

## Troubleshooting

*   **Database Connection Error:** Ensure `MYSQL_HOST=db` in `.env` and wait a few seconds for MySQL to initialize on first run.
*   **EVE SSO Error:** Verify the Callback URL in `.env` matches the EVE Portal exactly.
