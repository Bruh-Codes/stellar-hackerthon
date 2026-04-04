# Soroban Contracts

This workspace is the Stellar-native contract layer for TrustBlock.

## Current scope

- milestone-based escrow scaffold
- escrow lifecycle storage model
- starter events
- basic unit test coverage for create, fund, submit, approve, and release flow

## Planned additions

- SAC token funding and settlement
- resolver and dispute flow
- milestone deadlines and refund logic
- contract upgrade/release notes
- frontend integration clients

## Local setup

You will need Rust and the Soroban CLI installed before running these commands:

```bash
cd contracts
cargo test
soroban contract build
```
