exports.userSignupValidator = (req, res, next) => {
    req.check('name', 'Name is required').notEmpty();
    
    req.check('email', 'Email is required').notEmpty();
    req.check('email', 'Please provide a valid email').isEmail();
    req.check('email')
        .isLength({
            min: 4,
            max: 32
        }).withMessage('Email must be between 4 to 32 characters');

    req.check('password', 'password is required').notEmpty();
    req.check('password')
        .isLength({min: 6})
        .withMessage('Password must be at least 6 characters')
        .matches(/\d/)
        .withMessage('Password must contain a number');

    const errors = req.validationErrors();
    if(errors) {
        const firstError = errors.map(error => error.msg)[0];
        return res.status(400).json({
            error: firstError
        });
    }
    next();
}

exports.userSigninValidator = (req, res, next) => {

    req.check('email', 'Email is required').notEmpty();
    req.check('email', 'Please provide a valid email').isEmail();
    req.check('email')
        .isLength({
            min: 4,
            max: 32
        }).withMessage('Email must be between 4 to 32 characters');

    req.check('password', 'password is required').notEmpty();
    
    const errors = req.validationErrors();
    if(errors) {
        const firstError = errors.map(error => error.msg)[0];
        return res.status(400).json({
            error: firstError
        });
    }
    next();
}