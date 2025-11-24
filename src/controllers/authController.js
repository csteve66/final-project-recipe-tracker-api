import { signUp, logIn } from '../services/authService.js';

export async function signUpHandler(req, res) {
    const {email, username, password} = req.body;
    const newUser = await signUp(email, username, password);
    res.status(201).json({ message: `New user created with an id of ${newUser.userid}`});
}

export async function logInHandler(req, res) {
    const {email, username, password} = req.body;
    const accessToken = await logIn(email, username, password);
    res.status(200).json({ accessToken });
}