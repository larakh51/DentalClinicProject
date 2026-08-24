const bcrypt = require("bcrypt");
const pool = require("../database/db");
const generateId = require("../utils/generateId");

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_REGEX = /^[\p{L}\s'-]+$/u;
const ID_REGEX = /^\d{9}$/;

const isValidPhone = (phone) => {
  if (!phone) {
    return true;
  }

  const normalizedPhone = String(phone).replace(/[\s()-]/g, "");

  return (
    /^0\d{8,9}$/.test(normalizedPhone) || /^\+972\d{8,9}$/.test(normalizedPhone)
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

    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      avatar: user.avatar,
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

    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    const normalizedFirstName = String(firstName || "").trim();
    const normalizedLastName = String(lastName || "").trim();
    const normalizedPhone = String(phone || "").trim();
    const normalizedIdNumber = String(idNumber || "").trim();

    if (!normalizedFirstName) {
      return res.status(400).json({
        message: "First name is required",
        field: "firstName",
      });
    }

    if (
      normalizedFirstName.length < 2 ||
      !NAME_REGEX.test(normalizedFirstName)
    ) {
      return res.status(400).json({
        message: "Please enter a valid first name",
        field: "firstName",
      });
    }

    if (!normalizedLastName) {
      return res.status(400).json({
        message: "Last name is required",
        field: "lastName",
      });
    }

    if (normalizedLastName.length < 2 || !NAME_REGEX.test(normalizedLastName)) {
      return res.status(400).json({
        message: "Please enter a valid last name",
        field: "lastName",
      });
    }

    if (!normalizedEmail) {
      return res.status(400).json({
        message: "Email is required",
        field: "email",
      });
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
        field: "email",
      });
    }

    if (!normalizedIdNumber) {
      return res.status(400).json({
        message: "ID number is required",
        field: "idNumber",
      });
    }

    if (!ID_REGEX.test(normalizedIdNumber)) {
      return res.status(400).json({
        message: "ID number must contain exactly 9 digits",
        field: "idNumber",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
        field: "password",
      });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        message:
          "Password must be 6-8 characters and include an uppercase letter and a number",
        field: "password",
      });
    }

    if (normalizedPhone && !isValidPhone(normalizedPhone)) {
      return res.status(400).json({
        message: "Please enter a valid phone number",
        field: "phone",
      });
    }

    if (birthDate) {
      const parsedBirthDate = new Date(`${birthDate}T00:00:00`);

      const today = new Date();

      today.setHours(0, 0, 0, 0);

      if (Number.isNaN(parsedBirthDate.getTime()) || parsedBirthDate > today) {
        return res.status(400).json({
          message: "Please enter a valid birth date",
          field: "birthDate",
        });
      }
    }

    const [emailExists] = await pool.query(
      `SELECT id
       FROM users
       WHERE LOWER(email) = ?
       LIMIT 1`,
      [normalizedEmail],
    );

    if (emailExists.length > 0) {
      return res.status(409).json({
        message: "Email is already registered",
        field: "email",
      });
    }

    const [idExists] = await pool.query(
      `SELECT id
       FROM users
       WHERE id_number = ?
       LIMIT 1`,
      [normalizedIdNumber],
    );

    if (idExists.length > 0) {
      return res.status(409).json({
        message: "ID number is already registered",
        field: "idNumber",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const id = generateId("p");

    await pool.query(
      `INSERT INTO users
       (
         id,
         email,
         password,
         role,
         first_name,
         last_name,
         phone,
         birth_date,
         id_number,
         status
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        normalizedEmail,
        hashedPassword,
        "patient",
        normalizedFirstName,
        normalizedLastName,
        normalizedPhone || null,
        birthDate || null,
        normalizedIdNumber,
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
      `SELECT
         id,
         email,
         role,
         first_name,
         last_name,
         phone,
         avatar
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
      avatar: user.avatar,
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
