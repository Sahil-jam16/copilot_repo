import React, { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { LoadingSpinner } from '../components/Loading';
import { 
  UserIcon, 
  EnvelopeIcon, 
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

function EditProfile() {
  const [formData, setFormData] = useState({
    name: '',
    upiId: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Login required');
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get('/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData({
          name: res.data.name || '',
          upiId: res.data.upiId || '',
          email: res.data.email || ''
        });
      } catch (err) {
        setMessage({
          text: err.response?.data?.error || 'Failed to fetch profile',
          type: 'error'
        });
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear message when user starts typing
    if (message.text) {
      setMessage({ text: '', type: '' });
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setMessage({ text: 'Name is required', type: 'error' });
      return false;
    }
    if (!formData.upiId.trim()) {
      setMessage({ text: 'UPI ID is required', type: 'error' });
      return false;
    }
    if (!/^[\w.-]+@[\w.-]+$/.test(formData.upiId)) {
      setMessage({ text: 'Please enter a valid UPI ID (e.g., user@paytm)', type: 'error' });
      return false;
    }
    return true;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Login required');
      navigate('/login');
      return;
    }

    try {
      setSaving(true);
      const res = await axios.put(
        '/edit-profile',
        { name: formData.name, upiId: formData.upiId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage({
        text: res.data.message || 'Profile updated successfully!',
        type: 'success'
      });
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate('/my-tickets');
      }, 2000);
      
    } catch (err) {
      setMessage({
        text: err.response?.data?.error || 'Update failed. Please try again.',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/my-tickets')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to My Tickets
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4">
            <PencilIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Edit Profile</h1>
          <p className="text-gray-600">Update your account information</p>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Profile Information</h2>
            <p className="text-sm text-gray-600">Keep your information up to date for secure transactions</p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleUpdate} className="p-6 space-y-6">
            {/* Email Field (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Email cannot be changed for security reasons
              </p>
            </div>

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                  required
                />
              </div>
            </div>

            {/* UPI ID Field */}
            <div>
              <label htmlFor="upi" className="block text-sm font-medium text-gray-700 mb-2">
                UPI ID *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCardIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="upi"
                  type="text"
                  placeholder="your-upi@paytm"
                  value={formData.upiId}
                  onChange={(e) => handleInputChange('upiId', e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                  required
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                This UPI ID will be used to receive payments when you sell tickets
              </p>
            </div>

            {/* Message Display */}
            {message.text && (
              <div className={`flex items-center p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
                )}
                <p className={`text-sm font-medium ${
                  message.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {message.text}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 btn-primary text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Updating Profile...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Update Profile
                  </div>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/my-tickets')}
                className="flex-1 sm:flex-none btn-secondary text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Important Information
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Your UPI ID is used for receiving payments when selling tickets</li>
                  <li>Ensure your UPI ID is active and correct to avoid payment issues</li>
                  <li>Contact support if you need to change your email address</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EditProfile;
