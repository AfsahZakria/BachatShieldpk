const express = require('express');
const router = express.Router();

let committees = [
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
];

// GET /api/committees
router.get('/', (req, res) => {
    res.json(committees);
});

// POST /api/committees
router.post('/', (req, res) => {
    const { name, monthlyContribution, totalPool, drawDate, myPayoutMonth, members } = req.body;

    const newComm = {
        id: `comm-${Date.now()}`,
        name: name || 'New Family Committee',
        monthlyContribution: Number(monthlyContribution) || 10000,
        totalPool: Number(totalPool) || 100000,
        currentMonth: 'Turn #1',
        drawDate: drawDate || 'Last Sunday of the month',
        myPayoutMonth: myPayoutMonth || 'TBD',
        members: members || []
    };

    committees.push(newComm);
    res.status(201).json(newComm);
});

// PATCH /api/committees/:commId/members/:memberId/toggle
router.patch('/:commId/members/:memberId/toggle', (req, res) => {
    const { commId, memberId } = req.params;
    const comm = committees.find(c => c.id === commId);

    if (!comm) return res.status(404).json({ error: 'Committee not found' });

    const member = comm.members.find(m => m.id === parseInt(memberId, 10));
    if (!member) return res.status(404).json({ error: 'Member not found' });

    member.paid = !member.paid;
    res.json({ message: 'Status updated', member, committee: comm });
});

module.exports = router;
