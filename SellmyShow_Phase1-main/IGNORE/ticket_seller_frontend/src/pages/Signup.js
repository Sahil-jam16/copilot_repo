import React, { useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [upiId, setUpiId] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleRequestOtp = async () => {
  try {
    await axios.post('/request-otp', {
      phone_number: phone,
      source: 'signup', 
    });
    alert('OTP sent!');
    setOtpSent(true);
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to send OTP');
  }
};


  const handleSignup = async () => {
    try {
      const res = await axios.post('/signup', {
        name,
        email,
        upiId,
        phone_number: phone,
        otp,
      });
      localStorage.setItem('token', res.data.token);
      const redirectPath = localStorage.getItem('redirectAfterLogin') || '/my-tickets';
      localStorage.removeItem('redirectAfterLogin');
      navigate(redirectPath);


    } catch (err) {
      alert(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div>
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="UPI ID" value={upiId} onChange={e => setUpiId(e.target.value)} />
      <input placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
      {!otpSent && <button onClick={handleRequestOtp}>Send OTP</button>}
      {otpSent && (
        <>
          <input placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} />
          <button onClick={handleSignup}>Signup</button>
        </>
      )}
    </div>
  );
}

export default Signup;
