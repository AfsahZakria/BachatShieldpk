const express = require('express');
const router = express.Router();

let inflationAlerts = [
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
];

// GET /api/inflation
router.get('/', (req, res) => {
    res.json(inflationAlerts);
});

// POST /api/inflation/alert
router.post('/alert', (req, res) => {
    const { commodity, spike, currentPrice, previousPrice, recommendation } = req.body;
    const newAlert = {
        id: `inf-${Date.now()}`,
        commodity,
        spike,
        currentPrice,
        previousPrice,
        recommendation,
        source: 'PBS / Market Intelligence'
    };
    inflationAlerts.unshift(newAlert);
    res.status(201).json(newAlert);
});

module.exports = router;
