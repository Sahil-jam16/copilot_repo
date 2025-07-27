import React, { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

function EditProfile() {
  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return alert('Login required');

      try {
        const res = await axios.get('/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setName(res.data.name || '');
        setUpiId(res.data.upiId || '');
        setEmail(res.data.email || '');
      } catch (err) {
        setMessage(err.response?.data?.error || 'Failed to fetch profile');
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return alert('Login required');

    try {
      const res = await axios.put(
        '/edit-profile',
        { name, upiId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message || 'Profile updated!');
      navigate('/');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Update failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
      <form onSubmit={handleUpdate}>
        <label className="block mb-2">Email (read-only)</label>
        <input
          type="text"
          value={email}
          disabled
          className="w-full p-2 border mb-4 bg-gray-100 cursor-not-allowed"
        />

        <label className="block mb-2">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border mb-4"
        />

        <label className="block mb-2">UPI ID</label>
        <input
          type="text"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          className="w-full p-2 border mb-4"
        />

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          Update Profile
        </button>
      </form>
      {message && <p className="mt-4 text-red-600 text-center">{message}</p>}
    </div>
  );
}

export default EditProfile;
