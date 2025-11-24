import { getMyProfile, updateMyProfile, deleteMyProfile, updateUserRole } from "../services/userService.js";

export async function getMyProfileHandler(req, res) {
    const userid = req.user.id;
    const user = await getMyProfile(userid);
    res.status(200).json(user);
}

export async function updateProfileHandler(req, res) {
    const userid = req.user.id;
    const {username, email, password} = req.body;
    const updatedUser = await updateMyProfile(userid, { username, email, password })
    res.status(200).json(updatedUser);
}

export async function deleteProfileHandler(req, res) {
    const userid = req.user.id;
    await deleteMyProfile(userid);
    res.status(204).send();
}

export async function updateUserRoleHandler(req, res) {
    const userid = parseInt(req.params.id);
    const role = req.body.role;
    const updatedUser = await updateUserRole(userid, role);
    res.status(200).json(updatedUser);
}