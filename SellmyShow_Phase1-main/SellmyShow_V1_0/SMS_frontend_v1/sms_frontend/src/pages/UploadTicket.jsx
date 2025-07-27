import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';

function UploadTicket() {
  const [file, setFile] = useState(null);
  const [sellingPrice, setSellingPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !sellingPrice) {
      return alert('Please select a file and enter selling price');
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('selling_price', sellingPrice);

    try {
      await axios.post('/upload2', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Ticket uploaded successfully');
      navigate('/my-tickets');
    } catch (err) {
      console.error(err);
      alert('Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Upload Ticket</h2>
      <input type="file" accept=".jpg,.jpeg,.png" onChange={handleFileChange} />
      <br />
      <input
        type="number"
        placeholder="Selling Price"
        value={sellingPrice}
        onChange={(e) => setSellingPrice(e.target.value)}
      />
      <br />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}

export default UploadTicket;
