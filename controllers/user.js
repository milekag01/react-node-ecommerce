const User = require('../models/user');
const jwt = require('jsonwebtoken');    // to generate signed token
const expressJwt = require('express-jwt');  // for authorization check

const {errorHandler} = require('../helpers/dbErrorHandler');

exports.signup = async (req,res) => {
    // console.log("req.body: ", req.body);
    const user = new User(req.body);

    try {
        await user.save();

        user.salt = undefined;
        user.hashed_password = undefined;
        res.json({
            user: user
        })
    } catch (error) {
        return res.status(400).json({
            error: errorHandler(error)
        });
    }
}

exports.signin = async (req,res) => {
    
    try {
        const user = await User.findOne({email: req.body.email});
        if(!user) {
            return res.status(400).json({
                error: 'User does not exist. Please signup!'
            });
        }
        // if found, hash password using authenticate middleware
        // and check user email and password.
        if(!user.authenticate(req.body.password)) {
            return res.status(401).json({
                error: 'Email and password do not match'
            });
        }

        // if matches, generate new jwt token with _id and secret
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);
        
        // store token as 't' in cookie with expiry date
        res.cookie('t', token, {expire: new Date() + 9999});

        // return response with user and token to frontend client
        const {_id, name, email, role} = user;
        return res.json({
            token: token,
            user: {_id, email, name, role}
        });

    } catch(error) {
        res.status(400).json({
            error: 'Something went wrong!'
        })
    }
}

exports.signout = (req, res) =>  {
    res.clearCookie('t');
    res.json({message: "Signout Successful"});
}
