const express = require('express');
const router = express.Router();

let sinkingFunds = [
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
];

// GET /api/sinking-funds
router.get('/', (req, res) => {
    res.json(sinkingFunds);
});

// POST /api/sinking-funds
router.post('/', (req, res) => {
    const { title, targetAmount, dueDate, dailyTarget, category, notes } = req.body;

    if (!title || !targetAmount) {
        return res.status(400).json({ error: 'Title and target amount are required' });
    }

    const newFund = {
        id: `sf-${Date.now()}`,
        title,
        targetAmount: Number(targetAmount),
        currentAmount: 0,
        dueDate: dueDate || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
        dailyTarget: Number(dailyTarget) || Math.round(Number(targetAmount) / 30),
        category: category || 'general',
        notes: notes || ''
    };

    sinkingFunds.push(newFund);
    res.status(201).json(newFund);
});

// POST /api/sinking-funds/:id/allocate
router.post('/:id/allocate', (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;
    const fund = sinkingFunds.find(f => f.id === id);

    if (!fund) {
        return res.status(404).json({ error: 'Sinking fund not found' });
    }

    const alloc = amount ? Number(amount) : fund.dailyTarget;
    fund.currentAmount = Math.min(fund.targetAmount, fund.currentAmount + alloc);

    res.json({ message: 'Allocated successfully', fund });
});

// POST /api/sinking-funds/allocate-all
router.post('/allocate-all', (req, res) => {
    let totalAllocated = 0;
    sinkingFunds.forEach(fund => {
        const canAdd = Math.min(fund.dailyTarget, Math.max(0, fund.targetAmount - fund.currentAmount));
        fund.currentAmount += canAdd;
        totalAllocated += canAdd;
    });

    res.json({ message: 'All active micro-sinking funds allocated for today', totalAllocated, sinkingFunds });
});

module.exports = router;
