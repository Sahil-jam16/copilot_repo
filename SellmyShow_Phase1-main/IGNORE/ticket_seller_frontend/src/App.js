import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import MyTickets from './pages/MyTickets';
import Admin from './pages/Admin';
import PostTicket from './pages/PostTicket';
import BuyTicket from './pages/BuyTicket';
import EditProfile from './pages/EditProfile';
import UploadTicket from './pages/UploadTicket';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/my-tickets" element={<MyTickets />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/post-ticket" element={<PostTicket />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/buy/:ticketId" element={<BuyTicket />} />
        <Route path="/upload-ticket" element={<UploadTicket />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
