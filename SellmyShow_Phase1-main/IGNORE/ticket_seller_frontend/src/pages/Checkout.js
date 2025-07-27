// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from '../api/axiosInstance';

// function Checkout() {
//   const { ticketId } = useParams();
//   const navigate = useNavigate();
//   const [ticket, setTicket] = useState(null);
//   const [msg, setMsg] = useState('');

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       navigate('/login'); // Redirect to login if not authenticated
//       return;
//     }

//     const fetchTicket = async () => {
//       try {
//         const res = await axios.get(`/ticket/${ticketId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setTicket(res.data);
//       } catch (err) {
//         alert('Failed to load ticket');
//         console.error(err);
//       }
//     };

//     fetchTicket();
//   }, [ticketId, navigate]);

//   const handleBuy = async () => {
//     const token = localStorage.getItem('token');
//     try {
//       await axios.post(`/buy/${ticketId}`, {}, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setMsg('Ticket purchase successful!');
//       setTicket(prev => ({ ...prev, is_sold: true }));
//       setTimeout(() => {
//         navigate('/my-tickets'); // Redirect after short delay
//       }, 1000);
//     } catch (err) {
//       if (err.response && err.response.status === 403) {
//         setMsg('This ticket is already sold.');
//       } else {
//         setMsg('Failed to complete purchase.');
//       }
//     }
//   };

//   if (!ticket) return <div>Loading ticket...</div>;

//   return (
//     <div style={{ padding: '20px' }}>
//       <h2>Checkout</h2>
//       <p><strong>Event:</strong> {ticket.event_name}</p>
//       <p><strong>Venue:</strong> {ticket.venue}</p>
//       <p><strong>Date & Time:</strong> {ticket.datetime}</p>
//       <p><strong>Seat Number(s):</strong> {Array.isArray(ticket.seat_numbers) ? ticket.seat_numbers.join(', ') : 'N/A'}</p>
//       <p><strong>Original Price:</strong> ₹{ticket.original_price}</p>
//       <p><strong>Final Price:</strong> ₹{ticket.selling_price}</p>

//       {msg && <p style={{ color: msg.includes('successful') ? 'green' : 'red' }}>{msg}</p>}

//       {!ticket.is_sold ? (
//         <button 
//           onClick={handleBuy} 
//           style={{ padding: '10px', backgroundColor: 'green', color: 'white', border: 'none', cursor: 'pointer' }}
//         >
//           Buy Now
//         </button>
//       ) : (
//         <p style={{ color: 'red' }}>Ticket already sold</p>
//       )}
//     </div>
//   );
// }

// export default Checkout;
