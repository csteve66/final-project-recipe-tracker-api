export function authorizeOwnership(getResourceById) {
    return async (req, res, next) => {
        try {
            const resourceId = parseInt(req.params.id);
            const resource = await getResourceById(resourceId);

            if(!resource) {
                const error = new Error('Resource not found');
                error.status = 404;
                return next(error);
            }

            if (resource.user_id !== req.user.id && req.user.role !== 'ADMIN') {
                const error = new Error('Forbidden: insufficient permissions');
                error.status = 403;
                return next(error);
            }

            next();
        } catch (err) {
            next(err);
        }
    };
}