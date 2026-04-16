import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import carRoutes from './routes/carRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import rentalRoutes   from './routes/rentalRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import companyRoutes from './routes/companyRoutes.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
}));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/cars', carRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/rentals', rentalRoutes);
app.use('/api/v1/company', companyRoutes);
app.use('/api/v1/stats', statsRoutes);



// Basic Route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Car Rental Application API',
    status: 'Server is running',
  });
});

export default app;