require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Validate required environment variables
const requiredEnvVars = ['STRIPE_TEST_SECRET_KEY'];
const missing = requiredEnvVars.filter(v => !process.env[v]);
if (missing.length > 0) {
    console.error('Missing required environment variables:', missing.join(', '));
    console.error('Check your .env file');
    process.exit(1);
}

const stripe = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'sha256-oqC7cfu9K769wgIyX6E7tW9NXAyQy3vNWrL2/kcnKCg='"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: ["'self'", "https://formspree.io"],
        },
    },
}));

// CORS — restrict to allowed origins
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://icumediadesign.com').split(',').map(s => s.trim());
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (server-to-server, curl, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST'],
}));

// Rate limiting on checkout endpoints
const checkoutLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(express.static('public'));
app.use(express.json());

// Health check
app.get('/api-test', (req, res) => {
    res.json({ status: 'success', message: 'API is working' });
});

// One-time payment
app.post('/create-checkout-session', checkoutLimiter, async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: process.env.TEST_ONE_TIME_PRICE_ID,
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${BASE_URL}/success.html`,
            cancel_url: `${BASE_URL}/cancel.html`,
        });
        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error.message);
        res.status(500).json({ error: 'Failed to create checkout session. Please try again.' });
    }
});

// Subscription
app.post('/create-subscription', checkoutLimiter, async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: process.env.TEST_SUBSCRIPTION_PRICE_ID,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${BASE_URL}/success.html`,
            cancel_url: `${BASE_URL}/cancel.html`,
        });
        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating subscription:', error.message);
        res.status(500).json({ error: 'Failed to create subscription. Please try again.' });
    }
});

// Test payment (50 cents NZD)
app.post('/create-0-dollar-session', checkoutLimiter, async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'nzd',
                    product_data: {
                        name: 'Test Payment',
                        description: 'Testing payment processing',
                    },
                    unit_amount: 50,
                },
                quantity: 1,
            }],
            mode: 'payment',
            billing_address_collection: 'required',
            submit_type: 'pay',
            success_url: `${BASE_URL}/success.html`,
            cancel_url: `${BASE_URL}/cancel.html`,
        });
        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating test payment session:', error.message);
        res.status(500).json({ error: 'Failed to create payment session. Please try again.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
        console.log('Stripe key loaded:', process.env.STRIPE_TEST_SECRET_KEY ? 'Yes' : 'No');
        console.log('Available endpoints:');
        console.log('  GET  /api-test');
        console.log('  POST /create-checkout-session');
        console.log('  POST /create-subscription');
        console.log('  POST /create-0-dollar-session');
    }
});
