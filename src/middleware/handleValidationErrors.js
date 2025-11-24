import { validationResult } from 'express-validator';

function handleValidationErrors(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const messages = result.array().map(err => err.msg);
    return res.status(400).json({ errors: messages });
  }
  next();
}

export default handleValidationErrors;
