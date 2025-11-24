import bcrypt from 'bcrypt';
import { Prisma } from '../generated/prisma/index.js';
import {
  findById,
  findByUsername,
  createUser,
  updateMyProfile as repoUpdateMyProfile,
  removeProfile,
  updateRole
} from '../repositories/userRepo.js';

export async function getMyProfile(userid) {
  return await findById(userid);
}

export async function updateMyProfile(userid, { username, email, password }) {
  const updates = {};

  if (username) updates.username = username;
  if (email) updates.email = email;
  if (password) updates.password_hash = await bcrypt.hash(password, 10);

  try {
    const updated = await repoUpdateMyProfile(userid, updates);
    return updated;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const err = new Error('Email/Username has already been used');
      err.status = 409;
      throw err;
    }
    throw error;
  }
}

export async function deleteMyProfile(userid) {
  await removeProfile(userid);
}

export async function updateUserRole(userid, role) {
  const updated = await updateRole(userid, role);
  if (!updated) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  return updated;
}
