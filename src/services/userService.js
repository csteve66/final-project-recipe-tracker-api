import bcrypt from 'bcrypt';
import { Prisma } from '../generated/prisma/index.js';
import { findMyProfile, updateProfile, removeProfile, updateRole } from '../repositories/userRepo';

export async function getMyProfile(userid) {
    return await findMyProfile(userid);
}

export async function updateMyProfile(userid, { username, email, password }) {
    const data = {}

    if (username) {
        data.username = username;
    }

    if (email) {
        data.email = email;
    }

    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        data.password_hash = hashedPassword;
    }

    try {
        const updatedUser = await updateProfile(userid, data);
        return updatedUser;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                const err = new Error('Email/Username has already been used');
                err.status = 409;
                throw err;
            }
            throw error;
        }
    }
}

export async function deleteMyProfile(userid) {
    await removeProfile(userid);
}

export async function updateUserRole(userid, role) {
    const updatedUser = await updateRole(userid, role);
    if(!updatedUser) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }
    return updatedUser;
}