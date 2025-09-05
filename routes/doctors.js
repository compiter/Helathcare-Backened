const express = require('express');
const { 
  createDoctor, 
  getDoctors, 
  getDoctor, 
  updateDoctor, 
  deleteDoctor 
} = require('../controllers/doctorController');
const auth = require('../middleware/auth');
const { doctorValidation, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();


router.use(auth);

router.post('/', doctorValidation, handleValidationErrors, createDoctor);

router.get('/', getDoctors);

router.get('/:id', getDoctor);

router.put('/:id', doctorValidation, handleValidationErrors, updateDoctor);

router.delete('/:id', deleteDoctor);

module.exports = router;