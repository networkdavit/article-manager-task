import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { UserDTO } from '../dtos/user.dto'; 

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

interface CustomRequest extends Request {
  user?: UserDTO;
}

export const authenticate = (req: CustomRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1]; 

  if (!token) {
    res.status(403).json({ message: 'Access denied, no token provided.' }); 
    return; 
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ message: 'Invalid token.' }); 
      return; 
    }
    req.user = decoded as UserDTO;
    next(); 
  });
};

export const isAdmin = (req: CustomRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') { 
    res.status(403).json({ message: 'Admin role required.' }); 
    return; 
  }
  next(); 
};
