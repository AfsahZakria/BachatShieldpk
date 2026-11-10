const express = require('express');
const router = express.Router();

// In-Memory store (production apps connect to PostgreSQL/MongoDB via ORM)
let transactions = [
    {
        id: 'tx-1',
        title: 'Imtiaz Supermarket Ration',
        category: 'groceries',
        amount: 14200,
        type: 'expense',
        method: 'Raast',
        scope: 'parent',
        date: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
        id: 'tx-2',
        title: 'Daily Milk (Doodh 5 Litres)',
        category: 'groceries',
        amount: 1100,
        type: 'expense',
        method: 'Cash',
        scope: 'parent',
        date: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
        id: 'tx-3',
        title: 'Shell Fuel (Car Petrol)',
        category: 'transport',
        amount: 4000,
        type: 'expense',
        method: 'SadaPay',
        scope: 'parent',
        date: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
        id: 'tx-4',
        title: 'College Canteen & Shawarma',
        category: 'personal_teen',
        amount: 450,
        type: 'expense',
        method: 'Cash',
        scope: 'teen',
        date: new Date(Date.now() - 3600000 * 6).toISOString()
    },
    {
        id: 'tx-5',
        title: 'School Fee Daily Micro-Sinking Fund',
        category: 'education',
        amount: 450,
        type: 'sinking_fund',
        method: 'Auto-Allocation',
        scope: 'parent',
        date: new Date(Date.now() - 3600000 * 1).toISOString()
    }
];

// GET /api/transactions
router.get('/', (req, res) => {
    const { category, scope } = req.query;
    let filtered = [...transactions];

    if (scope) {
        filtered = filtered.filter(t => t.scope === scope);
    }
    if (category && category !== 'all') {
        filtered = filtered.filter(t => t.category === category);
    }

    res.json(filtered);
});

// POST /api/transactions
router.post('/', (req, res) => {
    const { title, amount, type, category, method, scope } = req.body;

    if (!title || !amount) {
        return res.status(400).json({ error: 'Title and amount are required' });
    }

    const newTx = {
        id: `tx-${Date.now()}`,
        title,
        amount: Number(amount),
        type: type || 'expense',
        category: category || 'groceries',
        method: method || 'Cash',
        scope: scope || 'parent',
        date: new Date().toISOString()
    };

    transactions.unshift(newTx);
    res.status(201).json(newTx);
});

// DELETE /api/transactions/:id
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    transactions = transactions.filter(t => t.id !== id);
    res.json({ message: 'Transaction deleted', id });
});

module.exports = router;
