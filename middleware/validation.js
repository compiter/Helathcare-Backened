const { body, validationResult } = require('express-validator');

const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const patientValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('age').isInt({ gt: 0 }).withMessage('Age must be a positive integer'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
];

const doctorValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('specialization').notEmpty().withMessage('Specialization is required'),
  body('license_number').notEmpty().withMessage('License number is required'),
  body('years_of_experience').isInt({ gt: -1 }).withMessage('Years of experience must be a positive integer'),
  body('consultation_fee').isFloat({ gt: -1 }).withMessage('Consultation fee must be a positive number'),
];

const mappingValidation = [
  body('patient_id').isInt().withMessage('Patient ID must be an integer'),
  body('doctor_id').isInt().withMessage('Doctor ID must be an integer'),
];

module.exports = {
  registerValidation,
  loginValidation,
  patientValidation,
  doctorValidation,
  mappingValidation,
  handleValidationErrors,
};
