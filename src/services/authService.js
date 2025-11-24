import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Prisma } from '../generated/prisma/index.js';
import { createUser, findUserByUsername } from '../repositories/userRepo.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

export async function signUp(email, username, password) {
    const password_hash = await bcrypt.hash(password, 10);
    try {
        const newUser = await createUser({ email, username, password_hash });
        return newUser;
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

export async function logIn(username, password) {
    const user = await findUserByUsername(username);
    if (!user) {
        const error = new Error('Invalid credentials');
        error.status = 401;
        throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if(!isMatch) {
        const error = new Error('Invalid Credentials');
        error.status = 401;
        throw error;
    }

    const accessToken = jwt.sign({ id: user.userid, role: user.role}, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return accessToken;
}