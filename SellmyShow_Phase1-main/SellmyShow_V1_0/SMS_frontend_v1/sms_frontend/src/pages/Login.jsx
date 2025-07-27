import React, { useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const requestOtp = async () => {
  try {
    await axios.post('/request-otp', {
      phone_number: phoneNumber,
      source: 'login', 
    });
    setOtpSent(true);
    alert('OTP sent to your phone');
  } catch (err) {
    if (err.response?.status === 404) {
      alert('User not found. Please sign up first.');
    } else {
      alert('Failed to send OTP. Please try again.');
    }
  }
};


  const handleLogin = async () => {
    try {
      const res = await axios.post('/login', {
        phone_number: phoneNumber,
        otp,
      });
      localStorage.setItem('token', res.data.token);

      const redirectPath = localStorage.getItem('redirectAfterLogin') || '/my-tickets';
      localStorage.removeItem('redirectAfterLogin');
      navigate(redirectPath);
    } catch (err) {
      setOtp('');
      if (err.response?.status === 401 || err.response?.status === 400) {
        alert('Invalid OTP or expired. Try again.');
      } else {
        alert('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <input
        placeholder="Phone Number"
        value={phoneNumber}
        onChange={e => setPhoneNumber(e.target.value)}
      />
      <br />
      {otpSent ? (
        <>
          <input
            placeholder="Enter OTP"
            value={otp}
            onChange={e => setOtp(e.target.value)}
          />
          <br />
          <button onClick={handleLogin}>Login</button>
        </>
      ) : (
        <button onClick={requestOtp}>Send OTP</button>
      )}
      <br /><br />
      <div>
        <p>Don't have an account?</p>
        <button onClick={() => navigate('/signup')}>Sign Up</button>
      </div>
    </div>
  );
}

export default Login;
