# BachatShield 🛡️🇵🇰

> **“Kharchay pe lagao tala, Savings se hoga ujala!”**  
> *Control expenses and let your savings grow.*

BachatShield is a localized Pakistani family finance platform built specifically for local economic realities. It replaces complex manual entry with natural language Roman Urdu voice or text logging, calculates real-time Safe Daily Spend limits, breaks down bi-monthly school fees and utility bill shocks into automated daily micro-sinking funds, and manages informal money systems like Committees (BCs) and Udhaar with 1-tap WhatsApp payment reminders.

---

## 🎨 UI/UX Color Guardrails

- **Background:** Pure Deep Black (`#000000`, `#050505`)
- **Buttons:** Vibrant Green (`#22c55e`, `#16a34a`)
- **Alerts:** Yellow (`#f59e0b`, `#fde047`, PBS SPI indicators)
- **Text:** Crisp White (`#ffffff`, muted `#94a3b8`)
- **Cards:** Dark Grey (`#141414`, `#1a1a1a`, `#27272a`)

*(Strictly built without SMS parsing and without solar net metering).*

---

## 🚀 Key Features

1. **Natural Language Roman Urdu Voice & Text Ingestion:**
   - Log expenses effortlessly using everyday Roman Urdu phrases:
     - *"Doodh wale ko 4500 diye Cash se"*
     - *"Shell petrol 3500 SadaPay"*
     - *"Tariq karyana 3800 atta aur ghee"*
     - *"Careem ride 850"*
     - *"Ali ko 2500 udhaar diye"*
   - Full Web Speech API voice recording with live waveform simulation.

2. **Real-Time Safe Daily Spend Limit HUD:**
   - Protects household liquidity using the formula:
     $$\text{Safe Daily Spend} = \frac{\text{Monthly Income} - \text{Fixed Bills} - \text{Daily Sinking Allocations} - \text{Current Month Spend}}{\text{Days Remaining}}$$
   - Dynamic indicators (`Optimal`, `Cautious`, `High Shock Risk`).

3. **Automated Daily Micro-Sinking Funds:**
   - Breaks down sudden bi-monthly school fees (Beaconhouse, City School, Roots, etc.) and summer utility peaks into small automated daily micro-savings targets (e.g., auto-locking Rs. 450/day).

4. **Committees / BCs (ROSCA Ledger):**
   - Track family savings circles (*Kameti*), pool accumulation, monthly turns, and 1-click member payment status checklists.

5. **Udhaar & Informal Ledger with 1-Tap WhatsApp Reminders:**
   - Track receivables (money owed to you) and payables (money you owe).
   - Generates polite Roman Urdu payment reminders with your Raast ID/mobile number and launches WhatsApp with a single tap.

6. **Role-Based Family Privacy Controls:**
   - **Parent Master View:** Full visibility over total family income, committee draws, and joint utilities.
   - **Teen Sub-Wallet View:** Restricts view to personal pocket money, daily canteen/shawarma spend, and private savings goals, masking parent income and joint obligations.

7. **Inflation Shield (PBS SPI Commodity Monitor):**
   - Monitors Pakistan Bureau of Statistics (PBS) Sensitive Price Indicator (SPI) spikes (Atta, Cooking Ghee, Sugar, Fuel) and recommends tactical bulk purchases and Shariah-compliant Daily Cash Fund idle money defense.

---

## 📁 Project Structure

```text
bachatshield/
├── client/
│   ├── index.html            # Main website dashboard UI
│   ├── css/
│   │   └── styles.css        # Strict Black/Green/Yellow/White/Dark Grey styles
│   └── js/
│       ├── app.js            # App controller, HUD math, voice recording
│       ├── nlp-parser.js     # Roman Urdu Natural Language Processing engine
│       └── api-client.js     # REST client + offline localStorage sync
├── server/
│   ├── package.json          # Node/Express dependencies
│   ├── server.js             # Express API server + static frontend host
│   ├── controllers/
│   │   └── nlpController.js  # Server-side Roman Urdu parser route
│   └── routes/
│       ├── transactions.js   # Transactions API
│       ├── sinkingFunds.js   # Micro-sinking funds API
│       ├── committees.js     # Committee / BC API
│       ├── udhaar.js         # Udhaar & WhatsApp reminder API
│       └── inflation.js      # SPI commodity price alert API
├── .env.example              # Sample environment configuration
├── .gitignore                # Git ignore rules
├── Dockerfile                # Production container spec
├── docker-compose.yml        # Docker compose runner
├── DEPLOYMENT.md             # Smooth deployment instructions
├── GITHUB_SETUP.md           # Step-by-step GitHub repository guide
└── README.md
```

---

## ⚡ Quick Start

### Option A: Standalone Browser Mode (Zero Installation)
Simply double-click `client/index.html` or open it in any web browser. The app runs 100% locally with built-in `localStorage` synchronization and full voice logging support!

### Option B: Full-Stack Node.js Server
1. Navigate to the server directory:
   ```bash
   cd server
   npm install
   npm start
   ```
2. Open `http://localhost:5000` in your browser.

### Option C: Docker
```bash
docker-compose up --build
```
Open `http://localhost:5000`.
