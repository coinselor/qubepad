# Qubepad

A launchpad to faciliate the creation of HyperQube-powered extension chains on the Zenon Network (Network of Momentum).

Demo deployed at [qubepad.vercel.app](https://qubepad.vercel.app)

## Disclaimer

This project is a work in progress and still not fully configurable.

## Stack

-   Framework: Next.js 15 with App Router
-   Database: Vercel Postgres powered by Neondb
-   ORM: Drizzle
-   Package Manager: npm
-   UI Components: Shadcn UI
-   Styling: Tailwind CSS
-   Form Handling: React Hook Form with Zod validation
-   Data Fetching: SWR
-   Automation: Vercel Cron Jobs

## Setup

1. Clone the repository
2. Install dependencies:
    ```bash
    bun install
    ```
3. Copy the environment variables:
    ```bash
    cp .env.example .env
    ```
4. Update the following required environment variables:

    - `DATABASE_URL`: Your Postgres connection string
    - `NEXT_PUBLIC_SIGNATURE_MESSAGE_SUFFIX`: The suffix message used for signature verification (default: "HYPERQUBE LAUNCH")
    - `CRON_SECRET`: A strong random string to secure cron job endpoints

5. Push the database schema:
    ```bash
    bun run push
    ```
6. Start the development server:
    ```bash
    bun run dev
    ```

## Signature Message Suffix

The signature message suffix is implemented with a three-tier fallback system:

1. **Environment Variable**: Can be set via `NEXT_PUBLIC_SIGNATURE_MESSAGE_SUFFIX`
2. **Code of Conduct Hash**: Automatically generated at build time as a truncated SHA-256 hash of the project's Code of Conduct
3. **Default Value**: Falls back to "HYPERQUBE LAUNCH" if neither of the above are available

This implementation ensures message consistency across the application while allowing for easy customization. The Code of Conduct hash option creates a verifiable link between the registration process and the project's community guidelines.

## Automated Updates

Pillar data is automatically updated from [ZenonHub](https://zenonhub.io) every 12 hours using Vercel Cron Jobs. The system tracks the last update time and displays it in the UI. To enable this feature in production:

1. Set the `CRON_SECRET` environment variable to a strong random string
2. Ensure the `vercel.json` file contains the cron job configuration:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/update-pillars",
         "schedule": "0 */12 * * *"
       }
     ]
   }
   ```
3. Deploy to Vercel, which will automatically schedule and run the cron job

## Code of Conduct

Please note that this project adheres to the HyperQube [Code of Conduct](https://github.com/hypercore-one/hyperqube_z/blob/hyperqube_z/CODE_OF_CONDUCT.md). By participating in this project, you agree to abide by its terms.

Built by Aliens
