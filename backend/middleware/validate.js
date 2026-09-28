const { validationResult, matchedData } = require('express-validator');

// Security: central handler for express-validator chains.
// Rejects invalid input with 400 before any controller logic runs, and replaces
// req.body/query/params with ONLY the validated fields so unknown properties
// sent by a client can never reach Mongoose (mass-assignment defence).
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map((err) => ({
                field: err.path,
                message: err.msg
            }))
        });
    }

    const body = matchedData(req, { locations: ['body'], includeOptionals: false });
    const query = matchedData(req, { locations: ['query'], includeOptionals: false });
    const params = matchedData(req, { locations: ['params'], includeOptionals: false });

    req.body = body;
    // req.query and req.params are getter-only on some Express versions, so
    // assign field-by-field rather than replacing the object wholesale.
    Object.keys(req.query).forEach((key) => {
        if (!(key in query)) {
            delete req.query[key];
        }
    });
    Object.assign(req.query, query);
    Object.assign(req.params, params);

    next();
};

module.exports = validate;
