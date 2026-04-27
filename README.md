# TrustBlock on Stellar

[![Frontend CI](https://github.com/Bruh-Codes/stellar-hackerthon/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/Bruh-Codes/stellar-hackerthon/actions/workflows/frontend-ci.yml)

TrustBlock is a Stellar-native milestone escrow app for service payments. This hackathon workspace is the Stellar Journey to Mastery version of the product, adapted to Soroban with multi-wallet Stellar support, live contract activity in the frontend, and a tested mini-dApp flow.

## Current Scope

- Multi-wallet Stellar connection through `StellarWalletsKit`
- Stellar testnet detection in the frontend
- Live Soroban escrow contract deployed on Stellar testnet
- Real `create_escrow` contract invocation from the app
- Visible contract transaction state in the UI
- Ledger sync plus a lightweight live activity feed for onchain changes
- Automatic onchain refresh every 4 seconds with sync events surfaced in the activity feed

## Current Belt Status

This repo now covers the completed Level 3 mini-dApp milestone and the first Green Belt production-readiness upgrade:

- Mini-dApp fully functional
- 3+ tests passing
- README complete
- Demo video linked
- Live demo deployed
- GitHub Actions CI added for test, typecheck, and build automation
- Live state synchronization is surfaced in the UI with auto-refresh and activity feed updates

## Project Structure

- `frontend/`: TrustBlock frontend adapted for Stellar wallets + Soroban
- `contracts/`: Soroban contract workspace for the Stellar escrow logic

## Deployed Contract

- Network: `Stellar Testnet`
- Contract ID: `CAQGDVXYW6YHIMLXTNCINAPCZXZ37JKLACGEWXQULYJNAGB5JJBHV4NC`
- Contract Explorer: [stellar.expert testnet contract page](https://stellar.expert/explorer/testnet/contract/CAQGDVXYW6YHIMLXTNCINAPCZXZ37JKLACGEWXQULYJNAGB5JJBHV4NC)

## Contract Call Proof

- Latest contract call transaction hash: `0375428654af24921b77d9d97f2087f308190fa6d31447b4e9b471e8d270fb24`
- Explorer link: [stellar.expert verified transaction](https://stellar.expert/explorer/testnet/tx/0375428654af24921b77d9d97f2087f308190fa6d31447b4e9b471e8d270fb24)

## Live Demo

- Live demo link: [trustblock-soroban.vercel.app](https://trustblock-soroban.vercel.app/)

## CI/CD

- Workflow: `Frontend CI`
- GitHub Actions page: [frontend-ci.yml workflow](https://github.com/Bruh-Codes/stellar-hackerthon/actions/workflows/frontend-ci.yml)
- Current checks:
  - dependency install with Yarn 4
  - Vitest test suite
  - TypeScript typecheck
  - Next.js production build

## Live Sync

- The frontend refreshes Soroban escrow state every 4 seconds for the connected wallet
- Status changes and milestone progress updates are written into the in-app activity feed
- Transaction results remain visible alongside the synced escrow state for quick verification

## Demo Video

- Demo video link: [TrustBlock Stellar demo video](./frontend/TrustBlock-Stellar-White-Belt.mp4)

## Local Run

From `frontend/`:

```bash
yarn install
yarn dev
```

Then open `http://localhost:3000`.

## Run Tests

From `frontend/`:

```bash
yarn test
```

Current test result:

- `3` test files passed
- `9` tests passed total

## Demo Flow

1. Open the app and connect a Stellar wallet from the wallet options modal.
2. Keep the selected wallet on Stellar testnet.
3. Open `New Escrow`.
4. Enter a valid Stellar recipient address.
5. Add milestone amounts in XLM.
6. Click `Create escrow`.
7. Approve the Soroban transaction in the connected wallet.
8. Confirm the transaction status in `Ledger`.
9. Confirm the escrow and activity update in `Overview` and `Ledger`.

## Screenshots

Required screenshots for the submission package:

- Wallet options available
- Wallet connected state
- Successful testnet contract transaction
- Transaction result shown to the user in the app
- Test output showing 3+ tests passing
- Mobile responsive view
- CI/CD pipeline running

Current screenshot assets in this repo:

- `frontend/screenshots/wallet-options.png`
- `frontend/screenshots/white-belt-combined-proof.png`
- `frontend/screenshots/tests.png`
- `frontend/screenshots/TrustBlock-Stellar-mobile-UI.png`

Wallet options screenshot:

![TrustBlock wallet options](./frontend/screenshots/wallet-options.png)

Submission proof image:

![TrustBlock Stellar proof](./frontend/screenshots/white-belt-combined-proof.png)

Test output screenshot:

![TrustBlock passing tests](./frontend/screenshots/tests.png)

Mobile responsive screenshot:

![TrustBlock mobile responsive UI](./frontend/screenshots/TrustBlock-Stellar-mobile-UI.png)

## Functional Flow

Current mini-dApp flow:

1. Connect a Stellar wallet from the wallet options modal.
2. Create a Soroban escrow on Stellar testnet.
3. See the escrow appear in the Ledger.
4. Open the escrow detail view.
5. Fund the escrow from the app.
6. See status and activity updates in the UI.

## Notes

- This repository is a separate Git repository from the original Arbitrum project.
- The frontend UI was intentionally preserved while the wallet and contract layers were migrated to Stellar.

## Feedback
I plan to iterate and improve the dApp based on the constructive feedbacks from the users. Each feedback will be taken into consideration if it a very valid feedback
https://forms.gle/j3hk3qrAQqHJR7YC8
