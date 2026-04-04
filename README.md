# TrustBlock Stellar Hackathon

This folder is a separate Git workspace for the Stellar Journey to Mastery submission.

It keeps:

- `frontend/`: a copy of the current TrustBlock web app UI
- `contracts/`: a new Soroban contract workspace for the Stellar-native escrow flow

## Intent

The frontend was copied from the current Arbitrum version so the product experience and information architecture can move faster.

The contract layer is intentionally being rebuilt for Stellar with Soroban so the submission is clearly Stellar-native rather than an EVM port.

## Suggested next steps

1. Replace the EVM wallet and contract hooks in `frontend/` with Stellar wallet + Soroban integration.
2. Expand the Soroban contract in `contracts/escrow` to handle token transfers, milestone review, disputes, and resolver logic.
3. Rewrite the app copy and docs so the product story is framed around Stellar-native service payments and milestone escrow.

## Git

This folder already has its own Git repository, so you can add a new remote and push it independently from the original project.

```bash
cd stellar-hackathon
git remote add origin <your-new-repo-url>
git add .
git commit -m "Initial Stellar hackathon scaffold"
git push -u origin main
```
