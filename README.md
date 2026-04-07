# WalletX — ERC-4337 Smart Wallet

A full-stack implementation of an ERC-4337 Account Abstraction smart wallet with gasless transactions, session keys, and transaction lifecycle visualization.

💻 **Project 4/6 of my [6 Projects in 60 Days](https://twitter.com/dev_niladri) challenge**  
← [Project 3: ZKPass](https://github.com/niladri-gudu/ZKPass)

---

## What is this?

WalletX is a smart contract wallet system built on ERC-4337 (Account Abstraction). Instead of signing regular Ethereum transactions, users sign **UserOperations** — structured intents that get validated and executed through a standardized flow involving bundlers, paymasters, and smart wallet contracts.

This project demonstrates:
- How smart contract wallets work under the hood
- How gas abstraction (gasless UX) is implemented
- How session keys enable delegated, limited access
- The full lifecycle of a UserOperation from creation to on-chain execution

---

## Architecture

```
User / Frontend (Next.js)
        │
        ▼
  Backend API (NestJS)
        │
        ├── Builds UserOperation
        ├── Signs with owner key
        ├── Gets paymaster signature
        │
        ▼
  Pimlico Bundler
        │
        ▼
  EntryPoint Contract (0x0000000071727De22E5E9d8BAf0edAc6f37da032)
        │
        ├── Calls VerifyingPaymaster.validatePaymasterUserOp()
        ├── Calls SmartWallet.validateUserOp()
        │
        ▼
  SmartWallet.execute()
        │
        ▼
  On-chain transaction confirmed
```

---

## UserOperation Lifecycle

```
1. USER ACTION
   User fills in recipient + amount on frontend

2. USEROP BUILT
   Backend constructs a UserOperation struct with:
   - callData (encoded execute() call)
   - gas limits
   - nonce from smart wallet

3. PAYMASTER SIGNS
   Backend computes hash of UserOp (with empty paymasterData)
   VerifyingPaymaster signer signs the hash
   Signature added to paymasterData field

4. WALLET SIGNS
   Backend recomputes hash (now with real paymasterData)
   Owner key signs the final hash
   Signature added to UserOp.signature

5. SENT TO BUNDLER
   UserOp submitted to Pimlico via eth_sendUserOperation

6. ENTRYPOINT VALIDATES
   EntryPoint calls validatePaymasterUserOp → verifies paymaster sig
   EntryPoint calls validateUserOp → verifies owner/session key sig

7. EXECUTION
   SmartWallet.execute() called with target, value, calldata
   Transaction confirmed on-chain
```

---

## Tech Stack

### Smart Contracts (Solidity)
- `SmartWallet.sol` — ERC-4337 compatible smart wallet with session key support
- `VerifyingPaymaster.sol` — Signature-based paymaster for gas sponsorship

### Backend (NestJS + TypeScript)
- UserOperation builder and signer
- Paymaster signature generation
- Session key management
- Bundler integration via Pimlico

### Frontend (Next.js + TypeScript)
- RainbowKit for wallet connection
- Wagmi + Viem for blockchain interactions
- shadcn/ui for components
- Transaction lifecycle visualization

---

## Features

### Gasless Transactions
Users can send transactions without holding ETH for gas. The VerifyingPaymaster covers gas costs — the paymaster signer approves each UserOperation by signing its hash, and the EntryPoint deducts gas from the paymaster's deposit.

### Session Keys
Temporary keypairs with limited permissions that can sign UserOperations on behalf of the smart wallet owner:
- Restricted to a specific target address
- Capped at a maximum ETH amount per transaction
- Auto-expire after a configurable duration

This enables delegated access without exposing the owner's private key.

### Transaction Lifecycle UI
Real-time visualization of each stage in the UserOperation flow — from signing to bundler submission to on-chain confirmation.

---

## Project Structure

```
walletx/
├── apps/
│   ├── api/                    # NestJS backend
│   │   └── src/
│   │       ├── userop/         # UserOperation builder, signer, sender
│   │       ├── session/        # Session key management
│   │       ├── lib/            # Paymaster signing
│   │       └── blockchain/     # Viem client
│   └── web/                    # Next.js frontend
│       ├── app/
│       │   ├── page.tsx        # Main wallet UI
│       │   └── providers.tsx   # RainbowKit + Wagmi providers
│       └── components/
│           ├── TxLifecycle.tsx # Transaction lifecycle visualization
│           └── wallet/         # Wallet UI components
├── contracts/
│   ├── SmartWallet.sol
│   └── VerifyingPaymaster.sol
└── README.md
```

---

## Smart Contracts

### SmartWallet.sol

A minimal ERC-4337 smart account that supports:
- Owner-based signature validation
- Session key validation with permission enforcement
- Nonce management
- ETH receiving and sending via `execute()`

Key functions:
- `validateUserOp()` — validates owner or session key signatures
- `execute()` — executes calls, only callable by EntryPoint
- `addSessionKey()` — owner registers a temp keypair with restrictions
- `revokeSessionKey()` — owner revokes a session key

### VerifyingPaymaster.sol

A signature-based paymaster that sponsors gas for UserOperations. The paymaster signer approves each UserOp by signing its hash. The contract recomputes the hash (stripping the signature bytes from paymasterAndData) and verifies the signature using `ecrecover`.

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- MetaMask browser extension
- Sepolia testnet ETH

### Installation

```bash
git clone https://github.com/yourusername/walletx
cd walletx
pnpm install
```

### Environment Variables

**`apps/api/.env`**
```bash
OWNER_PRIVATE_KEY=<smart wallet owner private key>
BACKEND_PRIVATE_KEY=<backend signer private key>
PAYMASTER_PRIVATE_KEY=<paymaster signer private key>
PAYMASTER_ADDRESS=<deployed paymaster contract address>
SMART_WALLET=<deployed smart wallet address>
ENTRY_POINT=0x0000000071727De22E5E9d8BAf0edAc6f37da032
BUNDLER_URL=https://api.pimlico.io/v2/11155111/rpc?apikey=<your_key>
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<your_key>
```

**`apps/web/.env.local`**
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<your_project_id>
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SMART_WALLET=<deployed smart wallet address>
```

### Deploy Contracts

Deploy both contracts using **Remix IDE** (not Hardhat — bytecode must match exactly):

1. Deploy `SmartWallet.sol`:
   - `_owner`: your MetaMask wallet address
   - `_entryPoint`: `0x0000000071727De22E5E9d8BAf0edAc6f37da032`

2. Deploy `VerifyingPaymaster.sol`:
   - `_entryPoint`: `0x0000000071727De22E5E9d8BAf0edAc6f37da032`
   - `_signer`: address derived from `PAYMASTER_PRIVATE_KEY`

3. Fund the paymaster by calling `deposit()` with at least `0.01 ETH`

### Run

```bash
# Start backend
cd apps/api
pnpm dev

# Start frontend (new terminal)
cd apps/web
pnpm dev
```

Open `http://localhost:3000`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/userop/send` | Send a UserOperation (owner signed) |
| POST | `/userop/send-session` | Send a UserOperation (session key signed) |
| GET | `/userop/status/:hash` | Poll UserOperation receipt |
| POST | `/session/create` | Create and register a session key |
| DELETE | `/session/revoke/:address` | Revoke a session key |
| GET | `/session/list` | List all session keys |

---

## Key Concepts Explained

**Why ERC-4337?**
Regular Ethereum accounts (EOAs) can only sign transactions. Smart contract wallets can have programmable validation logic — multisig, session keys, social recovery, gas sponsorship — but historically required protocol changes. ERC-4337 achieves this without any protocol change by introducing an alternative mempool and a standard EntryPoint contract.

**Why do we need a bundler?**
UserOperations are not regular transactions. They live in a separate mempool and get bundled together into a single on-chain transaction by bundlers (like Pimlico) who call `EntryPoint.handleOps()`.

**What problem does the paymaster solve?**
New users often can't interact with dApps because they have no ETH for gas. A paymaster sponsors gas on their behalf — the dApp pays gas, users just sign intents.

**What are session keys for?**
Imagine a game where every move requires a signature. Session keys let the owner pre-approve a temporary key that can sign automatically within defined limits (time, amount, target) — no owner interaction needed per action.

---

## Network

All contracts are deployed on **Ethereum Sepolia** testnet.

- EntryPoint: `0x0000000071727De22E5E9d8BAf0edAc6f37da032`
- Bundler: Pimlico

---

## License

MIT
