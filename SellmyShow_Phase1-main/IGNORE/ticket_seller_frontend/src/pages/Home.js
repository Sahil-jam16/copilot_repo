import React, { useEffect, useState, useCallback } from 'react';
import axios from '../api/axiosInstance';

function Home() {
  const [tickets, setTickets] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterMovie, setFilterMovie] = useState('');
  const [movies, setMovies] = useState([]);
  const [filterCount, setFilterCount] = useState('');
  const [cities, setCities] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await axios.get('/tickets', {
        params: {
          sort: sortBy,
          city: filterCity,
          movie: filterMovie,
          count: filterCount || undefined
        }
      });
      setTickets(res.data);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    }
  }, [sortBy, filterCity, filterMovie, filterCount]);

  const fetchFilters = async () => {
    try {
      const res = await axios.get('/active-filters');
      setCities(res.data.cities || []);
      setMovies(res.data.movies || []);
    } catch (err) {
      console.error('Failed to fetch filters:', err);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px', gap: '10px' }}>
      <>
  <button onClick={() => {
  const token = localStorage.getItem('token');
  if (!token) {
    localStorage.setItem('redirectAfterLogin', '/upload-ticket');
    window.location.href = '/login';
  } else {
    window.location.href = '/upload-ticket';
  }
}}>
  Sell Tickets
</button>
  {isLoggedIn ? (
    <>
      <button onClick={() => window.location.href = '/my-tickets'}>My Tickets</button>
      <button onClick={() => window.location.href = '/edit-profile'}>Edit Profile</button>
      <button onClick={handleLogout}>Logout</button>
    </>
  ) : (
    <button onClick={() => window.location.href = '/login'}>Login</button>
  )}
</>
      </div>

      <h2>Sellmyshow</h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <select onChange={(e) => setFilterCity(e.target.value)} value={filterCity}>
          <option value="">All Cities</option>
          {cities.map((city, index) => (
            <option key={index} value={city}>{city}</option>
          ))}
        </select>

        <select onChange={(e) => setFilterMovie(e.target.value)} value={filterMovie}>
        <option value="">All Movies</option>
        {movies.map((movie, index) => (
          <option key={index} value={movie}>{movie}</option>
        ))}
        </select>

        <select onChange={(e) => setSortBy(e.target.value)} value={sortBy}>
          <option value="">Sort By</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
          <option value="date_asc">Date ↑</option>
          <option value="date_desc">Date ↓</option>
        </select>

        <input
          type="number"
          placeholder="Min Ticket Count"
          value={filterCount}
          onChange={(e) => setFilterCount(e.target.value)}
          style={{ width: '150px' }}
        />
      </div>

      {tickets.map((ticket, index) => (
  <div key={index} style={{ border: '1px solid gray', margin: '10px', padding: '10px', display: 'flex', gap: '15px' }}>
    {ticket.poster_url && (
      <img src={ticket.poster_url} alt={ticket.event_name} style={{ width: '120px', height: '180px', objectFit: 'cover' }} />
    )}
    <div>
      <h3>{ticket.event_name}</h3>
      <p>Venue: {ticket.venue}</p>
      <p>Date & Time: {ticket.datetime}</p>
      <p>Original Price: ₹{ticket.original_price ?? 'N/A'}</p>
      <p>Selling Price: ₹{ticket.selling_price}</p>
      <p>Tickets Available: {ticket.count}</p>
      <button onClick={() => {
        if (!localStorage.getItem('token')) {
          localStorage.setItem('redirectAfterLogin', `/buy/${ticket._id}`);
          window.location.href = '/login';
        } else {
          window.location.href = `/buy/${ticket._id}`;
        }
      }}>
        Buy Ticket
      </button>
    </div>
  </div>
))}

    </div>
  );
}

export default Home;
