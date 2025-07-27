/**
 * API Connection Test Component
 * Use this to test if your frontend can connect to the Flask backend
 */

import React, { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';

function ConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState('testing');
  const [backendResponse, setBackendResponse] = useState(null);
  const [error, setError] = useState(null);

  const testConnection = async () => {
    try {
      setConnectionStatus('testing');
      setError(null);
      
      // Test basic connection
      const response = await axios.get('/tickets');
      
      setBackendResponse(response.data);
      setConnectionStatus('connected');
      
    } catch (err) {
      console.error('Connection test failed:', err);
      setError({
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      setConnectionStatus('failed');
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Backend Connection Test</h1>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Backend URL:</span>
            <span className="text-blue-600">http://localhost:5000</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Status:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
              connectionStatus === 'failed' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {connectionStatus === 'connected' ? '✅ Connected' :
               connectionStatus === 'failed' ? '❌ Failed' :
               '🔄 Testing...'}
            </span>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-medium text-red-800 mb-2">Connection Error:</h3>
              <p className="text-red-700 text-sm mb-2">{error.message}</p>
              {error.status && (
                <p className="text-red-600 text-sm">Status: {error.status}</p>
              )}
              {error.data && (
                <pre className="text-red-600 text-xs mt-2 bg-red-100 p-2 rounded">
                  {JSON.stringify(error.data, null, 2)}
                </pre>
              )}
            </div>
          )}
          
          {backendResponse && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-800 mb-2">Backend Response:</h3>
              <pre className="text-green-700 text-sm bg-green-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(backendResponse, null, 2)}
              </pre>
            </div>
          )}
          
          <button
            onClick={testConnection}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Test Connection Again
          </button>
          
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Expected Endpoints on your Flask backend:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>GET /tickets - List all tickets</li>
              <li>GET /active-filters - Get filter options</li>
              <li>POST /request-otp - Request OTP for auth</li>
              <li>POST /login - User login</li>
              <li>POST /signup - User registration</li>
              <li>GET /my-tickets - User's selling tickets</li>
              <li>GET /bought-tickets - User's purchased tickets</li>
              <li>GET /profile - User profile</li>
              <li>PUT /edit-profile - Update profile</li>
              <li>GET /ticket/:id - Single ticket details</li>
              <li>POST /upload2 - Upload ticket image</li>
              <li>POST /create-order/:id - Create payment order</li>
              <li>POST /verify-payment - Verify payment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConnectionTest;
