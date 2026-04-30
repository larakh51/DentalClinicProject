const pool = require("../database/db");

const getUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id, email, role, first_name, last_name, phone, birth_date, id_number, status
       FROM users
       ORDER BY created_at DESC`,
    );

    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get users", error: error.message });
  }
};

const getDoctors = async (req, res) => {
  try {
    const [doctors] = await pool.query(
      `SELECT id, first_name, last_name, email, phone, specialty
       FROM users
       WHERE role = 'doctor' AND status = 'active'
       ORDER BY first_name`,
    );

    res.json(doctors);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get doctors", error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.query(
      `SELECT id, email, role, first_name, last_name, phone, birth_date, id_number, status
       FROM users
       WHERE id = ?`,
      [id],
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(users[0]);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get user", error: error.message });
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

    res.json({ message: "User updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update user", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("UPDATE users SET status = 'inactive' WHERE id = ?", [id]);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
};

module.exports = {
  getUsers,
  getDoctors,
  getUserById,
  updateUser,
  deleteUser,
};
