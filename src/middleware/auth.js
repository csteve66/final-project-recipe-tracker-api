export function requireAuth(req, res, next) {
  // TEMP for development/testing only
  req.user = {
    userid: 1,      // pretend logged-in user with id 1
    role: 'ADMIN',  // or 'USER' if you want to test restrictions
  };
  next();
}
