
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
3. Create a `.env` file with your OpenAI API key:
	```sh
	echo "OPENAI_API_KEY=your_key_here" > .env
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

