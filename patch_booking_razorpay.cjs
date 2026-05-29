const fs = require('fs');

try {
  let content = fs.readFileSync('src/components/modals/BookingModal.tsx', 'utf8');

  // Add script loader and env check to useEffect
  if(!content.includes('https://checkout.razorpay.com/v1/checkout.js')) {
    const useEffectStr = `useEffect(() => {
    // Load Razorpay
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);`;
    
    // insert right before the fetch worker bookings useEffect
    content = content.replace("useEffect(() => {\n    // Fetch worker bookings", useEffectStr + "\n\n  useEffect(() => {\n    // Fetch worker bookings");
  }

  // Update handlePayment
  const oldHandlePayment = `  const handlePayment = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const totalPrice = basePrice.includes('/hr') ? \`\${basePrice.split('/')[0]} + $12.50\` : \`$\${parseInt(basePrice.replace(/\\D/g, '')) + 12.50}\`;

      const bookingData = {
        workerId,
        clientId: user._id,
        serviceName,
        date,
        time,
        location,
        lat: coordinates?.lat,
        lng: coordinates?.lng,
        basePrice,
        totalPrice
      };

      const res = await fetch(\`\${API_URL}/api/bookings\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Booking failed');
      }

      setStep(3); // Success state
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };`;

  const newHandlePayment = `  const handlePayment = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const totalPriceString = basePrice.includes('/hr') ? \`\${basePrice.split('/')[0]} + $12.50\` : \`$\${parseInt(basePrice.replace(/\\D/g, '')) + 12.50}\`;
      // Extract numeric value for Razorpay (assuming USD)
      const numericPrice = parseFloat(totalPriceString.replace(/[^0-9.-]+/g,""));

      const bookingData = {
        workerId,
        clientId: user._id,
        serviceName,
        date,
        time,
        location,
        lat: coordinates?.lat,
        lng: coordinates?.lng,
        basePrice,
        totalPrice: totalPriceString
      };

      // 1. Create order on backend
      const orderRes = await fetch(\`\${API_URL}/api/payment/create-order\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numericPrice })
      });

      if (!orderRes.ok) throw new Error('Failed to create payment order');
      const order = await orderRes.json();

      // 2. Open Razorpay Widget
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'test_key', // Ensure this is set in .env
        amount: order.amount,
        currency: order.currency,
        name: "SERVIC Marketplace",
        description: \`Payment for \${serviceName}\`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // 3. Verify Payment on Backend
            const verifyRes = await fetch(\`\${API_URL}/api/payment/verify\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                bookingData
              })
            });

            if (!verifyRes.ok) throw new Error('Payment verification failed');
            
            setStep(3); // Success state
          } catch (err: any) {
            setError(err.message);
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: user.name || '',
          email: user.email || '',
          contact: user.phone || ''
        },
        theme: {
          color: "#3B82F6"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setError(response.error.description);
        setIsSubmitting(false);
      });
      rzp.open();

    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };`;

  if(content.includes(oldHandlePayment)) {
    content = content.replace(oldHandlePayment, newHandlePayment);
  }

  // Also fix the import.meta.env error if any and make sure it has 'import.meta.env' defined (Vite project)

  fs.writeFileSync('src/components/modals/BookingModal.tsx', content);
  console.log('Razorpay patched successfully');
} catch (e) {
  console.error(e);
}
