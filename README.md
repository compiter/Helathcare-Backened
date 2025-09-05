# Healthcare Backend API

A comprehensive healthcare backend system built with Node.js, Express.js, PostgreSQL, and JWT authentication. This system allows users to register, log in, and manage patient and doctor records securely.

## Features

- **User Authentication**: JWT-based registration and login system
- **Patient Management**: CRUD operations for patient records
- **Doctor Management**: CRUD operations for doctor records
- **Patient-Doctor Mapping**: Assign doctors to patients
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Database**: PostgreSQL with proper indexing and relationships
- **Error Handling**: Comprehensive error handling and validation
- **Environment Variables**: Secure configuration management

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## Installation

### Step 1: Clone the Repository
```bash
git clone https://github.com/Abhinaba35/Healthcare-Backend-API
cd healthcare-backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Database Setup
1. Create a PostgreSQL database:
```sql
CREATE DATABASE healthcare_db;
```

2. Run the database schema:
```bash
psql -U your_username -d healthcare_db -f database/schema.sql
```

### Step 4: Environment Configuration
1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update the .env file with your configuration:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=healthcare_db
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
JWT_EXPIRE=24h

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Step 5: Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Documentation

### Authentication Endpoints
- POST /api/auth/register
- POST /api/auth/login

### Patient Management Endpoints
- POST /api/patients – Create Patient
- GET /api/patients – Get All Patients
- GET /api/patients/:id – Get Patient by ID
- PUT /api/patients/:id – Update Patient
- DELETE /api/patients/:id – Delete Patient

### Doctor Management Endpoints
- POST /api/doctors – Create Doctor
- GET /api/doctors – Get All Doctors
- GET /api/doctors/:id – Get Doctor by ID
- PUT /api/doctors/:id – Update Doctor
- DELETE /api/doctors/:id – Delete Doctor

### Patient-Doctor Mapping Endpoints
- POST /api/mappings – Assign Doctor to Patient
- GET /api/mappings – Get All Mappings
- GET /api/mappings/:patient_id – Get Doctors for a Patient
- DELETE /api/mappings/:id – Remove Doctor from Patient

## Project Structure

```
healthcare-backend/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── patientController.js # Patient management logic
│   ├── doctorController.js  # Doctor management logic
│   └── mappingController.js # Patient-doctor mapping logic
├── middleware/
│   ├── auth.js             # JWT authentication middleware
│   ├── validation.js       # Input validation middleware
│   └── errorHandler.js     # Global error handling
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── patients.js         # Patient routes
│   ├── doctors.js          # Doctor routes
│   └── mappings.js         # Mapping routes
├── database/
│   └── schema.sql          # Database schema
├── .env.example            # Environment variables example
├── package.json            # Dependencies and scripts
├── server.js               # Main application file
└── README.md              # Project documentation
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive request validation
- **CORS**: Cross-origin request handling
- **Helmet**: Security headers
- **SQL Injection Protection**: Parameterized queries

## Testing with Postman

1. Import the collection or create requests manually
2. Set up environment variables in Postman:
   - `base_url`: http://localhost:3000
   - `token`: (set after login)
3. Test flow:
   - Register a user
   - Login and save the token
   - Create patients and doctors
   - Create mappings between patients and doctors

## Database Schema

### Users Table
- `id` (Primary Key)
- `name`, `email`, `password`
- `created_at`, `updated_at`

### Patients Table
- `id` (Primary Key)
- `name`, `email`, `phone`, `date_of_birth`, `gender`
- `address`, `medical_history`
- `created_by` (Foreign Key to Users)

### Doctors Table
- `id` (Primary Key)
- `name`, `email`, `phone`, `specialization`
- `license_number`, `years_of_experience`, `consultation_fee`
- `created_by` (Foreign Key to Users)

### Patient-Doctor Mappings Table
- `id` (Primary Key)
- `patient_id` (Foreign Key)
- `doctor_id` (Foreign Key)
- `assigned_date`, `notes`, `is_active`

## Deployment

### Environment Variables for Production
```env
NODE_ENV=production
DB_HOST=your_production_db_host
JWT_SECRET=your_super_secure_production_secret
```

## License

This project is licensed under the MIT License.

## Support

For support, email dasjayanti208@gmail.com or create an issue in the repository.