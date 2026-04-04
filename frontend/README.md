# TrustBlock Stellar Frontend

This package contains the copied TrustBlock frontend that will power the Stellar hackathon version of the app.

The current UI came from the Arbitrum version, but this folder now belongs to the Stellar-native submission path. The immediate goal is to preserve the working product UX while replacing EVM-specific wallet and contract integration with Stellar + Soroban flows.

## Current Status

What was copied from the original frontend:

- responsive application shell and navigation
- escrow drafting flow
- milestone creation, editing, reordering, and review
- dispute resolver selection UX
- wallet connection with Reown AppKit and wagmi
- EVM contract read and write hooks
- exported deployment registry shared from Hardhat artifacts
- env-based Arbitrum deployment configs
- Drizzle-backed workroom schema for Supabase persistence

What still needs to change for the Stellar submission:

- replace wagmi/Reown wallet flow with Stellar wallet support
- replace EVM hooks, ABIs, and deployment helpers with Soroban client calls
- adapt escrow reads and writes to the Soroban contract shape
- refresh docs and product copy to emphasize Stellar-native escrow

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Reown AppKit
- wagmi
- viem

## Prerequisites

- Node.js 20+
- Yarn 4

## Install

```bash
yarn install
```

## Environment

Create `.env.local` with:

```bash
NEXT_PUBLIC_REOWN_PROJECT_ID=your_reown_project_id
NEXT_PUBLIC_ESCROW_DEPLOYMENT=arbitrumSepolia
DATABASE_URL=postgresql://...
```

The committed `.env.example` shows the expected variables.

Use `NEXT_PUBLIC_ESCROW_DEPLOYMENT=arbitrum` to switch the frontend to the mainnet deployment registry.
Use the Supabase Postgres connection string for `DATABASE_URL`. Keep it server-side only.

For Supabase runtime reads and writes, use the configured PostgREST client in [`lib/supabase/postgrest.ts`](./lib/supabase/postgrest.ts):

```ts
import { supabase } from "@/lib/supabase/postgrest";

const { data, error } = await supabase
  .from("workroom_submissions")
  .select("*");
```

Drizzle remains the schema and migration source of truth. PostgREST gives you the Supabase-style query API inside the app.

## Run

```bash
yarn dev
```

## Scripts

```bash
yarn dev
yarn build
yarn start
yarn lint
yarn db:generate
yarn db:push
yarn db:studio
```

## Project Structure

```text
app/
  layout.tsx
  page.tsx
components/
  CreateEscrow.tsx
  Overview.tsx
  Transactions.tsx
  WalletButton.tsx
  WalletProvider.tsx
  ui/
lib/
  demo-data.ts
db/
  schema.ts
  workroom.ts
  wallet.ts
```

## Notes

- wallet connection is enabled through Reown AppKit and wagmi
- deployment addresses and token metadata are generated from `apps/smart-contracts/scripts/export-web-deployment.js`
- `next build` may require outbound network access if fonts are fetched during build
