import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import { LoadingSpinner, EmptyState } from '../components/Loading';
import { 
  TicketIcon, 
  TrashIcon, 
  CalendarDaysIcon, 
  MapPinIcon,
  CurrencyRupeeIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

function MyTickets() {
  const [soldTickets, setSoldTickets] = useState([]);
  const [boughtTickets, setBoughtTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bought');

  const fetchTickets = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
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

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'sold': { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircleIcon,
        text: 'Sold'
      },
      'available': { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: TicketIcon,
        text: 'Available'
      },
      'expired': { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: XCircleIcon,
        text: 'Expired'
      }
    };

    const config = statusConfig[status] || statusConfig['available'];
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const renderTicketCard = (ticket, index, isSeller = false) => (
    <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="flex flex-col md:flex-row">
        {/* Poster Image */}
        <div className="md:w-40 h-48 md:h-56 flex-shrink-0">
          {ticket.poster_url ? (
            <img 
              src={ticket.poster_url} 
              alt={ticket.event_name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x400/e5e7eb/6b7280?text=No+Image';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <TicketIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{ticket.event_name}</h3>
              {isSeller && getStatusBadge(ticket.status || 'available')}
            </div>
            
            {isSeller && (
              <div className="flex space-x-2">
                <button
                  onClick={() => window.location.href = `/edit-ticket/${ticket._id}`}
                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  title="Edit Ticket"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(ticket._id)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  title="Delete Ticket"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center text-gray-600">
              <MapPinIcon className="h-5 w-5 mr-2 text-red-500" />
              <span>{ticket.venue}</span>
            </div>
            
            <div className="flex items-center text-gray-600">
              <CalendarDaysIcon className="h-5 w-5 mr-2 text-blue-500" />
              <span>{formatDate(ticket.datetime)}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-green-600">
                <CurrencyRupeeIcon className="h-5 w-5 mr-1" />
                <span className="font-semibold">{ticket.selling_price}</span>
                <span className="text-sm text-gray-500 ml-1">per ticket</span>
              </div>
              
              {ticket.original_price && ticket.original_price !== ticket.selling_price && (
                <div className="flex items-center text-gray-400">
                  <CurrencyRupeeIcon className="h-4 w-4 mr-1" />
                  <span className="line-through">{ticket.original_price}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center text-gray-600">
              <TicketIcon className="h-5 w-5 mr-2 text-purple-500" />
              <span>{ticket.count} tickets {isSeller ? 'available' : 'purchased'}</span>
            </div>
          </div>

          {/* Purchase Date for bought tickets */}
          {!isSeller && ticket.purchase_date && (
            <div className="text-sm text-gray-500 border-t pt-3">
              Purchased on: {formatDate(ticket.purchase_date)}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">My Tickets</h1>
          <p className="text-gray-600">Manage your bought and sold tickets</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('bought')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'bought'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <ShoppingBagIcon className="h-5 w-5 mr-2" />
                  Bought Tickets ({boughtTickets.length})
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('sold')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'sold'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <TicketIcon className="h-5 w-5 mr-2" />
                  Selling Tickets ({soldTickets.length})
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'bought' ? (
            boughtTickets.length > 0 ? (
              boughtTickets.map((ticket, index) => renderTicketCard(ticket, index, false))
            ) : (
              <EmptyState
                title="No tickets purchased yet"
                message="Start exploring events and buy your first ticket!"
              />
            )
          ) : (
            soldTickets.length > 0 ? (
              soldTickets.map((ticket, index) => renderTicketCard(ticket, index, true))
            ) : (
              <EmptyState
                title="No tickets for sale"
                message="List your first ticket and start earning!"
              />
            )
          )}
        </div>
      </main>
    </div>
  );
}

export default MyTickets;
