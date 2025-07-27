# 🎫 SellMyShow - Ticket Reselling Platform

A modern, secure, and user-friendly ticket reselling platform built with React and BookMyShow-inspired design. Users can buy and sell tickets for movies, concerts, sports events, and other entertainment.

## 🌟 **Features**

### 🔐 **Authentication & Security**
- OTP-based secure login/signup
- JWT token authentication
- Session management with auto-logout
- Secure payment processing with Razorpay

### 🎨 **Modern UI/UX**
- BookMyShow-inspired color palette and design
- Fully responsive design (mobile-first approach)
- Sticky navigation with mobile hamburger menu
- Loading states, skeleton screens, and error handling
- Smooth animations and hover effects

### 🎪 **Ticket Management**
- Browse and filter tickets by city, movie, price, and date
- Advanced search and sorting capabilities
- Upload tickets with drag-and-drop interface
- Image preview and validation
- Real-time ticket availability

### 💳 **Payment Integration**
- Secure Razorpay payment gateway
- Payment verification and confirmation
- Transaction history and receipts

### 📱 **User Dashboard**
- Manage bought and sold tickets
- Profile editing with UPI ID management
- Ticket status tracking
- Sales analytics

## 🛠 **Tech Stack**

### Frontend
- **React 19.1.0** - Latest React with modern hooks
- **React Router DOM 7.7.1** - Client-side routing
- **Tailwind CSS 4.1.11** - Utility-first CSS framework
- **Heroicons** - Beautiful SVG icons
- **Axios** - HTTP client with interceptors

### Backend Integration
- **Flask REST API** - Python backend
- **JWT Authentication** - Secure token-based auth
- **Razorpay API** - Payment processing
- **File Upload** - Image handling and validation+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
