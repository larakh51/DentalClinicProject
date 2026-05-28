const bcrypt = require("bcrypt");
const pool = require("../database/db");
const generateId = require("../utils/generateId");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(401).json({
        message: "Email or password is incorrect",
      });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Email or password is incorrect",
      });
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
    };

    req.session.save((error) => {
      if (error) {
        return res.status(500).json({
          message: "Failed to save session",
        });
      }

      res.json({
        message: "Login successful",
        user: req.session.user,
      });
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: "Login failed",
      error: error.sqlMessage || error.message || "Unknown error",
    });
  }
};

const registerPatient = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, birthDate, idNumber } =
      req.body;

    if (!email || !password || !firstName || !lastName || !idNumber) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const [exists] = await pool.query(
      "SELECT id FROM users WHERE email = ? OR id_number = ?",
      [email, idNumber],
    );

    if (exists.length > 0) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = generateId("p");

    await pool.query(
      `INSERT INTO users
       (id, email, password, role, first_name, last_name, phone, birth_date, id_number, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        email,
        hashedPassword,
        "patient",
        firstName,
        lastName,
        phone || null,
        birthDate || null,
        idNumber,
        "active",
      ],
    );

    res.status(201).json({
      message: "Patient registered successfully",
      id,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    res.status(500).json({
      message: "Register failed",
      error: error.sqlMessage || error.message || "Unknown error",
    });
  }
};

const getMe = async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    const [users] = await pool.query(
      `SELECT id, email, role, first_name, last_name, phone
       FROM users
       WHERE id = ?`,
      [req.session.user.id],
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = users[0];

    const currentUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
    };

    req.session.user = currentUser;

    res.json({
      user: currentUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get user",
      error: error.sqlMessage || error.message,
    });
  }
};

const logout = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        message: "Logout failed",
      });
    }

    res.clearCookie("clinic_session");

    res.json({
      message: "Logged out successfully",
    });
  });
};

module.exports = {
  login,
  registerPatient,
  getMe,
  logout,
};
