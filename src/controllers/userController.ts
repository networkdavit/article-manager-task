import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db';
import { User } from '../models/user';  
import { UserDTO } from '../dtos/user.dto';  

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export class UserController {
  static async register(req: Request, res: Response) {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const checkUserQuery = 'SELECT * FROM users WHERE email = $1';
    try {
      const existingUser = await pool.query(checkUserQuery, [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email is already in use' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const insertQuery = 'INSERT INTO users (email, password, role, name) VALUES ($1, $2, $3, $4) RETURNING *';
      const result = await pool.query(insertQuery, [email, hashedPassword, 'user', name]); // Default role is 'user'
      const newUser = result.rows[0];

      const user = new User(
        newUser.id,
        newUser.email,
        newUser.password,
        newUser.role,
        newUser.name
      );

      const userDTO: UserDTO = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };

      return res.status(201).json(userDTO);
    } catch (err: unknown) {
      console.error('Error registering user:', err);
      return res.status(500).json({ error: 'Error registering user', details: err });
    }
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const checkUserQuery = 'SELECT * FROM users WHERE email = $1';
    try {
      const userResult = await pool.query(checkUserQuery, [email]);

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = userResult.rows[0];

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role }, // Payload
        JWT_SECRET, 
        { expiresIn: '1h' } 
      );

      const userDTO: UserDTO = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };

      return res.status(200).json({ token, user: userDTO });
    } catch (err: unknown) {
      console.error('Error logging in user:', err);
      return res.status(500).json({ error: 'Error logging in user', details: err });
    }
  }
}
