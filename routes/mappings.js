const express = require('express');
const { 
  createMapping, 
  getMappings, 
  getPatientDoctors, 
  deleteMapping 
} = require('../controllers/mappingController');
const auth = require('../middleware/auth');
const { mappingValidation, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

router.use(auth);

router.post('/', mappingValidation, handleValidationErrors, createMapping);

router.get('/', getMappings);

router.get('/:patient_id', getPatientDoctors);

router.delete('/:id', deleteMapping);

module.exports = router;