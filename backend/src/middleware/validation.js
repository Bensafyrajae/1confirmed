const { validationResult, checkSchema } = require('express-validator');
const { AppError } = require('./errorHandler');

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError('Validation error', 400, errors.array()));
    }
    next();
};

const eventSchema = {
    title: {
        trim: true,
        notEmpty: true,
        errorMessage: 'Title is required'
    },
    eventDate: {
        isISO8601: true,
        toDate: true,
        errorMessage: 'Valid event date is required'
    },
    timezone: {
        optional: true,
        matches: {
            options: [/^[A-Za-z/_+-]+$/],
            errorMessage: 'Invalid timezone format'
        }
    },
    description: {
        optional: true,
        trim: true
    }
};

const validateEvent = [
    checkSchema(eventSchema),
    validateRequest
];

module.exports = {
    validateEvent,
    validateRequest
};