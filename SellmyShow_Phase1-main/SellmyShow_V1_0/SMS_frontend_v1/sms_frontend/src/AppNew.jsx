import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/LoginNew';
import Signup from './pages/SignupNew';
import Home from './pages/HomeNew';
import MyTickets from './pages/MyTicketsNew';
import Admin from './pages/Admin';
import PostTicket from './pages/PostTicket';
import BuyTicket from './pages/BuyTicketNew';
import EditProfile from './pages/EditProfileNew';
import UploadTicket from './pages/UploadTicketNew';
import ConnectionTest from './components/ConnectionTest';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/test-connection" element={<ConnectionTest />} />
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
