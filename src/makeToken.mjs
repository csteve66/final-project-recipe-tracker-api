import jwt from 'jsonwebtoken';

const JWT_SECRET = 'somesecretstring'; // same as in .env

// Use the userid and role from your database.
// After a fresh seed, likely userid = 1 for Nathalie_Brown (ADMIN)
const payload = {
  id: 1,
  role: 'ADMIN'
};

const token = jwt.sign(payload, JWT_SECRET);
console.log(token);
