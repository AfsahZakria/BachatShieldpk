const express = require('express');
const router = express.Router();

/**
 * Backend Roman Urdu NLP Controller
 * Accepts conversational text and extracts financial parameters
 */
router.post('/parse', (req, res) => {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text string is required' });
    }

    const cleanText = text.toLowerCase().trim();

    // 1. Amount Extraction
    let amount = 0;
    const kMatch = cleanText.match(/(\d+(?:\.\d+)?)\s*(k|hazar|thousand)/i);
    if (kMatch) {
        amount = Math.round(parseFloat(kMatch[1]) * 1000);
    } else {
        const digits = cleanText.match(/\d+[\d,]*(?:\.\d+)?/g);
        if (digits) {
            const parsed = digits.map(d => parseFloat(d.replace(/,/g, ''))).filter(n => n >= 10);
            amount = parsed.length > 0 ? parsed[parsed.length - 1] : 0;
        }
    }

    // 2. Category Detection
    let category = 'groceries';
    if (/(petrol|fuel|diesel|careem|indrive|uber|bykea|rickshaw)/i.test(cleanText)) {
        category = 'transport';
    } else if (/(bijli|electricity|lesco|ke|k-electric|gas|sngpl|ssgc|ptcl|wifi|bill)/i.test(cleanText)) {
        category = 'utilities';
    } else if (/(school|fee|beaconhouse|city school|roots|lgs|academy|college)/i.test(cleanText)) {
        category = 'education';
    } else if (/(pocket|canteen|burger|shawarma|biryani|chai)/i.test(cleanText)) {
        category = 'personal_teen';
    } else if (/(kameti|bc|committee)/i.test(cleanText)) {
        category = 'committee_bc';
    } else if (/(udhaar|qarz|borrow|lent)/i.test(cleanText)) {
        category = 'informal_udhaar';
    }

    // 3. Payment Method
    let method = 'Cash';
    if (/raast|rast|iban/i.test(cleanText)) method = 'Raast';
    else if (/sadapay|sada/i.test(cleanText)) method = 'SadaPay';
    else if (/nayapay|naya/i.test(cleanText)) method = 'NayaPay';
    else if (/jazzcash|jc/i.test(cleanText)) method = 'JazzCash';
    else if (/easypaisa|ep/i.test(cleanText)) method = 'Easypaisa';
    else if (/meezan/i.test(cleanText)) method = 'Meezan Bank';

    // 4. Flow Type
    let type = 'expense';
    if (category === 'committee_bc') type = 'committee';
    else if (category === 'informal_udhaar') type = 'udhaar';
    else if (category === 'education' && /reserve|sinking|fund/i.test(cleanText)) type = 'sinking_fund';
    else if (/salary|tankhwa|kamai|received/i.test(cleanText)) type = 'income';

    res.json({
        originalText: text,
        amount,
        category,
        type,
        method,
        confidence: amount > 0 ? 0.95 : 0.6
    });
});

module.exports = router;
