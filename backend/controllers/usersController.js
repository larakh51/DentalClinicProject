const pool = require("../database/db");
const bcrypt = require("bcrypt");
const generateId = require("../utils/generateId");

const getUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id, email, role, first_name, last_name, phone, birth_date, id_number, avatar, status
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
      `SELECT id, first_name, last_name, email, phone, avatar, status
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
        COUNT(a.id) AS appointments_count,
        CASE
          WHEN mr.allergies IS NOT NULL AND mr.allergies != '' THEN 1
          ELSE 0
        END AS has_allergies
      FROM users u
      LEFT JOIN appointments a
        ON a.patient_id = u.id
      LEFT JOIN medical_records mr
        ON mr.patient_id = u.id
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
        u.avatar,
        mr.allergies
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

const createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      idNumber,
      birthDate,
    } = req.body;

    const normalizedRole = role?.toLowerCase();

    if (!firstName || !lastName || !email || !password || !normalizedRole) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    if (!["doctor", "manager"].includes(normalizedRole)) {
      return res.status(400).json({
        message: "Role must be doctor or manager",
      });
    }

    let existsSql = "SELECT id FROM users WHERE email = ?";
    const existsParams = [email];

    if (idNumber) {
      existsSql += " OR id_number = ?";
      existsParams.push(idNumber);
    }

    const [exists] = await pool.query(existsSql, existsParams);

    if (exists.length > 0) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let id;
    let idExists = true;

    while (idExists) {
      id = normalizedRole === "doctor" ? generateId("d") : generateId("m");

      const [sameId] = await pool.query("SELECT id FROM users WHERE id = ?", [
        id,
      ]);

      idExists = sameId.length > 0;
    }

    await pool.query(
      `INSERT INTO users
       (id, email, password, role, first_name, last_name, phone, birth_date, id_number, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        email,
        hashedPassword,
        normalizedRole,
        firstName,
        lastName,
        phone || null,
        birthDate || null,
        idNumber || null,
        "active",
      ],
    );

    res.status(201).json({
      message: "Employee created successfully",
      id,
    });
  } catch (error) {
    console.error("CREATE EMPLOYEE ERROR:", error);

    res.status(500).json({
      message: "Failed to create employee",
      error: error.sqlMessage || error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.query(
      `SELECT id, email, role, first_name, last_name, phone, birth_date, id_number, avatar, status
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
    const { firstName, lastName, phone, email, status } = req.body;

    await pool.query(
      `UPDATE users
       SET first_name = ?, last_name = ?, phone = ?, email = ?, status = ?
       WHERE id = ?`,
      [firstName, lastName, phone, email, status || "active", id],
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

    await pool.query("UPDATE users SET status = 'inactive' WHERE id = ?", [id]);

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
  createEmployee,
  getUserById,
  updateUser,
  deleteUser,
};
