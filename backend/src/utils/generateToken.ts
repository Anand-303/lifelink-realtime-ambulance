import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token for authentication
 * @param id User ID to include in the token
 * @returns JWT token string
 */
const generateToken = (id: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ id }, jwtSecret as string, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

export default generateToken;