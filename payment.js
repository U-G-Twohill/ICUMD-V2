// Initialize Stripe with your publishable key
const stripe = Stripe('STRIPE PUBLISHABLE KEY');

// Test server connection on page load
fetch('http://localhost:3000/api-test')
    .then(response => response.json())
    .then(data => console.log('Server test:', data))
    .catch(error => console.error('Server test failed:', error));

// One-time payment
document.getElementById('checkout-button').addEventListener('click', async () => {
    try {
      const response = await fetch('http://localhost:3000/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'ONE TIME PRODUCT KEY', // You'll get this from Stripe Dashboard
        }),
      });
      
      const session = await response.json();
      
      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });
  
      if (result.error) {
        alert(result.error.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });

// Handle subscription
document.getElementById('subscription-button').addEventListener('click', async () => {
    console.log('Subscription button clicked');
    try {
        const response = await fetch('http://localhost:3000/create-subscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}) // Empty object as body
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const session = await response.json();
        console.log('Session created:', session);
        
        const result = await stripe.redirectToCheckout({
            sessionId: session.id
        });

        if (result.error) {
            throw new Error(result.error.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to create subscription: ' + error.message);
    }
});

// 0 Dollar payment// One-time payment
document.getElementById('0-dollar-button').addEventListener('click', async () => {
  try {
      const response = await fetch('http://localhost:3000/create-0-dollar-session', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          }
      });
      
      const session = await response.json();
      
      if (session.error) {
          throw new Error(session.error);
      }
      
      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
          sessionId: session.id,
      });

      if (result.error) {
          throw new Error(result.error.message);
      }
  } catch (error) {
      console.error('Error:', error);
      alert('Payment failed: ' + error.message);
  }
});