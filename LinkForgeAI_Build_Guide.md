# LinkForge AI — Build & Repo Guide (Frontend / Backend / Smartcontract + CRE)

Dokumen ini adalah panduan **paling praktis** untuk kamu mulai build project **LinkForge AI** untuk hackathon Chainlink Convergence.

> Fokus utama hackathon: **CRE workflow** + integrasi blockchain + integrasi external API/AI.  
> Frontend/Backend itu nilai tambah, tapi workflow CRE harus jelas dan bisa didemokan.

---

## 0) Repo Naming & Target Output

**Repo (public):** `linkforge-ai`  
**Target demo minimal:**  
- Deploy smart contract testnet  
- CRE workflow bisa **simulate / run** dan memicu:
  - fetch data → AI decision → commit reasoning onchain → execute action (minimal event)  
- Frontend menampilkan: profile + logs

---

## 1) Struktur Repo (Final)

```
linkforge-ai/
  README.md
  .gitignore
  .env.example

  Frontend/
    README.md
    package.json
    vite.config.ts
    .env.example
    src/
      main.tsx
      app/
      components/
      pages/
      lib/

  Backend/                 # opsional
    README.md
    package.json           # atau pyproject.toml (FastAPI)
    .env.example
    src/
      index.ts
      routes/
      services/

  Smartcontract/
    README.md
    package.json
    hardhat.config.ts
    .env.example
    contracts/
      LinkForgeVault.sol
      interfaces/
      libraries/
      adapters/
      gates/
    scripts/
      deploy.ts
    test/

  CRE/
    README.md
    .env.example
    workflows/
      linkforge-rebalance.workflow.json   # atau yaml/ts sesuai CRE
    src/
      steps/
      utils/

  docs/
    architecture.md
    demo-script.md
```

**Kenapa ada folder `CRE/`?**  
Karena ini biasanya yang juri paling cari: workflow CRE kamu.

---

## 2) Tech Stack yang Direkomendasikan (Simple & Hackathon-friendly)

### Frontend (React)
- React + Vite + TypeScript
- wagmi + viem (atau ethers v6)
- TailwindCSS + shadcn/ui
- TanStack Query (opsional)
- Recharts (opsional)

### Backend (Opsional)
- Node.js + Fastify/Express
- API Proxy: sentiment, compliance, ESG score
- (Opsional) SQLite / Postgres

> Kalau kamu mau cepat: **skip Backend** dan langsung panggil external API dari Chainlink Functions/CRE.

### Smartcontract
- Solidity ^0.8.20
- Hardhat
- OpenZeppelin: AccessControl, Pausable, ReentrancyGuard, SafeERC20
- Chainlink: Automation + Functions (CCIP optional)

### CRE
- CRE CLI
- Workflow yang melakukan:
  1) fetch market data  
  2) call AI/sentiment  
  3) apply strategy rules  
  4) write result onchain (commit reasoning + execute action)

---

## 3) Network & Deployment Strategy (Praktis)

**Rekomendasi testnet:**
- **Home chain:** Base Sepolia *atau* Sepolia
- **Cross-chain (optional):** Arbitrum Sepolia / Avalanche Fuji (untuk CCIP demo)

> Kalau kamu belum siap CCIP, fokus dulu 1 chain + log reasoning + (mock) execute action.

---

## 4) Environment Variables (Template)

### Root `.env.example`
```
# optional: shared constants
PROJECT_NAME=linkforge-ai
```

### `Smartcontract/.env.example`
```
RPC_URL_SEPOLIA=
RPC_URL_BASE_SEPOLIA=
PRIVATE_KEY=                 # testnet deployer key
ETHERSCAN_API_KEY=           # optional verify
CHAIN_ID=                    # e.g. 11155111 sepolia

# Chainlink / Automation / Functions config (isi sesuai kebutuhan)
LINK_TOKEN_ADDRESS=
FUNCTIONS_ROUTER_ADDRESS=
DON_ID=
```

### `CRE/.env.example`
```
RPC_URL=
CHAIN_ID=
PRIVATE_KEY=

# External APIs
NEWS_API_KEY=
HF_API_KEY=
COMPLIANCE_API_KEY=

# Contract addresses
VAULT_ADDRESS=
```

### `Frontend/.env.example`
```
VITE_RPC_URL=
VITE_CHAIN_ID=
VITE_VAULT_ADDRESS=
VITE_EXPLORER_BASE=
```

### `Backend/.env.example` (kalau dipakai)
```
PORT=8080
NEWS_API_KEY=
HF_API_KEY=
COMPLIANCE_API_KEY=
CORS_ORIGIN=http://localhost:5173
```

---

## 5) Smart Contract — Minimal Requirement & Design

### Tujuan SC untuk MVP
1. Simpan profile user (risk + ESG flag)
2. Menyediakan endpoint yang dipanggil CRE untuk:
   - commit reasoning hash + URI
   - execute “rebalance action” (minimal emit event)
3. Event logs menjadi **verifiable audit trail**

### Event minimal (biar FE mudah baca)
- `ProfileUpdated(user, riskLevel, esgPriority)`
- `RebalanceRequested(user, requestId)`
- `ReasoningCommitted(user, reasoningHash, reasoningURI)`
- `RebalanceExecuted(user, actionHash, actionType)`

### Minimal data yang disimpan onchain
- riskLevel + esgPriority + automationEnabled
- mapping requestId → reasoningHash (optional)

> Hindari simpan string panjang onchain. Simpan **hash + URI**.

---

## 6) CRE Workflow — Minimal Requirement & Output

### Apa yang harus terjadi di workflow
**Input:** user address + config  
**Process:**
1) Pull price snapshot (Data Feeds / RPC / API)
2) Pull sentiment/news (external API)
3) Apply strategy (rule-based atau simple model)
4) Build `reasoning.json` lalu:
   - `reasoningHash = keccak256(json)`
   - `reasoningURI = ipfs://...` (optional; bisa juga temp URL)
5) Call contract:
   - `commitReasoning(user, reasoningHash, reasoningURI)`
   - `executeAction(user, actionHash, actionType)`

**Output:** on-chain events + tx hash

### Kenapa rule-based untuk MVP?
Karena cepat & deterministic untuk demo:
- contoh: kalau sentiment < -0.5 dan volatility tinggi → SHIFT_TO_STABLE

---

## 7) Backend (Opsional) — Kapan Dipakai?

Pakai backend jika kamu mau:
- caching news/sentiment (rate limit)
- mock compliance provider stabil
- ESG score endpoint sederhana

Kalau tidak, skip.

### Endpoint minimum (kalau kamu pilih backend)
- `GET /sentiment?asset=ETH`
- `GET /wallet-risk?address=0x...`
- `GET /esg-score?asset=GREEN1`

---

## 8) Frontend — Halaman Minimum

### Pages
1) **Dashboard**
   - total portfolio value (bisa mock)
   - allocation chart (optional)
2) **Profile**
   - risk level (low/med/high)
   - ESG toggle
   - tombol save → `setProfile()`
3) **Logs**
   - list events:
     - ReasoningCommitted
     - RebalanceExecuted
   - link ke explorer

### FE Read Logs (simple)
- pakai `getLogs` dari provider dan filter by contract + topics

---

## 9) Command Cheatsheet (Build & Run)

### Prerequisites
- Node.js 18+
- pnpm (recommended)
- Git
- Testnet ETH + testnet LINK (jika perlu)

### Smartcontract
```bash
cd Smartcontract
pnpm install
pnpm hardhat compile
pnpm hardhat test
pnpm hardhat run scripts/deploy.ts --network sepolia
```

### CRE
```bash
cd CRE
# install & setup CRE CLI sesuai docs
# lalu simulate / run workflow
# contoh:
cre workflow simulate workflows/linkforge-rebalance.workflow.json
```

### Frontend
```bash
cd Frontend
pnpm install
pnpm dev
```

### Backend (opsional)
```bash
cd Backend
pnpm install
pnpm dev
```

---

## 10) Milestone Build Plan (Paling Cepat)

### Milestone A — 1 hari (minimal demo)
- [ ] SC deploy + event logs jalan
- [ ] CRE workflow: fetch dummy sentiment → commit reasoning → execute action
- [ ] FE: connect wallet + show logs

### Milestone B — 2–3 hari (lebih kuat)
- [ ] Functions/CRE call real external API sentiment
- [ ] Automation trigger interval
- [ ] Compliance gate allow/deny

### Milestone C — optional
- [ ] CCIP transfer cross-chain
- [ ] Real swap integration (optional)

---

## 11) README Root (Wajib untuk juri)

Root `README.md` minimal punya:
- One-liner + problem/solution
- Chainlink components used (CRE, Functions, Feeds, Automation, CCIP)
- Deployed addresses + networks
- How to run (Smartcontract / CRE / Frontend)
- Demo video link (3–5 menit)
- Folder pointers: `CRE/` (utama), `Smartcontract/`, `Frontend/`

---

## 12) File Templates yang Disarankan Kamu Buat

### Root
- `README.md`
- `.env.example`

### Per folder
- `Frontend/README.md`
- `Backend/README.md`
- `Smartcontract/README.md`
- `CRE/README.md`

---

## 13) Next Action (langsung build)

1) Buat repo GitHub `linkforge-ai` (public)  
2) Buat folder sesuai struktur (Frontend/Backend/Smartcontract/CRE/docs)  
3) Start dari **Smartcontract** (deploy event logs)  
4) Lanjut **CRE workflow** (commitReasoning + executeAction)  
5) Baru FE menampilkan logs

---

Jika kamu mau, aku bisa lanjutkan dengan:
- template `README.md` root yang siap submit,
- template `deploy.ts`, `hardhat.config.ts`,
- template workflow file di `CRE/workflows/`.
