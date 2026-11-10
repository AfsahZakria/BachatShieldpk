const express = require('express');
const router = express.Router();

let udhaarLedger = [
    {
        id: 'udh-1',
        personName: 'Hamza (Colleague)',
        amount: 6500,
        type: 'receivable', // they owe you
        reason: 'Dinner bill split via Raast',
        date: new Date(Date.now() - 86400000 * 5).toISOString(),
        phone: '03219876543',
        settled: false
    },
    {
        id: 'udh-2',
        personName: 'Tariq Karyana Store',
        amount: 3200,
        type: 'payable', // you owe them
        reason: 'Monthly ration tab remainder',
        date: new Date(Date.now() - 86400000 * 3).toISOString(),
        phone: '03335551234',
        settled: false
    },
    {
        id: 'udh-3',
        personName: 'Kamran (Cousin)',
        amount: 15000,
        type: 'receivable',
        reason: 'Emergency hospital medicine',
        date: new Date(Date.now() - 86400000 * 12).toISOString(),
        phone: '03004448888',
        settled: false
    }
];

// GET /api/udhaar
router.get('/', (req, res) => {
    res.json(udhaarLedger);
});

// POST /api/udhaar
router.post('/', (req, res) => {
    const { personName, amount, type, reason, phone } = req.body;

    if (!personName || !amount) {
        return res.status(400).json({ error: 'Person name and amount are required' });
    }

    const newUdhaar = {
        id: `udh-${Date.now()}`,
        personName,
        amount: Number(amount),
        type: type || 'receivable',
        reason: reason || 'Informal loan / expense split',
        phone: phone || '',
        date: new Date().toISOString(),
        settled: false
    };

    udhaarLedger.unshift(newUdhaar);
    res.status(201).json(newUdhaar);
});

// PATCH /api/udhaar/:id/settle
router.patch('/:id/settle', (req, res) => {
    const { id } = req.params;
    const item = udhaarLedger.find(u => u.id === id);

    if (!item) return res.status(404).json({ error: 'Udhaar record not found' });

    item.settled = !item.settled;
    res.json({ message: 'Settlement status updated', item });
});

// POST /api/udhaar/whatsapp-reminder
router.post('/whatsapp-reminder', (req, res) => {
    const { personName, amount, reason, raastId } = req.body;
    const formatted = Number(amount || 0).toLocaleString();
    const raastLine = raastId ? `\n\n🔹 Mera Raast ID / Mobile: *${raastId}*` : '';

    const text = 
`Assalam-o-Alaikum ${personName || 'bhai'},

Umeed hai aap khariyat se honge. 
Ek gentle reminder tha regarding Rs. ${formatted} balance (${reason || 'hisab-kitab'}). 

Jab bhi aap ko sahulat ho, Raast ya SadaPay se transfer kar dijiyega.${raastLine}

JazakAllah Khair! 🙏`;

    const encoded = encodeURIComponent(text);
    res.json({
        rawText: text,
        whatsappUrl: `https://api.whatsapp.com/send?text=${encoded}`
    });
});

module.exports = router;
