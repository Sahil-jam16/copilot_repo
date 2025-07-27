import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';


function BuyTicket() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await axios.get(`/ticket/${ticketId}`);
        setTicket(res.data);
      } catch (err) {
        console.error('Error fetching ticket:', err);
      }
    };
    fetchTicket();
  }, [ticketId]);

  const loadRazorpay = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      document.body.appendChild(script);
    });
  };

const handleBuy = async () => {
  const res = await loadRazorpay('https://checkout.razorpay.com/v1/checkout.js');
  if (!res) {
    alert('Failed to load Razorpay');
    return;
  }

  const token = localStorage.getItem('token');
  const orderRes = await axios.post(
    `/create-order/${ticketId}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const options = {
    key: orderRes.data.key,
    amount: orderRes.data.amount,
    currency: orderRes.data.currency,
    order_id: orderRes.data.order_id,
    name: 'Ticket Purchase',
    description: `Buying ticket ${ticketId}`,
    prefill: {
      name: 'Your Name',
      email: 'you@example.com',
    },
    theme: { color: '#528FF0' },
    handler: async function (response) {
      try {
        await axios.post(
          '/verify-payment',
          {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            ticket_id: ticketId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Payment successful!');
        navigate('/my-tickets');
      } catch (err) {
        console.error('Payment verification failed', err);
        alert('Payment verification failed.');
      }
    },
    modal: {
      ondismiss: () => {
        console.log('Payment popup closed');
      }
    }
  };

  const rzp = new window.Razorpay(options);

  rzp.on('payment.failed', function (response) {
    alert('Payment failed');
    console.log(response.error);
  });

  rzp.open();
};



  if (!ticket) return <p>Loading ticket details...</p>;

  return (
  <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
    <h2>Buy Ticket</h2>
    
    {ticket.poster_url && (
      <img
        src={ticket.poster_url}
        alt={ticket.event_name}
        style={{ width: '100%', height: 'auto', borderRadius: '8px', marginBottom: '20px' }}
      />
    )}

    <p><strong>Movie:</strong> {ticket.event_name}</p>
    <p><strong>Amount:</strong> ₹{ticket.selling_price} x {ticket.count} = ₹{ticket.selling_price * ticket.count}</p>
    
    <button onClick={handleBuy}>Buy Now</button>
  </div>
);

}

export default BuyTicket;
