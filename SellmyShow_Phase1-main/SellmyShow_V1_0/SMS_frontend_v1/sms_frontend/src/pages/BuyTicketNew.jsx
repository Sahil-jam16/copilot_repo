/**
 * BuyTicket Component
 * 
 * Modern ticket purchase page with Razorpay integration
 * Features:
 * - Detailed ticket information display
 * - Secure payment processing with Razorpay
 * - Loading states and error handling
 * - Responsive design
 * - BookMyShow-inspired UI
 * 
 * @author SellMyShow Team
 * @version 2.0
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import { LoadingSpinner } from '../components/Loading';
import { 
  TicketIcon, 
  CalendarDaysIcon, 
  MapPinIcon,
  CurrencyRupeeIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PhotoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

function BuyTicket() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [seatLayoutImages, setSeatLayoutImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/ticket/${ticketId}`);
        setTicket(res.data);
        
        // Set seat layout images if available
        if (res.data.seat_layout_images && res.data.seat_layout_images.length > 0) {
          setSeatLayoutImages(res.data.seat_layout_images);
        }
        
        // Generate available seat numbers based on available count
        if (res.data.count && res.data.seat_numbers) {
          // If seat numbers are provided from backend
          setSelectedSeats(res.data.seat_numbers || []);
        }
      } catch (err) {
        console.error('Error fetching ticket:', err);
        setError('Failed to load ticket details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  /**
   * Dynamically load Razorpay script
   */
  const loadRazorpay = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  /**
   * Generate available seat numbers for display
   */
  const generateSeatNumbers = (count) => {
    const seats = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    let seatCount = 0;
    
    for (let row of rows) {
      for (let num = 1; num <= 20; num++) {
        if (seatCount >= count) break;
        seats.push(`${row}${num}`);
        seatCount++;
      }
      if (seatCount >= count) break;
    }
    
    return seats;
  };

  /**
   * Handle seat selection
   */
  const handleSeatSelect = (seat) => {
    setSelectedSeats(prev => {
      if (prev.includes(seat)) {
        return prev.filter(s => s !== seat);
      } else if (prev.length < quantity) {
        return [...prev, seat];
      }
      return prev;
    });
  };

  /**
   * Handle quantity change
   */
  const handleQuantityChange = (newQuantity) => {
    setQuantity(newQuantity);
    if (selectedSeats.length > newQuantity) {
      setSelectedSeats(selectedSeats.slice(0, newQuantity));
    }
  };

  /**
   * Navigate through seat layout images
   */
  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === seatLayoutImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? seatLayoutImages.length - 1 : prev - 1
    );
  };

  /**
   * Handle ticket purchase with Razorpay integration
   */
  const handleBuy = async () => {
    if (!ticket) return;

    try {
      setPurchasing(true);
      setError('');

      // Load Razorpay script
      const isRazorpayLoaded = await loadRazorpay('https://checkout.razorpay.com/v1/checkout.js');
      if (!isRazorpayLoaded) {
        throw new Error('Failed to load payment gateway. Please try again.');
      }

      // Create order
      const token = localStorage.getItem('token');
      const orderRes = await axios.post(
        `/create-order/${ticketId}`,
        {
          quantity: quantity,
          selected_seats: selectedSeats,
          total_amount: ticket.selling_price * quantity
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Razorpay options
      const options = {
        key: orderRes.data.key,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        order_id: orderRes.data.order_id,
        name: 'SellMyShow',
        description: `Ticket for ${ticket.event_name}`,
        image: '/vite.svg', // Your app logo
        handler: async function (response) {
          try {
            // Verify payment
            const verifyRes = await axios.post('/verify-payment', {
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              signature: response.razorpay_signature,
              ticket_id: ticketId,
              quantity: quantity,
              selected_seats: selectedSeats,
              total_amount: ticket.selling_price * quantity
            });

            if (verifyRes.data.success) {
              alert('Payment successful! Ticket purchased.');
              navigate('/my-tickets');
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: '', // You can prefill user details here
          email: '',
          contact: '',
        },
        notes: {
          ticket_id: ticketId,
          event_name: ticket.event_name,
          quantity: quantity,
          selected_seats: selectedSeats.join(', '),
          total_amount: ticket.selling_price * quantity
        },
        theme: {
          color: '#dc2626', // Your brand color
        },
        modal: {
          ondismiss: function() {
            setPurchasing(false);
          }
        }
      };

      // Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error('Purchase error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to process payment. Please try again.');
      setPurchasing(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const calculateDiscount = () => {
    if (ticket?.original_price && ticket?.selling_price) {
      const discount = ((ticket.original_price - ticket.selling_price) / ticket.original_price) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-red-500" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Error Loading Ticket</h3>
            <p className="mt-2 text-gray-600">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 btn-primary text-white px-6 py-2 rounded-lg"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const discount = calculateDiscount();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Browse Tickets
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ticket Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 text-white">
                <h1 className="text-2xl font-bold">{ticket.event_name}</h1>
                <p className="text-red-100">Ticket Purchase Details</p>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Poster */}
                  <div className="md:w-64 flex-shrink-0">
                    {ticket.poster_url ? (
                      <img 
                        src={ticket.poster_url} 
                        alt={ticket.event_name}
                        className="w-full h-80 object-cover rounded-lg shadow-md"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x400/e5e7eb/6b7280?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-80 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                        <TicketIcon className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-4">
                    {/* Venue */}
                    <div className="flex items-start">
                      <MapPinIcon className="h-5 w-5 text-red-500 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-800">Venue</h3>
                        <p className="text-gray-600">{ticket.venue}</p>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="flex items-start">
                      <CalendarDaysIcon className="h-5 w-5 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-800">Date & Time</h3>
                        <p className="text-gray-600">{formatDate(ticket.datetime)}</p>
                      </div>
                    </div>

                    {/* Tickets Available */}
                    <div className="flex items-start">
                      <TicketIcon className="h-5 w-5 text-purple-500 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-800">Tickets Available</h3>
                        <p className="text-gray-600">{ticket.count} tickets remaining</p>
                      </div>
                    </div>

                    {/* Seat Numbers */}
                    {ticket.seat_numbers && ticket.seat_numbers.length > 0 && (
                      <div className="flex items-start">
                        <UserGroupIcon className="h-5 w-5 text-indigo-500 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-gray-800">Available Seats</h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {ticket.seat_numbers.slice(0, 10).map((seat, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-md font-medium"
                              >
                                {seat}
                              </span>
                            ))}
                            {ticket.seat_numbers.length > 10 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-md">
                                +{ticket.seat_numbers.length - 10} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Pricing */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Pricing</h3>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-green-600">
                          <CurrencyRupeeIcon className="h-6 w-6 mr-1" />
                          <span className="text-2xl font-bold">{ticket.selling_price}</span>
                          <span className="text-sm ml-1">per ticket</span>
                        </div>
                        
                        {ticket.original_price && ticket.original_price !== ticket.selling_price && (
                          <>
                            <div className="flex items-center text-gray-400">
                              <CurrencyRupeeIcon className="h-4 w-4 mr-1" />
                              <span className="line-through">{ticket.original_price}</span>
                            </div>
                            {discount > 0 && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                                {discount}% OFF
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seat Layout Images */}
            {seatLayoutImages.length > 0 && (
              <div className="mt-6 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 text-white">
                  <div className="flex items-center">
                    <PhotoIcon className="h-6 w-6 mr-2" />
                    <h2 className="text-xl font-bold">Seat Layout</h2>
                  </div>
                  <p className="text-purple-100 text-sm">View the venue seating arrangement</p>
                </div>

                <div className="p-6">
                  <div className="relative">
                    {/* Image Display */}
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={seatLayoutImages[currentImageIndex]}
                        alt={`Seat Layout ${currentImageIndex + 1}`}
                        className="w-full h-96 object-contain cursor-pointer"
                        onClick={() => setShowImageModal(true)}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/800x600/e5e7eb/6b7280?text=Seat+Layout+Not+Available';
                        }}
                      />
                      
                      {/* Navigation Arrows */}
                      {seatLayoutImages.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200"
                          >
                            <ChevronLeftIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200"
                          >
                            <ChevronRightIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}

                      {/* Image Counter */}
                      {seatLayoutImages.length > 1 && (
                        <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {seatLayoutImages.length}
                        </div>
                      )}

                      {/* Click to Enlarge Hint */}
                      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                        Click to enlarge
                      </div>
                    </div>

                    {/* Thumbnail Navigation */}
                    {seatLayoutImages.length > 1 && (
                      <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
                        {seatLayoutImages.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                              index === currentImageIndex 
                                ? 'border-purple-500 shadow-lg' 
                                : 'border-gray-300 hover:border-purple-300'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`Layout ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/80x64/e5e7eb/6b7280?text=Layout';
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Seat Selection */}
            {ticket.seat_numbers && ticket.seat_numbers.length > 0 && (
              <div className="mt-6 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4 text-white">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-6 w-6 mr-2" />
                    <h2 className="text-xl font-bold">Select Your Seats</h2>
                  </div>
                  <p className="text-indigo-100 text-sm">Choose up to {Math.min(quantity, 4)} seats</p>
                </div>

                <div className="p-6">
                  {/* Quantity Selector */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Tickets
                    </label>
                    <div className="flex items-center space-x-3">
                      {[1, 2, 3, 4].map((num) => (
                        <button
                          key={num}
                          onClick={() => handleQuantityChange(num)}
                          disabled={num > ticket.count}
                          className={`px-4 py-2 rounded-lg border-2 font-medium transition-all duration-200 ${
                            quantity === num
                              ? 'border-indigo-500 bg-indigo-500 text-white'
                              : num <= ticket.count
                              ? 'border-gray-300 text-gray-700 hover:border-indigo-300'
                              : 'border-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Available Seats Grid */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Available Seats ({ticket.seat_numbers.length})
                      </span>
                      <span className="text-sm text-gray-500">
                        Selected: {selectedSeats.length}/{quantity}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2 max-h-64 overflow-y-auto">
                      {ticket.seat_numbers.map((seat, index) => (
                        <button
                          key={index}
                          onClick={() => handleSeatSelect(seat)}
                          disabled={!selectedSeats.includes(seat) && selectedSeats.length >= quantity}
                          className={`p-2 text-xs font-medium rounded-md transition-all duration-200 ${
                            selectedSeats.includes(seat)
                              ? 'bg-indigo-500 text-white shadow-md'
                              : selectedSeats.length >= quantity
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-green-100 text-green-800 hover:bg-green-200 hover:shadow-md'
                          }`}
                        >
                          {seat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selected Seats Display */}
                  {selectedSeats.length > 0 && (
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h4 className="font-medium text-indigo-800 mb-2">Selected Seats:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSeats.map((seat, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-indigo-500 text-white text-sm rounded-md font-medium"
                          >
                            {seat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Purchase Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 sticky top-8">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Purchase Summary</h3>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ticket Price</span>
                    <span className="font-medium">₹{ticket.selling_price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity</span>
                    <span className="font-medium">{quantity}</span>
                  </div>
                  {selectedSeats.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Selected Seats</span>
                      <span className="font-medium text-indigo-600">
                        {selectedSeats.join(', ')}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total Amount</span>
                      <span className="text-green-600">₹{ticket.selling_price * quantity}</span>
                    </div>
                  </div>
                </div>

                {/* Security Features */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <ShieldCheckIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-800">Secure Payment</span>
                  </div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• 256-bit SSL encryption</li>
                    <li>• Razorpay secure gateway</li>
                    <li>• Instant ticket delivery</li>
                  </ul>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                      <span className="text-sm text-red-800">{error}</span>
                    </div>
                  </div>
                )}

                {/* Purchase Button */}
                <button
                  onClick={handleBuy}
                  disabled={purchasing || (ticket.seat_numbers && selectedSeats.length === 0)}
                  className="w-full btn-primary text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {purchasing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <CreditCardIcon className="h-5 w-5 mr-2" />
                      Buy Now - ₹{ticket.selling_price * quantity}
                    </div>
                  )}
                </button>

                {ticket.seat_numbers && selectedSeats.length === 0 && (
                  <p className="text-sm text-amber-600 text-center bg-amber-50 p-2 rounded-md">
                    Please select your seats to continue
                  </p>
                )}

                <p className="text-xs text-gray-500 text-center">
                  By clicking "Buy Now", you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Image Modal */}
      {showImageModal && seatLayoutImages.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Close Button */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {/* Modal Image */}
            <img
              src={seatLayoutImages[currentImageIndex]}
              alt={`Seat Layout ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x600/e5e7eb/6b7280?text=Seat+Layout+Not+Available';
              }}
            />

            {/* Navigation in Modal */}
            {seatLayoutImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all duration-200"
                >
                  <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all duration-200"
                >
                  <ChevronRightIcon className="h-6 w-6" />
                </button>

                {/* Image Counter in Modal */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
                  {currentImageIndex + 1} of {seatLayoutImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default BuyTicket;
