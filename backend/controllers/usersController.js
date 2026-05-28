const pool = require("../database/db");

const getUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id, email, role, first_name, last_name, phone, birth_date, id_number, avatar
       FROM users
       ORDER BY first_name`,
    );

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get users",
      error: error.sqlMessage || error.message,
    });
  }
};

const getDoctors = async (req, res) => {
  try {
    const [doctors] = await pool.query(
      `SELECT id, first_name, last_name, email, phone, avatar
       FROM users
       WHERE role = 'doctor'
       ORDER BY first_name`,
    );

    res.json(doctors);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get doctors",
      error: error.sqlMessage || error.message,
    });
  }
};

const getPatientsForDoctor = async (req, res) => {
  try {
    const { doctorId } = req.query;

    let sql = `
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.birth_date,
        u.id_number,
        u.avatar,
        COUNT(a.id) AS appointments_count
      FROM users u
      LEFT JOIN appointments a
        ON a.patient_id = u.id
      WHERE u.role = 'patient'
    `;

    const params = [];

    if (doctorId) {
      sql += " AND a.doctor_id = ?";
      params.push(doctorId);
    }

    sql += `
      GROUP BY 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.birth_date,
        u.id_number,
        u.avatar
      ORDER BY u.first_name, u.last_name
    `;

    const [patients] = await pool.query(sql, params);

    res.json(patients);
  } catch (error) {
    console.error("GET PATIENTS ERROR:", error);

    res.status(500).json({
      message: "Failed to get patients",
      error: error.sqlMessage || error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.query(
      `SELECT id, email, role, first_name, last_name, phone, birth_date, id_number, avatar
       FROM users
       WHERE id = ?`,
      [id],
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(users[0]);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get user",
      error: error.sqlMessage || error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, email } = req.body;

    await pool.query(
      `UPDATE users
       SET first_name = ?, last_name = ?, phone = ?, email = ?
       WHERE id = ?`,
      [firstName, lastName, phone, email, id],
    );

    res.json({
      message: "User updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update user",
      error: error.sqlMessage || error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM users WHERE id = ?", [id]);

    res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete user",
      error: error.sqlMessage || error.message,
    });
  }
};

module.exports = {
  getUsers,
  getDoctors,
  getPatientsForDoctor,
  getUserById,
  updateUser,
  deleteUser,
};
