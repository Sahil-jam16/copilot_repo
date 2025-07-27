/**
 * UploadTicket Component
 * 
 * Modern ticket upload page with drag-and-drop file upload
 * Features:
 * - Drag and drop file upload
 * - Image preview
 * - Form validation
 * - Progress tracking
 * - Responsive design
 * - BookMyShow-inspired UI
 * 
 * @author SellMyShow Team
 * @version 2.0
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import { 
  CloudArrowUpIcon, 
  PhotoIcon, 
  CurrencyRupeeIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

function UploadTicket() {
  const [file, setFile] = useState(null);
  const [sellingPrice, setSellingPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Accepted file types
  const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  /**
   * Validate uploaded file
   */
  const validateFile = (file) => {
    if (!file) {
      return 'Please select a file';
    }

    if (!acceptedTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, or WebP)';
    }

    if (file.size > maxFileSize) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  /**
   * Handle file selection
   */
  const handleFileChange = (selectedFile) => {
    const error = validateFile(selectedFile);
    if (error) {
      setMessage({ text: error, type: 'error' });
      return;
    }

    setFile(selectedFile);
    setMessage({ text: '', type: '' });

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  /**
   * Handle drag events
   */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  /**
   * Handle drop event
   */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  /**
   * Handle file input change
   */
  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  /**
   * Remove selected file
   */
  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setMessage({ text: '', type: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    if (!file) {
      setMessage({ text: 'Please select a ticket image', type: 'error' });
      return false;
    }

    if (!sellingPrice || parseFloat(sellingPrice) <= 0) {
      setMessage({ text: 'Please enter a valid selling price', type: 'error' });
      return false;
    }

    if (parseFloat(sellingPrice) > 100000) {
      setMessage({ text: 'Selling price cannot exceed ₹1,00,000', type: 'error' });
      return false;
    }

    return true;
  };

  /**
   * Handle form submission
   */
  const handleUpload = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('selling_price', sellingPrice);

    try {
      await axios.post('/upload2', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      setMessage({ 
        text: 'Ticket uploaded successfully! Redirecting to your tickets...', 
        type: 'success' 
      });

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/my-tickets');
      }, 2000);

    } catch (err) {
      console.error('Upload error:', err);
      setMessage({ 
        text: err.response?.data?.error || 'Failed to upload ticket. Please try again.', 
        type: 'error' 
      });
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
            <CloudArrowUpIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Upload Ticket</h1>
          <p className="text-gray-600">Sell your tickets to fellow event enthusiasts</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            {/* File Upload Area */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Ticket Image</h2>
                <p className="text-sm text-gray-600">Upload a clear image of your ticket</p>
              </div>

              <div className="p-6">
                {!file ? (
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                      dragActive 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      Drop your ticket image here
                    </h3>
                    <p className="text-gray-600 mb-4">
                      or click to browse files
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-primary text-white px-6 py-2 rounded-lg font-medium"
                    >
                      Choose File
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleInputChange}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-500 mt-4">
                      Accepted formats: JPEG, PNG, WebP (Max 5MB)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* File Preview */}
                    <div className="relative">
                      <img
                        src={preview}
                        alt="Ticket preview"
                        className="w-full h-64 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={removeFile}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>

                    {/* File Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5 text-gray-500 mr-3" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{file.name}</p>
                          <p className="text-sm text-gray-600">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Pricing</h2>
                <p className="text-sm text-gray-600">Set your selling price</p>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                      Selling Price *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CurrencyRupeeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="price"
                        type="number"
                        placeholder="Enter selling price"
                        value={sellingPrice}
                        onChange={(e) => {
                          setSellingPrice(e.target.value);
                          setMessage({ text: '', type: '' });
                        }}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                        min="1"
                        max="100000"
                        step="1"
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Set a competitive price to attract buyers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            {/* Upload Guidelines */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
                <h2 className="text-lg font-semibold text-blue-800">Upload Guidelines</h2>
              </div>

              <div className="p-6">
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Upload a clear, high-quality image of your ticket</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Ensure all text and details are clearly visible</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Avoid blurry or cropped images</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Set a fair and competitive price</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Only upload tickets you own</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Message Display */}
            {message.text && (
              <div className={`rounded-lg p-4 ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center">
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
              </div>
            )}

            {/* Upload Progress */}
            {loading && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="text-center">
                  <CloudArrowUpIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="font-medium text-gray-800 mb-2">Uploading ticket...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">{uploadProgress}%</p>
                </div>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={loading || !file || !sellingPrice}
              className="w-full btn-primary text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Uploading...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                  Upload Ticket
                </div>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default UploadTicket;
