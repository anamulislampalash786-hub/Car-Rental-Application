# Car Rental Management System

## Overview
The Car Rental Management System is a comprehensive full-stack web application designed to manage car rental operations across multiple locations. Built with modern technologies, it provides a role-based platform for customers, managers, and administrators to handle vehicle rentals, returns, and business operations efficiently.

## Tech Stack

### Frontend
- **React 19** - Modern JavaScript library for building user interfaces
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Modern UI components built on Radix UI
- **React Router** - Declarative routing for React
- **React Query** - Powerful data synchronization for React
- **Zustand** - Small, fast state management
- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation
- **Recharts** - Composable charting library
- **Lucide React** - Beautiful & consistent icon toolkit

### Backend
- **Node.js** - JavaScript runtime built on Chrome's V8 engine
- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - NoSQL document database
- **Mongoose** - Elegant MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Passport.js** - Authentication middleware with Google OAuth 2.0
- **Multer** - Middleware for handling file uploads
- **ImageKit** - Image optimization and delivery
- **Morgan** - HTTP request logger middleware

## Features

### 🔐 Authentication & Authorization
- User registration and login
- Google OAuth 2.0 integration
- Role-based access control (User, Manager, Boss, Admin)
- JWT token-based authentication
- Secure password hashing
- Session management

### 👥 User Management
- User profile management
- Role assignment and management
- User authentication and authorization
- Profile picture upload and management

### 🚗 Car Management
- Add, update, and delete vehicles
- Car inventory management
- Vehicle categorization and specifications
- Image upload for cars
- Car availability tracking
- Maintenance and status management

### 📍 Location Management
- Multi-location support
- Add, update, and delete rental locations
- Location-specific inventory management
- Branch performance tracking
- Geographic expansion capabilities

### 🚗 Rental Management
- Vehicle rental booking system
- Rental duration and pricing management
- Customer rental history
- Rental extensions and modifications
- Return processing
- Invoice generation and receipts

### 🏢 Company Management
- Company profile and settings
- Business information management
- Company-wide statistics and analytics

### 📊 Statistics & Analytics
- Comprehensive reporting system
- Revenue and performance metrics
- Location-wise analytics
- User activity monitoring
- Business intelligence dashboards

### 🎨 User Interface
- Modern, responsive design
- Dark/light theme support
- Mobile-first approach
- Intuitive navigation
- Real-time notifications
- Interactive charts and graphs

## Project Structure

```
Car-Rental-Application/
├── Frontend/                 # React application
│   ├── src/
│   │   ├── api/             # API service functions
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   ├── pages/           # Page components by role
│   │   │   ├── admin/       # Admin-specific pages
│   │   │   ├── auth/        # Authentication pages
│   │   │   ├── boss/        # Boss/Director pages
│   │   │   ├── manager/     # Manager pages
│   │   │   ├── public/      # Public pages
│   │   │   └── user/        # Regular user pages
│   │   ├── store/           # Zustand state management
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
├── Backend/                  # Node.js/Express server
│   ├── src/
│   │   ├── config/          # Database and app configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   └── seed/            # Database seeding
│   ├── server.js            # Main server file
│   └── package.json
├── .gitignore               # Git ignore rules
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Car-Rental-Application
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   # Create .env file with required environment variables
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../Frontend
   npm install
   # Create .env file with required environment variables
   npm run dev
   ```

4. **Database Seeding** (Optional)
   ```bash
   cd Backend
   npm run seed
   ```

### Environment Variables

Create `.env` files in both Frontend and Backend directories with the following variables:

**Backend/.env:**
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

**Frontend/.env:**
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth login
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Cars
- `GET /api/cars` - Get all cars
- `POST /api/cars` - Add new car
- `PUT /api/cars/:id` - Update car
- `DELETE /api/cars/:id` - Delete car

### Locations
- `GET /api/locations` - Get all locations
- `POST /api/locations` - Add new location
- `PUT /api/locations/:id` - Update location
- `DELETE /api/locations/:id` - Delete location

### Rentals
- `GET /api/rentals` - Get all rentals
- `POST /api/rentals` - Create new rental
- `PUT /api/rentals/:id` - Update rental
- `DELETE /api/rentals/:id` - Delete rental

### Statistics
- `GET /api/stats/dashboard` - Get dashboard statistics
- `GET /api/stats/revenue` - Get revenue statistics
- `GET /api/stats/locations` - Get location statistics

## User Roles & Permissions

### 👤 User (Customer)
- Browse and search cars
- Make rental bookings
- View rental history
- Manage profile

### 👨‍💼 Manager
- All user permissions
- Manage cars at assigned locations
- Process rentals and returns
- View location-specific reports
- Manage customer inquiries

### 👔 Boss/Director
- All manager permissions
- Access to all locations
- Financial reports and analytics
- Strategic decision making
- Approve major operations

### 🔐 Admin
- Full system access
- User management and role assignment
- System configuration
- Database maintenance
- Comprehensive reporting
