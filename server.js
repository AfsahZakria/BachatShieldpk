const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const transactionsRouter = require('./routes/transactions');
const sinkingFundsRouter = require('./routes/sinkingFunds');
const committeesRouter = require('./routes/committees');
const udhaarRouter = require('./routes/udhaar');
const inflationRouter = require('./routes/inflation');
const nlpRouter = require('./controllers/nlpController');

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        service: 'BachatShield Backend API',
        timestamp: new Date().toISOString(),
        currency: 'PKR',
        features: [
            'Roman Urdu NLP',
            'Safe Daily Spend calculation',
            'Micro-Sinking Funds',
            'Committees (BCs)',
            'Udhaar 1-Tap WhatsApp Reminders',
            'Role-Based Family Privacy',
            'Inflation Shield Alerts'
        ]
    });
});

// Mount API Endpoints
app.use('/api/transactions', transactionsRouter);
app.use('/api/sinking-funds', sinkingFundsRouter);
app.use('/api/committees', committeesRouter);
app.use('/api/udhaar', udhaarRouter);
app.use('/api/inflation', inflationRouter);
app.use('/api/nlp', nlpRouter);

// Serve Frontend Static Assets if in unified deployment mode
const clientPath = path.join(__dirname, '../client');
app.use(express.static(clientPath));
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    res.sendFile(path.join(clientPath, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('BachatShield Server Error:', err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🛡️  BachatShield Backend running on port ${PORT}`);
    console.log(`🚀 API Base URL: http://localhost:${PORT}/api`);
    console.log(`===============================================`);
});
