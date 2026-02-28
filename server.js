require('dotenv').config();
const express = require('express');
const cors = require('cors');

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

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cors());

// Health check
app.get('/api-test', (req, res) => {
    res.json({ status: 'success', message: 'API is working' });
});

// One-time payment
app.post('/create-checkout-session', async (req, res) => {
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
        res.status(500).json({ error: error.message });
    }
});

// Subscription
app.post('/create-subscription', async (req, res) => {
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
        res.status(500).json({ error: error.message });
    }
});

// Test payment (50 cents NZD)
app.post('/create-0-dollar-session', async (req, res) => {
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
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Stripe key loaded:', process.env.STRIPE_TEST_SECRET_KEY ? 'Yes' : 'No');
    console.log('Available endpoints:');
    console.log('  GET  /api-test');
    console.log('  POST /create-checkout-session');
    console.log('  POST /create-subscription');
    console.log('  POST /create-0-dollar-session');
});
