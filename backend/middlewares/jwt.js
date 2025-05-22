// jwt.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Generate a token with a 1-hour expiration
export function generateToken(payload) {
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

// Middleware to verify a token on protected routes
export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1]; // Expecting "Bearer <token>"
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = decoded;
    console.log('Token verified');
    next();
  });
}
