const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../database/db");
const generateId = require("../utils/generateId");

const createToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
};

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

    const token = createToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: "Login failed",
      error: error.message || error.sqlMessage || "Unknown error",
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
       (id, email, password, role, first_name, last_name, phone, birth_date, id_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

module.exports = {
  login,
  registerPatient,
};
