import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';

function MyTickets() {
  const [soldTickets, setSoldTickets] = useState([]);
  const [boughtTickets, setBoughtTickets] = useState([]);

  const fetchTickets = async () => {
    try {
      const [soldRes, boughtRes] = await Promise.all([
        axios.get('/my-tickets'),
        axios.get('/bought-tickets'),
      ]);
      setSoldTickets(soldRes.data);
      setBoughtTickets(boughtRes.data);
    } catch (err) {
      console.error('Failed to fetch tickets', err);
      alert('Session expired. Please log in again.');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleDelete = async (ticketId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this ticket?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`/my-tickets/${ticketId}`);
      alert('Ticket deleted successfully');
      fetchTickets();
    } catch (err) {
      console.error('Failed to delete ticket', err);
      alert('Failed to delete ticket');
    }
  };

  const goToHome = () => {
    window.location.href = '/';
  };

  const renderTicket = (ticket, i, isSeller = false) => (
  <div key={i} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px', display: 'flex', gap: '15px' }}>
    {ticket.poster_url && (
      <img
        src={ticket.poster_url}
        alt={ticket.event_name}
        style={{ width: '120px', height: '180px', objectFit: 'cover' }}
      />
    )}

    <div>
      <h4>{ticket.event_name}</h4>
      <p><strong>Venue:</strong> {ticket.venue}</p>
      <p><strong>Date & Time:</strong> {ticket.datetime}</p>
      <p><strong>Original Price:</strong> ₹{ticket.original_price}</p>
      <p><strong>Selling Price:</strong> ₹{ticket.selling_price}</p>
      <p><strong>Seat Numbers:</strong> {Array.isArray(ticket.seat_numbers) ? ticket.seat_numbers.join(', ') : 'N/A'}</p>
      <p><strong>Contact:</strong> <a href={`https://wa.me/${ticket.contact_info}`} target="_blank" rel="noreferrer">WhatsApp</a></p>
      <p>
        <strong>File:</strong>{' '}
        <a
          href={`http://192.168.0.102:5000${ticket.ticket_url}`}
          target="_blank"
          rel="noreferrer"
        >
          View Ticket
        </a>
      </p>

      {isSeller ? (
        ticket.is_sold ? (
          <p style={{ color: 'green', fontWeight: 'bold' }}>✅ Sold</p>
        ) : (
          <div>
            <input
              type="number"
              placeholder="New Price"
              style={{ marginRight: '8px' }}
              value={ticket.new_price || ''}
              onChange={(e) => {
                const value = e.target.value;
                setSoldTickets((prev) =>
                  prev.map((t, idx) => (idx === i ? { ...t, new_price: value } : t))
                );
              }}
            />
            <button
              onClick={async () => {
                try {
                  const price = parseInt(ticket.new_price);
                  if (!price || price <= 0) return alert('Enter a valid price');
                  await axios.patch(`/my-tickets/${ticket.ticket_id}/price`, {
                    new_price: price,
                  });
                  alert('Price updated');
                  fetchTickets();
                } catch (err) {
                  console.error(err);
                  alert('Failed to update price');
                }
              }}
            >
              Update Price
            </button>
            <button onClick={() => handleDelete(ticket.ticket_id)} style={{ marginLeft: '8px' }}>
              Delete
            </button>
          </div>
        )
      ) : null}
    </div>
  </div>
);

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={goToHome} style={{ marginBottom: '20px', padding: '10px 20px' }}>
        Show Available Tickets
      </button>

      <h2>My Tickets</h2>

      <h3>Tickets You Sell</h3>
      {soldTickets.length > 0 ? soldTickets.map((t, i) => renderTicket(t, i, true)) : <p>No tickets listed.</p>}

      <h3>Tickets You Bought</h3>
      {boughtTickets.length > 0 ? boughtTickets.map((t, i) => renderTicket(t, i)) : <p>No tickets bought.</p>}
    </div>
  );
}

export default MyTickets;
