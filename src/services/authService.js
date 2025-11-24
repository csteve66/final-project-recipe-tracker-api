import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Prisma } from '../generated/prisma/index.js';
import prisma from '../config/db.js';
import { createUser, findByUsername } from '../repositories/userRepo.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

export async function signUp(email, username, password) {
  const password_hash = await bcrypt.hash(password, 10);
  try {
    const newUser = await createUser({ email, username, password_hash });
    return newUser;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const err = new Error('Email/Username has already been used');
      err.status = 409;
      throw err;
    }
    throw error;
  }
}

export async function logIn({ email, username, password }) {
  let user = null;

  if (username) {
    user = await findByUsername(username);
  } else if (email) {
    user = await prisma.user.findUnique({
      where: { email }
    });
  }

  if (!user) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const payload = { id: user.userid, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return token;
}
