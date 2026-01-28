const Joi = require('joi');

/**
 * Validation middleware factory
 * @param {Joi.ObjectSchema} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                error: 'Validation failed',
                details: errors
            });
        }

        req[property] = value;
        next();
    };
};

// Common validation schemas
const schemas = {
    login: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'Password must be at least 6 characters',
            'any.required': 'Password is required'
        })
    }),

    progressUpdate: Joi.object({
        chapterId: Joi.number().integer().positive().required(),
        currentPage: Joi.number().integer().min(0).required(),
        totalPagesViewed: Joi.number().integer().min(0),
        timeSpentSeconds: Joi.number().integer().min(0)
    }),

    courseAssignment: Joi.object({
        userId: Joi.number().integer().positive().required(),
        courseId: Joi.number().integer().positive().required(),
        deadlineDays: Joi.number().integer().min(1).max(365)
    })
};

module.exports = { validate, schemas };
