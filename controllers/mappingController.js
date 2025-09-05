const pool = require('../config/database');


const createMapping = async (req, res) => {
  try {
    const { patient_id, doctor_id, notes } = req.body;
    const userId = req.user.id;

    
    const patientCheck = await pool.query(
      'SELECT id FROM patients WHERE id = $1 AND created_by = $2',
      [patient_id, userId]
    );

    if (patientCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found or you do not have access to this patient'
      });
    }

    
    const doctorCheck = await pool.query(
      'SELECT id, name, specialization FROM doctors WHERE id = $1',
      [doctor_id]
    );

    if (doctorCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    
    const existingMapping = await pool.query(
      'SELECT id FROM patient_doctor_mappings WHERE patient_id = $1 AND doctor_id = $2 AND is_active = true',
      [patient_id, doctor_id]
    );

    if (existingMapping.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This doctor is already assigned to this patient'
      });
    }

    
    const result = await pool.query(
      `INSERT INTO patient_doctor_mappings (patient_id, doctor_id, notes) 
       VALUES ($1, $2, $3) 
       RETURNING id, patient_id, doctor_id, assigned_date, notes, is_active`,
      [patient_id, doctor_id, notes]
    );

    
    const mappingDetails = await pool.query(
      `SELECT 
         pdm.id, pdm.patient_id, pdm.doctor_id, pdm.assigned_date, pdm.notes, pdm.is_active,
         p.name as patient_name,
         d.name as doctor_name, d.specialization
       FROM patient_doctor_mappings pdm
       JOIN patients p ON pdm.patient_id = p.id
       JOIN doctors d ON pdm.doctor_id = d.id
       WHERE pdm.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json({
      success: true,
      message: 'Doctor assigned to patient successfully',
      data: { mapping: mappingDetails.rows[0] }
    });
  } catch (error) {
    if (error.code === '23503') { 
      return res.status(400).json({
        success: false,
        message: 'Invalid patient or doctor ID'
      });
    }
    
    console.error('Create mapping error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


const getMappings = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    
    const countResult = await pool.query(
      `SELECT COUNT(*) 
       FROM patient_doctor_mappings pdm
       JOIN patients p ON pdm.patient_id = p.id
       WHERE p.created_by = $1 AND pdm.is_active = true`,
      [userId]
    );
    const totalCount = parseInt(countResult.rows[0].count);

    
    const result = await pool.query(
      `SELECT 
         pdm.id, pdm.patient_id, pdm.doctor_id, pdm.assigned_date, pdm.notes, pdm.is_active,
         p.name as patient_name, p.email as patient_email,
         d.name as doctor_name, d.specialization, d.consultation_fee
       FROM patient_doctor_mappings pdm
       JOIN patients p ON pdm.patient_id = p.id
       JOIN doctors d ON pdm.doctor_id = d.id
       WHERE p.created_by = $1 AND pdm.is_active = true
       ORDER BY pdm.assigned_date DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({
      success: true,
      message: 'Patient-doctor mappings retrieved successfully',
      data: {
        mappings: result.rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get mappings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


const getPatientDoctors = async (req, res) => {
  try {
    const patientId = req.params.patient_id;
    const userId = req.user.id;

    
    const patientCheck = await pool.query(
      'SELECT id, name FROM patients WHERE id = $1 AND created_by = $2',
      [patientId, userId]
    );

    if (patientCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found or you do not have access to this patient'
      });
    }

    const result = await pool.query(
      `SELECT 
         pdm.id as mapping_id, pdm.assigned_date, pdm.notes,
         d.id, d.name, d.email, d.phone, d.specialization, d.consultation_fee
       FROM patient_doctor_mappings pdm
       JOIN doctors d ON pdm.doctor_id = d.id
       WHERE pdm.patient_id = $1 AND pdm.is_active = true
       ORDER BY pdm.assigned_date DESC`,
      [patientId]
    );

    res.json({
      success: true,
      message: 'Patient doctors retrieved successfully',
      data: {
        patient: patientCheck.rows[0],
        doctors: result.rows
      }
    });
  } catch (error) {
    console.error('Get patient doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


const deleteMapping = async (req, res) => {
  try {
    const mappingId = req.params.id;
    const userId = req.user.id;

    
    const mappingCheck = await pool.query(
      `SELECT pdm.id 
       FROM patient_doctor_mappings pdm
       JOIN patients p ON pdm.patient_id = p.id
       WHERE pdm.id = $1 AND p.created_by = $2 AND pdm.is_active = true`,
      [mappingId, userId]
    );

    if (mappingCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mapping not found or you do not have access to this mapping'
      });
    }

    
    await pool.query(
      'UPDATE patient_doctor_mappings SET is_active = false WHERE id = $1',
      [mappingId]
    );

    res.json({
      success: true,
      message: 'Doctor removed from patient successfully'
    });
  } catch (error) {
    console.error('Delete mapping error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createMapping,
  getMappings,
  getPatientDoctors,
  deleteMapping
};