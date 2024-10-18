import pool from "../db.js";
import bcrypt from "bcryptjs";

class UserRepository {
  static async createUser({ userName, password, role }) {
    const hashedPassword = await bcrypt.hash(password, 3)
    const response = await pool.query(
      "INSERT INTO users (name, password, role) VALUES ($1, $2, $3) RETURNING *", [
      userName,
      hashedPassword,
      role,
    ])

    return response.rows[0];
  }

  static async getUserData(userName) {
    const response = await pool.query("SELECT * FROM users WHERE name=$1", [
      userName,]);
    if (!response.rows.length) return null;

    return response.rows[0];
  }
}

export default UserRepository;
