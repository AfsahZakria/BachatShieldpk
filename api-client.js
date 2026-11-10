/**
 * BachatShield - Fullstack API Client with Offline Resilience & Mock Store Fallback
 * Connects smoothly to Node/Express backend at /api or falls back to browser storage.
 */

class BachatShieldAPI {
    constructor(baseURL = 'http://localhost:5000/api') {
        this.baseURL = baseURL;
        this.isOnline = false;
        this.storageKey = 'bachatshield_state_v1';
        this.initializeMockData();
    }

    async testConnection() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1500);
            const res = await fetch(`${this.baseURL}/health`, { signal: controller.signal });
            clearTimeout(timeoutId);
            this.isOnline = res.ok;
        } catch (e) {
            this.isOnline = false;
        }
        return this.isOnline;
    }

    initializeMockData() {
        if (!localStorage.getItem(this.storageKey)) {
            const defaultState = {
                role: 'parent', // 'parent' or 'teen'
                monthlyIncome: 240000,
                fixedBills: 65000, // Rent, Maid, Utility basic
                teenPocketAllowance: 12000,
                raastId: '03001234567',

                sinkingFunds: [
                    {
                        id: 'sf-1',
                        title: 'Beaconhouse Bi-Monthly School Fee',
                        targetAmount: 55000,
                        currentAmount: 38500,
                        dueDate: '2026-12-10',
                        dailyTarget: 450,
                        category: 'education',
                        notes: '2 kids tuition voucher'
                    },
                    {
                        id: 'sf-2',
                        title: 'Summer Peak Utility Bill Cushion (LESCO)',
                        targetAmount: 30000,
                        currentAmount: 18000,
                        dueDate: '2026-11-28',
                        dailyTarget: 350,
                        category: 'utilities',
                        notes: 'AC peak slab cushion'
                    }
                ],

                committees: [
                    {
                        id: 'comm-1',
                        name: 'Al-Khair Family Committee (BC)',
                        monthlyContribution: 25000,
                        totalPool: 250000,
                        currentMonth: 'Turn #6 of 10',
                        drawDate: '25th of every month',
                        myPayoutMonth: 'December 2026',
                        members: [
                            { id: 1, name: 'Usama (You)', paid: true, turnMonth: 'Dec' },
                            { id: 2, name: 'Tariq Chacha', paid: true, turnMonth: 'Aug' },
                            { id: 3, name: 'Bhabhi Sadia', paid: true, turnMonth: 'Sep' },
                            { id: 4, name: 'Asad Bhai', paid: false, turnMonth: 'Oct' },
                            { id: 5, name: 'Khala Rehana', paid: false, turnMonth: 'Nov' }
                        ]
                    }
                ],

                udhaar: [
                    {
                        id: 'udh-1',
                        personName: 'Hamza (Colleague)',
                        amount: 6500,
                        type: 'receivable', // they owe you
                        reason: 'Dinner bill split via Raast',
                        date: '2026-11-04',
                        phone: '03219876543',
                        settled: false
                    },
                    {
                        id: 'udh-2',
                        personName: 'Tariq Karyana Store',
                        amount: 3200,
                        type: 'payable', // you owe them
                        reason: 'Monthly ration tab remainder',
                        date: '2026-11-06',
                        phone: '03335551234',
                        settled: false
                    },
                    {
                        id: 'udh-3',
                        personName: 'Kamran (Cousin)',
                        amount: 15000,
                        type: 'receivable',
                        reason: 'Emergency hospital medicine',
                        date: '2026-10-28',
                        phone: '03004448888',
                        settled: false
                    }
                ],

                transactions: [
                    {
                        id: 'tx-1',
                        title: 'Imtiaz Supermarket Ration',
                        category: 'groceries',
                        amount: 14200,
                        type: 'expense',
                        method: 'Raast',
                        scope: 'parent',
                        date: '2026-11-10T11:30:00Z'
                    },
                    {
                        id: 'tx-2',
                        title: 'Daily Milk (Doodh 5 Litres)',
                        category: 'groceries',
                        amount: 1100,
                        type: 'expense',
                        method: 'Cash',
                        scope: 'parent',
                        date: '2026-11-10T08:15:00Z'
                    },
                    {
                        id: 'tx-3',
                        title: 'Shell Fuel (Car Petrol)',
                        category: 'transport',
                        amount: 4000,
                        type: 'expense',
                        method: 'SadaPay',
                        scope: 'parent',
                        date: '2026-11-09T17:45:00Z'
                    },
                    {
                        id: 'tx-4',
                        title: 'College Canteen & Shawarma',
                        category: 'personal_teen',
                        amount: 450,
                        type: 'expense',
                        method: 'Cash',
                        scope: 'teen',
                        date: '2026-11-10T13:10:00Z'
                    },
                    {
                        id: 'tx-5',
                        title: 'School Fee Daily Micro-Sinking Fund',
                        category: 'education',
                        amount: 450,
                        type: 'sinking_fund',
                        method: 'Auto-Allocation',
                        scope: 'parent',
                        date: '2026-11-10T00:01:00Z'
                    }
                ],

                inflationAlerts: [
                    {
                        id: 'inf-1',
                        commodity: 'Atta / Wheat Flour (20kg Bag)',
                        spike: '+16.8%',
                        currentPrice: 'Rs. 2,850',
                        previousPrice: 'Rs. 2,440',
                        severity: 'high',
                        recommendation: 'PBS SPI Spike detected. Bulk-purchase 2 bags before Friday price revision to hedge Rs. 820.',
                        source: 'Pakistan Bureau of Statistics (PBS)'
                    },
                    {
                        id: 'inf-2',
                        commodity: 'Cooking Ghee / Edible Oil (5L Tin)',
                        spike: '+11.2%',
                        currentPrice: 'Rs. 2,620',
                        previousPrice: 'Rs. 2,355',
                        severity: 'medium',
                        recommendation: 'International palm oil import tariff pass-through. Consider quarterly stocking.',
                        source: 'Local Wholesale Mandi Index'
                    },
                    {
                        id: 'inf-3',
                        commodity: 'Idle Cash Shield Recommendation',
                        spike: 'PKR Devaluation Guard',
                        currentPrice: '19.5% p.a.',
                        previousPrice: 'Shariah Money Market',
                        severity: 'opportunity',
                        recommendation: 'Park unallocated household reserves into Shariah-compliant Daily Cash Fund (Meezan / Al-Ameen) or physical gold coin to protect purchasing power.',
                        source: 'State Bank of Pakistan Policy Rate'
                    }
                ]
            };

            this.saveState(defaultState);
        }
    }

    getState() {
        const raw = localStorage.getItem(this.storageKey);
        return raw ? JSON.parse(raw) : null;
    }

    saveState(state) {
        localStorage.setItem(this.storageKey, JSON.stringify(state));
    }

    // --- TRANSACTIONS ---
    async getTransactions() {
        if (this.isOnline) {
            try {
                const res = await fetch(`${this.baseURL}/transactions`);
                if (res.ok) return await res.json();
            } catch (e) { /* fallback */ }
        }
        return this.getState().transactions;
    }

    async addTransaction(tx) {
        if (this.isOnline) {
            try {
                const res = await fetch(`${this.baseURL}/transactions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(tx)
                });
                if (res.ok) return await res.json();
            } catch (e) { /* fallback */ }
        }

        const state = this.getState();
        const newTx = {
            id: `tx-${Date.now()}`,
            date: new Date().toISOString(),
            ...tx
        };
        state.transactions.unshift(newTx);
        this.saveState(state);
        return newTx;
    }

    // --- SINKING FUNDS ---
    async getSinkingFunds() {
        if (this.isOnline) {
            try {
                const res = await fetch(`${this.baseURL}/sinking-funds`);
                if (res.ok) return await res.json();
            } catch (e) { /* fallback */ }
        }
        return this.getState().sinkingFunds;
    }

    async addSinkingFund(fund) {
        const state = this.getState();
        const newFund = {
            id: `sf-${Date.now()}`,
            currentAmount: 0,
            ...fund
        };
        state.sinkingFunds.push(newFund);
        this.saveState(state);
        return newFund;
    }

    async allocateDailySinkingFunds() {
        const state = this.getState();
        let totalAllocated = 0;
        state.sinkingFunds.forEach(fund => {
            const add = Math.min(fund.dailyTarget, Math.max(0, fund.targetAmount - fund.currentAmount));
            if (add > 0) {
                fund.currentAmount += add;
                totalAllocated += add;
                state.transactions.unshift({
                    id: `tx-sf-${Date.now()}-${fund.id}`,
                    title: `Micro-Sinking Fund: ${fund.title}`,
                    category: fund.category,
                    amount: add,
                    type: 'sinking_fund',
                    method: 'Auto-Allocation',
                    scope: 'parent',
                    date: new Date().toISOString()
                });
            }
        });
        this.saveState(state);
        return { totalAllocated, funds: state.sinkingFunds };
    }

    // --- COMMITTEES (BCs) ---
    async getCommittees() {
        if (this.isOnline) {
            try {
                const res = await fetch(`${this.baseURL}/committees`);
                if (res.ok) return await res.json();
            } catch (e) { /* fallback */ }
        }
        return this.getState().committees;
    }

    async toggleCommitteeMember(committeeId, memberId) {
        const state = this.getState();
        const comm = state.committees.find(c => c.id === committeeId);
        if (comm) {
            const member = comm.members.find(m => m.id === memberId);
            if (member) {
                member.paid = !member.paid;
                this.saveState(state);
                return member;
            }
        }
        return null;
    }

    // --- UDHAAR LEDGER ---
    async getUdhaar() {
        if (this.isOnline) {
            try {
                const res = await fetch(`${this.baseURL}/udhaar`);
                if (res.ok) return await res.json();
            } catch (e) { /* fallback */ }
        }
        return this.getState().udhaar;
    }

    async addUdhaar(entry) {
        const state = this.getState();
        const newEntry = {
            id: `udh-${Date.now()}`,
            date: new Date().toISOString(),
            settled: false,
            ...entry
        };
        state.udhaar.unshift(newEntry);
        this.saveState(state);
        return newEntry;
    }

    async toggleSettleUdhaar(id) {
        const state = this.getState();
        const item = state.udhaar.find(u => u.id === id);
        if (item) {
            item.settled = !item.settled;
            this.saveState(state);
            return item;
        }
        return null;
    }

    // --- 1-TAP WHATSAPP PAYMENT REMINDER GENERATOR ---
    generateWhatsAppReminder(personName, amount, reason, raastId) {
        const formattedAmount = Number(amount).toLocaleString();
        const raastNote = raastId ? `\n\n🔹 Mera Raast ID / Mobile: *${raastId}*` : '';
        
        const message = 
`Assalam-o-Alaikum ${personName} bhai,

Umeed hai aap khariyat se honge. 
Ek friendly reminder tha regarding Rs. ${formattedAmount} balance (${reason || 'hisab-kitab'}). 

Jab bhi aap ko sahulat ho, Raast ya SadaPay se transfer kar dijiyega.${raastNote}

JazakAllah Khair! 🙏`;

        const encoded = encodeURIComponent(message);
        return {
            rawText: message,
            url: `https://api.whatsapp.com/send?text=${encoded}`
        };
    }

    // --- INFLATION SHIELD ALERTS ---
    async getInflationAlerts() {
        if (this.isOnline) {
            try {
                const res = await fetch(`${this.baseURL}/inflation`);
                if (res.ok) return await res.json();
            } catch (e) { /* fallback */ }
        }
        return this.getState().inflationAlerts;
    }
}

// Attach to window
if (typeof window !== 'undefined') {
    window.BachatShieldAPI = BachatShieldAPI;
}
