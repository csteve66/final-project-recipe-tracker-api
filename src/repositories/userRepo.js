import prisma from '../config/db.js';

export async function findById(id) {
  return await prisma.user.findUnique({
    where: { userid: Number(id) },
    select: {
      userid: true,
      username: true,
      email: true,
      role: true
    }
  });
}

export async function findByUsername(username) {
  return await prisma.user.findUnique({
    where: { username }
  });
}

export async function createUser({ username, email, password_hash }) {
  return await prisma.user.create({
    data: {
      username,
      email,
      password_hash,
      role: 'USER'
    },
    select: {
      userid: true,
      username: true,
      email: true,
      role: true
    }
  });
}

export async function updateMyProfile(id, { username, email, password_hash }) {
  const updates = {};

  if (username) updates.username = username;
  if (email) updates.email = email;
  if (password_hash) updates.password_hash = password_hash;

  return await prisma.user.update({
    where: { userid: Number(id) },
    data: updates,
    select: {
      userid: true,
      username: true,
      email: true,
      role: true
    }
  });
}

export async function removeProfile(id) {
  return await prisma.user.delete({
    where: { userid: Number(id) },
    select: {
      userid: true,
      username: true,
      email: true,
      role: true
    }
  });
}

export async function updateRole(id, role) {
  try {
    return await prisma.user.update({
      where: { userid: Number(id) },
      data: { role },
      select: {
        userid: true,
        username: true,
        email: true,
        role: true
      }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return null;
    }
    throw error;
  }
}
