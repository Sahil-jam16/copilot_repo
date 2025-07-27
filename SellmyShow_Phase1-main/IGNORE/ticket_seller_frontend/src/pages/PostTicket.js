import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

function PostTicket() {
  const [cinemaData, setCinemaData] = useState([]);
  const [form, setForm] = useState({
    city: '',
    theatre: '',
    movie: '',
    show_time: '',
    ticket_type: '',
    selling_price: '',
    count: 0,
    seat_numbers: [],
    contact_info: '',
    ticket_url: '',
  });
  const [originalPrice, setOriginalPrice] = useState(0);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    axios.get('/cinema-data').then(res => setCinemaData(res.data));
  }, []);

  const handleChange = (field, value) => {
    if (field === 'count') {
      const count = parseInt(value) || 0;
      const seats = [...form.seat_numbers];
      while (seats.length < count) seats.push('');
      while (seats.length > count) seats.pop();
      setForm(prev => ({ ...prev, count, seat_numbers: seats }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }

    if (['city', 'theatre', 'movie', 'show_time', 'ticket_type'].includes(field)) {
      const city = field === 'city' ? value : form.city;
      const theatre = field === 'theatre' ? value : form.theatre;
      const movie = field === 'movie' ? value : form.movie;
      const showTime = field === 'show_time' ? value : form.show_time;
      const type = field === 'ticket_type' ? value : form.ticket_type;

      const selected = cinemaData.find(c => c.city === city)
        ?.theatres.find(t => t.name === theatre)
        ?.movies.find(m => m.name === movie)
        ?.show_timings.find(s => s.time === showTime);

      const ticketPrice = selected?.price?.[type] || 0;
      setOriginalPrice(ticketPrice);
    }
  };

  const handleSeatChange = (index, value) => {
    const updated = [...form.seat_numbers];
    updated[index] = value;
    setForm(prev => ({ ...prev, seat_numbers: updated }));
  };

  const handleFileUpload = async () => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    const res = await axios.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data.file_url;
  };

  const handleSubmit = async () => {
    const {
      city, theatre, movie, show_time, ticket_type,
      selling_price, count, seat_numbers
    } = form;

    if (!city || !theatre || !movie || !show_time || !ticket_type || !selling_price) {
      return alert('Please fill all fields');
    }

    if (count <= 0){
      return alert('Ticket count should be minimum 1')
    }

    if (parseInt(selling_price) > originalPrice) {
      return alert('Selling price cannot exceed original price');
    }

    if (seat_numbers.length !== parseInt(count) || seat_numbers.includes('')) {
      return alert('Please enter all seat numbers');
    }

    const token = localStorage.getItem('token');
    if (!token) return alert('Login required');

    let uploadedUrl = form.ticket_url;
    if (file) uploadedUrl = await handleFileUpload();

    const payload = {
      city:city,
      event_name: movie,
      venue: theatre,
      datetime: `${city} ${show_time}`,
      original_price: originalPrice,
      selling_price: parseInt(selling_price),
      contact_info: form.contact_info,
      ticket_url: uploadedUrl,
      count: parseInt(count),
      seat_numbers
    };

    try {
      await axios.post('/tickets', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Ticket posted successfully!');
      navigate('/my-tickets');
    } catch (err) {
      alert('Failed to post ticket');
    }
  };

  const extractOptions = (type) => {
    const result = new Set();
    cinemaData.forEach(c => {
      if (type === 'city') result.add(c.city);
      c.theatres.forEach(t => {
        if (type === 'theatre' && (!form.city || c.city === form.city)) result.add(t.name);
        t.movies.forEach(m => {
          if (type === 'movie' && (!form.theatre || t.name === form.theatre)) result.add(m.name);
          m.show_timings.forEach(s => {
            if (type === 'show_time' && (!form.movie || m.name === form.movie)) result.add(s.time);
            if (type === 'ticket_type' && s.time === form.show_time) {
              Object.keys(s.price).forEach(p => result.add(p));
            }
          });
        });
      });
    });
    return [...result];
  };

  return (
    <div>
      <h2>Post Ticket</h2>

      <select value={form.city} onChange={e => handleChange('city', e.target.value)}>
        <option value="">Select City</option>
        {extractOptions('city').map((c, i) => <option key={i}>{c}</option>)}
      </select>

      <select value={form.theatre} onChange={e => handleChange('theatre', e.target.value)}>
        <option value="">Select Theatre</option>
        {extractOptions('theatre').map((t, i) => <option key={i}>{t}</option>)}
      </select>

      <select value={form.movie} onChange={e => handleChange('movie', e.target.value)}>
        <option value="">Select Movie</option>
        {extractOptions('movie').map((m, i) => <option key={i}>{m}</option>)}
      </select>

      <select value={form.show_time} onChange={e => handleChange('show_time', e.target.value)}>
        <option value="">Select Show Time</option>
        {extractOptions('show_time').map((s, i) => <option key={i}>{s}</option>)}
      </select>

      <select value={form.ticket_type} onChange={e => handleChange('ticket_type', e.target.value)}>
        <option value="">Select Ticket Type</option>
        {extractOptions('ticket_type').map((t, i) => <option key={i}>{t}</option>)}
      </select>

      {originalPrice > 0 && <p>Original Price: ₹{originalPrice}</p>}

      <input
        type="number"
        placeholder="Selling Price"
        value={form.selling_price}
        onChange={e => handleChange('selling_price', e.target.value)}
      />

      <input
        type="number"
        placeholder="Ticket Count"
        value={form.count}
        onChange={e => handleChange('count', e.target.value)}
        min={1}
      />

      {form.seat_numbers.map((seat, i) => (
        <input
          key={i}
          placeholder={`Seat #${i + 1}`}
          value={seat}
          onChange={e => handleSeatChange(i, e.target.value)}
        />
      ))}

      <input
        name="contact_info"
        placeholder="Contact Info (e.g., WhatsApp link)"
        value={form.contact_info}
        onChange={e => handleChange('contact_info', e.target.value)}
      />

      <input
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={e => setFile(e.target.files[0])}
      />

      <button onClick={handleSubmit}>Post Ticket</button>
    </div>
  );
}

export default PostTicket;
