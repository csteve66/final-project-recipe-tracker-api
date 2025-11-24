import prisma from '../config/db.js';

export async function findMyProfile(userid) {
    return await prisma.user.findUnique({
        where: { userid },
        select: {
            userid: true,
            username: true,
            email: true,
            role: true
        }
    });
}

export async function createUser(data) {
    return await prisma.user.create({
        data: data,
        omit: { password_hash: true }
    });
}

export async function updateProfile(id, data) {
    return await prisma.user.update({
        where: { userid: id },
        data,
        select: {
            userid: true,
            username: true,
            email: true,
            role: true
        }
    });
}

export async function removeProfile(id) {
    await prisma.user.delete({
        where: { userid: id },
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
            where: { userid: id },
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

export async function findUserByUsername(username) {
    return await prisma.user.findUnique({
        where: { username }
    });
}