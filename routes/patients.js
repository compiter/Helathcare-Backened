const express = require('express');
const { 
  createPatient, 
  getPatients, 
  getPatient, 
  updatePatient, 
  deletePatient 
} = require('../controllers/patientController');
const auth = require('../middleware/auth');
const { patientValidation, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

router.use(auth);

router.post('/', patientValidation, handleValidationErrors, createPatient);

router.get('/', getPatients);

router.get('/:id', getPatient);

router.put('/:id', patientValidation, handleValidationErrors, updatePatient);

router.delete('/:id', deletePatient);

module.exports = router;