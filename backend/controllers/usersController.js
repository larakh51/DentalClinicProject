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

const getPatientByIdNumber = async (req, res) => {
  try {
    const { idNumber } = req.params;

    if (!idNumber) {
      return res.status(400).json({
        message: "Patient ID number is required",
      });
    }

    const [patients] = await pool.query(
      `SELECT
         id,
         email,
         role,
         first_name,
         last_name,
         phone,
         birth_date,
         id_number,
         avatar,
         status
       FROM users
       WHERE id_number = ?
         AND role = 'patient'
         AND status = 'active'`,
      [idNumber],
    );

    if (patients.length === 0) {
      return res.status(404).json({
        message: "Patient not found with this ID number",
      });
    }

    res.json(patients[0]);
  } catch (error) {
    console.error("GET PATIENT BY ID NUMBER ERROR:", error);

    res.status(500).json({
      message: "Failed to get patient",
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

    if (req.user.role !== "manager" && req.user.id !== id) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const { firstName, lastName, phone, email, status, avatar, role } =
      req.body;

    const fields = [];
    const values = [];

    if (firstName !== undefined) {
      fields.push("first_name = ?");
      values.push(firstName);
    }

    if (lastName !== undefined) {
      fields.push("last_name = ?");
      values.push(lastName);
    }

    if (phone !== undefined) {
      fields.push("phone = ?");
      values.push(phone);
    }

    if (email !== undefined) {
      fields.push("email = ?");
      values.push(email);
    }

    if (avatar !== undefined) {
      fields.push("avatar = ?");
      values.push(avatar);
    }

    if (status !== undefined && req.user.role === "manager") {
      fields.push("status = ?");
      values.push(status);
    }

    if (role !== undefined && req.user.role === "manager") {
      fields.push("role = ?");
      values.push(role);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        message: "No fields to update",
      });
    }

    values.push(id);

    await pool.query(
      `UPDATE users
       SET ${fields.join(", ")}
       WHERE id = ?`,
      values,
    );

    const [updatedUsers] = await pool.query(
      `SELECT id, email, role, first_name, last_name, phone, birth_date, id_number, avatar, status
       FROM users
       WHERE id = ?`,
      [id],
    );

    if (updatedUsers.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const updatedUser = updatedUsers[0];

    if (req.session?.user?.id === id) {
      req.session.user = {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        phone: updatedUser.phone,
        birthDate: updatedUser.birth_date,
        idNumber: updatedUser.id_number,
        avatar: updatedUser.avatar,
        status: updatedUser.status,
      };
    }

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);

    res.status(500).json({
      message: "Failed to update user",
      error: error.sqlMessage || error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (req.user.id !== id) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const [users] = await pool.query(
      "SELECT id, password FROM users WHERE id = ?",
      [id],
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, users[0].password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      id,
    ]);

    res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);

    res.status(500).json({
      message: "Failed to change password",
      error: error.sqlMessage || error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "manager" && req.user.id !== id) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    await pool.query("UPDATE users SET status = 'inactive' WHERE id = ?", [id]);

    if (req.user.id === id && req.session) {
      req.session.destroy(() => {});
    }

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
  changePassword,
  deleteUser,
  getPatientByIdNumber,
};
