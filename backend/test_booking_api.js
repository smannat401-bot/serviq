// Using native fetch available in Node 24

const API_URL = 'http://localhost:5000';

const testBooking = async () => {
  try {
    console.log('Testing booking creation...');
    
    // Mannat (Client) ID: 69ef26721a4c5356825cd052
    // Tushar (Worker) ID: 69ef27281a4c5356825cd053
    
    const amount = 500;
    
    console.log('1. Creating order...');
    const orderRes = await fetch(`${API_URL}/api/payment/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    const orderData = await orderRes.json();
    console.log('Order created:', orderData);

    console.log('2. Verifying payment...');
    const bookingData = {
      client: '69ef26721a4c5356825cd052',
      worker: '69ef27281a4c5356825cd053',
      serviceName: 'Test Service',
      date: '2026-04-30',
      time: '10:00 AM',
      location: 'Test Location',
      basePrice: '₹450',
      totalPrice: `₹500.00`,
      distance: 4.2,
      travelFee: 50
    };

    const verifyRes = await fetch(`${API_URL}/api/payment/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: orderData.id,
        razorpay_payment_id: `pay_mock_${Date.now()}`,
        razorpay_signature: `mock_signature`,
        bookingData
      })
    });

    const verifyData = await verifyRes.json();
    console.log('Verification result:', verifyData);

    if (verifyRes.ok) {
      console.log('SUCCESS: Booking created!');
    } else {
      console.log('FAILED: Booking creation failed.');
    }

  } catch (err) {
    console.error('ERROR:', err.message);
  }
};

testBooking();
