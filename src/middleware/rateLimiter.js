import { rateLimit } from 'express-rate-limit';

const LogInLimiter = rateLimit({
    windowMs: 60*1000,
    limit: 3,
    handler: (req, res, next) => {
        const error = new Error('Too many log in requests. Try again later');
        error.status = 429;
        next(error);
    },
});

export default LogInLimiter;