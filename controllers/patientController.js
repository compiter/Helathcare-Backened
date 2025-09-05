const pool = require('../config/database');


const createPatient = async (req, res) => {
  try {
    const { name, email, phone, date_of_birth, gender, address, medical_history } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      `INSERT INTO patients (name, email, phone, date_of_birth, gender, address, medical_history, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, name, email, phone, date_of_birth, gender, address, medical_history, created_at`,
      [name, email, phone, date_of_birth, gender, address, medical_history, userId]
    );

    const patient = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: { patient }
    });
  } catch (error) {
    if (error.code === '23505') { 
      return res.status(400).json({
        success: false,
        message: 'Patient with this email already exists'
      });
    }
    
    console.error('Create patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


const getPatients = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM patients WHERE created_by = $1',
      [userId]
    );
    const totalCount = parseInt(countResult.rows[0].count);

    
    const result = await pool.query(
      `SELECT id, name, email, phone, date_of_birth, gender, address, medical_history, created_at, updated_at
       FROM patients 
       WHERE created_by = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({
      success: true,
      message: 'Patients retrieved successfully',
      data: {
        patients: result.rows,
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
    console.error('Get patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


const getPatient = async (req, res) => {
  try {
    const patientId = req.params.id;
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT id, name, email, phone, date_of_birth, gender, address, medical_history, created_at, updated_at
       FROM patients 
       WHERE id = $1 AND created_by = $2`,
      [patientId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      message: 'Patient retrieved successfully',
      data: { patient: result.rows[0] }
    });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


const updatePatient = async (req, res) => {
  try {
    const patientId = req.params.id;
    const userId = req.user.id;
    const { name, email, phone, date_of_birth, gender, address, medical_history } = req.body;

    
    const existingPatient = await pool.query(
      'SELECT id FROM patients WHERE id = $1 AND created_by = $2',
      [patientId, userId]
    );

    if (existingPatient.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const result = await pool.query(
      `UPDATE patients 
       SET name = $1, email = $2, phone = $3, date_of_birth = $4, gender = $5, address = $6, medical_history = $7
       WHERE id = $8 AND created_by = $9
       RETURNING id, name, email, phone, date_of_birth, gender, address, medical_history, updated_at`,
      [name, email, phone, date_of_birth, gender, address, medical_history, patientId, userId]
    );

    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: { patient: result.rows[0] }
    });
  } catch (error) {
    if (error.code === '23505') { 
      return res.status(400).json({
        success: false,
        message: 'Patient with this email already exists'
      });
    }
    
    console.error('Update patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


const deletePatient = async (req, res) => {
  try {
    const patientId = req.params.id;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM patients WHERE id = $1 AND created_by = $2 RETURNING id',
      [patientId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createPatient,
  getPatients,
  getPatient,
  updatePatient,
  deletePatient
};