/**
 * BachatShield - Roman Urdu & English Natural Language Parser Engine
 * Converts conversational Pakistani Roman Urdu voice and text logs into structured financial records.
 * Examples:
 *   "Doodh wale ko 4500 diye Cash se"
 *   "Tariq karyana 3200 atta aur ghee"
 *   "Careem 850 petrol 3000"
 *   "Ali ko 2500 udhaar diye"
 *   "Al-Khair committee kist 10000"
 *   "Beaconhouse school fee reserve 500"
 */

class RomanUrduNLPParser {
    constructor() {
        this.categories = {
            groceries: [
                'doodh', 'milk', 'dahi', 'yogurt', 'karyana', 'ration', 'atta', 'ghee', 
                'oil', 'sabzi', 'vegetables', 'tarkari', 'roti', 'naan', 'meat', 'gosht', 
                'chicken', 'beef', 'mutton', 'chawal', 'rice', 'daal', 'chini', 'sugar', 
                'chai', 'tea', 'patti', 'anday', 'eggs', 'bread', 'fal', 'fruits', 'masalay',
                'imtiaz', 'metro', 'carrefour', 'hyperstar', 'bakery', 'sweets', 'mithai'
            ],
            utilities: [
                'bijli', 'electricity', 'lesco', 'ke', 'k-electric', 'iesco', 'fesco', 
                'mepco', 'heco', 'gas', 'sngpl', 'ssgc', 'cylinder', 'pani', 'water', 
                'tanker', 'ptcl', 'wifi', 'internet', 'nayatel', 'stormfiber', 'jazz', 
                'telenor', 'zong', 'ufone', 'mobile load', 'easyload', 'bill'
            ],
            education: [
                'school', 'fee', 'fees', 'beaconhouse', 'city school', 'roots', 'lgs', 
                'lahore grammar', 'army public', 'aps', 'college', 'university', 'academy', 
                'qari sahab', 'quran', 'madrasa', 'tuition', 'tution', 'books', 'stationery', 
                'copies', 'uniform', 'van', 'school van'
            ],
            transport: [
                'petrol', 'fuel', 'diesel', 'cng', 'careem', 'indrive', 'in-drive', 'uber', 
                'bykea', 'rickshaw', 'rikshaw', 'taxi', 'speedo', 'metro bus', 'orange line', 
                'toll', 'motorway', 'puncture', 'oil change', 'car wash', 'mechanic', 'tuning'
            ],
            informal_udhaar: [
                'udhaar', 'qarz', 'borrow', 'lent', 'lend', 'khata', 'advance', 'peshgi', 
                'wapis', 'dena hai', 'lena hai', 'baqi'
            ],
            committee_bc: [
                'kameti', 'bc', 'committee', 'kist', 'installment', 'draw', 'payout', 'turn'
            ],
            personal_teen: [
                'pocket', 'pocket money', 'canteen', 'burger', 'shawarma', 'biryani', 
                'chai paratha', 'roll', 'snack', 'game', 'gaming', 'topup', 'chotey ka kharcha'
            ],
            medical: [
                'dawa', 'dawaii', 'medicine', 'doctor', 'clinic', 'hospital', 'medical', 
                'pharmacy', 'test', 'blood test', 'panadol', 'chughtai', 'aga khan'
            ]
        };

        this.paymentMethods = {
            'Cash': ['cash', 'naqad', 'hath mein', 'nqd'],
            'Raast': ['raast', 'rast', 'iban'],
            'SadaPay': ['sadapay', 'sada pay', 'sada'],
            'NayaPay': ['nayapay', 'naya pay', 'naya'],
            'JazzCash': ['jazzcash', 'jazz cash', 'jc'],
            'Easypaisa': ['easypaisa', 'easy paisa', 'ep'],
            'Meezan Bank': ['meezan', 'mbl'],
            'HBL': ['hbl', 'habib bank']
        };

        this.urduNumberWords = {
            'ek': 1, 'do': 2, 'teen': 3, 'char': 4, 'paanch': 5,
            'panch': 5, 'che': 6, 'saat': 7, 'aath': 8, 'nau': 9, 'das': 10,
            'sau': 100, 'so': 100, 'hazar': 1000, 'hzaar': 1000, 'k': 1000,
            'lakh': 100000, 'laakh': 100000
        };
    }

    /**
     * Parses freeform Roman Urdu or English text string into a financial event
     */
    parse(inputText) {
        if (!inputText || typeof inputText !== 'string') {
            return null;
        }

        const cleanText = inputText.toLowerCase().trim();
        
        // 1. Extract Amount
        const amount = this.extractAmount(cleanText);

        // 2. Identify Category & Sub-Intent
        const detectedCategory = this.detectCategory(cleanText);

        // 3. Detect Payment Method
        const paymentMethod = this.detectPaymentMethod(cleanText);

        // 4. Determine Financial Flow Type (expense, income, udhaar, committee, sinking_fund)
        const flowType = this.determineFlowType(cleanText, detectedCategory);

        // 5. Extract Person / Vendor Entity
        const entity = this.extractEntity(inputText, detectedCategory);

        // 6. Generate Clean Title
        const title = this.generateTitle(inputText, entity, detectedCategory, flowType);

        return {
            originalText: inputText,
            amount: amount || 0,
            category: detectedCategory,
            type: flowType, // 'expense', 'income', 'udhaar', 'committee', 'sinking_fund'
            paymentMethod: paymentMethod,
            entity: entity,
            title: title,
            date: new Date().toISOString(),
            confidence: amount > 0 ? 0.95 : 0.65
        };
    }

    extractAmount(text) {
        // Look for digit patterns like "4500", "Rs. 2500", "25k", "1.5 lakh"
        const kPattern = /(\d+(?:\.\d+)?)\s*(k|hazar|thousand)/i;
        const kMatch = text.match(kPattern);
        if (kMatch) {
            return Math.round(parseFloat(kMatch[1]) * 1000);
        }

        const lakhPattern = /(\d+(?:\.\d+)?)\s*(lakh|lac)/i;
        const lakhMatch = text.match(lakhPattern);
        if (lakhMatch) {
            return Math.round(parseFloat(lakhMatch[1]) * 100000);
        }

        // Direct digits: e.g. "petrol 2500" or "4500 diye"
        const digitMatches = text.match(/\d+[\d,]*(?:\.\d+)?/g);
        if (digitMatches && digitMatches.length > 0) {
            // Pick the largest or the most plausible financial amount
            const parsed = digitMatches.map(m => parseFloat(m.replace(/,/g, '')));
            // Usually the last number or the highest number > 10
            const valid = parsed.filter(n => n >= 10);
            return valid.length > 0 ? valid[valid.length - 1] : parsed[0];
        }

        return 0;
    }

    detectCategory(text) {
        for (const [category, keywords] of Object.entries(this.categories)) {
            for (const kw of keywords) {
                // Word boundary match or exact inclusion
                const regex = new RegExp(`\\b${kw}\\b`, 'i');
                if (regex.test(text) || text.includes(kw)) {
                    return category;
                }
            }
        }
        return 'groceries'; // Default fallback
    }

    detectPaymentMethod(text) {
        for (const [method, keywords] of Object.entries(this.paymentMethods)) {
            for (const kw of keywords) {
                if (text.includes(kw)) {
                    return method;
                }
            }
        }
        return 'Cash'; // Default Pakistani standard
    }

    determineFlowType(text, category) {
        if (category === 'committee_bc') return 'committee';
        if (category === 'informal_udhaar') return 'udhaar';
        if (category === 'education' && (text.includes('sinking') || text.includes('reserve') || text.includes('bimonthly') || text.includes('fund'))) {
            return 'sinking_fund';
        }
        if (text.includes('salary') || text.includes('tankhwa') || text.includes('kamai') || text.includes('aaye') || text.includes('received') || text.includes('munafa')) {
            return 'income';
        }
        return 'expense';
    }

    extractEntity(rawText, category) {
        // Look for patterns like "Ali ko...", "Tariq sahab...", "Imtiaz store..."
        const koMatch = rawText.match(/([a-zA-Z\s]+?)\s+(?:ko|se|ka|ki)\s+/i);
        if (koMatch && koMatch[1].trim().length > 1) {
            const candidate = koMatch[1].trim();
            const blacklist = ['mein', 'hum', 'mene', 'aaj', 'kal', 'doodh', 'petrol', 'cash'];
            if (!blacklist.includes(candidate.toLowerCase())) {
                return this.capitalize(candidate);
            }
        }

        if (category === 'informal_udhaar') {
            const words = rawText.split(/\s+/);
            for (const w of words) {
                if (!['udhaar', 'diye', 'liye', 'ko', 'se', 'rs', 'pkr'].includes(w.toLowerCase()) && isNaN(w)) {
                    return this.capitalize(w);
                }
            }
            return 'Family / Friend';
        }

        return null;
    }

    generateTitle(rawText, entity, category, flowType) {
        if (entity && flowType === 'udhaar') {
            return `Udhaar: ${entity}`;
        }
        if (category === 'committee_bc') {
            return 'BC Committee Installment';
        }
        if (category === 'education') {
            return 'School Fee Allocation';
        }

        // Clean out numbers and prepositions to form title
        let clean = rawText
            .replace(/\d+[\d,]*(?:\.\d+)?/g, '')
            .replace(/\b(ko|se|ka|ki|diye|liye|hain|tha|kist|rs|pkr|cash)\b/gi, '')
            .trim();

        if (clean.length < 3) {
            clean = this.capitalize(category);
        }

        return this.capitalize(clean);
    }

    capitalize(str) {
        if (!str) return '';
        return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
}

// Attach to window for client usage
if (typeof window !== 'undefined') {
    window.RomanUrduNLPParser = RomanUrduNLPParser;
}
