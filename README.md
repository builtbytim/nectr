# NECTR - Decentralized Staking Platform

NECTR is a modern decentralized staking platform built on Polygon, offering a seamless staking experience with features like flexible durations, daily interest accrual, and a beautiful, responsive UI.

## Project Structure

```
nectr/
├── frontend/          # React frontend application
└── smart-contracts/   # Solidity smart contracts
```

## Smart Contracts

### Prerequisites

- Node.js >= 16
- pnpm (recommended) or npm
- A `.env` file in the `smart-contracts` directory with:
  ```env
  PRIVATE_KEY=your_private_key
  POLYGON_AMOY_RPC_URL=your_polygon_amoy_rpc_url
  ```

### Setup & Deployment

1. Install dependencies:

   ```bash
   cd smart-contracts
   pnpm install
   ```

2. Compile contracts:

   ```bash
   npx hardhat compile
   ```

3. Deploy to Polygon Amoy testnet:

   ```bash
   # Deploy NECTR Token
   npx hardhat ignition deploy NectrModule --network polygonAmoy

   # After token deployment, update .env with the token address:
   # NECTR_TOKEN_ADDRESS=deployed_token_address

   # Deploy Staking contract
   npx hardhat ignition deploy NectrStakingModule --network polygonAmoy
   ```

4. After deployment, copy the contract addresses and update the frontend `.env` file.

### Contract Addresses

Copy these addresses to your frontend `.env` file:

```env
# Frontend .env
NECTR_TOKEN_ADDRESS=0xaA3457AFd6E04FA3B222f722B51be418f737A440
NECTR_STAKING_ADDRESS=0xf9Ba698524c89730A4D9041F83fb347603Ff8C28
```

### Deployed Contracts (Polygon Amoy)

- **NECTR Token (ERC20)**

  - Address: `0xaA3457AFd6E04FA3B222f722B51be418f737A440`
  - [View on Explorer](https://www.oklink.com/amoy/address/0xaA3457AFd6E04FA3B222f722B51be418f737A440)

- **NECTR Staking**
  - Address: `0xf9Ba698524c89730A4D9041F83fb347603Ff8C28`
  - [View on Explorer](https://www.oklink.com/amoy/address/0xf9Ba698524c89730A4D9041F83fb347603Ff8C28)

### Smart Contract Details

- **NECTR Token (ERC20)**

  - Initial Supply: 100M NECTR
  - Max Supply: 100B NECTR
  - Max Mint Amount: 1M NECTR per transaction
  - Minting Restriction: Balance must be < 1000 NECTR

- **NECTR Staking**
  - Duration: 5 minutes to 2 years
  - Base APR: 7.3%
  - Bonus APR: Up to 10% based on duration
  - Early Withdrawal: 10% penalty, no interest
  - Interest: Accrues daily, claimable anytime

## Frontend Application

### Prerequisites

- Node.js >= 16
- Bun (recommended) or npm
- A `.env` file in the `frontend` directory with:
  ```env
  NECTR_TOKEN_ADDRESS=0xaA3457AFd6E04FA3B222f722B51be418f737A440
  NECTR_STAKING_ADDRESS=0xf9Ba698524c89730A4D9041F83fb347603Ff8C28
  ```

### Setup & Development

1. Install dependencies:

   ```bash
   cd frontend
   bun install
   ```

2. Start development server:

   ```bash
   bun dev
   ```

3. Build for production:
   ```bash
   bun run build
   ```

### Features

- **Staking Interface**

  - Flexible duration selection
  - Real-time APR calculation
  - Progress tracking
  - Interest claiming
  - Token minting

- **Community Hub**

  - Twitter feed integration
  - Crypto news RSS feeds
  - Multi-category news filtering

- **Modern UI/UX**
  - Responsive design
  - Beautiful gradients
  - Smooth animations
  - Mobile-optimized interface

### Technology Stack

- React + Vite
- TailwindCSS
- Framer Motion
- Wagmi v2 + Viem
- RainbowKit
- TanStack Query

## Development Notes

### Contract Interaction

- Use `useReadContract` for reading contract state
- Use `useWriteContract` for transactions
- Always check allowance before staking
- Handle transaction states appropriately

### UI Components

- Responsive breakpoints:
  - Mobile: < 640px
  - Tablet: >= 640px
  - Desktop: >= 1024px

### Testing

Smart Contracts:

```bash
cd smart-contracts
npx hardhat test
```

Frontend:

```bash
cd frontend
bun test
```
