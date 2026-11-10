/**
 * BachatShield - Main Application Controller
 * Handles UI interactions, Safe Daily Spend formulas, Web Speech API,
 * Committee (BC) checklists, Udhaar WhatsApp links, Sinking Funds,
 * and Role-Based Privacy Controls.
 */

document.addEventListener('DOMContentLoaded', () => {
    window.app = new BachatShieldApp();
});

class BachatShieldApp {
    constructor() {
        this.api = new BachatShieldAPI();
        this.nlp = new RomanUrduNLPParser();
        
        // Voice recognition setup
        this.speechRecognition = null;
        this.isRecording = false;

        // Current UI state
        this.currentFilter = 'all';
        this.activeRole = 'parent'; // 'parent' or 'teen'

        this.init();
    }

    async init() {
        await this.api.testConnection();
        this.setupSpeechRecognition();
        this.bindEvents();
        this.renderAll();
    }

    // --- BIND EVENT LISTENERS ---
    bindEvents() {
        // Voice mic button
        const micBtn = document.getElementById('micRecordBtn');
        if (micBtn) {
            micBtn.addEventListener('click', () => this.toggleVoiceRecording());
        }

        // Quick log submit
        const quickLogInput = document.getElementById('quickLogInput');
        if (quickLogInput) {
            quickLogInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.processQuickLog();
            });
        }

        const logBtn = document.getElementById('quickLogSubmitBtn');
        if (logBtn) {
            logBtn.addEventListener('click', () => this.processQuickLog());
        }

        // Role Switcher toggle
        const roleBtn = document.getElementById('roleToggleBtn');
        if (roleBtn) {
            roleBtn.addEventListener('click', () => this.toggleRole());
        }

        // Manual Transaction Form
        const txForm = document.getElementById('manualTxForm');
        if (txForm) {
            txForm.addEventListener('submit', (e) => this.handleManualTxSubmit(e));
        }

        // Add Sinking Fund Form
        const sfForm = document.getElementById('sinkingFundForm');
        if (sfForm) {
            sfForm.addEventListener('submit', (e) => this.handleSinkingFundSubmit(e));
        }

        // Add Udhaar Form
        const udhForm = document.getElementById('udhaarForm');
        if (udhForm) {
            udhForm.addEventListener('submit', (e) => this.handleUdhaarSubmit(e));
        }
    }

    // --- SPEECH RECOGNITION (WEB SPEECH API) ---
    setupSpeechRecognition() {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRec) {
            this.speechRecognition = new SpeechRec();
            this.speechRecognition.continuous = false;
            this.speechRecognition.interimResults = false;
            // ur-PK or en-US
            this.speechRecognition.lang = 'en-US';

            this.speechRecognition.onstart = () => {
                this.isRecording = true;
                this.updateMicUI(true);
                this.showToast('🎙️ Bolna shuru karein (e.g. "Doodh 450", "Petrol 3000")...', 'info');
            };

            this.speechRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                const input = document.getElementById('quickLogInput');
                if (input) {
                    input.value = transcript;
                }
                this.showToast(`Heard: "${transcript}"`, 'info');
                this.processQuickLog();
            };

            this.speechRecognition.onerror = (event) => {
                this.isRecording = false;
                this.updateMicUI(false);
                this.showToast('Microphone error or permission denied. Using voice simulation.', 'warning');
            };

            this.speechRecognition.onend = () => {
                this.isRecording = false;
                this.updateMicUI(false);
            };
        }
    }

    toggleVoiceRecording() {
        if (!this.speechRecognition) {
            // Fallback: simulate realistic voice entry
            this.simulateVoiceEntry();
            return;
        }

        if (this.isRecording) {
            this.speechRecognition.stop();
        } else {
            try {
                this.speechRecognition.start();
            } catch (e) {
                this.simulateVoiceEntry();
            }
        }
    }

    updateMicUI(recording) {
        const micBtn = document.getElementById('micRecordBtn');
        const waveform = document.getElementById('voiceWaveform');
        const micIcon = document.getElementById('micIcon');

        if (recording) {
            micBtn?.classList.add('recording-active');
            waveform?.classList.remove('hidden');
            waveform?.classList.add('flex');
            if (micIcon) micIcon.style.color = '#ffffff';
        } else {
            micBtn?.classList.remove('recording-active');
            waveform?.classList.add('hidden');
            waveform?.classList.remove('flex');
            if (micIcon) micIcon.style.color = '';
        }
    }

    simulateVoiceEntry() {
        const samples = [
            'Doodh wale ko 4500 diye Cash se',
            'Petrol Shell 3500 SadaPay',
            'Tariq karyana 3800 atta aur daal',
            'Careem ride 820 to office',
            'Beaconhouse school fee 450 daily reserve',
            'College canteen shawarma 350',
            'Ali ko 2500 udhaar diye emergency'
        ];
        const randomChoice = samples[Math.floor(Math.random() * samples.length)];
        const input = document.getElementById('quickLogInput');
        if (input) {
            input.value = randomChoice;
        }
        this.showToast(`Transcribed voice note: "${randomChoice}"`, 'info');
        this.processQuickLog();
    }

    // --- QUICK LOG PROCESSING ---
    async processQuickLog() {
        const input = document.getElementById('quickLogInput');
        const text = input ? input.value.trim() : '';
        if (!text) return;

        const parsed = this.nlp.parse(text);
        if (!parsed || parsed.amount <= 0) {
            this.showToast('Please include an amount in PKR (e.g., "Doodh 450" or "Petrol 3000")', 'warning');
            return;
        }

        if (parsed.type === 'udhaar') {
            await this.api.addUdhaar({
                personName: parsed.entity || 'Colleague / Friend',
                amount: parsed.amount,
                type: 'receivable',
                reason: parsed.title,
                phone: ''
            });
            this.showToast(`Logged Udhaar: Rs. ${parsed.amount.toLocaleString()} for ${parsed.entity || 'Friend'}`, 'success');
        } else if (parsed.type === 'sinking_fund') {
            // Allocate to first matching sinking fund or general
            const funds = await this.api.getSinkingFunds();
            const targetFund = funds.find(f => f.category === 'education') || funds[0];
            if (targetFund) {
                targetFund.currentAmount += parsed.amount;
                this.api.saveState(this.api.getState());
            }
            await this.api.addTransaction({
                title: parsed.title,
                category: parsed.category,
                amount: parsed.amount,
                type: 'sinking_fund',
                method: parsed.paymentMethod,
                scope: this.activeRole
            });
            this.showToast(`Allocated Rs. ${parsed.amount.toLocaleString()} into ${targetFund ? targetFund.title : 'Sinking Fund'}`, 'success');
        } else {
            await this.api.addTransaction({
                title: parsed.title,
                category: parsed.category,
                amount: parsed.amount,
                type: parsed.type,
                method: parsed.paymentMethod,
                scope: this.activeRole
            });
            this.showToast(`Logged: "${parsed.title}" (Rs. ${parsed.amount.toLocaleString()})`, 'success');
        }

        input.value = '';
        this.renderAll();
    }

    fillQuickTag(phrase) {
        const input = document.getElementById('quickLogInput');
        if (input) {
            input.value = phrase;
            this.processQuickLog();
        }
    }

    // --- RENDER COMPLETE DASHBOARD ---
    async renderAll() {
        this.renderHUD();
        this.renderSinkingFunds();
        this.renderCommittees();
        this.renderUdhaarLedger();
        this.renderTransactions();
        this.renderInflationAlerts();
    }

    // --- SAFE DAILY SPEND HUD ---
    renderHUD() {
        const state = this.api.getState();
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const currentDay = now.getDate();
        const daysRemaining = Math.max(1, daysInMonth - currentDay);

        // Calculate totals for parent vs teen view
        const txs = state.transactions || [];
        const isTeen = this.activeRole === 'teen';

        // Filter transactions for current view
        const currentMonthTxs = txs.filter(t => {
            if (isTeen) return t.scope === 'teen';
            return true;
        });

        const totalSpent = currentMonthTxs
            .filter(t => t.type === 'expense' || t.type === 'sinking_fund')
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);

        const totalSinkingFunds = (state.sinkingFunds || []).reduce((sum, f) => sum + Number(f.currentAmount || 0), 0);
        const dailySinkingObligations = (state.sinkingFunds || []).reduce((sum, f) => sum + Number(f.dailyTarget || 0), 0);

        // Safe Daily Spend Calculation
        // Parent: (Income - FixedBills - (DailySinkingAllocations * DaysRemaining) - AlreadySpent) / DaysRemaining
        let safeDaily = 0;
        let hudIncome = state.monthlyIncome;
        let hudRemainingPool = 0;

        if (isTeen) {
            hudIncome = state.teenPocketAllowance;
            const remainingTeen = Math.max(0, hudIncome - totalSpent);
            safeDaily = Math.round(remainingTeen / daysRemaining);
            hudRemainingPool = remainingTeen;
        } else {
            const totalCommitted = state.fixedBills + (dailySinkingObligations * daysRemaining);
            const remainingHousehold = Math.max(0, state.monthlyIncome - totalCommitted - totalSpent);
            safeDaily = Math.round(remainingHousehold / daysRemaining);
            hudRemainingPool = remainingHousehold;
        }

        // DOM Updates
        const spentEl = document.getElementById('hudSpentDisplay');
        const incomeEl = document.getElementById('hudIncomeDisplay');
        const safeDailyEl = document.getElementById('hudDailySpendDisplay');
        const daysRemainingEl = document.getElementById('hudDaysRemaining');
        const hudProgressBar = document.getElementById('hudBudgetProgressBar');
        const hudPctBadge = document.getElementById('hudBudgetPct');
        const safeDailyStatus = document.getElementById('safeDailyStatus');

        if (spentEl) spentEl.innerText = `Rs. ${totalSpent.toLocaleString()}`;
        if (incomeEl) {
            incomeEl.innerText = isTeen ? `Rs. ${state.teenPocketAllowance.toLocaleString()} (Pocket Allowance)` : `Rs. ${state.monthlyIncome.toLocaleString()}`;
        }
        if (safeDailyEl) {
            safeDailyEl.innerHTML = `Rs. ${safeDaily.toLocaleString()} <span class="text-xs text-gray-400 font-normal">/ day</span>`;
        }
        if (daysRemainingEl) {
            daysRemainingEl.innerText = `${daysRemaining} days remaining in month`;
        }

        // Budget % calculations
        const spendRatio = hudIncome > 0 ? (totalSpent / hudIncome) : 0;
        const spendPct = Math.min(100, Math.round(spendRatio * 100));
        if (hudPctBadge) hudPctBadge.innerText = `${spendPct}%`;
        if (hudProgressBar) {
            hudProgressBar.style.width = `${spendPct}%`;
            // Color according to risk
            if (spendPct > 85) {
                hudProgressBar.style.backgroundColor = '#ef4444';
            } else if (spendPct > 65) {
                hudProgressBar.style.backgroundColor = '#f59e0b';
            } else {
                hudProgressBar.style.backgroundColor = '#22c55e';
            }
        }

        // Status indicator badge
        if (safeDailyStatus) {
            if (safeDaily > 3000) {
                safeDailyStatus.className = 'text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
                safeDailyStatus.innerText = 'Optimal Capacity';
            } else if (safeDaily >= 1200) {
                safeDailyStatus.className = 'text-[11px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/40';
                safeDailyStatus.innerText = 'Cautious Spend';
            } else {
                safeDailyStatus.className = 'text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40';
                safeDailyStatus.innerText = 'High Shock Risk';
            }
        }

        // Sinking Fund summary card
        const sfTotalDisplay = document.getElementById('sinkingFundSummaryDisplay');
        if (sfTotalDisplay) {
            sfTotalDisplay.innerText = `Rs. ${totalSinkingFunds.toLocaleString()}`;
        }
        const sfDailyTotal = document.getElementById('sinkingFundDailyObligation');
        if (sfDailyTotal) {
            sfDailyTotal.innerText = `Auto-locking Rs. ${dailySinkingObligations.toLocaleString()} daily`;
        }
    }

    // --- MICRO-SINKING FUNDS MANAGER ---
    async renderSinkingFunds() {
        const container = document.getElementById('sinkingFundsContainer');
        if (!container) return;

        const funds = await this.api.getSinkingFunds();
        container.innerHTML = '';

        funds.forEach(fund => {
            const pct = Math.min(100, Math.round((fund.currentAmount / fund.targetAmount) * 100));
            const card = document.createElement('div');
            card.className = 'p-4 rounded-xl bg-[#181818] border border-[#27272a] hover:border-[#3f3f46] transition flex flex-col justify-between';
            card.innerHTML = `
                <div>
                    <div class="flex items-start justify-between gap-2 mb-2">
                        <div>
                            <h4 class="text-sm font-bold text-white">${fund.title}</h4>
                            <p class="text-[11px] text-gray-400">${fund.notes || 'Automated micro-sinking pool'}</p>
                        </div>
                        <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 whitespace-nowrap">
                            Rs. ${fund.dailyTarget}/day
                        </span>
                    </div>

                    <div class="space-y-1.5 my-3">
                        <div class="flex items-center justify-between text-xs">
                            <span class="text-gray-400">Target: <strong class="text-white">Rs. ${fund.targetAmount.toLocaleString()}</strong></span>
                            <span class="text-emerald-400 font-bold">Rs. ${fund.currentAmount.toLocaleString()} (${pct}%)</span>
                        </div>
                        <div class="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-[#27272a]">
                            <div class="bg-gradient-to-r from-emerald-500 to-yellow-400 h-2 rounded-full transition-all duration-500" style="width: ${pct}%"></div>
                        </div>
                    </div>
                </div>

                <div class="pt-3 border-t border-[#27272a] flex items-center justify-between text-[11px]">
                    <span class="text-gray-400">Due: <strong class="text-gray-300">${fund.dueDate}</strong></span>
                    <button onclick="app.allocateSingleSinkingFund('${fund.id}')" class="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 font-semibold transition">
                        + Save Rs. ${fund.dailyTarget} Today
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    async allocateDailySinkingFunds() {
        const res = await this.api.allocateDailySinkingFunds();
        this.showToast(`Automated daily micro-sinking funds allocated! (+Rs. ${res.totalAllocated.toLocaleString()} locked)`, 'success');
        this.renderAll();
    }

    async allocateSingleSinkingFund(fundId) {
        const state = this.api.getState();
        const fund = state.sinkingFunds.find(f => f.id === fundId);
        if (fund) {
            fund.currentAmount += fund.dailyTarget;
            state.transactions.unshift({
                id: `tx-sf-${Date.now()}`,
                title: `Micro-Sinking: ${fund.title}`,
                category: fund.category,
                amount: fund.dailyTarget,
                type: 'sinking_fund',
                method: 'Auto-Allocation',
                scope: 'parent',
                date: new Date().toISOString()
            });
            this.api.saveState(state);
            this.showToast(`Saved Rs. ${fund.dailyTarget} towards "${fund.title}"`, 'success');
            this.renderAll();
        }
    }

    // --- COMMITTEE / BC (ROSCA) MODULE ---
    async renderCommittees() {
        const container = document.getElementById('committeeContainer');
        if (!container) return;

        const committees = await this.api.getCommittees();
        container.innerHTML = '';

        committees.forEach(comm => {
            const paidMembers = comm.members.filter(m => m.paid).length;
            const totalMembers = comm.members.length;
            const collectedSoFar = paidMembers * (comm.totalPool / totalMembers);

            const card = document.createElement('div');
            card.className = 'space-y-4';
            card.innerHTML = `
                <div class="flex items-start justify-between">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-bold px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">Kameti (BC)</span>
                            <h4 class="text-sm font-bold text-white">${comm.name}</h4>
                        </div>
                        <p class="text-xs text-gray-400 mt-0.5">Pool: <strong class="text-white">Rs. ${comm.totalPool.toLocaleString()}</strong> | ${comm.currentMonth}</p>
                    </div>
                    <span class="text-xs text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-500/30">
                        ${paidMembers}/${totalMembers} Paid
                    </span>
                </div>

                <!-- Collection checklist -->
                <div class="space-y-2">
                    <div class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex justify-between">
                        <span>Member Collection Checklist</span>
                        <span class="text-yellow-400">Rs. ${collectedSoFar.toLocaleString()} Collected</span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        ${comm.members.map(m => `
                            <div class="flex items-center justify-between p-2 rounded-lg bg-[#181818] border border-[#27272a] text-xs">
                                <label class="flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" ${m.paid ? 'checked' : ''} onchange="app.toggleCommitteePayment('${comm.id}', ${m.id})" class="accent-emerald-500 w-4 h-4 rounded cursor-pointer">
                                    <span class="${m.paid ? 'line-through text-gray-500' : 'text-gray-200 font-medium'}">${m.name}</span>
                                </label>
                                <span class="text-[10px] ${m.paid ? 'text-emerald-400 font-semibold' : 'text-yellow-400'}">${m.paid ? 'Paid ✓' : 'Pending'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="p-3 rounded-xl bg-black/60 border border-[#27272a] flex items-center justify-between text-xs">
                    <div>
                        <span class="text-gray-400 block text-[11px]">Your Payout Turn:</span>
                        <span class="font-bold text-yellow-400">${comm.myPayoutMonth} (Rs. ${comm.totalPool.toLocaleString()})</span>
                    </div>
                    <div class="text-right">
                        <span class="text-gray-400 block text-[11px]">Next Draw Date:</span>
                        <span class="text-gray-200 font-medium">${comm.drawDate}</span>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    async toggleCommitteePayment(committeeId, memberId) {
        await this.api.toggleCommitteeMember(committeeId, memberId);
        this.showToast('Updated committee member payment status', 'info');
        this.renderAll();
    }

    // --- UDHAAR & LEND/BORROW LEDGER ---
    async renderUdhaarLedger() {
        const container = document.getElementById('udhaarListContainer');
        const netReceivableEl = document.getElementById('netReceivableDisplay');
        if (!container) return;

        const ledger = await this.api.getUdhaar();
        container.innerHTML = '';

        let netReceivable = 0;

        if (ledger.length === 0) {
            container.innerHTML = `<div class="p-4 text-center text-xs text-gray-500">No active Udhaar records. Log lending or borrowing to track informal debt.</div>`;
            return;
        }

        ledger.forEach(u => {
            const isReceivable = u.type === 'receivable'; // they owe you
            if (!u.settled) {
                netReceivable += isReceivable ? Number(u.amount) : -Number(u.amount);
            }

            const item = document.createElement('div');
            item.className = `p-3 rounded-xl bg-[#181818] border ${u.settled ? 'border-gray-800 opacity-60' : 'border-[#27272a]'} flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition`;

            const tagColor = isReceivable ? 'text-emerald-400 font-bold' : 'text-yellow-400 font-bold';
            const sign = isReceivable ? '+' : '-';
            const state = this.api.getState();

            item.innerHTML = `
                <div class="flex items-start gap-2.5">
                    <div class="w-8 h-8 rounded-lg ${isReceivable ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' : 'bg-yellow-950/60 text-yellow-400 border border-yellow-500/30'} flex items-center justify-center font-bold text-xs shrink-0">
                        ${isReceivable ? 'IN' : 'OUT'}
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-white">${u.personName}</span>
                            ${u.settled ? '<span class="text-[10px] px-1.5 py-0.2 rounded bg-gray-800 text-gray-400">Settled</span>' : ''}
                        </div>
                        <p class="text-[11px] text-gray-400 mt-0.5">${u.reason} • <span class="text-gray-500">${new Date(u.date).toLocaleDateString()}</span></p>
                    </div>
                </div>

                <div class="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#27272a]">
                    <div class="text-right">
                        <span class="${tagColor} text-sm block">${sign} Rs. ${Number(u.amount).toLocaleString()}</span>
                        <span class="text-[10px] text-gray-500">${isReceivable ? 'They owe you' : 'You owe them'}</span>
                    </div>

                    <div class="flex items-center gap-1.5">
                        ${isReceivable && !u.settled ? `
                            <button onclick="app.triggerWhatsAppReminder('${u.personName}', ${u.amount}, '${u.reason}')" title="Send 1-Tap WhatsApp Payment Reminder" class="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-[11px] flex items-center gap-1 transition">
                                <span>WhatsApp</span>
                                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
                            </button>
                        ` : ''}

                        <button onclick="app.toggleSettleUdhaar('${u.id}')" title="Toggle Settled Status" class="p-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-gray-300 text-[11px] transition">
                            ${u.settled ? 'Reopen' : '✓ Settle'}
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(item);
        });

        if (netReceivableEl) {
            const prefix = netReceivable >= 0 ? '+ Rs. ' : '- Rs. ';
            netReceivableEl.innerText = `${prefix}${Math.abs(netReceivable).toLocaleString()}`;
            netReceivableEl.className = netReceivable >= 0 ? 'font-bold text-emerald-400' : 'font-bold text-yellow-400';
        }
    }

    async toggleSettleUdhaar(id) {
        await this.api.toggleSettleUdhaar(id);
        this.showToast('Udhaar status updated', 'info');
        this.renderAll();
    }

    triggerWhatsAppReminder(personName, amount, reason) {
        const state = this.api.getState();
        const reminder = this.api.generateWhatsAppReminder(personName, amount, reason, state.raastId);
        
        // Show modal with copy option and direct WhatsApp launch
        const modal = document.getElementById('whatsAppModal');
        const textPreview = document.getElementById('whatsAppMessagePreview');
        const directLink = document.getElementById('whatsAppDirectLink');

        if (textPreview) textPreview.innerText = reminder.rawText;
        if (directLink) directLink.href = reminder.url;

        // Copy to clipboard
        navigator.clipboard.writeText(reminder.rawText).catch(() => {});
        this.showToast('Copied reminder to clipboard! Click to open WhatsApp.', 'success');
        modal?.classList.remove('hidden');
    }

    // --- TRANSACTIONS LIST & FILTER ---
    async renderTransactions() {
        const tbody = document.getElementById('transactionTableBody');
        if (!tbody) return;

        const allTxs = await this.api.getTransactions();
        tbody.innerHTML = '';

        // Role-based filtering
        const roleFiltered = allTxs.filter(t => {
            if (this.activeRole === 'teen') {
                return t.scope === 'teen';
            }
            return true;
        });

        // Category filtering
        const filtered = roleFiltered.filter(t => {
            if (this.currentFilter === 'all') return true;
            return t.category === this.currentFilter;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-gray-500 text-xs">No transactions in this view.</td></tr>`;
            return;
        }

        filtered.forEach(t => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-[#181818] border-b border-[#27272a] transition';

            const isIncome = t.type === 'income';
            const isSinkingFund = t.type === 'sinking_fund';
            const amountFormatted = isIncome 
                ? `+ Rs. ${Number(t.amount).toLocaleString()}` 
                : `- Rs. ${Number(t.amount).toLocaleString()}`;
            
            let amountColor = 'text-white font-semibold';
            if (isIncome) amountColor = 'text-emerald-400 font-bold';
            if (isSinkingFund) amountColor = 'text-yellow-400 font-bold';

            const dateStr = new Date(t.date).toLocaleDateString('en-PK', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            tr.innerHTML = `
                <td class="py-3 px-3">
                    <div class="flex items-center gap-2.5">
                        <span class="w-2 h-2 rounded-full ${isIncome ? 'bg-emerald-400' : (isSinkingFund ? 'bg-yellow-400' : 'bg-gray-500')}"></span>
                        <span class="text-white font-medium">${t.title}</span>
                    </div>
                </td>
                <td class="py-3 px-3">
                    <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${this.getCategoryBadgeClass(t.category)}">
                        ${t.category.replace('_', ' ')}
                    </span>
                </td>
                <td class="py-3 px-3 text-gray-400">${t.method || 'Cash'}</td>
                <td class="py-3 px-3 text-gray-400">${dateStr}</td>
                <td class="py-3 px-3 text-right ${amountColor}">${amountFormatted}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    filterTransactions(cat) {
        this.currentFilter = cat;
        document.querySelectorAll('.tx-filter-btn').forEach(btn => {
            btn.className = 'tx-filter-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#181818] text-gray-300 hover:bg-[#27272a] border border-[#27272a] transition';
        });
        if (event && event.target) {
            event.target.className = 'tx-filter-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-black transition';
        }
        this.renderTransactions();
    }

    getCategoryBadgeClass(category) {
        switch (category) {
            case 'groceries': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
            case 'utilities': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
            case 'education': return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40';
            case 'transport': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
            case 'personal_teen': return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
            default: return 'bg-gray-800 text-gray-300 border border-gray-700';
        }
    }

    // --- INFLATION SHIELD ALERTS ---
    async renderInflationAlerts() {
        const container = document.getElementById('inflationAlertsContainer');
        if (!container) return;

        const alerts = await this.api.getInflationAlerts();
        container.innerHTML = '';

        alerts.forEach(item => {
            const card = document.createElement('div');
            card.className = 'p-3.5 rounded-xl bg-[#181818] border border-yellow-500/30 hover:border-yellow-500/60 transition space-y-2';
            card.innerHTML = `
                <div class="flex items-start justify-between">
                    <div>
                        <div class="flex items-center gap-1.5">
                            <span class="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                            <h4 class="text-xs font-bold text-white">${item.commodity}</h4>
                        </div>
                        <p class="text-[11px] text-gray-400 mt-0.5">Now: <strong class="text-yellow-300">${item.currentPrice}</strong> (Prev: ${item.previousPrice})</p>
                    </div>
                    <span class="badge-yellow text-xs px-2 py-0.5 rounded-full font-bold">
                        ${item.spike}
                    </span>
                </div>
                <div class="p-2 rounded-lg bg-black/60 border border-yellow-500/20 text-[11px] text-yellow-100 flex items-start gap-1.5">
                    <span class="text-yellow-400 shrink-0">🛡️</span>
                    <span>${item.recommendation}</span>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // --- ROLE-BASED PRIVACY CONTROLS (PARENT vs TEEN) ---
    toggleRole() {
        this.activeRole = this.activeRole === 'parent' ? 'teen' : 'parent';
        const roleBtn = document.getElementById('roleToggleBtn');
        const roleIcon = document.getElementById('roleIcon');
        const roleTitle = document.getElementById('roleTitle');
        const teenNotice = document.getElementById('teenPrivacyNotice');
        const parentModules = document.querySelectorAll('.parent-only-module');

        if (this.activeRole === 'teen') {
            if (roleBtn) {
                roleBtn.className = 'flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/40 text-xs font-bold hover:bg-purple-600/30 transition';
            }
            if (roleIcon) roleIcon.innerText = '🎒';
            if (roleTitle) roleTitle.innerText = 'Teen Sub-Wallet';
            if (teenNotice) teenNotice.classList.remove('hidden');

            // Hide parent-exclusive modules (joint household committee pools, parent income, utility contracts)
            parentModules.forEach(el => el.classList.add('hidden'));

            this.showToast('Switched to Teen Sub-Wallet View. Joint household obligations are private.', 'info');
        } else {
            if (roleBtn) {
                roleBtn.className = 'flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-600/30 transition';
            }
            if (roleIcon) roleIcon.innerText = '👨‍👩‍👧‍👦';
            if (roleTitle) roleTitle.innerText = 'Parent Master View';
            if (teenNotice) teenNotice.classList.add('hidden');

            parentModules.forEach(el => el.classList.remove('hidden'));
            this.showToast('Switched to Parent Mode (Full Household Oversight).', 'info');
        }

        this.renderAll();
    }

    // --- MODAL CONTROLS & FORM HANDLERS ---
    openModal(modalId) {
        document.getElementById(modalId)?.classList.remove('hidden');
    }

    closeModal(modalId) {
        document.getElementById(modalId)?.classList.add('hidden');
    }

    async handleManualTxSubmit(e) {
        e.preventDefault();
        const title = document.getElementById('manualTitle').value;
        const amount = Number(document.getElementById('manualAmount').value);
        const type = document.getElementById('manualType').value;
        const category = document.getElementById('manualCategory').value;
        const method = document.getElementById('manualMethod').value;
        const scope = this.activeRole;

        await this.api.addTransaction({
            title,
            amount,
            type,
            category,
            method,
            scope
        });

        this.closeModal('addTxModal');
        e.target.reset();
        this.showToast(`Saved transaction: "${title}"`, 'success');
        this.renderAll();
    }

    async handleSinkingFundSubmit(e) {
        e.preventDefault();
        const title = document.getElementById('sfTitle').value;
        const targetAmount = Number(document.getElementById('sfTargetAmount').value);
        const dueDate = document.getElementById('sfDueDate').value;
        const category = document.getElementById('sfCategory').value;
        const notes = document.getElementById('sfNotes').value;

        // Auto-calculate daily target from today until due date
        const now = new Date();
        const target = new Date(dueDate);
        const diffDays = Math.max(1, Math.ceil((target - now) / (1000 * 60 * 60 * 24)));
        const dailyTarget = Math.round(targetAmount / diffDays);

        await this.api.addSinkingFund({
            title,
            targetAmount,
            currentAmount: 0,
            dueDate,
            dailyTarget,
            category,
            notes
        });

        this.closeModal('sinkingFundModal');
        e.target.reset();
        this.showToast(`Micro-Sinking Fund created! Auto-saving Rs. ${dailyTarget}/day.`, 'success');
        this.renderAll();
    }

    async handleUdhaarSubmit(e) {
        e.preventDefault();
        const personName = document.getElementById('udhPersonName').value;
        const amount = Number(document.getElementById('udhAmount').value);
        const type = document.getElementById('udhType').value;
        const reason = document.getElementById('udhReason').value;
        const phone = document.getElementById('udhPhone').value;

        await this.api.addUdhaar({
            personName,
            amount,
            type,
            reason,
            phone
        });

        this.closeModal('addUdhaarModal');
        e.target.reset();
        this.showToast(`Udhaar entry recorded for ${personName}!`, 'success');
        this.renderAll();
    }

    // --- TOAST NOTIFICATION UTILITY ---
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        let borderClass = 'border-yellow-500/50 bg-[#181818] text-yellow-300';
        if (type === 'success') borderClass = 'border-emerald-500/50 bg-[#141414] text-emerald-300';
        if (type === 'warning') borderClass = 'border-yellow-500 bg-[#181818] text-yellow-200';

        toast.className = `p-3 rounded-xl border ${borderClass} shadow-2xl text-xs font-semibold backdrop-blur-md pointer-events-auto transition-all duration-300 transform translate-y-2 flex items-center gap-2`;
        
        let icon = '💡';
        if (type === 'success') icon = '✓';
        if (type === 'warning') icon = '⚠️';

        toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => toast.classList.remove('translate-y-2'), 10);
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-2');
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }
}
