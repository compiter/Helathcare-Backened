const express = require('express');
const { register, login } = require('../controllers/authController');
const { registerValidation, loginValidation, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();


router.post('/register', registerValidation, handleValidationErrors, register);


router.post('/login', loginValidation, handleValidationErrors, login);

module.exports = router;