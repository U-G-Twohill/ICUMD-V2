require('dotenv').config();
const express = require('express');
const stripe = require('stripe')('STRIPE SECRET KEY');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cors());

// Add the test endpoint
app.get('/api-test', (req, res) => {
    console.log('Test endpoint hit');
    res.json({ status: 'success', message: 'API is working' });
});

// Your existing endpoints
app.post('/create-checkout-session', async (req, res) => {
    try {
        console.log('Creating one-time payment session');
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                 price: 'ONE TIME PRODUCT KEY',
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'http://localhost:3000/success.html',
            cancel_url: 'http://localhost:30000/cancel.html',
            });
        console.log('One-time payment session created:', session.id);
        res.json({id: session.id});
        } catch (error) {
            console.error('Error creating checkout session:', error);
            res.status(500).json({error: error.message});
        }
    });

app.post('/create-subscription', async (req, res) => {
    console.log('Subscription endpoint hit'); // Debug log
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: 'SUBSCRIPTION PRODUCT KEY', // Your actual price ID
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: 'http://localhost:3000/success.html',
            cancel_url: 'http://localhost:3000/cancel.html',
        });
        
        console.log('Session created:', session.id);
        res.json({ id: session.id });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/create-0-dollar-session', async (req, res) => {
    try {
        console.log('Creating minimal payment session');
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'nzd',
                    product_data: {
                        name: 'Test Payment',
                        description: 'Testing payment processing',
                    },
                    unit_amount: 50, // 50 cents (Stripe uses smallest currency unit)
                },
                quantity: 1,
            }],
            mode: 'payment',
            billing_address_collection: 'required',
            submit_type: 'pay',
            success_url: 'http://localhost:3000/success.html',
            cancel_url: 'http://localhost:3000/cancel.html',
        });
        
        console.log('Test payment session created:', session.id);
        res.json({id: session.id});
    } catch (error) {
        console.error('Error creating test payment session:', error);
        res.status(500).json({error: error.message});
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log('Stripe key loaded:', 'STRIPE SECRET KEY' ? 'Yes' : 'No');
    console.log(`Server running on port ${PORT}`);
    console.log('Available endpoints:');
    console.log('- GET /api-test');
    console.log('- POST /create-checkout-session');
    console.log('- POST /create-subscription');
});
        
