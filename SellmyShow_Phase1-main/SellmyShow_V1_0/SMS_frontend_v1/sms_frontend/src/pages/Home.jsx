import React, { useEffect, useState, useCallback } from 'react';
import axios from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import FilterBar from '../components/FilterBar';
import TicketCard from '../components/TicketCard';
import { LoadingSpinner, TicketCardSkeleton, EmptyState } from '../components/Loading';

function Home() {
  const [tickets, setTickets] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterMovie, setFilterMovie] = useState('');
  const [movies, setMovies] = useState([]);
  const [filterCount, setFilterCount] = useState('');
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersLoading, setFiltersLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, [sortBy, filterCity, filterMovie, filterCount]);

  const fetchFilters = async () => {
    try {
      setFiltersLoading(true);
      const res = await axios.get('/active-filters');
      setCities(res.data.cities || []);
      setMovies(res.data.movies || []);
    } catch (err) {
      console.error('Failed to fetch filters:', err);
    } finally {
      setFiltersLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-4">
            Your Ticket to Every Show
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Buy and sell tickets for movies, concerts, sports, and events. 
            Get the best deals from verified sellers.
          </p>
        </div>

        {/* Filter Bar */}
        {!filtersLoading && (
          <FilterBar
            cities={cities}
            movies={movies}
            filterCity={filterCity}
            setFilterCity={setFilterCity}
            filterMovie={filterMovie}
            setFilterMovie={setFilterMovie}
            sortBy={sortBy}
            setSortBy={setSortBy}
            filterCount={filterCount}
            setFilterCount={setFilterCount}
          />
        )}

        {/* Tickets Grid */}
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, index) => (
                <TicketCardSkeleton key={index} />
              ))}
            </div>
          ) : tickets.length > 0 ? (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Available Tickets ({tickets.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {tickets.map((ticket, index) => (
                  <TicketCard key={ticket._id || index} ticket={ticket} />
                ))}
              </div>
            </>
          ) : (
            <EmptyState 
              title="No tickets available" 
              message="Be the first to sell tickets for exciting events or check back later for new listings."
            />
          )}
        </div>
      </main>
    </div>
  );
}


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


export default Home;
