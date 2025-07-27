import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  UserIcon, 
  TicketIcon, 
  PlusIcon, 
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/login');
  };

  const handleSellTickets = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.setItem('redirectAfterLogin', '/upload-ticket');
      navigate('/login');
    } else {
      navigate('/upload-ticket');
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const navItems = isLoggedIn ? [
    { 
      label: 'Sell Tickets', 
      action: handleSellTickets, 
      icon: PlusIcon,
      variant: 'primary'
    },
    { 
      label: 'My Tickets', 
      action: () => navigate('/my-tickets'), 
      icon: TicketIcon,
      variant: 'secondary'
    },
    { 
      label: 'Profile', 
      action: () => navigate('/edit-profile'), 
      icon: Cog6ToothIcon,
      variant: 'secondary'
    },
    { 
      label: 'Logout', 
      action: handleLogout, 
      icon: ArrowRightOnRectangleIcon,
      variant: 'secondary'
    }
  ] : [
    { 
      label: 'Sell Tickets', 
      action: handleSellTickets, 
      icon: PlusIcon,
      variant: 'primary'
    },
    { 
      label: 'Login', 
      action: handleLogin, 
      icon: ArrowLeftOnRectangleIcon,
      variant: 'secondary'
    }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={() => navigate('/')}
              className="text-2xl font-bold gradient-text hover:scale-105 transition-transform duration-200"
            >
              SellMyShow
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.action}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                    ${item.variant === 'primary' 
                      ? 'btn-primary text-white shadow-md hover:shadow-lg' 
                      : 'btn-secondary text-white hover:bg-gray-700'
                    }
                  `}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {navItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      item.action();
                      setIsMobileMenuOpen(false);
                    }}
                    className={`
                      flex items-center space-x-3 w-full px-3 py-2 rounded-md font-medium transition-all duration-200
                      ${item.variant === 'primary' 
                        ? 'btn-primary text-white' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
