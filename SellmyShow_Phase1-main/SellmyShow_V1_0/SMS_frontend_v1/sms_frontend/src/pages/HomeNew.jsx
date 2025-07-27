import React, { useEffect, useState, useCallback } from 'react';
import axios from '../api/axiosInstance';
import Navbar from '../components/Navbar.jsx';
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

export default Home;
