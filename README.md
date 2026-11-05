
# Dataset Discovery & Evaluation Agent (MVP)

This project is an MVP AI agent that helps scientists and data engineers discover, evaluate, and acquire open research datasets. It streamlines the process of defining data needs, searching repositories, evaluating dataset suitability, and acquiring datasets with proper citation and logging.

## Features

- Define data needs via a structured form (research question, variables, format, license, date range)
- Search open dataset repositories (DataCite, re3data) for relevant datasets
- Evaluate candidates for metadata completeness, license, format compatibility, and timeliness
- Download openly available datasets and compute checksums
- Generate standard dataset citations (APA/CSL)
- Log decisions (selected/rejected datasets and reasons)
- UI for candidate listing, evaluation cards, download confirmation, and citation display

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS (with dark mode)
- Vercel AI SDK (OpenAI GPT-4o)
- Framer Motion (UI animation)
- pnpm (package manager)

## Installation

1. Clone this repository
2. Install dependencies:
	```sh
	pnpm install
	```
3. Copy `.env.example` to `.env.local` and fill it in:
	```sh
	cp .env.example .env.local
	```
	- `OPENAI_API_KEY`: your OpenAI key (server-side only).
	- `HAWFINCH_PASSWORD`: the shared password for the app. Server-only: never use a `NEXT_PUBLIC_` prefix. If it is unset, login and `/api/chat` stay closed.

## Access control

`/api/chat` requires a signed, httpOnly session cookie. The password gate posts to `/api/auth/login`, which checks `HAWFINCH_PASSWORD` on the server and sets the cookie (7 days). `/api/chat` returns 401 without a valid cookie before reading the request body or calling OpenAI. Requests are capped at 40 messages, 4000 characters per message, 256 KB body (counted in bytes), 3 tool steps and 1024 output tokens. Changing `HAWFINCH_PASSWORD` invalidates all existing sessions.

The login route has no rate limiting, so the password is the only protection for the OpenAI key: use a long random value (for example `openssl rand -base64 24`). Also set a monthly spend limit on the OpenAI key.

## Tests

```sh
pnpm test
```

## Development

Start the development server:
```sh
pnpm dev
```
The app will be available at http://localhost:3000

## Build & Production

To build for production:
```sh
pnpm build
```
To start the production server:
```sh
pnpm start
```

## Linting

Run code linting:
```sh
pnpm lint
```

## Deployment

Deploy to Vercel for best results. Set the `OPENAI_API_KEY` environment variable in the Vercel dashboard. No custom build settings are required.

## Project Structure

- `app/` – Next.js app router, UI, API routes
- `components/` – React UI components (forms, evaluation cards, etc.)
- `src/` – Clean architecture: domain logic, infrastructure, application use cases
- `public/` – Static assets

