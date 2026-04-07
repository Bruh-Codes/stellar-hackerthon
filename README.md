# TrustBlock on Stellar

TrustBlock is a Stellar-native milestone escrow app for service payments. This hackathon workspace is the Stellar Journey to Mastery version of the product, focused on Soroban-based escrow creation and a Freighter-connected frontend.

## White Belt Status

This repo is ready for a Level 1 White Belt submission.

Current working scope:

- Freighter wallet connection in the existing TrustBlock UI
- Stellar testnet detection in the frontend
- Live Soroban escrow contract deployed on Stellar testnet
- Real `create_escrow` contract invocation from the app
- Created escrows shown back in the in-app Ledger view

What this milestone proves:

- users can connect a Stellar wallet
- users can sign a real Stellar/Soroban transaction
- the app creates a live onchain escrow on Stellar testnet

## Submission Checklist

This submission includes:

- Public GitHub repository
- `README.md`

This README includes:

- Project description
- Setup instructions for local run
- Screenshot checklist for submission assets

Required screenshots for the final submission package:

- Wallet connected state
- Balance displayed
- Successful testnet transaction
- The transaction result shown to the user

One combined screenshot is acceptable if it clearly shows multiple required states in one frame.

Suggested screenshot filenames:

- `screenshots/wallet-connected.png`
- `screenshots/balance-displayed.png`
- `screenshots/successful-testnet-transaction.png`
- `screenshots/transaction-result-shown.png`
- `screenshots/white-belt-combined-proof.png`

## Project Structure

- `frontend/`: TrustBlock frontend adapted for Freighter + Soroban
- `contracts/`: Soroban contract workspace for the Stellar escrow logic

## Deployed Testnet Contract

- Contract ID: `CAQGDVXYW6YHIMLXTNCINAPCZXZ37JKLACGEWXQULYJNAGB5JJBHV4NC`
- Network: `Stellar Testnet`

## Local Run

From `frontend/`:

```bash
yarn install
yarn dev
```

Then open `http://localhost:3000`.

## Demo Flow

1. Connect Freighter
2. Make sure Freighter is on Stellar testnet
3. Open `New Escrow`
4. Enter a valid Stellar recipient address
5. Add milestone amounts in XLM
6. Click `Create escrow`
7. Approve the Soroban transaction in Freighter
8. View the created escrow in `Ledger`

## Screenshots

Capture and include these in the repository before final submission:

1. Wallet connected state
2. Balance displayed
3. Successful testnet transaction
4. Transaction result shown to the user in the app

If you prefer a single combined proof image, use:

- `frontend/screenshots/white-belt-combined-proof.png`

Suggested caption:

- Connected Freighter wallet, in-app escrow value display, and successful Stellar testnet escrow creation visible in the TrustBlock ledger.

Submission proof image:

![White Belt combined proof](./frontend/screenshots/white-belt-combined-proof.png)

## Next Belt Steps

- fund escrow onchain from the app
- submit milestone actions onchain
- approve and release milestones onchain
- add tests and broader production-readiness polish

## Git

This folder has its own Git repository and can be pushed to a separate hackathon remote.
