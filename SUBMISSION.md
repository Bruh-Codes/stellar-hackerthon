# Stellar Journey Submission Summary

## Project

TrustBlock on Stellar

## Track

Builder Track

## Belt Target

Level 1 White Belt

## What I Built

TrustBlock is a Stellar-native milestone escrow app for service payments. For this submission, I adapted the TrustBlock frontend to work with Freighter and connected it to a live Soroban escrow contract on Stellar testnet.

Users can:

- connect a Freighter wallet
- work from the existing TrustBlock UI
- create a real escrow on Stellar testnet through Soroban
- see the created escrow appear in the in-app ledger

## Why Stellar

This product is being built specifically around Stellar-native payments and escrow flows. The contract layer is implemented with Soroban rather than reusing the original EVM contract stack, so the Stellar version is not just a chain toggle on the old app.

## White Belt Scope Completed

- wallet connection with Freighter
- Stellar network awareness
- real transaction signing from the frontend
- Soroban escrow creation on Stellar testnet

## Contract

- Network: Stellar Testnet
- Contract ID: `CAQGDVXYW6YHIMLXTNCINAPCZXZ37JKLACGEWXQULYJNAGB5JJBHV4NC`

## Demo Flow

1. Connect Freighter
2. Switch to Stellar testnet
3. Create an escrow with milestones
4. Approve the Soroban transaction
5. View the created escrow in Ledger

## Next Steps

The next milestone is expanding beyond White Belt into funding, milestone submission, milestone approval/release, and broader production-readiness work for later belts.
