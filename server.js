const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();


const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const doctorRoutes = require('./routes/doctors');
const mappingRoutes = require('./routes/mappings');


const { errorHandler, notFound } = require('./middleware/errorHandler');


require('./config/database');

const app = express();


app.use(helmet());


const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, 
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, 
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api/', limiter);


const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'], 
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Healthcare API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});


app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/mappings', mappingRoutes);


app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Healthcare Backend API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      patients: {
        create: 'POST /api/patients',
        getAll: 'GET /api/patients',
        getById: 'GET /api/patients/:id',
        update: 'PUT /api/patients/:id',
        delete: 'DELETE /api/patients/:id'
      },
      doctors: {
        create: 'POST /api/doctors',
        getAll: 'GET /api/doctors',
        getById: 'GET /api/doctors/:id',
        update: 'PUT /api/doctors/:id',
        delete: 'DELETE /api/doctors/:id'
      },
      mappings: {
        create: 'POST /api/mappings',
        getAll: 'GET /api/mappings',
        getByPatient: 'GET /api/mappings/:patient_id',
        delete: 'DELETE /api/mappings/:id'
      }
    }
  });
});


app.use(notFound);


app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Healthcare API Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API Documentation available at http://localhost:${PORT}`);
});
