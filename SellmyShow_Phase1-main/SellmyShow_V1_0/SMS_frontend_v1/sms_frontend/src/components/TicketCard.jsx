import React from 'react';
import { 
  MapPinIcon, 
  CalendarDaysIcon, 
  CurrencyRupeeIcon, 
  TicketIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

function TicketCard({ ticket }) {
  const navigate = useNavigate();

  const handleBuyTicket = () => {
    if (!localStorage.getItem('token')) {
      localStorage.setItem('redirectAfterLogin', `/buy/${ticket._id}`);
      navigate('/login');
    } else {
      navigate(`/buy/${ticket._id}`);
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

  const calculateDiscount = () => {
    if (ticket.original_price && ticket.selling_price) {
      const discount = ((ticket.original_price - ticket.selling_price) / ticket.original_price) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  const discount = calculateDiscount();

  return (
    <div className="ticket-card rounded-xl overflow-hidden group">
      <div className="flex flex-col md:flex-row">
        {/* Poster Image */}
        <div className="relative md:w-48 h-64 md:h-72 flex-shrink-0">
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
              <TicketIcon className="h-16 w-16 text-gray-400" />
            </div>
          )}
          
          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
              {discount}% OFF
            </div>
          )}
          
          {/* Ticket Count Badge */}
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
            {ticket.count} left
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="mb-4">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 group-hover:text-red-600 transition-colors duration-200">
                {ticket.event_name}
              </h3>
              
              {/* Venue */}
              <div className="flex items-center text-gray-600 mb-2">
                <MapPinIcon className="h-5 w-5 mr-2 text-red-500" />
                <span className="font-medium">{ticket.venue}</span>
              </div>
              
              {/* Date & Time */}
              <div className="flex items-center text-gray-600">
                <CalendarDaysIcon className="h-5 w-5 mr-2 text-blue-500" />
                <span>{formatDate(ticket.datetime)}</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <CurrencyRupeeIcon className="h-6 w-6 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">
                    {ticket.selling_price}
                  </span>
                </div>
                
                {ticket.original_price && ticket.original_price !== ticket.selling_price && (
                  <div className="flex items-center">
                    <CurrencyRupeeIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-lg text-gray-400 line-through">
                      {ticket.original_price}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <TagIcon className="h-4 w-4 mr-1" />
                <span>Per ticket</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-auto">
              <button
                onClick={handleBuyTicket}
                className="w-full btn-primary text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <TicketIcon className="h-5 w-5" />
                <span>Buy Tickets</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketCard;
