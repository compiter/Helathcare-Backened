const pool = require('../config/database');

// Add new doctor
const createDoctor = async (req, res) => {
  try {
    const { name, email, phone, specialization, license_number, years_of_experience, consultation_fee } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      `INSERT INTO doctors (name, email, phone, specialization, license_number, years_of_experience, consultation_fee, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, name, email, phone, specialization, license_number, years_of_experience, consultation_fee, created_at`,
      [name, email, phone, specialization, license_number, years_of_experience, consultation_fee, userId]
    );

    const doctor = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: { doctor }
    });
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({
        success: false,
        message: 'Doctor with this email or license number already exists'
      });
    }
    
    console.error('Update doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete doctor (only creator can delete)
const deleteDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM doctors WHERE id = $1 AND created_by = $2 RETURNING id',
      [doctorId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or you do not have permission to delete this doctor'
      });
    }

    res.json({
      success: true,
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all doctors (public endpoint but requires auth)
const getDoctors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const specialization = req.query.specialization;

    let query = `SELECT id, name, email, phone, specialization, license_number, years_of_experience, consultation_fee, created_at, updated_at
                 FROM doctors`;
    let countQuery = 'SELECT COUNT(*) FROM doctors';
    let queryParams = [];
    let countParams = [];

    
    if (specialization) {
      query += ' WHERE LOWER(specialization) LIKE LOWER($1)';
      countQuery += ' WHERE LOWER(specialization) LIKE LOWER($1)';
      queryParams.push(`%${specialization}%`);
      countParams.push(`%${specialization}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
    queryParams.push(limit, offset);

    
    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    
    const result = await pool.query(query, queryParams);

    res.json({
      success: true,
      message: 'Doctors retrieved successfully',
      data: {
        doctors: result.rows,
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
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


const getDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;

    const result = await pool.query(
      `SELECT id, name, email, phone, specialization, license_number, years_of_experience, consultation_fee, created_at, updated_at
       FROM doctors 
       WHERE id = $1`,
      [doctorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      message: 'Doctor retrieved successfully',
      data: { doctor: result.rows[0] }
    });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


const updateDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const userId = req.user.id;
    const { name, email, phone, specialization, license_number, years_of_experience, consultation_fee } = req.body;


    const existingDoctor = await pool.query(
      'SELECT id FROM doctors WHERE id = $1 AND created_by = $2',
      [doctorId, userId]
    );

    if (existingDoctor.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or you do not have permission to update this doctor'
      });
    }

    const result = await pool.query(
      `UPDATE doctors 
       SET name = $1, email = $2, phone = $3, specialization = $4, license_number = $5, years_of_experience = $6, consultation_fee = $7
       WHERE id = $8 AND created_by = $9
       RETURNING id, name, email, phone, specialization, license_number, years_of_experience, consultation_fee, updated_at`,
      [name, email, phone, specialization, license_number, years_of_experience, consultation_fee, doctorId, userId]
    );

    res.json({
      success: true,
      message: 'Doctor updated successfully',
      data: { doctor: result.rows[0] }
    });
  } catch (error) {
    if (error.code === '23505') { 
      return res.status(400).json({
        success: false,
        message: 'Doctor with this email or license number already exists'
      });
    }
    console.error('Update doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createDoctor,
  getDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor
};
